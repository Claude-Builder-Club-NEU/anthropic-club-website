<div align="center">

# Claude Builders Club @ Northeastern

**The website for Northeastern's chapter of Anthropic's Claude Builder Club program.**

A five-route static site that runs on a Google Calendar and two form services,
so the exec board can keep it current without ever opening this repository.

React 19 · Vite 7 · Tailwind 3 · Prerendered to static HTML · Netlify

</div>

---

> [!IMPORTANT]
> **`claudebuildersneu.com` is served from this repository's `main` branch.**
> Netlify builds `main` with `npm run build` and publishes `dist/`. Merging to
> `main` therefore publishes. Set `GCAL_ID` and `VITE_WEB3FORMS_KEY` in the
> Netlify build environment first, or the deploy will build with no events and a
> degraded pitch form.

---

## What the site is for

The club's problem is not that people dislike it. It is that a student sees a
flyer or an Instagram story, wonders whether they are "technical enough", and
never finds out when the next session is. The site exists to close that gap, and
it splits by audience rather than trying to serve everyone on every page:

- **The homepage persuades.** It is written for someone who is not sure they
  belong, and its single goal is a submitted interest form.
- **The events page operates.** It is written for someone who has already
  decided and now needs a date, a room and an RSVP.

Two rules follow from that and are worth knowing before you change anything:

1. **One conversion action.** The interest form is the goal on every
   prospective-member surface. Competing calls to action dilute it.
2. **Never fabricate proof.** No invented stats, member counts, testimonials or
   benefits. Where something does not exist yet, the site says so plainly. An
   honest empty state beats a fictional one, and the empty states here are
   designed surfaces rather than accidents.

## The pages

| Route | What it does |
|---|---|
| `/` | Hero, link hub, what a Claude Builder Club is, what this chapter does, the interest banner with upcoming events beneath it, and the FAQ |
| `/about` | The club's story and the seven-person executive board, with headshots, roles, majors and contact links |
| `/events` | Upcoming events as feature cards, a month calendar, and the two ways to get more involved |
| `/events/pitch` | A full-screen, one-question-at-a-time form for pitching a workshop |
| `/404` | A real HTTP 404 with links back to everything, not a soft 200 |

`/workshops` was renamed to `/events`; permanent redirects in `netlify.toml`
keep old links from Instagram bios and printed QR codes working.

---

## Integrations, and what each one does for the club

Every external service here was chosen for the same reason: **the board should
be able to change what the site says without touching code.** Students maintain
this between coursework, and anything that requires a pull request to update
will go stale.

### 📅 Google Calendar — the events engine

**What it does for the club:** one board member adds an event to a shared Google
Calendar, and it appears on the website. No deploy, no developer, no CMS login.
The calendar is the single source of truth for what the club is running.

**How it works.** At *build time*, `scripts/fetch-events.mjs` fetches the
calendar's public ICS feed and writes `src/lib/events.generated.json`. Nothing
is fetched from the browser, so there is no API key in the bundle, no runtime
dependency on Google being up, and no way for the public site to write back. A
calendar outage never fails the build and never overwrites good data: the
previously generated events are kept exactly as they were.

One calendar entry becomes an event card, a calendar chip and a detail popover.
The mapping is a convention the board needs to know, because nothing else can
supply it:

| Calendar field | What the site does with it |
|---|---|
| **Title** | The event name. It also decides the colour: anything ending "athon" is a **hackathon**, "info session" / "intro" / "orientation" / "kickoff" is an **info session**, everything else is a **workshop** |
| **Location** | Shown beside the time, and as "Where" in the detail |
| **Description** | **The Luma link on the first line, the blurb underneath.** The link becomes the RSVP button and is never printed as text; the prose after it becomes the description |

So a description is written like this:

```
https://luma.com/your-event-id
What the club is, what we build, and how to get involved. Open to all.
```

The parser copes with the link being wrapped in an anchor, which is what the
Google Calendar web UI produces, and with an "RSVP:" style label in front of it.

> [!WARNING]
> **Calendar sharing must be set to "See all event details".** Set to "See only
> free/busy" instead, every entry arrives titled `Busy` with no location and no
> description, and there is nothing the site can do to recover what was never
> sent. This is the single most common way to break the events page.

Because events are read at build time, a scheduled GitHub Action
(`.github/workflows/refresh-events.yml`) re-reads the calendar **every hour**,
commits the result only when it actually changed, and lets that push trigger a
deploy. Add an event to the calendar and it appears on the site within the hour,
with nobody touching the repository. There is a **Run workflow** button on the
Actions tab if you do not want to wait.

A failed fetch never overwrites good data, so a network blip changes nothing
rather than emptying the calendar.

### 🎟️ Luma — per-event RSVP

**What it does for the club:** headcounts. The board needs to know how many
people are coming so they can book the right room and order the right amount of
pizza, and Luma handles the ticketing, reminders and check-in that a calendar
cannot.

Each event carries **its own** Luma link, parsed from that entry's calendar
description, so RSVP buttons on the cards, the tiles and the calendar popover
all point at the right event. Nothing is configured in code. An entry with no
link renders no button rather than one that goes nowhere.

### 📝 Typeform — the interest form

**What it does for the club:** it is the front door. Everything on the
prospective-member surfaces funnels here, and a submission is what "success"
means for this site. It collects the contact details the board uses to email
people about what is coming up.

It is linked, not embedded: no third-party script, no iframe, no performance or
privacy cost to the site itself.

### ✉️ Web3Forms — the workshop pitch form

**What it does for the club:** it turns "you should run a workshop" from a
conversation into an inbox item. A student who can build something in an hour
can teach it, and this is how they raise their hand without needing to know
which board member to email.

`/events/pitch` asks five questions one screen at a time: name, Northeastern
email, topic, rough timeframe, and what they would cover. Web3Forms posts the
result straight to the board's inbox. There is **no backend to run and no
database to secure**, which is the point.

Specifics worth knowing:

- Only `northeastern.edu`, `husky.neu.edu` and `neu.edu` addresses are accepted.
- Spam is handled by Web3Forms' own honeypot field, discarded server-side.
- Without the access key the flow does not render a form that would silently
  fail; it routes people to the interest form instead.
- The key is public by design (see [Environment](#environment)).

### 📈 Google Analytics 4 — what people actually do

**What it does for the club:** answers "is the Instagram link working?" and
"does anyone reach the events page?" so the board can spend effort where it
counts.

Deliberately restrained. The script loads **after** the page is interactive, so
it never competes with first paint. No personal information is collected, IPs
are anonymised, and outbound clicks are recorded by name only. With no
measurement ID configured it is a clean no-op and **no third-party script loads
at all**.

Events tracked: `join_click`, `slack_click`, `instagram_click`,
`linkedin_click`, `email_signup`, `calendar_view`.

### 🔗 Slack, Instagram and LinkedIn — the link hub

**What it does for the club:** most visitors arrive from a social profile and
want to go back to one. The link row sits on the first screen rather than being
a footer afterthought, so "where do I follow this?" is answered immediately.

---

## How it is built, and why

### Prerendering

This is a React app that ships as **real HTML files**, one per route. `npm run
build` runs four stages:

```
prebuild   fetch the calendar  +  generate headshot derivatives
   ↓
client     the browser bundle
   ↓
SSR        a server build of the same app
   ↓
prerender  render every route to static HTML, write sitemap.xml + robots.txt
```

**Why bother.** A client-only single-page app serves the same `<title>` and an
empty `<div>` to everything that is not a browser. That breaks the three things
this site actually needs: a distinct title and description per page in search
results, real structured data, and a genuine HTTP 404. Prerendering gets all
three while keeping the app a normal React app to work on.

`src/lib/seo.js` owns every title, description, canonical URL, Open Graph tag
and JSON-LD block. Add a route to its `ROUTES` table and the sitemap follows
automatically.

### Structured data

The site publishes `EducationalOrganization` markup sitewide, `FAQPage` on the
homepage, and a `Person` entry per board member on the About page. The FAQ
markup is generated from the same source as the rendered copy, so the two cannot
drift apart and tell Google something different from what a visitor sees.

### Headshots

Masters live in `board-src/<slug>.jpg` and are **never deployed**.
`scripts/build-headshots.mjs` generates 320 / 480 / 640 widths in AVIF, WebP and
JPEG into `public/board/`, and the board cards pick the smallest adequate file.

Adding someone's photo is two steps and no code:

1. Drop `board-src/<slug>.jpg` in.
2. Set `photo: true` on that member in `src/lib/board.js`.

Members without a photo get a designed initials placeholder in an identically
sized box, so adding a picture later shifts nothing on the page.

### Social preview image

`npm run og` generates `public/og.png`, the 1200×630 image that appears when
someone shares a link. It is generated manually and committed rather than built
every deploy, because the display font is embedded into it and that work does
not need repeating.

---

## Running it

```bash
npm install
npm run dev      # localhost:5173
npm run build    # prebuild -> client -> SSR -> prerender
npm run lint
npm run og       # regenerate the social preview image, rarely needed
```

> [!CAUTION]
> **Do not use `npm run preview` to check the built site.** Its fallback serves
> `index.html` for every path, so interior routes hydrate against the wrong HTML
> and every measurement you take will be wrong. Use a plain static server, which
> routes the way Netlify does:
>
> ```bash
> npx --yes serve@14 dist -l 4173
> ```

## Environment

Copy `.env.example` to `.env`. **Every variable is optional**, and each one
absent degrades to a defined state rather than breaking the build.

| Variable | Purpose | Absent behaviour |
|---|---|---|
| `GCAL_ID` | Public Google Calendar address | Events surfaces render their empty state |
| `VITE_WEB3FORMS_KEY` | Destination inbox for the pitch form | The flow is replaced by a link to the interest form |
| `VITE_GA_ID` | GA4 measurement ID | Analytics is a clean no-op; no script loads |

`VITE_`-prefixed values are **inlined into the client bundle at build time and
are therefore public.** That is correct for both of them here: the Web3Forms key
identifies a destination inbox and authorises nothing, and a GA measurement ID
is public by design. Abuse of the form key is controlled by domain allowlist and
rate limit in the Web3Forms dashboard, not by hiding it.

**Anything genuinely secret must never take a `VITE_` prefix.** `GCAL_ID` has
none, which is why it stays on the build machine.

Variables set in Netlify's build environment override `.env`.

---

## Design, accessibility and performance

The visual system is documented in full in `DESIGN.md`. The short version:

- **A marked page.** Warm paper, never screen white. A serif reading voice
  (Lora) against a geometric-sans title voice (Poppins), both self-hosted so the
  site makes no Google Fonts request.
- **Anthropic's real brand palette**, pinned. Coral `#d97757` is a *fill* and
  never sets type on paper, where it measures 2.96:1 and fails contrast.
- **Depth is tonal, not shadowed.** Nothing lifts, nothing floats.
- **Three motion primitives, all documented**: the coral highlighter sweep
  sitewide, the pitch flow's step transition, and the events page's hover
  reveal. All three are removed under `prefers-reduced-motion`.

**Accessibility is a hard floor, not a goal.** WCAG 2.1 AA throughout: every
colour pair is measured rather than eyeballed, every interactive element has a
visible focus ring, hover-only detail always has a click and keyboard
equivalent, and the layout holds to 320px.

Current mobile Lighthouse, measured on the built output:

| Route | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 100 |
| `/about` | 98 | 100 | 100 | 100 |
| `/events` | 99 | 100 | 100 | 100 |
| `/events/pitch` | 99 | 100 | 100 | 100 |

## Security

Full record in `SECURITY.md`. In short: no server, no database, no accounts, no
cookies set by this site, and no write path from the public internet. Response
headers including a Content Security Policy are set in `netlify.toml`, calendar
data is treated as untrusted and URL-validated before it can reach a link, and
production dependencies are held at **zero** advisories.

```bash
npm audit --omit=dev   # production dependencies: must stay at 0
```

---

<div align="center">

A recognized student organization at Northeastern University and an official
chapter of Anthropic's Claude Builder Club program.
Not an official communication of Anthropic or Northeastern University.

</div>
