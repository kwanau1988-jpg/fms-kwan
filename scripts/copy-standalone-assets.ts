import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.error("[Build] Error: .next/standalone does not exist. Please run 'next build' first.");
  process.exit(1);
}

// 1. Copy public -> .next/standalone/public
const publicSrc = path.join(rootDir, "public");
const publicDest = path.join(standaloneDir, "public");
if (fs.existsSync(publicSrc)) {
  console.log("[Build] Copying public assets to standalone/public...");
  fs.cpSync(publicSrc, publicDest, { recursive: true });
}

// 2. Copy .next/static -> .next/standalone/.next/static
const staticSrc = path.join(rootDir, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
if (fs.existsSync(staticSrc)) {
  console.log("[Build] Copying .next/static assets to standalone/.next/static...");
  fs.cpSync(staticSrc, staticDest, { recursive: true });
}

console.log("[Build] Standalone assets copied successfully!");
