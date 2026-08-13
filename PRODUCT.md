# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: React 19 + Vite 7 + Tailwind CSS 3, deployed on Netlify.

Confirmed direction (approved 2026-08-13): stay on React + Vite and add a prerender step to the
existing build so each route emits static HTML. No framework migration. This was chosen over
plain SPA + client-side meta management because the product requires per-route titles, real
structured data, and a true HTTP 404 — none of which a client-only SPA can serve to non-JS
crawlers.

## Users

**Primary — prospective members.** Northeastern University students who are curious about AI and
about the club but have not joined. They arrive from Instagram, LinkedIn, word of mouth, or a
flyer, usually on a phone, usually skimming. They are deciding whether this club is for them, and
many are unsure whether they are "technical enough" to belong.

**Secondary — current members.** Students already in the club, returning to find out what is
happening next and how to get more involved.

The two audiences want different things, and the site splits by surface rather than trying to
serve both everywhere: the homepage persuades, the workshops page operates.

## Product Purpose

The site exists to convert an interested Northeastern student into a committed one — via the
interest form, Slack, or an upcoming event. Success is a submitted interest form, not a page view.

For current members, the site is the operational record of what is happening: upcoming events,
ways to get involved, and what the club has built before.

## Positioning

An official Anthropic Claude Builder Club chapter at Northeastern — students building real things
with Claude, with direct access to the Anthropic campus program. The claim a neighboring AI or CS
club could not truthfully copy is the official Anthropic program affiliation and what comes with
it.

## Operating Context

- Most first visits are mobile, brief, and skimming — arriving from a social profile link.
- The exec board needs to add events without touching code or the repository. Non-negotiable
  constraint: the public site has **no write path**; event editing is solved at the data source
  (a shared Google Calendar), never in the site UI.
- The club runs workshops and hackathons in person on the Northeastern campus.
- Content is maintained by students between coursework — anything requiring frequent manual
  editing of code will go stale and should be avoided.

## Capabilities and Constraints

**Confirmed:**
- Interest form is a Typeform: `https://form.typeform.com/to/RH9sxEqE` ("Claude Club Interest
  Form", verified live). This is the single primary conversion action, surfaced in the hero and
  again in the events/info panel.
- **There are currently no scheduled events.** The upcoming-events surface ships in its empty
  state, and that empty state routes to the interest form. Events are a future state, not a
  present one.
- Live domain is `claudebuildersneu.com` (Netlify). `claudebuilders.com` appears throughout the
  current codebase but is a **parked domain that serves no site** — every reference to it is a
  bug.
- Existing social presence: Instagram `@claudeclub.nu`, LinkedIn
  `northeastern-anthropic-builders-club`, and a Linktree `linktr.ee/claudeNortheastern`.
- Slack invite (recovered from the retired `/join` page before deletion):
  `https://join.slack.com/t/claudebuilder-vzb9586/shared_invite/zt-3cfiwxtb9-JRvaJqI5UaqCGV~mz4pbdg`
  — **unverified**: shared-invite links expire, and this one predates Feb 2026. Confirm it still
  works before it ships in the link hub.
- Retired Google Form (superseded by the Typeform, preserved here for reference only):
  `https://docs.google.com/forms/d/e/1FAIpQLSexyQmwKJfnUdZou6_6o3bC4kH-ieS95pjV_9W-X3C0JLbjJw/viewform`

**Undecided / not yet supplied — must not be invented:**
- Custom emoji set for the link hub.
- Email-list endpoint (Mailchimp / other). The Typeform is the conversion path until one exists.
- GA4 measurement ID.
- Google Calendar ID, and confirmation the exec board has edit access.
- Board headshots.
- Anthropic Builder Club brand kit, if the program supplied one.
- Showcase content from past hackathons and workshops.

**Retired:** the `/join` route and its embedded Google Form are removed; the Typeform replaces
them as the conversion path.

## Brand Commitments

- **Name:** Claude Builders Club @ Northeastern University.
- **Affiliation (confirmed 2026-08-13):** officially part of Anthropic's Claude Builder Club
  program **and** a recognized Northeastern student organization. Both may be stated plainly.
  Endorsement language must still stay within what the program permits — the club is affiliated,
  not a voice of Anthropic.
- **Binding palette (user-pinned, do not substitute):** Anthropic's brand values — paper
  `#faf9f5`, ink `#141413`, coral `#d97757`, gray-mid `#b0aea5`, gray-light `#e8e6dc`, blue
  `#6a9bcc`, green `#788c5d`.
  > **Approved exception, must survive all future polish/distill/audit runs:** the "warm cream
  > background + terracotta accent (~#D97757)" combination is normally flagged as a generic-AI
  > tell. **On this project it is not a tell — it is the client's actual brand, because the
  > client is a Claude club.** Do not substitute this palette during any polish, distill, or
  > audit pass. Treat a detector finding against it as a known false positive.
- **Binding typography:** Poppins (display) and Lora (body), self-hosted. Anthropic's real faces
  (Styrene, Tiempos, Copernicus) are commercially licensed and **must not** be sourced or
  self-hosted without a license.
- **Binding motion policy:** exactly one motion primitive exists sitewide — a coral highlighter
  sweep. Everything else is static.
- **Voice:** plain, concrete, sentence case. Written for a student who is unsure they belong.
  Never marketing-grade hype.

## Evidence on Hand

**Real, in-repo or verified:**
- Typeform interest form (verified HTTP 200, titled "Claude Club Interest Form").
- Instagram, LinkedIn, and Linktree URLs, in `src/components/Layout.jsx`.
- Board roster of seven, supplied in the build brief and treated as authoritative.
- `context.json` — 24 KB of original project background, currently orphaned.

**Explicitly absent — future work must not fabricate these:**
- No board headshots exist. Placeholders are the designed state, not a gap.
- No events exist. The empty state is the shipping state.
- No past-hackathon or workshop showcase content has been supplied.
- No testimonials, member counts, attendance figures, or project outcomes exist. Do not invent
  numbers to fill a stat row.
- **Removed pending verification:** the previous site advertised "FREE Claude Pro + $25 API
  Credits". These claims are **not** carried forward; they may only return if confirmed accurate
  for the current semester.

## Product Principles

1. **One conversion action.** The interest form is the goal on every prospective-member surface.
   Competing CTAs dilute it.
2. **Never fabricate proof.** No invented stats, testimonials, member counts, or benefits. An
   honest empty state beats a fictional one.
3. **Empty is an invitation, not an apology.** With no events and no headshots, absence states
   are primary design surfaces and must feel deliberate.
4. **No write path from the public site.** Event data is read-only to the world; permissions are
   solved at the source.
5. **Lower the barrier to belonging.** The primary user doubts they are technical enough. Copy
   and structure should answer that doubt before it is asked.

## Accessibility & Inclusion

- WCAG 2.1 AA is a hard floor. Note that brand coral `#d97757` on paper `#faf9f5` is ~3:1 — valid
  for large display type, fills, borders, and non-text graphics, but **failing for body copy and
  small links**. A darkened `--coral-text` variant at ≥4.5:1 is required for any coral text under
  24px.
- `prefers-reduced-motion: reduce` must turn the highlighter sweep into an instant color change.
- Visible keyboard focus on every interactive element; semantic landmarks; correct heading order;
  responsive down to 320px.
- Target: mobile Lighthouse ≥95 across Performance, Accessibility, Best Practices, and SEO.
