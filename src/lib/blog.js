/**
 * Blog.
 *
 * A post is a markdown file in `src/content/blog/`. Drop the file in and it is
 * published: this module globs the folder, so there is no register-it-here list
 * to forget. That is a deliberate DEPARTURE from lib/polls.js, which documents
 * the opposite house pattern ("drop the JSON in, import it, put it at the
 * top"). A ballot that is not registered simply is not offered yet, whereas a
 * post that is not registered is a silent non-publish that nobody notices for a
 * week. The drafts folder below covers the risk the glob introduces, which is
 * an unfinished file going live.
 *
 * The glob is EAGER, and that is load bearing rather than a tuning knob.
 * renderToString cannot suspend and main.jsx hydrates, so a post body has to be
 * available synchronously on the server and in the browser or the first paint
 * is empty and hydration mismatches. Vite inlines each file into both bundles
 * as a string literal, which is also why scripts/prerender.mjs needs no change:
 * it imports dist-ssr with bare Node and the post bodies are already in there.
 *
 * NO JSX IN THIS FILE. lib/seo.js imports it to build one route per post, and
 * `vite build --ssr` refuses JSX in a .js file. Rendering lives in
 * components/PostBody.jsx.
 *
 * TO ADD A POST
 *   1. Write `src/content/blog/<slug>.md`. The filename is the URL, so
 *      `september2026.md` serves at /blog/september2026.
 *   2. Give it the frontmatter below. `title`, `date` and `excerpt` are the
 *      three that matter; everything else is optional.
 *   3. Pictures are optional. Put masters in `blog-src/<slug>/` and see
 *      scripts/build-blog-images.mjs.
 *
 * TO PARK AN UNFINISHED ONE
 *   Put it in `src/content/blog/drafts/` instead. It renders on the dev server
 *   and is left out of the production build entirely, text included. Move it up
 *   one directory to publish. There is no `draft:` flag and writing one is an
 *   error, for the reason recorded beside DRAFT_FILES below.
 *
 * FRONTMATTER, a restricted key/value header (see lib/markdown.js)
 *   title      required. Sentence case. No dashes as punctuation.
 *   date       required. YYYY-MM-DD, the calendar date, no time.
 *   excerpt    the one or two sentences shown on /blog AND used as the route's
 *              meta description. Aim for 120 to 155 characters. Derived from
 *              the first paragraph when absent, but writing it is better.
 *   lead       optional standfirst, shown on the post page only.
 *   thumb      optional filename in `blog-src/<slug>/`, e.g. `hero.jpg`. Its
 *              16:9 crop is the thumbnail on /blog.
 *   thumbAlt   required whenever `thumb` is set. What the picture SHOWS, never
 *              the title again.
 *   author     optional slug from lib/board.js. A name is never free text, so a
 *              byline cannot credit somebody who is not on the board.
 *   updated    optional YYYY-MM-DD.
 */

import { BOARD } from "./board";
import {
  parseFrontmatter,
  parseMarkdown,
  firstParagraphText,
} from "./markdown";

const FILES = import.meta.glob("../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

/**
 * Drafts are a DIRECTORY, not a flag, and the reason is the bundle.
 *
 * An eager `?raw` glob inlines every file it matches into the JavaScript as a
 * string literal, so a `draft: true` flag filtered at runtime would keep an
 * unfinished post off every page and out of the sitemap while still serving its
 * full text to anyone who opened the bundle. The glob above is not recursive,
 * so a file in `drafts/` is never matched by it at all.
 *
 * This second glob is behind `import.meta.env.DEV`, which Vite replaces with a
 * literal `false` in the production build, so Rollup drops the branch and the
 * imports with it. VERIFIED: a probe draft carrying a unique string built
 * clean and the string appears nowhere under dist/.
 */
const INCLUDE_DRAFTS = import.meta.env.DEV;

const DRAFT_FILES = INCLUDE_DRAFTS
  ? import.meta.glob("../content/blog/drafts/*.md", {
      query: "?raw",
      import: "default",
      eager: true,
    })
  : {};

const SLUG = /^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The excerpt is also the meta description, so it is capped rather than left to
 * run. Cut on a sentence boundary where there is one, on a word boundary where
 * there is not, and close with the ellipsis CHARACTER: three dots are three
 * characters of noise and a dash is banned in rendered copy.
 */
function deriveExcerpt(blocks) {
  const text = firstParagraphText(blocks);
  if (text.length <= 160) return text;

  const sentence = text.slice(0, 161).search(/[.?!]\s(?!.*[.?!]\s)/);
  if (sentence > 60) return text.slice(0, sentence + 1);

  const word = text.slice(0, 157).lastIndexOf(" ");
  return `${text.slice(0, word > 0 ? word : 157)}…`;
}

/**
 * The shape check is not enough on its own.
 *
 * The raw string is what reaches every machine-readable slot: the `datetime`
 * attribute, `article:published_time`, the JSON-LD `datePublished` and the
 * sitemap's `lastmod`. Meanwhile `new Date(y, m - 1, d)` rolls an overflow
 * forward, so 2026-09-31 would render as "Oct 1, 2026" beside a datetime
 * attribute that still said the 31st, and would put a value no sitemap
 * validator accepts into lastmod. Round-tripping the parse is the only way to
 * tell a typo from a date.
 */
function assertDate(slug, field, value, required) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`[blog] ${slug}: ${field} is required`);
    return;
  }
  const text = String(value);
  if (!DATE.test(text)) {
    throw new Error(`[blog] ${slug}: ${field} must be YYYY-MM-DD, got ${text}`);
  }
  const [y, m, d] = text.split("-").map(Number);
  const probe = new Date(y, m - 1, d);
  if (
    probe.getFullYear() !== y ||
    probe.getMonth() !== m - 1 ||
    probe.getDate() !== d
  ) {
    throw new Error(`[blog] ${slug}: ${text} is not a real calendar date`);
  }
}

function toPost(path, raw) {
  // "../content/blog/september2026.md" -> "september2026"
  const filename = path.slice(path.lastIndexOf("/") + 1).replace(/\.md$/, "");
  const { data, body } = parseFrontmatter(raw);
  const slug = String(data.slug || filename);

  if (!SLUG.test(slug)) {
    throw new Error(`[blog] ${filename}.md: bad slug ${JSON.stringify(slug)}`);
  }
  if (!data.title) {
    throw new Error(`[blog] ${slug}: frontmatter is missing a title`);
  }
  assertDate(slug, "date", data.date, true);
  assertDate(slug, "updated", data.updated, false);
  if (data.thumb && !data.thumbAlt) {
    throw new Error(`[blog] ${slug}: thumb needs a thumbAlt describing it`);
  }
  // There is no `draft:` flag, and typing one has to fail loudly rather than
  // appear to work. A flag filtered at runtime would leave the post's full text
  // in the public bundle, and a flag written `draft: True` would not even parse
  // as a boolean, so the post would publish with no warning at all.
  if ("draft" in data) {
    throw new Error(
      `[blog] ${slug}: there is no draft flag. Move the file to ` +
        `src/content/blog/drafts/ instead, where it renders on the dev server ` +
        `and is left out of the build entirely.`
    );
  }

  const blocks = parseMarkdown(body);

  return {
    slug,
    title: String(data.title),
    date: String(data.date),
    updated: data.updated ? String(data.updated) : null,
    excerpt: (data.excerpt ? String(data.excerpt) : deriveExcerpt(blocks))
      .replace(/\s+/g, " ")
      .trim(),
    lead: data.lead ? String(data.lead) : null,
    thumb: data.thumb ? String(data.thumb) : null,
    thumbAlt: data.thumbAlt ? String(data.thumbAlt) : null,
    author: data.author ? String(data.author) : null,
    blocks,
  };
}

/**
 * Slugs are checked rather than trusted. seo.js turns a slug into
 * `blog/<slug>/index.html` and prerender.mjs writes it with mkdirSync, so a
 * slug carrying a slash would write outside dist/ and a duplicate would
 * silently overwrite an earlier post. Both fail the build here, where the
 * message names the offender.
 */
function assertUnique(posts) {
  const seen = new Set();
  for (const post of posts) {
    if (seen.has(post.slug)) {
      throw new Error(`[blog] duplicate slug: ${post.slug}`);
    }
    seen.add(post.slug);
  }
  return posts;
}

/**
 * Published posts, newest first, with the slug as the tie break so two posts
 * sharing a date cannot reorder between builds and churn the sitemap.
 */
export const POSTS = assertUnique(
  Object.entries({ ...FILES, ...DRAFT_FILES })
    .map(([path, raw]) => toPost(path, raw))
    .sort((a, b) =>
      a.date === b.date
        ? a.slug.localeCompare(b.slug)
        : b.date.localeCompare(a.date)
    )
);

export const hasPosts = POSTS.length > 0;

export function findPost(slug) {
  return POSTS.find((post) => post.slug === slug) || null;
}

/** The next post down the page, for the footer. Null on the oldest. */
export function olderThan(slug) {
  const at = POSTS.findIndex((post) => post.slug === slug);
  return at >= 0 ? POSTS[at + 1] || null : null;
}

/** The board member who wrote it, or null. Never a free-text name. */
export function authorFor(post) {
  return BOARD.find((member) => member.slug === post?.author) || null;
}

/**
 * "Sep 1, 2026".
 *
 * Built from the split parts, NEVER `new Date("2026-09-01")`. The string form
 * parses as UTC midnight, and toLocaleDateString then renders it as Aug 31 in
 * every US timezone. The same trap is why events.js formats the way it does.
 */
export function formatPostDate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------------ *
 * Images
 *
 * Masters live in `blog-src/<slug>/` and are never deployed;
 * scripts/build-blog-images.mjs writes derivatives into `public/blog-img/`.
 * Nothing in a post ever names a derivative path, so the width ladder can
 * change here without touching a single markdown file.
 *
 * `/blog-img/`, not `/blog/`: a Netlify header rule written for "/blog/*"
 * would also match the prerendered `/blog/<slug>/index.html`, putting an image
 * cache policy on the post pages. The two namespaces stay disjoint.
 * ------------------------------------------------------------------------ */

const IMG_BASE = "/blog-img";

/** 2x cover for the 88, 160 and 256 CSS px the thumbnail renders at. */
export const CARD_WIDTHS = [176, 352, 560];

/**
 * The article shell is `--measure` plus `--space-32`, which is 68ch of Lora at
 * 17px plus 128px. MEASURED in the browser with the real face loaded: 718 + 128
 * = 846px. 848 is therefore 1x, 1696 is 2x, and 1272 sits between them.
 *
 * The numbers are measured rather than estimated because `ch` depends on the
 * font: an arithmetic guess at 68ch is out by 100px, which is exactly enough to
 * make every figure on the site load one rung too small and render soft.
 */
export const FIGURE_WIDTHS = [848, 1272, 1696];

/**
 * Measured against the real container insets, which step 24 / 40 / 64 as
 * Tailwind's sm and lg breakpoints pass. Do not assume lg:px-16 below 1024px.
 */
export const CARD_SIZES = "(min-width: 52rem) 160px, 88px";
export const LEAD_CARD_SIZES =
  "(min-width: 64rem) 256px, (min-width: 52rem) 160px, 88px";

/**
 * A figure that breaks out sits on the shell's edges, 846px, but only at 58rem
 * (928px) and up: that is where the shell stops growing, since the sm band
 * insets 40px a side and 928 - 80 = 848 is the first width at or past the cap.
 * Below that the breakout is off and a figure fills the prose column, which is
 * itself the content width minus whichever inset is in force.
 */
export const FIGURE_SIZES =
  "(min-width: 58rem) 848px, (min-width: 40rem) calc(100vw - 80px), calc(100vw - 48px)";

/**
 * An inset figure never breaks out, so it is capped by the prose column: 68ch
 * of Lora at 17px, measured at 718px. 50rem (800px) is where the sm band's
 * content width, 100vw - 80, first passes that.
 */
export const INSET_FIGURE_SIZES =
  "(min-width: 50rem) 718px, (min-width: 40rem) calc(100vw - 80px), calc(100vw - 48px)";

/**
 * A portrait figure is capped at --measure-tight, 46ch in the same context, so
 * 46/68 of 718px is 486px. 34rem (544px) is where 100vw - 48 first passes it.
 */
export const PORTRAIT_FIGURE_SIZES =
  "(min-width: 34rem) 486px, calc(100vw - 48px)";

/** "hero.jpg" -> "/blog-img/september2026/hero". */
export function imageBase(slug, file) {
  const name = String(file).replace(/\.[^.]+$/, "");
  return `${IMG_BASE}/${slug}/${name}`;
}

/** "…/hero-736.avif 736w, …" */
export function srcSet(base, widths, ext, suffix = "") {
  return widths.map((w) => `${base}${suffix}-${w}.${ext} ${w}w`).join(", ");
}

/** Card derivatives carry a `-card` suffix so a crop never shadows a figure. */
export const CARD_SUFFIX = "-card";
