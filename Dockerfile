# -------------------------------------------------------------
# 1. Base Stage: Node 22 on Alpine with system dependencies
# -------------------------------------------------------------
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl netcat-openbsd
WORKDIR /app

# -------------------------------------------------------------
# 2. Dependencies Stage
# -------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --legacy-peer-deps --ignore-scripts

# -------------------------------------------------------------
# 3. Builder Stage
# -------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Provide build-time environment variables for Prisma and Next.js compiler
ENV DATABASE_URL="postgresql://postgres:dummy@localhost:5432/ums_dev"
ENV AUTH_SECRET="dummy_build_time_secret_32_characters_long_abc"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma Client (both native and linux-musl)
RUN npx prisma generate

RUN npm run build

# -------------------------------------------------------------
# 4. Runner Stage (Production Minimal & Hardened)
# -------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"
ENV HOME=/home/nextjs

# Create non-root user and group with home directory
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 -G nodejs -h /home/nextjs nextjs && \
    mkdir -p /home/nextjs/.cache && \
    chown -R nextjs:nodejs /home/nextjs

# Copy dependencies for Prisma CLI and database migrations
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public assets and prisma migrations
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/src/generated/prisma ./src/generated/prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

# Copy and setup entrypoint
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Ensure prisma engines are unpacked and ensure entire /app is owned by nextjs:nodejs
RUN node ./node_modules/prisma/build/index.js -v || true
RUN mkdir -p /app/public/uploads/logos && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3010

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3010/portal || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
