/**
 * Render the page to static HTML.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server). Without
 * it the site ships an empty <div id="root">: a crawler sees no tracks, no
 * schedule and no copy, and a visitor sees black until the bundle executes.
 * The page has no per-visitor content, so there is nothing to lose by
 * rendering it once at build time.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = join(ROOT, "dist");
const SSR_ENTRY = join(ROOT, "dist-ssr", "entry-server.js");

if (!existsSync(SSR_ENTRY)) {
  console.error(`[prerender] missing ${SSR_ENTRY} — run the SSR build first`);
  process.exit(1);
}

const template = readFileSync(join(DIST, "index.html"), "utf8");
const { render, HEAD } = await import(pathToFileURL(SSR_ENTRY).href);

const appHtml = render();

/**
 * Function replacers, not strings.
 *
 * String.replace treats `$$`, `$&`, `` $` `` and `$'` in a string replacement
 * as substitution patterns. The ASCII art is 140 rows of punctuation and the
 * particle field is drawn from a character set; one `$&` reaching this call
 * would splice a copy of the page into the middle of itself. A function's
 * return value is inserted literally.
 */
const html = template
  .replace("<!--app-head-->", () => HEAD)
  // The template's dev-only <title> would otherwise duplicate the real one.
  .replace(/<title>HACK1984<\/title>\s*/, "")
  .replace("<!--app-html-->", () => appHtml);

writeFileSync(join(DIST, "index.html"), html);
console.log(`[prerender] / → index.html (${(html.length / 1024).toFixed(0)}KB)`);
