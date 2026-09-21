/**
 * Copy the HACK1984 site's build into dist/hackathon/.
 *
 * hackathon/ is a separate Vite app with its own dependencies, design system
 * and prerender, built with `base: "/hackathon/"`. Keeping it separate means
 * its global CSS (a black body, its own tokens, its own resets) never meets
 * this site's, and neither app can break the other's routes. This script is
 * the only join: it runs after both builds, as `postbuild`, and drops the
 * hackathon output into this site's publish directory, where Netlify serves it
 * as plain files at /hackathon/.
 *
 * It fails loudly rather than quietly shipping a site with the page missing.
 */
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FROM = join(ROOT, "hackathon", "dist");
const TO = join(ROOT, "dist", "hackathon");

if (!existsSync(join(FROM, "index.html"))) {
  console.error(
    "[hackathon] hackathon/dist/index.html is missing — the hackathon build did not run or failed.",
  );
  process.exit(1);
}

if (!existsSync(join(ROOT, "dist"))) {
  console.error("[hackathon] dist/ is missing — run the main build first.");
  process.exit(1);
}

rmSync(TO, { recursive: true, force: true });
cpSync(FROM, TO, { recursive: true });
console.log("[hackathon] hackathon/dist → dist/hackathon");
