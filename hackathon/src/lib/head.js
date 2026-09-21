import { EVENT } from "./event.js";

/**
 * Where the page is published: the club site's domain, under /hackathon/.
 * Used for the canonical and og:url tags. If the mount point ever moves, this
 * and `base` in vite.config.js move together.
 */
export const SITE_ORIGIN = "https://claudeneu.com";
export const SITE_PATH = "/hackathon/";
const SITE_URL = `${SITE_ORIGIN}${SITE_PATH}`;

const TITLE = `${EVENT.name} — ${EVENT.dateRange}, Boston`;
const DESCRIPTION = EVENT.tagline;

/**
 * The contents of <head>, injected into dist/index.html by the prerenderer.
 *
 * Built here rather than written into index.html so the title and description
 * come from the same event data as the page body, and cannot drift from it.
 */
export const HEAD = `<title>${TITLE}</title>
    <meta name="description" content="${DESCRIPTION}" />
    <link rel="canonical" href="${SITE_URL}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESCRIPTION}" />
    <meta property="og:url" content="${SITE_URL}" />
    <meta name="twitter:card" content="summary_large_image" />`;
