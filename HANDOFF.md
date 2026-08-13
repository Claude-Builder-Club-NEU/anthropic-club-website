# Handoff

Paste this whole file into a fresh session to pick the work up.

---

You are continuing a rebuild of the Claude Builders Club @ Northeastern
website. Read this file, then `PRODUCT.md` and `DESIGN.md`, before changing
anything. `BUILD-BRIEF.md` is the original spec and revision 2 was delivered
separately; both are already implemented.

## What it is

A four-route marketing site for an official Anthropic Claude Builder Club
chapter at Northeastern. React 19 + Vite 7 + Tailwind 3, prerendered to static
HTML, deployed on Netlify.

Routes: `/`, `/about`, `/workshops`, and a real `/404`.

## Repo and branch

- Repo: `https://github.com/Claude-Builder-Club-NEU/anthropic-club-website`
- Working branch: `rebuild/phase-0-setup`, **14 commits ahead of `main`, 0
  behind**. Nothing has been merged yet.
- Local clone: `C:\Users\salam\Documents\Claude\anthropic-club-website`
- Push access confirmed for GitHub user `lamouro` (admin on the org repo).

## THE MOST IMPORTANT THING

**None of this work is live.** `claudebuildersneu.com` is a Netlify site that
builds from a *different* repository, `shourya0523/anthropic-club-website`, not
this one. Verified by fingerprinting the deployed JS bundle against both
rosters.

Until someone repoints Netlify at this repo, every change here is invisible to
the public. That is a Netlify dashboard action (Site configuration → Build &
deploy → link to a different repository) and cannot be done from code. Whoever
owns that Netlify site has to do it.

Do not tell Jackson a change is "live" without checking this first.

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
`dist/index.html`, `dist/about/index.html`, `dist/workshops/index.html`,
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

Current baseline, mobile, all three content routes: **99–100 performance,
100 accessibility, 100 best practices, 100 SEO**, LCP under 2000ms, CLS 0.
Do not regress these.

The design detector is also available and is worth running after UI edits:

```bash
node "C:/Users/salam/.claude/skills/impeccable/scripts/detect.mjs" --json \
  src/index.css src/components src/pages src/lib tailwind.config.js index.html
```

It should report exactly one finding: `codex-grid-background`. That one is a
documented, approved exception (see below). Anything else is new and should be
fixed or documented in `DESIGN.md`, not ignored.

The in-app browser pane frequently stops compositing frames. When that happens
screenshots fail, CSS transitions freeze mid-value, `loading="lazy"` never
fires, and scroll events stop dispatching. None of those are bugs in the site.
Measure the DOM with `javascript_tool` instead; it keeps working.

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
an empty array rather than failing the build. Currently empty because the
calendar ID has not been supplied, so every events surface renders its empty
state, which is the correct shipping state.

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
- **One motion primitive exists sitewide**: the coral highlighter sweep, 150ms
  ease-out. No scroll reveals, no fades, no smooth scrolling, no GIFs. Adding a
  second animation contradicts the brief the whole system is built on. Jackson
  asked about GIFs once; that question is still open and is his call.
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
| 2 | Public Google Calendar ID (`GCAL_ID`) | Events, the calendar, the FAQ calendar link |
| 3 | `VITE_WEB3FORMS_KEY` set in **Netlify** env vars | Workshop pitch form on the deployed site |
| 4 | `VITE_GA_ID` | Analytics. Absent ID is a clean no-op |
| 5 | Slack shared-invite link | The current URL is a workspace sign-in, useless to a prospective member |
| 6 | Rotate the N8N webhook | It sat in `src/.env` in a public repo. Untracking it does not remove it from history |
| 7 | Showcase content | The Workshops showcase renders an empty state |
| 8 | Custom emoji set | Link hub uses authored SVG marks in the meantime |

The Web3Forms key **is** set locally in a gitignored `.env` and the form works
in dev. `.env.example` documents all three variables.

## Open questions and known issues

- **`README.md` is entirely stale.** It still describes React 18, Space Grotesk
  and JetBrains Mono, a `/join` page and the old coral palette. None of that is
  true. It is the first thing a newcomer reads. Worth rewriting.
- `LINKEDIN_PREVIEW_FIX.md` (2.7KB) and `context.json` (24KB) are orphans,
  referenced nowhere. `context.json` has some real project background in it if
  anyone wants to mine it before deleting.
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
