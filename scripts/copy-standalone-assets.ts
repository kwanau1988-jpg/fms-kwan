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

// 3. Remove non-runtime directories from standalone to keep installer lightweight
const unneededDirs = ["dist-desktop", "e2e", "tests", ".git"];
for (const dir of unneededDirs) {
  const target = path.join(standaloneDir, dir);
  if (fs.existsSync(target)) {
    console.log(`[Build] Cleaning up '${dir}' from standalone...`);
    fs.rmSync(target, { recursive: true, force: true });
  }
}

console.log("[Build] Standalone assets copied and cleaned successfully!");
