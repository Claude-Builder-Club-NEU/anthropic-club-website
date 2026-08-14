# Handoff

Read this first to pick the work up.

---

You are continuing a rebuild of the Claude Builders Club @ Northeastern
website. Read this file, then `PRODUCT.md` and `DESIGN.md`, before changing
anything. `BUILD-BRIEF.md` is the original spec and revision 2 was delivered
separately; both are already implemented.

## What it is

A five-route marketing site for an official Anthropic Claude Builder Club
chapter at Northeastern. React 19 + Vite 7 + Tailwind 3, prerendered to static
HTML, deployed on Netlify.

Routes: `/`, `/about`, `/events`, `/events/pitch`, and a real `/404`.

`/workshops` was renamed to `/events` (and `/workshops/pitch` to `/events/pitch`).
`netlify.toml` carries 301s from the old paths, so existing links keep working.

## Repo and branch

- Repo: `https://github.com/Claude-Builder-Club-NEU/anthropic-club-website`
- Working branch: `rebuild/phase-0-setup`, **14 commits ahead of `main`, 0
  behind**. Nothing has been merged yet.
- Push access confirmed for GitHub user `lamouro` (admin on the org repo).

## THE MOST IMPORTANT THING

**This repository IS what serves `claudebuildersneu.com`, from the `main`
branch.** An earlier version of this file claimed the live site built from
`shourya0523/anthropic-club-website`. That was wrong, and it was repeated for a
long time. Verified 2026-08-13 by fetching the live page and diffing it against
`origin/main:index.html`: the only differences are the transformations
`vite build` itself makes, `/favicon.png` becoming `./favicon.png` under the old
`base: "./"`, and the dev entry `/src/main.jsx` replaced by the built bundle.
`main`'s own `netlify.toml` carries `command = "npm run build"`,
`publish = "dist"`, and the SPA catch-all that matches how the live site
behaves.

**So merging this branch into `main` publishes it.** Before doing that:

1. **Set `GCAL_ID` and `VITE_WEB3FORMS_KEY` in Netlify's build environment.**
   Without the first, the deployed site builds with zero events even though the
   calendar has entries. Without the second, the pitch form degrades to a link.
2. **Note `NODE_VERSION`.** `main` currently pins 18, which cannot build Vite 7.
   This branch sets 22. That change has to land or the deploy fails.
3. **Note the removed catch-all.** `main` rewrites every path to `index.html`
   with a 200. This branch removes that, because every route is now a real
   prerendered file and unknown paths should return a genuine 404.

## Running it

```bash
npm install
npm run dev          # localhost:5173
npm run build        # prebuild -> client -> ssr -> prerender
npm run lint
npm run og           # regenerate the OG image, manual, rarely needed
```

`npm run build` runs four stages: `fetch-events` and `build-headshots`, then
the client build, then an SSR build, then `scripts/prerender.mjs` which writes
`dist/index.html`, `dist/about/index.html`, `dist/events/index.html`,
`dist/404.html`, plus `sitemap.xml` and `robots.txt`.

## Verifying work — read this before measuring anything

**Do not use `vite preview` to check the built site.** Its SPA fallback serves
`dist/index.html` for every route, so `/about` renders the homepage's HTML and
React hydrates the wrong page. That produces a hydration mismatch that shows up
as a console error and silently costs 4 Lighthouse points. It made an earlier
round of measurements wrong.

Use a plain static server, which routes like Netlify does:

```bash
npx --yes serve@14 dist -l 4173
```

Lighthouse needs a Chrome binary. There is no Chrome on this machine; Edge
works:

```bash
export CHROME_PATH="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
npx --yes lighthouse@12 "http://localhost:4173/" \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=mobile --screenEmulation.mobile \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" \
  --output=json --output-path=./lh.json --quiet
```

Current measurements, mobile (2026-08-13, after the events page landed):

| Route | Perf | A11y | BP | SEO | LCP |
|---|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 100 | 2057ms |
| `/about` | 99 | 100 | 100 | 100 | 2116ms |
| `/events` | 100 | 100 | 100 | 100 | 1354ms |
| `/events/pitch` | 99 | 100 | 100 | 100 | 1954ms |

Accessibility, best practices and SEO are 100 everywhere and must stay there.

`/events` measures fastest because the interest banner, and its 27KB graphic,
moved to the homepage. That is also the whole story of the performance drift on
the other routes: the single shared stylesheet is render-blocking on every page,
so hand-written CSS for one surface is paid for by all of them. Recovering the
last point or two means per-route CSS, which needs either code splitting (breaks
the prerender, since `renderToString` cannot resolve `React.lazy`) or a per-route
`<link>` injected from `headFor` against an unfingerprinted file in `public/`.
Neither is free. PRODUCT.md's floor is >=95 and that holds comfortably.

A local design-quality linter is run over `src/index.css`, `src/components`,
`src/pages`, `src/lib`, `tailwind.config.js` and `index.html` after UI edits.

It should report exactly one finding: a decorative grid background. That one is a
documented, approved exception (see below). Anything else is new and should be
fixed or documented in `DESIGN.md`, not ignored.

A headless browser preview can stop compositing frames. When that happens
screenshots fail, CSS transitions freeze mid-value, `loading="lazy"` never
fires, and scroll events stop dispatching. None of those are bugs in the site.
Measure the DOM from the console instead; that keeps working.

## Architecture, the non-obvious parts

**Prerendering.** `src/entry-server.jsx` renders each route with `StaticRouter`
(from `react-router`, not `react-router-dom/server` — v7 merged the packages).
It also re-exports the route table from `src/lib/seo.js` so the prerenderer can
reach it through the bundle; importing `seo.js` with bare Node fails on Vite's
extensionless imports.

**Per-route head.** `src/lib/seo.js` owns every title, description, canonical,
OG tag and JSON-LD block. `index.html` is a template with an `<!--app-head-->`
marker. Add a route in `ROUTES` and the sitemap follows automatically.

**Events.** Read at *build time* from a public Google Calendar ICS by
`scripts/fetch-events.mjs` into `src/lib/events.generated.json`. There is no
client-side API key and no write path from the site. A calendar outage writes
an empty array rather than failing the build.

The calendar ID is now supplied and wired: `claudebuildersclubneu@gmail.com`,
in `src/lib/links.js` and as `GCAL_ID`. `fetch-events.mjs` reads `.env` itself
so local builds fetch without extra setup. Sharing was switched to "See all
event details" on 2026-08-13 and the feed now carries real titles, locations and
descriptions. Nothing on the events page is hardcoded, so the page shows exactly
what the feed gives it.

**How a calendar entry becomes a card.** There is a convention here and the
board needs to know it, because nothing else on the site can supply this:

| Google Calendar field | What the site does with it |
|---|---|
| **Title** | The card title. Also decides the kind: anything ending "athon" is a hackathon, "info session" / "intro" / "orientation" / "kickoff" is an info session, everything else is a workshop |
| **Location** | Shown beside the time, and as "Where" in the detail |
| **Description** | **The Luma link first, the blurb after it.** The link becomes the "RSVP on Luma" button and is never printed as text; the prose after it becomes the description line |

So a description is written like this:

```
https://lu.ma/claude-info-session
What the club is, what we build, and how to get involved. Open to all.
```

`scripts/fetch-events.mjs` splits those at build time into `rsvpUrl` and
`description`. It copes with the link being wrapped in an anchor, which is what
the Google Calendar web UI does, and with a "RSVP:" style label in front of it.
If the blurb is written *above* the link instead, that is used rather than
nothing. An entry with no link renders no RSVP button rather than a dead one.

**Headshots.** Masters live in `board-src/<slug>.jpg` and are **never
deployed**. `scripts/build-headshots.mjs` emits 320/480/640 in AVIF/WebP/JPEG
into `public/board/`, which is gitignored build output. Anything in `public/`
is copied verbatim into `dist/`, which is why the masters are kept out of it.

To add or replace a headshot: drop `board-src/<slug>.jpg` in and set
`photo: true` on that member in `src/lib/board.js`. Nothing else.

**`sizes` attributes are load-bearing.** They are computed from the real
layout, not estimated, and a wrong value costs real bytes. `BoardCard`'s value
is derived in a comment there. If you change the board grid columns, gaps or
padding, recompute it.

## Design system rules that will trip you up

All of this is in `DESIGN.md`; these are the ones most likely to be violated by
accident.

- **Coral `#d97757` is a fill, never text on paper.** It measures 2.96:1, which
  fails the 4.5:1 body threshold *and* the 3:1 large-text threshold. Coral text
  uses `--coral-text: #a34a2a`. Coral *is* allowed as text on ink (5.90:1),
  which is why board card roles work.
- **`--gray-mid #b0aea5` cannot carry text at any size** (2.11:1). Secondary
  text is `--gray-text: #686560`. The original brief assigned gray-mid to
  "secondary text"; that was unusable and the deviation is recorded.
- **Three motion primitives exist**, all approved and all documented in
  `DESIGN.md`: the coral highlighter sweep (150ms, sitewide), the pitch flow's
  step transition (260ms, `/events/pitch` only), and the events page's hover
  reveal (190ms in / 110ms out, `/events` only). Do not add a fourth. No scroll
  reveals, no parallax, no smooth scrolling, no GIFs. All three come off under
  `prefers-reduced-motion`. Jackson asked about GIFs once; that question is
  still open and is his call.
- **No `box-shadow` for depth.** Depth is tonal. There is exactly one in the
  codebase, the interest banner CTA's focus ring, which is a focus indicator
  rather than decoration and is specified by that band's design.
- **No dashes as prose punctuation** anywhere in rendered copy. Rewrite the
  sentence, do not swap the character. Hyphenated compounds (co-op, Pre-Law,
  hands-on) are fine.
- **No TODO strings in rendered output.**
- The palette is Anthropic's real brand values. A slop detector flags
  warm-cream + terracotta as an AI tell; on this project it is the client's
  actual brand and the finding is a known false positive. Do not substitute it.

**Two approved detector exceptions**, both documented in `DESIGN.md`:
1. The palette, above.
2. The interest banner's dot-grid/scanline background. It is the pinned
   design's console texture, not a default reached for. It applies to that band
   and nowhere else.

**The interest banner** (`src/components/InterestBanner.jsx`) is sized in `cqw`
against its own width, each value being the reference design's pixel
measurement divided by 1320, and locked to `aspect-ratio: 1320/421`. Do not
convert those to fixed pixels; reproducing the raw values at this site's
narrower column is what broke the proportions originally.

## Brand assets

`src/assets/brand/` holds the official Claude Spark, the Anthropic wordmark,
and the Claude Code display type, all from Anthropic's public press kit
(anthropic.com/news → Media assets). `src/assets/brand/README.md` records
provenance and usage rules. Do not stretch, recolour or rotate them, and do not
redraw the type. The Claude wordmark, Claude Code logo and app icon are
deliberately *not* vendored: they are Anthropic's product lockups and using
them as this club's identity would overstate the relationship.

## Blockers — needs Jackson, do not invent these

| # | Needed | Blocks |
|---|---|---|
| 1 | Repoint Netlify at this repo | **Everything. Nothing is live.** |
| 2 | `GCAL_ID` set in **Netlify** env vars | Events on the deployed site. The value is `claudebuildersclubneu@gmail.com` |
| 3 | Luma links in each calendar entry's description | That event's RSVP button. Optional club-wide fallback: `LUMA_URL` in `src/lib/links.js` |
| 4 | `VITE_WEB3FORMS_KEY` set in **Netlify** env vars | Workshop pitch form on the deployed site |
| 5 | `VITE_GA_ID` | Analytics. Absent ID is a clean no-op |
| 6 | Slack shared-invite link | The current URL is a workspace sign-in, useless to a prospective member |
| 7 | ~~Rotate the N8N webhook~~ **RESOLVED** | Nothing was ever exposed here. See below |
| 8 | Showcase content | The events page showcase renders an empty state |
| 9 | Custom emoji set | Link hub uses authored SVG marks in the meantime |

**Blocker 7 was a false alarm, and the record is now corrected.** `src/.env`
*was* committed, in `ba45c15`, and removed in `2de9847`. But the file is 14
bytes and reads `N8N_WEBHOOK =` with an **empty value**: no credential was ever
in it. A scan across every commit and every reachable blob for private keys,
cloud tokens, `sk-`/`ghp_`/`xoxb-`/`AIza` shaped credentials and webhook URLs
found nothing. Rotation is not required: this repository is also what serves the
live site, so there is no second repo left to check.

The calendar's public sharing must stay on **See all event details**. Set to
*See only free/busy* instead, every entry arrives as `SUMMARY:Busy` with no
LOCATION and no DESCRIPTION line at all, and no amount of parsing can recover
what was never sent. That was the state for most of 2026-08-13; it is fixed.

The Web3Forms key **is** set locally in a gitignored `.env` and the form works
in dev. `GCAL_ID` is set there too, and `scripts/fetch-events.mjs` now reads
`.env` directly, so a local build fetches the calendar with no extra setup. A
real environment variable still overrides the file, which is how Netlify wins.
`.env.example` documents every variable.

## Open questions and known issues

- ~~`README.md` is entirely stale.~~ **Rewritten 2026-08-13** against the real
  stack, routes, env vars and calendar convention.
- ~~`LINKEDIN_PREVIEW_FIX.md` and `context.json` are orphans.~~ **Both deleted
  2026-08-13**, recoverable from git history. The first told people to share
  `claudebuilders.com`, the parked domain; the second was the original brief,
  long superseded by `PRODUCT.md` and `DESIGN.md`.
- **Security posture is documented in `SECURITY.md`** and was audited on
  2026-08-13: trust boundaries, data flows, variable mapping, headers and the
  dependency record. Production dependencies are at zero advisories and should
  stay there.
- **Lucas's email was supplied misspelt** as `salzgeber.l@northesatern.edu`.
  Stored as `northeastern.edu`. Unconfirmed.
- **Alex Green's role**: the brief's notes say his role is missing, but the
  roster array gives "Head of Events". The array is used, and the
  missing-role mechanism exists and is one word away if that was wrong.
- Claims deliberately **not** carried forward until confirmed: nothing beyond
  what is in the FAQ. "$18,000 in prizes", "hundreds of students" and free
  Claude Pro were removed as unverified. API credits and merch were reinstated
  because revision 2 explicitly confirmed them.
- FAQ answers and the About page copy are Jackson's drafts, already reviewed.
  Do not reintroduce TODO markers.

## How to work on this

- Verify before claiming. Measure the DOM, run the build, run Lighthouse. Do
  not report a score you did not produce.
- When a spec conflicts with itself or with accessibility, say so and pick with
  reasons rather than silently choosing. Several such conflicts are already
  recorded in code comments; follow that pattern.
- Keep commits scoped and explain *why*, including the deviations.
- Update `DESIGN.md` when a genuinely new token or exception is introduced,
  instead of suppressing the detector.
