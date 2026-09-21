/**
 * Resolve a site-relative path against wherever the site is mounted.
 *
 * The site lives at claudeneu.com/hackathon/, not at a domain root, so a
 * literal "/logos/acm.png" would ask claudeneu.com for /logos/acm.png — which
 * belongs to the club site and does not exist. Vite rewrites the paths it
 * owns (the bundle, CSS url()s, public-dir references in CSS) against `base`
 * in vite.config.js, but it cannot see a string sitting in a data file, so
 * every such string goes through here instead.
 *
 * Full URLs, data: URIs and in-page anchors are returned untouched, so a
 * sponsor logo hosted elsewhere or a "#" placeholder link still works.
 *
 * React-side only: import.meta.env does not exist when scripts/build-ics.mjs
 * reads src/lib/event.js under bare Node, which is why the data files hold
 * base-relative paths and resolve them here rather than resolving them there.
 */
export function withBase(path) {
  if (!path || /^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith("#")) {
    return path;
  }
  return import.meta.env.BASE_URL + path.replace(/^\/+/, "");
}
