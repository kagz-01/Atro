#!/usr/bin/env node
/**
 * Copies PGLite's runtime assets next to the built server bundle.
 *
 * Local development runs Postgres in-process through PGLite, and its wasm/data
 * files are resolved relative to the module. Once Nitro bundles the server into
 * `.vercel/output/functions/__server.func/_libs/`, those files are no longer
 * alongside it and every request throws ENOENT — so the built preview serves
 * nothing and looks like a broken deploy.
 *
 * Deployed builds get a real `DATABASE_URL` and never load PGLite, so this is
 * purely a local-preview concern. It no-ops when the Vercel output directory is
 * absent (any other build target) and never overwrites a real Postgres setup.
 */
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const libs = join(root, ".vercel/output/functions/__server.func/_libs");
const dist = join(root, "node_modules/@electric-sql/pglite/dist");
const assets = ["pglite.wasm", "pglite.data", "initdb.wasm"];

if (!existsSync(libs)) {
  console.log("[pglite-assets] no Vercel server bundle, nothing to do");
  process.exit(0);
}
if (!existsSync(dist)) {
  console.log("[pglite-assets] PGLite not installed, nothing to do");
  process.exit(0);
}

for (const asset of assets) {
  const from = join(dist, asset);
  if (!existsSync(from)) {
    console.warn(`[pglite-assets] missing ${asset} in the PGLite dist`);
    continue;
  }
  copyFileSync(from, join(libs, asset));
}

console.log(`[pglite-assets] copied ${assets.length} files into the server bundle`);