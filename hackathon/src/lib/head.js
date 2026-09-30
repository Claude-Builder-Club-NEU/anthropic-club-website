import { EVENT } from "./event.js";
import { PAGES } from "./pages.js";

/**
 * Where the pages are published: the club site's domain, under /hackathon/.
 * Used for the canonical and og:url tags. If the mount point ever moves, this
 * and `base` in vite.config.js move together.
 */
export const SITE_ORIGIN = "https://claudeneu.com";
export const SITE_PATH = "/hackathon/";

/**
 * The link preview (iMessage, Slack, LinkedIn, Discord) and the tab icon.
 * All four are drawn by scripts/build-icons.mjs from the hero's block mark,
 * and committed in public/. og:image has to be an ABSOLUTE url: the apps that
 * fetch it do not resolve a relative one against the page.
 */
const IMAGE = `${SITE_ORIGIN}${SITE_PATH}og.png`;
const IMAGE_ALT = `${EVENT.name}: a hackathon for software that doesn't watch you. ${EVENT.dateLong}, ${EVENT.venue}.`;

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
      "100 Northeastern students build privacy-first products over one weekend. Sponsors mentor, judge, run challenges on their own tools, and meet the co-op and new-grad talent Boston hires from.",
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
    <meta property="og:site_name" content="${EVENT.name}" />
    <meta property="og:image" content="${IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escape(IMAGE_ALT)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${IMAGE}" />
    <link rel="icon" href="${SITE_PATH}favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="${SITE_PATH}favicon-32.png" type="image/png" sizes="32x32" />
    <link rel="apple-touch-icon" href="${SITE_PATH}apple-touch-icon.png" sizes="180x180" />`;
}

/** The home page's head, kept under its old name for anything importing it. */
export const HEAD = headFor("home");
