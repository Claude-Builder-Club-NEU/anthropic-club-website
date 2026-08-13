/**
 * Per-route head metadata and structured data.
 *
 * Consumed by scripts/prerender.mjs, which bakes it into each route's static
 * HTML. A client-only SPA cannot do this — every route would share one title —
 * which is why the build prerenders.
 *
 * Canonical origin is claudebuildersneu.com. The old markup pointed OG and
 * Twitter tags at claudebuilders.com, which is a PARKED domain serving no site,
 * so link previews resolved to nothing at all.
 */

import { BOARD } from "./board";
import { faqJsonLd } from "./faq";
import { SITE_ORIGIN, INSTAGRAM, LINKEDIN, INTEREST_FORM } from "./links";

const SITE_NAME = "Claude Builders Club @ Northeastern";
const OG_IMAGE = `${SITE_ORIGIN}/og.png`;

export const ROUTES = [
  {
    path: "/",
    file: "index.html",
    title: `${SITE_NAME} — Build what's next with Claude`,
    description:
      "Northeastern's official Anthropic Claude Builder Club. Hands-on workshops, build nights and hackathons for students who want to build with AI.",
  },
  {
    path: "/about",
    file: "about/index.html",
    title: `About & Exec Board — ${SITE_NAME}`,
    description:
      "Meet the seven students running Northeastern's Claude Builders Club, and read how a semester of workshops, build nights and hackathons actually works.",
    breadcrumb: "About",
  },
  {
    path: "/workshops",
    file: "workshops/index.html",
    title: `Workshops & Events — ${SITE_NAME}`,
    description:
      "Upcoming workshops, build nights and hackathons at Northeastern's Claude Builders Club, plus how to run a session or pitch a project of your own.",
    breadcrumb: "Workshops",
  },
  {
    path: "/404",
    file: "404.html",
    title: `Page not found — ${SITE_NAME}`,
    description:
      "That page isn't here. Find the Claude Builders Club at Northeastern's home page, exec board, workshop calendar and interest form instead.",
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

export const breadcrumbJsonLd = (label, path) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
    {
      "@type": "ListItem",
      position: 2,
      name: label,
      item: `${SITE_ORIGIN}${path}`,
    },
  ],
});

/** Every JSON-LD block for a route, ready to serialise. */
export function structuredDataFor(route) {
  const blocks = [organizationJsonLd()];
  if (route.path === "/") blocks.push(faqJsonLd());
  if (route.path === "/about") blocks.push(...boardJsonLd());
  if (route.breadcrumb) {
    blocks.push(breadcrumbJsonLd(route.breadcrumb, route.path));
  }
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
