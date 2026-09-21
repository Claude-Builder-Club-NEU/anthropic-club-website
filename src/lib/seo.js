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
import { POSTS, authorFor, findPost } from "./blog";
import { faqJsonLd } from "./faq";
import { SITE_ORIGIN, INSTAGRAM, LINKEDIN, JOIN_PATH } from "./links";
import { UNSUBSCRIBE_PATH, UNSUBSCRIBE_SLUG } from "./unsubscribe";
import { FEATURE_PATH } from "./feature";

const SITE_NAME = "Claude Builders Club @ Northeastern";
const OG_IMAGE = `${SITE_ORIGIN}/og.png`;

/**
 * One prerendered route per blog post.
 *
 * The OPPOSITE call to /polls, and deliberately. A ballot closes, so only the
 * hub is prerendered and netlify.toml rewrites the slugs onto it. A post does
 * not close: its URL is meant to be shared and to keep resolving, and a crawler
 * should find real HTML carrying that post's own title. So each one is a real
 * file here, with a real title, description, canonical and sitemap line, and an
 * unpublished slug stays a genuine 404.
 *
 * Every field past `description` is OPTIONAL in headFor() and
 * structuredDataFor(), which is why the seven routes below emit exactly the
 * tags they emitted before any of this existed.
 */
const postRoute = (post) => ({
  path: `/blog/${post.slug}`,
  file: `blog/${post.slug}/index.html`,
  // The pipe, not a dash, same as every other title in this array.
  title: `${post.title} | ${SITE_NAME}`,
  description: post.excerpt,
  slug: post.slug,
  ogType: "article",
  author: authorFor(post)?.name || null,
  publishedTime: post.date,
  modifiedTime: post.updated || null,
  // A published post is finished writing. Weekly would ask crawlers to keep
  // returning to a file that is not going to change.
  changefreq: "yearly",
  priority: "0.6",
  lastmod: post.updated || post.date,
});

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
    path: "/blog",
    file: "blog/index.html",
    title: `Blog | ${SITE_NAME}`,
    description:
      "Write-ups from Northeastern's Claude Builders Club: what happened at the sessions we run, and notes on what members are building.",
    changefreq: "weekly",
    priority: "0.7",
    ...(POSTS[0] ? { lastmod: POSTS[0].updated || POSTS[0].date } : {}),
  },
  ...POSTS.map(postRoute),
  {
    /**
     * The site's primary conversion action, and the page every "Join the club"
     * button on every other page now points at. Indexable, unlike the other two
     * task surfaces: /attendance is noindex because a check-in form teaches a
     * searcher nothing, but somebody googling this club and landing on the
     * sign-up form has landed exactly where they meant to.
     *
     * Prerendered like everything else, so the welcome screen and its heading
     * are in the HTML before any JavaScript runs. The six questions are not:
     * they are a client-side flow, which is correct, because a crawler has
     * nothing to gain from question four.
     */
    path: JOIN_PATH,
    file: "join/index.html",
    title: `Join the club | ${SITE_NAME}`,
    description:
      "Sign up for Northeastern's Claude Builders Club. Six questions, about thirty seconds, and we build the semester around your answers.",
    priority: "0.9",
  },
  {
    /**
     * Get featured on the blog: the standing invitation to be interviewed, or
     * to have a project written up.
     *
     * INDEXED, and the comparison that settles it is /attendance below rather
     * than /join above. /attendance is noindex because a check-in form is
     * useless to anyone who is not already standing in the room with a code on
     * the screen in front of them. This page is the opposite of that: it is a
     * public call to action that is equally true on any day of the year, a
     * searcher who lands on it learns something real about the club (its blog
     * interviews members and writes up what they build), and they can act on it
     * from wherever they are. That is the same test /join passes.
     *
     * It is not /fallfest either. That one is noindex because it is a page
     * named after a date: the event ends, the page goes stale, and a thin
     * landing page competes with the homepage for searches of the club's own
     * name. Nothing here expires.
     *
     * PRIORITY 0.5, below /blog's 0.7, deliberately. This page feeds the blog
     * and must not outrank it: somebody searching for the club's writing wants
     * the writing, and this is the side door for the smaller number of people
     * who want to be in it. changefreq is yearly for the reason a published
     * post is yearly, which is that six questions are not going to move.
     *
     * Prerendered like every other route, so the invitation and its heading are
     * in the HTML before any JavaScript runs. The six questions are not, and
     * should not be: a crawler has nothing to gain from question four.
     *
     * FEATURE_PATH rather than a literal, matching JOIN_PATH and
     * UNSUBSCRIBE_PATH, so this entry, the <Route> in App.jsx and any link to
     * the page cannot drift apart.
     */
    path: FEATURE_PATH,
    file: "featureme/index.html",
    title: `Get featured on the blog | ${SITE_NAME}`,
    description:
      "Ask to be interviewed for the Claude Builders Club blog at Northeastern, or to have something you built written up. Six questions, and a board member reads every one.",
    changefreq: "yearly",
    priority: "0.5",
  },
  {
    /**
     * The club fair landing page, reached by scanning a QR code on a table
     * sign. Prerendered, so the code, the printed URL and anyone typing it all
     * work identically.
     *
     * noindex, and the reason is not that it is unimportant. It is that
     * /fallfest is a page named after a date. The event it was printed for ends
     * in a day, the tile beneath it moves on to whatever is next on the
     * calendar, and a thin two-tile page competing with the homepage for
     * searches of the club's own name is a bad trade in both directions.
     * `noindex` also drops it from sitemap.xml, which is the same reason.
     */
    path: "/fallfest",
    file: "fallfest/index.html",
    title: `Fall Fest | ${SITE_NAME}`,
    description:
      "Join Northeastern's Claude Builders Club, and come to the next info session.",
    noindex: true,
  },
  {
    /**
     * The hub only. Individual ballots at /polls/:slug are NOT prerendered and
     * are not listed here: a poll is added by dropping a JSON file in, polls
     * close, and a sitemap full of dead ballots is worse than one that points
     * at the hub and lets it list what is live. netlify.toml rewrites
     * /polls/* to this page so the client router can resolve a slug.
     */
    path: "/polls",
    file: "polls/index.html",
    title: `Polls | ${SITE_NAME}`,
    description:
      "Vote on what Claude Builders Club runs this term: which workshops, the mini hackathon theme, and everything else. Anonymous, and nothing asks for your name.",
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
    /**
     * The newsletter's unsubscribe page, at a random 20-character path.
     *
     * noindex, and for a stronger reason than /attendance above. That page is
     * merely useless to a searcher; this one should not be FINDABLE. The random
     * slug stops it being guessed, noindex keeps it out of search results, and
     * `noindex` also drops it from sitemap.xml, since the prerenderer builds
     * that list from the routes that lack this flag.
     *
     * It is deliberately absent from robots.txt as well. A Disallow line is a
     * public list of the paths you did not want found, so putting it there
     * would publish exactly what the random slug is for.
     *
     * Prerendered like every other route, so the form is on screen before any
     * JavaScript runs.
     */
    path: UNSUBSCRIBE_PATH,
    file: `${UNSUBSCRIBE_SLUG}/index.html`,
    title: `Unsubscribe | ${SITE_NAME}`,
    description:
      "Stop receiving the Claude Builders Club newsletter at Northeastern.",
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
    // ABSOLUTE, and it has to be. JOIN_PATH is "/join" since the form came off
    // Typeform, and a relative URL in structured data has no base to resolve
    // against once a crawler has lifted the JSON-LD out of the page. Built here
    // rather than exported from links.js, where SITE_ORIGIN is declared below
    // JOIN_PATH and referencing it from up there would throw at module load.
    target: `${SITE_ORIGIN}${JOIN_PATH}`,
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

const postUrl = (post) => `${SITE_ORIGIN}/blog/${post.slug}`;

/** Blog — the index only. */
export const blogJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${SITE_ORIGIN}/blog#blog`,
  name: `${SITE_NAME} blog`,
  url: `${SITE_ORIGIN}/blog`,
  inLanguage: "en-US",
  publisher: {
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_ORIGIN,
  },
  // Omitted entirely while there are no posts. `blogPost: []` is a claim that
  // the blog is empty; saying nothing is not.
  ...(POSTS.length
    ? {
        blogPost: POSTS.map((post) => ({
          "@type": "BlogPosting",
          "@id": postUrl(post),
          headline: post.title,
          url: postUrl(post),
          datePublished: post.date,
        })),
      }
    : {}),
});

/** BlogPosting — one per post route. */
export const blogPostingJsonLd = (post) => {
  const author = authorFor(post);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": postUrl(post),
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl(post) },
    url: postUrl(post),
    // post.title, not route.title: the route appends the site name for the
    // browser tab, and a headline is truncated around 110 characters.
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    ...(post.updated ? { dateModified: post.updated } : {}),
    inLanguage: "en-US",
    image: [OG_IMAGE],
    // Resolved from lib/board.js, never free text, so a byline cannot credit
    // somebody who is not on the board.
    author: author
      ? {
          "@type": "Person",
          name: author.name,
          ...(author.role ? { jobTitle: author.role } : {}),
          ...(author.linkedin ? { sameAs: [author.linkedin] } : {}),
        }
      : { "@type": "Organization", name: SITE_NAME, url: SITE_ORIGIN },
    publisher: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: SITE_ORIGIN,
      logo: { "@type": "ImageObject", url: `${SITE_ORIGIN}/favicon.png` },
    },
    isPartOf: { "@type": "Blog", "@id": `${SITE_ORIGIN}/blog#blog` },
  };
};

/** Every JSON-LD block for a route, ready to serialise. */
export function structuredDataFor(route) {
  const blocks = [organizationJsonLd()];
  if (route.path === "/") blocks.push(faqJsonLd());
  if (route.path === "/about") blocks.push(...boardJsonLd());
  if (route.path === "/blog") blocks.push(blogJsonLd());
  // `slug` is set only by postRoute(), so this is the post hook and cannot fire
  // on the index or on any other route. A startsWith("/blog/") test would.
  if (route.slug) {
    const post = findPost(route.slug);
    if (post) blocks.push(blogPostingJsonLd(post));
  }
  return blocks;
}

/** The <head> contents for a route, as an HTML string. */
export function headFor(route) {
  const canonical = `${SITE_ORIGIN}${route.path === "/404" ? "/404" : route.path}`;
  const esc = (s) =>
    String(s)
      // Collapsed first: a description carrying a newline would otherwise break
      // the attribute across lines in the emitted HTML.
      .replace(/\s+/g, " ")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");

  /**
   * Per-route override, defaulting to what this function emitted before it
   * existed, so a route that does not set it is byte identical.
   */
  const ogType = route.ogType || "website";

  const tags = [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    route.noindex
      ? `<meta name="robots" content="noindex, follow" />`
      : `<meta name="robots" content="index, follow" />`,
    `<meta property="og:type" content="${ogType}" />`,
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

  /**
   * article:* means nothing on og:type=website and a validator flags it there,
   * so posts set these and nothing else does.
   *
   * article:author is deliberately absent: the OG spec wants an og:profile
   * document in that slot and a LinkedIn page is not one. The byline goes out
   * as the standard author meta plus a real Person inside the BlogPosting
   * JSON-LD, which is what search engines actually read.
   */
  if (route.author)
    tags.push(`<meta name="author" content="${esc(route.author)}" />`);
  if (ogType === "article") {
    if (route.publishedTime)
      tags.push(
        `<meta property="article:published_time" content="${esc(route.publishedTime)}" />`
      );
    if (route.modifiedTime)
      tags.push(
        `<meta property="article:modified_time" content="${esc(route.modifiedTime)}" />`
      );
  }

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
