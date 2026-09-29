import { EVENT } from "./event.js";
import { PAGES } from "./pages.js";

/**
 * Where the pages are published: the club site's domain, under /hackathon/.
 * Used for the canonical and og:url tags. If the mount point ever moves, this
 * and `base` in vite.config.js move together.
 */
export const SITE_ORIGIN = "https://claudeneu.com";
export const SITE_PATH = "/hackathon/";

const BASE_TITLE = `${EVENT.name} — ${EVENT.dateRange}, Boston`;

/**
 * Per-page title and description. The ticket page is noindex: it only ever
 * shows something with a private ?t= token in the URL, and an empty shell of
 * it in search results would help nobody.
 */
const META = {
  home: { title: BASE_TITLE, description: EVENT.tagline },
  sponsor: {
    title: `Sponsor ${EVENT.name} — ${EVENT.dateRange}, Boston`,
    description:
      "100 Northeastern students build privacy-first products in 36 hours. Sponsors mentor, judge, run challenges on their own tools, and meet the co-op and new-grad talent Boston hires from.",
  },
  signup: {
    title: `Sign up — ${EVENT.name}`,
    description: `Claim one of 100 seats at ${EVENT.name}, ${EVENT.dateLong}, ${EVENT.venue}. $5 per student.`,
  },
  ticket: {
    title: `Your ticket — ${EVENT.name}`,
    description: `Your ${EVENT.name} ticket.`,
    noindex: true,
  },
};

const escape = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * The contents of <head> for one page, injected into its index.html by the
 * prerenderer.
 *
 * Built here rather than written into index.html so the title and description
 * come from the same event data as the page body, and cannot drift from it.
 */
export function headFor(page) {
  const { title, description, noindex } = META[page] || META.home;
  const path = PAGES[page]?.path;
  const url = `${SITE_ORIGIN}${SITE_PATH}${path ? `${path}/` : ""}`;
  return `<title>${escape(title)}</title>
    <meta name="description" content="${escape(description)}" />
    <link rel="canonical" href="${url}" />${noindex ? `\n    <meta name="robots" content="noindex, nofollow" />` : ""}
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />`;
}

/** The home page's head, kept under its old name for anything importing it. */
export const HEAD = headFor("home");
