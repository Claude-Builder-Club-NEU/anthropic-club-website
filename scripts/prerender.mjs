/**
 * Prerender every route to static HTML.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server). For each
 * route it renders the app to a string, injects the route's head metadata, and
 * writes a real HTML file. Also emits sitemap.xml and robots.txt so they can
 * never drift from the route table.
 *
 * Why this exists: the site was a client-only SPA, so every route shipped the
 * same <title> and an empty <div id="root">. Per-page titles, structured data,
 * and a genuine 404 all require HTML that exists before JavaScript runs.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = join(ROOT, "dist");
const SSR_ENTRY = join(ROOT, "dist-ssr", "entry-server.js");

async function main() {
  if (!existsSync(SSR_ENTRY)) {
    console.error(`[prerender] missing ${SSR_ENTRY} — run the SSR build first`);
    process.exit(1);
  }

  const template = readFileSync(join(DIST, "index.html"), "utf8");
  const { render, ROUTES, headFor, SITE_ORIGIN } = await import(
    pathToFileURL(SSR_ENTRY).href
  );

  for (const route of ROUTES) {
    const appHtml = render(route.path);
    /**
     * Function replacers, not strings.
     *
     * String.replace treats `$$`, `$&`, `` $` `` and `$'` in a STRING
     * replacement as substitution patterns, so a post whose text contains a
     * dollar sign would corrupt the page: `$'` inserts everything after the
     * placeholder, which duplicates the tail of the template into the middle of
     * the article and strands the rest of the post outside #root. A function's
     * return value is inserted literally, which is the whole fix. This was
     * harmless while every route's head and body came from hard-coded strings,
     * and stopped being harmless when post prose started flowing through here.
     */
    const html = template
      .replace("<!--app-head-->", () => headFor(route))
      // The template's dev-only <title> would otherwise duplicate the real one.
      .replace(
        /<title>Claude Builders Club @ Northeastern<\/title>\s*/,
        ""
      )
      .replace("<!--app-html-->", () => appHtml);

    const out = join(DIST, route.file);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
    console.log(`[prerender] ${route.path} → ${route.file}`);
  }

  // sitemap.xml — indexable routes only.
  const indexable = ROUTES.filter((r) => !r.noindex);

  // Per-route overrides, with the previous behaviour as the default, so every
  // page that existed before the blog emits exactly the line it emitted then.
  // Blog routes set their own: a published post is finished writing, so asking
  // a crawler back monthly is a request to refetch an unchanged file.
  const changefreq = (r) =>
    r.changefreq || (r.path === "/" ? "weekly" : "monthly");
  const priority = (r) => r.priority || (r.path === "/" ? "1.0" : "0.8");

  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    indexable
      .map(
        (r) =>
          // Child order is fixed by the sitemap schema: loc, lastmod,
          // changefreq, priority. A validator rejects them out of order.
          `  <url>\n    <loc>${SITE_ORIGIN}${r.path}</loc>\n` +
          (r.lastmod ? `    <lastmod>${r.lastmod}</lastmod>\n` : "") +
          `    <changefreq>${changefreq(r)}</changefreq>\n` +
          `    <priority>${priority(r)}</priority>\n  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`;
  writeFileSync(join(DIST, "sitemap.xml"), sitemap);
  console.log(`[prerender] sitemap.xml (${indexable.length} urls)`);

  writeFileSync(
    join(DIST, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`
  );
  console.log("[prerender] robots.txt");
}

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
