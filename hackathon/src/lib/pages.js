/**
 * The four pages this app renders, and how a URL picks one.
 *
 * There is still no router: each page is prerendered to its own
 * index.html (scripts/prerender.mjs), and in the browser main.jsx reads the
 * path once to decide which one to hydrate. Nothing navigates client-side.
 *
 * `path` is relative to the mount point, so "sponsor" is
 * claudeneu.com/hackathon/sponsor/.
 */
export const PAGES = {
  home: { path: "" },
  sponsor: { path: "sponsor" },
  signup: { path: "signup" },
  ticket: { path: "ticket" },
};

export const PAGE_NAMES = Object.keys(PAGES);

/** "/hackathon/signup/" → "signup". Anything unknown is the home page. */
export function pageFromPath(pathname, base) {
  const trimmedBase = base.replace(/\/+$/, "");
  const rest = pathname.startsWith(trimmedBase) ? pathname.slice(trimmedBase.length) : pathname;
  const segment = rest.replace(/^\/+|\/+$/g, "").split("/")[0] || "";
  return PAGE_NAMES.find((name) => PAGES[name].path === segment) || "home";
}
