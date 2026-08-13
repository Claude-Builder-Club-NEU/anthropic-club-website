 4             # Build Brief — claudebuildersneu.com

**How to use this file:** save it in the repo root as `BUILD-BRIEF.md`, then open Claude Code and paste:

> Read `BUILD-BRIEF.md` end to end. Do **Phase 0 only**, then stop and report back before writing any code.

Work phase by phase. Stop at every checkpoint. Small commits, one per phase.

---

## 0. Setup before you start

Install the Impeccable design skill and initialize it in this repo:

```bash
npx impeccable install     # requires Node 22.12+
```

Then in Claude Code: `/impeccable init`

Impeccable commands used in this brief: `/impeccable typeset` (type hierarchy), `/impeccable distill` (strip complexity), `/impeccable polish` (final quality pass), `/impeccable audit` (production quality), `/impeccable document` (emit DESIGN.md).

**One override you must respect:** Impeccable's slop detector flags "warm cream background + terracotta accent (~#D97757)" as an AI tell. On this project it is not a tell — it is the client's actual brand, because the client is a Claude club. **Do not substitute the palette during any polish, distill, or audit pass.** Record this in `PRODUCT.md` under anti-references so it survives future runs.

---

## 1. Context

| | |
|---|---|
| Site | https://claudebuildersneu.com/ |
| Org | Claude Builders Club @ Northeastern University |
| Primary audience | Northeastern students who are curious but not yet members |
| Secondary audience | Current members looking for what's happening next |
| Goal | Get a prospective member to join the email list, Slack, or an upcoming event |

**Audience split drives the IA:**
- **Homepage** = for people interested in the club. Persuade.
- **Workshops** = for current members. Upcoming events, get involved, past highlights. Operate.

---

## Phase 0 — Recon (no code yet)

Before changing anything, report back with:

1. **Stack** — framework, bundler, styling approach, package manager, Node version, deploy target (Vercel / Netlify / Cloudflare / GitHub Pages / other). Whether the site is server-rendered, statically generated, or a client-only SPA.
2. **Routes and components** — current sitemap, which components are shared, which are dead code.
3. **Assets** — where images live, whether any image optimization exists today, current font loading strategy.
4. **Existing SEO/analytics** — what's already in `<head>`, whether `robots.txt` / `sitemap.xml` / structured data exist, whether any analytics is wired up.
5. **A bug I already know about:** the OG and canonical tags point to `claudebuilders.com` but the live domain is `claudebuildersneu.com`. Confirm and note it — it gets fixed in Phase 5.
6. **Your recommendation** on whether we refactor in place or restructure routing. Do **not** migrate frameworks without my explicit approval.

**Checkpoint: stop here.**

---

## Phase 1 — Design system

### Palette

Anthropic's official brand values. Use these as CSS custom properties, no other colors without asking.

```css
--paper:        #faf9f5;  /* page background */
--ink:          #141413;  /* primary text, dark sections */
--coral:        #d97757;  /* Claude coral — primary accent */
--coral-text:   /* derive a darker coral that hits 4.5:1 on --paper; verify it */
--gray-mid:     #b0aea5;  /* secondary text, meta */
--gray-light:   #e8e6dc;  /* subtle fills, dividers, card surfaces */
--blue:         #6a9bcc;  /* rare secondary accent */
--green:        #788c5d;  /* rare tertiary accent */
```

**Contrast rule you must not skip:** `#d97757` on `#faf9f5` is roughly 3:1. That is fine for large display text, fills, borders, and non-text graphics — it **fails** WCAG AA for body copy and small links. Derive `--coral-text` as a darkened variant, verify it computes to ≥4.5:1 on paper, and use it for any coral text under 24px. Report the value you chose.

### Typography

Anthropic's real faces (Styrene, Tiempos, Copernicus) are commercially licensed — **do not source or self-host them without a license.** Use Anthropic's own published stand-ins from their brand-guidelines skill:

- **Display / headings:** Poppins
- **Body:** Lora
- **Fallbacks:** Arial / Georgia

Self-host as woff2, latin subset, `font-display: swap`, preload only the single display weight used above the fold. Set a real type scale with `/impeccable typeset` — don't leave defaults.

If you find something that reads closer to Styrene/Tiempos and is properly licensed for web use, propose it before switching.

### Motion policy — read this literally

Remove **every** animation currently on the site: scroll reveals, fade-ins, parallax, counters, marquees, card hover-lifts, pulsing dots, page transitions, gradient shifts, typewriter effects.

Exactly **one** motion primitive survives, and it is the site's signature:

> **The highlighter.** A coral sweep that fills left-to-right behind or beneath a phrase — like marking up a printed page. 120–180ms, `ease-out`. Used on: primary CTA hover, nav link hover/focus, and one key phrase in the hero that highlights once on load.

Nothing else moves. Under `prefers-reduced-motion: reduce`, the sweep becomes an instant color change with no transition.

### Icon policy

Strip decorative icons — no icon tiles, no feature-grid glyphs, no lucide sprinkled next to headings. Structure and type carry the hierarchy instead.

Three exceptions, all functional:
1. **Social links** — use the club's custom emoji set (see §Assets I owe you).
2. **External-link and chevron affordances** where they genuinely aid navigation.
3. **The club wordmark/logo.**

### Layout feel

Mimic anthropic.com: generous whitespace, a firm baseline grid, wide measure limits on body text (65–75ch), sentence case everywhere, restrained borders over drop shadows, sharp-to-slightly-rounded corners held consistent. No nested cards. No hero eyebrow chips.

### Deliverables

Write `PRODUCT.md` (audience, mode per surface, brand voice, anti-references) and run `/impeccable document` to emit `DESIGN.md`.

**Anti-references for PRODUCT.md:** purple gradients, glassmorphism, icon tile stacks, italic serif display type, pulsing status dots, numbered section labels, nested cards, "Boost your productivity"-grade marketing copy.

**Checkpoint: show me the tokens and a hero mock before building out pages.**

---

## Phase 2 — Information architecture

### Sitemap

| Route | Purpose | `<title>` |
|---|---|---|
| `/` | Convert interested students | Claude Builders Club @ Northeastern — Build what's next with Claude |
| `/about` | Deep background + exec board | About & Exec Board — Claude Builders Club @ Northeastern |
| `/workshops` | Member hub: events, calendar, past highlights | Workshops & Events — Claude Builders Club @ Northeastern |
| `/404` | Custom not-found | Page not found — Claude Builders Club @ Northeastern |

Add routes beyond these only if you can justify them. Every page links to at least two others. No orphans.

### Homepage sections, in order

1. **Hero.** Headline: **Build what's next with Claude.** One-sentence subhead. Two CTAs visible above the fold at both 390×844 and 1440×900 — primary "Join the club," secondary "See upcoming events."
2. **Link hub.** A linktree-style row: Instagram, Slack, LinkedIn, email list signup. Custom emoji marks, not stock icons. This is a first-screen element, not a footer afterthought.
3. **About the Claude Builders Club** — short, what the program is broadly.
4. **About Claude Builders Club @ Northeastern** — short, what *our* chapter does. Distinct from the above; don't let the two blur into one paragraph. Link both to `/about` for depth.
5. **Upcoming events panel** — next 3 events, then "View full calendar →" to `/workshops`.
6. **FAQ** — see §FAQ.
7. **Footer** — nav, socials, email list, Northeastern affiliation line.

### About page

An in-depth about section, **different content from the homepage blurbs** — history, what we actually build, what a semester looks like, how we work with Anthropic. Then the exec board grid.

Replace all current members with the roster in §Board roster. Keep the current grid treatment as the starting point, restyled to the new system.

### Workshops page

1. **Upcoming events** — calendar view + list.
2. **Get involved** — how to run a workshop, join a build team, pitch a project.
3. **Showcase** — previous hackathons and workshop highlights, positioned *underneath* the calendar.

### 404

On-brand, useful. Links to home, about, workshops, and join. Must return a real HTTP 404 status — if we're on a static/SPA host, configure the host so it isn't a soft 404 returning 200.

---

## Phase 3 — Board roster

Data lives in a single `board.ts` (or equivalent). Order as listed. Copy verbatim.

```ts
[
  { name: "Jackson Lamoureux", role: "President",
    detail: "Founder @ Logicull | Business Admin — Entrepreneurial Startups" },
  { name: "Lucas Salzgeber", role: "Vice President",
    detail: "Founder @ LSstacks | Business Admin — Finance + AI" },
  { name: "Oliver Ward", role: "Vice President",
    detail: "Business Admin — Entrepreneurial Startups" },
  { name: "Smyan Sengupta", role: "Head of Partnerships",
    detail: "Prev. MSAT Modeling @ Pfizer | CS + AI" },
  { name: "Anthony Jones", role: "Head of Finance",
    detail: "D1 Track & Field | Business Admin — Finance + Pre-Law" },
  { name: "Kristine Min", role: "Head of Social Media",
    detail: "UGC Creator, 20k on TikTok | International Business + Finance" },
  { name: "Alex Green", role: "Head of Events",
    detail: "Prev. Analyst @ Gordon Brothers | Business Admin - Finance" },
]
```

**Notes:** two Vice Presidents is intentional, not a typo. Alex Green's role is missing — render a visible `TODO` in dev and omit the role line in production until I supply it.

### Headshot pipeline

Photos don't exist yet. Build the slot so that dropping a file in later is the only step required.

- **Source spec I'll deliver to:** `public/board/firstname-lastname.jpg`, 1600×1600, square, subject centered, neutral background.
- **Placeholder until then:** a `--gray-light` tile with the person's initials set in `--coral-text`. Driven by `photo: null` in the data file — adding a photo should require adding the file and one line.
- **Optimization:** generate 320 / 480 / 640 / 960 widths in AVIF + WebP with JPEG fallback, emit `<picture>` with correct `sizes`. Use the framework's built-in image pipeline if there is one; otherwise a `sharp` prebuild script. Lazy-load below the fold.
- **No layout shift:** fixed aspect-ratio container, explicit width/height, identical box whether the photo is present or not.
- **Alt text pattern:** `Headshot of Jackson Lamoureux, President of the Claude Builders Club at Northeastern University.`

---

## Phase 4 — Events & calendar

**Requirement:** the exec board can add events easily; nobody browsing the site can. Two different things — solve permissions at the source, not in the UI.

**Recommended approach — Google Calendar as single source of truth:**

1. Create a dedicated Google Calendar, "Claude Builders Club @ NEU — Events."
2. Share it with exec board members as **"Make changes to events."** Make it **public, see-all-event-details** (read-only for the world).
3. The site reads it **server-side** via the Google Calendar API (key restricted, never exposed client-side) or the public ICS feed. Revalidate every 15–30 minutes, or rebuild on a cron if we're fully static.
4. Render our **own styled components** — do not iframe the Google embed into the page. The embed can live behind the "Full calendar" link, alongside an "Add to your calendar" ICS subscribe button.
5. The website has **no write path at all**. That's what makes it safe.

Surfaces:
- **Homepage:** next 3 events, compact panel, link to full calendar.
- **Workshops:** month grid + upcoming list + link out to Google Calendar.
- **Empty state:** "No events on the calendar right now — join the Slack to hear first." Empty is an invitation, not an apology.
- **Structured data:** `schema.org/Event` per event.

If the deploy target can't run server-side code, tell me before picking a fallback.

---

## Phase 5 — SEO, performance, analytics

### SEO

- Unique `<title>` per page (pattern in §Sitemap) and unique meta descriptions, 140–160 chars.
- **Fix the domain mismatch:** canonical, OG, and Twitter URLs all → `https://claudebuildersneu.com/…`. Real OG image at 1200×630.
- `robots.txt` + auto-generated `sitemap.xml`.
- **Breadcrumbs:** visible on `/about` and `/workshops` (not on `/`), plus `BreadcrumbList` JSON-LD.
- **Structured data:** `Organization` (or `EducationalOrganization`) sitewide, `FAQPage` on the FAQ, `Event` per event, `Person` per board member.
- **Internal links:** contextual in-body links between pages, not just nav. Descriptive anchor text, never "click here."
- **Alt text** on every image. Decorative-only images get `alt=""`.

### Performance targets

Mobile Lighthouse ≥95 across Performance, Accessibility, Best Practices, SEO. LCP <2.0s, CLS <0.05, INP <200ms, initial JS <150KB gzipped. Run Lighthouse after each phase and paste the numbers.

Also: eager-load + `fetchpriority="high"` on the LCP image only, lazy everything below the fold, no render-blocking third-party scripts.

### Sticky mobile CTA

Bottom bar, appears once the hero scrolls out of view, hidden at ≥768px. Respects `env(safe-area-inset-bottom)`. Must not cover footer links or the last line of content — add matching bottom padding. Dismissible.

### Analytics

GA4 via `gtag`, measurement ID in an env var (`NEXT_PUBLIC_GA_ID` or equivalent) — never hardcoded. Load after interactive so it doesn't hurt LCP. Track: `join_click`, `slack_click`, `instagram_click`, `linkedin_click`, `email_signup`, `calendar_view`. No PII in event params. Add a short privacy line in the footer noting analytics use.

### Final pass

Run `/impeccable audit`, then `/impeccable polish`. Target zero detector findings — **except** the warm-background/coral rule, which is an approved brand exception per §0.

---

## FAQ — questions to build the section around

I'll write final answers; draft a first pass and mark them `TODO: Jackson`.

1. Who can join? Do I need to know how to code?
2. Is there a fee or an application?
3. What actually happens at a workshop?
4. What do members get access to?
5. When and where do you meet?
6. How do I get into the Slack?
7. Do you run hackathons?
8. How do I join the exec board?
9. Are grad students / co-op students welcome?
10. How do I bring a project or partnership to the club?

**Verify before publishing:** the current site advertises free Claude Pro and free API credits. Don't carry those claims over until I confirm they're still accurate for this semester — flag them rather than copying them forward.

---

## Assets and decisions I owe you

Do not invent these. Stop and ask if a phase needs one that hasn't arrived.

- [ ] **Custom emoji set** — files + intended mapping. Needed for the link hub and any surviving iconography.
- [ ] **Social URLs** — Instagram, Slack invite, LinkedIn, email-list endpoint (Mailchimp / Google Form / other).
- [ ] **GA4 measurement ID.**
- [ ] **Google Calendar ID** + confirmation the exec board has edit access.
- [ ] **Headshots** (1600×1600 square, per §Headshot pipeline).
- [ ] **Anthropic Builder Club brand kit**, if the program supplied one — use its assets and follow its usage rules. Don't imply official Anthropic endorsement beyond what the program permits.
- [ ] **Showcase content** — photos, project names, dates from past hackathons and workshops.

---

## Ground rules

- **Stop at every checkpoint.** Summarize the diff and wait.
- One commit per phase, descriptive message.
- No framework migration, no new dependency over ~10KB, and no new page route without asking first.
- Don't delete content you can't replace — move it to a `_archive/` folder if unsure.
- Build to the quality floor without announcing it: responsive to 320px, visible keyboard focus on every interactive element, reduced motion honored, semantic landmarks, real heading order.
- If a requirement here conflicts with something you find in the codebase, raise it instead of silently picking.
