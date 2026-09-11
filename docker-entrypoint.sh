#!/bin/sh
set -e

echo "🚀 [FMS Docker Entrypoint] Initializing production environment..."

# Wait for database readiness if DATABASE_URL contains hostname
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Checking database connection..."
  # Extract host and port from DATABASE_URL
  DB_HOST=$(echo "$DATABASE_URL" | sed -e 's,.*://.*@\(.*\):[0-9]*/.*,\1,' -e 's,.*://.*@\(.*\)/.*,\1,')
  DB_PORT=$(echo "$DATABASE_URL" | sed -e 's,.*://.*@.*:\([0-9]*\)/.*,\1,')
  if [ -z "$DB_PORT" ] || [ "$DB_PORT" = "$DATABASE_URL" ]; then
    DB_PORT=5432
  fi

  echo "⏳ Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
  MAX_RETRIES=30
  COUNT=0
  until nc -z -w 2 "$DB_HOST" "$DB_PORT" || [ $COUNT -eq $MAX_RETRIES ]; do
    COUNT=$((COUNT + 1))
    echo "   Database not ready yet... retry $COUNT/$MAX_RETRIES"
    sleep 2
  done

  if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Error: Timed out waiting for database at $DB_HOST:$DB_PORT"
    exit 1
  fi
  echo "✅ Database is ready and accepting connections!"

  # Run Prisma database migrations automatically
  echo "🔄 Running database migrations (prisma migrate deploy)..."
  if [ -f "./node_modules/prisma/build/index.js" ]; then
    node ./node_modules/prisma/build/index.js migrate deploy
  else
    npx prisma migrate deploy
  fi
  echo "✅ Migrations applied successfully!"

  # Optional initial database seeding
  if [ "$AUTO_SEED" = "true" ] || [ "$AUTO_SEED" = "1" ]; then
    echo "🌱 AUTO_SEED enabled: Checking and seeding initial data..."
    if [ -f "./prisma/seed.ts" ]; then
      SEED_ALLOW_PROD=1 node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts || echo "⚠️ Auto-seed completed or skipped."
    fi
  fi
fi

echo "🌟 Starting Next.js Production Standalone Server on port ${PORT:-3010}..."
exec "$@"
