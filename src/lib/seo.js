/**
 * Per-route head metadata and structured data.
 *
 * Consumed by scripts/prerender.mjs, which bakes it into each route's static
 * HTML. A client-only SPA cannot do this — every route would share one title —
 * which is why the build prerenders.
 *
 * Canonical origin is claudeneu.com. The old markup pointed OG and
 * Twitter tags at claudebuilders.com, which is a PARKED domain serving no site,
 * so link previews resolved to nothing at all.
 */

import { BOARD } from "./board";
import { faqJsonLd } from "./faq";
import { SITE_ORIGIN, INSTAGRAM, LINKEDIN, INTEREST_FORM } from "./links";

const SITE_NAME = "Claude Builders Club @ Northeastern";
const OG_IMAGE = `${SITE_ORIGIN}/og.png`;

/**
 * Titles use a pipe separator rather than the em dash the first brief pinned.
 * Revision 2 §0.1 bans dashes as punctuation and §7 extends that to "anywhere
 * in rendered copy", which includes the browser tab and search results. Say
 * the word and these go back to em dashes.
 */
export const ROUTES = [
  {
    path: "/",
    file: "index.html",
    title: `${SITE_NAME} | Build what's next with Claude`,
    description:
      "Northeastern's official Anthropic Claude Builder Club. Hands-on workshops, community showcase nights and the biggest hackathons on campus, open to every student.",
  },
  {
    path: "/about",
    file: "about/index.html",
    title: `About & Exec Board | ${SITE_NAME}`,
    description:
      "Meet the executive board of Northeastern's Claude Builders Club, and read how a semester of hackathons, workshops and showcase nights actually works.",
  },
  {
    path: "/events",
    file: "events/index.html",
    title: `Events & Calendar | ${SITE_NAME}`,
    description:
      "What's coming up at Northeastern's Claude Builders Club: workshops, info sessions and hackathons, on a calendar you can subscribe to, plus how to run a session of your own.",
  },
  {
    path: "/events/pitch",
    file: "events/pitch/index.html",
    title: `Pitch a workshop | ${SITE_NAME}`,
    description:
      "Propose a workshop for Northeastern's Claude Builders Club. Tell us the topic, roughly when, and what you would cover, and a board member follows up about scheduling it.",
  },
  {
    /**
     * noindex, and deliberately so. This is a working surface for people who
     * are already standing in the room with a code on the screen in front of
     * them. A crawler landing on a check-in form learns nothing about the club,
     * and a search result pointing at it would send students somewhere they
     * cannot use. It stays out of the sitemap for the same reason.
     */
    path: "/attendance",
    file: "attendance/index.html",
    title: `Check in | ${SITE_NAME}`,
    description:
      "Check in to a Claude Builders Club session with the code on the screen and collect a stamp on your card for the term.",
    noindex: true,
  },
  {
    path: "/404",
    file: "404.html",
    title: `Page not found | ${SITE_NAME}`,
    description:
      "That page isn't here. Find the Claude Builders Club at Northeastern's home page, exec board, event calendar and interest form instead.",
    noindex: true,
  },
];

/** EducationalOrganization — sitewide. */
export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  alternateName: "Claude Builder Club at Northeastern University",
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/favicon.png`,
  description:
    "The official Anthropic Claude Builder Club chapter at Northeastern University.",
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "Northeastern University",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Boston",
      addressRegion: "MA",
      addressCountry: "US",
    },
  },
  sameAs: [INSTAGRAM, LINKEDIN],
  potentialAction: {
    "@type": "JoinAction",
    target: INTEREST_FORM,
    name: "Join the club",
  },
});

/** Person per board member — /about only. */
export const boardJsonLd = () =>
  BOARD.map((m) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: m.name,
    ...(m.role ? { jobTitle: m.role } : {}),
    memberOf: { "@type": "EducationalOrganization", name: SITE_NAME },
  }));

/**
 * BreadcrumbList JSON-LD was removed alongside the visible trail.
 *
 * Google's structured-data policy requires markup to represent content the
 * visitor can actually see, so emitting a breadcrumb graph for a page with no
 * breadcrumb on it is a mismatch, not a free win. The trail and its markup were
 * always meant to move together; they still do.
 */

/** Every JSON-LD block for a route, ready to serialise. */
export function structuredDataFor(route) {
  const blocks = [organizationJsonLd()];
  if (route.path === "/") blocks.push(faqJsonLd());
  if (route.path === "/about") blocks.push(...boardJsonLd());
  return blocks;
}

/** The <head> contents for a route, as an HTML string. */
export function headFor(route) {
  const canonical = `${SITE_ORIGIN}${route.path === "/404" ? "/404" : route.path}`;
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  const tags = [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    route.noindex
      ? `<meta name="robots" content="noindex, follow" />`
      : `<meta name="robots" content="index, follow" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:secure_url" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Claude Builders Club at Northeastern University" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:url" content="${canonical}" />`,
    `<meta name="twitter:title" content="${esc(route.title)}" />`,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
  ];

  for (const block of structuredDataFor(route)) {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(block).replace(
        /</g,
        "\\u003c"
      )}</script>`
    );
  }

  return tags.join("\n    ");
}

export { SITE_ORIGIN, SITE_NAME };
