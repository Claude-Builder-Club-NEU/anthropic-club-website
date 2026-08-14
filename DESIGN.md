---
name: Claude Builders Club @ Northeastern
description: A marked-up printed page — warm paper, quiet type, one coral highlighter.
colors:
  warm-paper: "#faf9f5"
  near-black-ink: "#141413"
  claude-coral: "#d97757"
  burnt-terracotta: "#a34a2a"
  stone-gray: "#686560"
  oat: "#e8e6dc"
  pale-clay: "#b0aea5"
  hairline: "#ded9cc"
  slate-blue: "#6a9bcc"
  olive: "#788c5d"
typography:
  display:
    fontFamily: "Poppins, Arial, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 1.6rem + 5.2vw, 5rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Poppins, Arial, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 2.6vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Poppins, Arial, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.2rem + 1.4vw, 2.125rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Lora, Georgia, Times New Roman, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Poppins, Arial, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.06em"
  banner-display:
    fontFamily: "Lora, Georgia, Times New Roman, serif"
    fontSize: "clamp(2.5rem, 1.1rem + 3.6vw, 4.375rem)"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  banner-body:
    fontFamily: "Lora, Georgia, Times New Roman, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "8px"
  banner-cta: "0.455cqw"
  banner-cta-stacked: "6px"
  slot: "10px"
  card: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "64px"
  xxl: "96px"
components:
  button-primary:
    textColor: "{colors.near-black-ink}"
    rounded: "{rounded.sm}"
    padding: "16px 24px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.claude-coral}"
    textColor: "{colors.near-black-ink}"
  button-secondary:
    textColor: "{colors.near-black-ink}"
    rounded: "{rounded.sm}"
    padding: "16px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.oat}"
    textColor: "{colors.near-black-ink}"
---

# Design System: Claude Builders Club @ Northeastern

## Overview

**Creative North Star: "The Marked Page"**

This is a printed page someone cared enough to mark up. The ground is warm paper,
not screen-white. The reading voice is a serif. Headings are a geometric sans set
tight and large, the way a well-set title page behaves. Nothing glows, nothing
floats, nothing drifts into view on scroll — the page is simply already there,
the way paper is already there when you pick it up.

The one thing that moves is a coral highlighter. It sweeps left to right beneath a
phrase, exactly once, the way a person marks a line they want to come back to.
That single gesture carries the entire brand: it is the reason the accent color
exists, the reason the motion budget is spent where it is, and the only animation
the system permits. Because it happens once and nowhere else, it reads as
deliberate rather than decorative.

Restraint here is not minimalism for its own sake. The audience is a student who
is not sure they are technical enough to belong. A page that shouts, animates, and
stacks feature-cards reads as a product pitch. A page that reads like a well-set
document reads as an invitation.

**The hero mark.** A cropped Claude Spark bleeding off the hero's bottom right,
clipped by the section. On a phone it sits *behind* the two calls to action at
30% rather than being pushed below them; the hero used to buy 240px of bottom
padding purely to keep them apart, which wasted a band of screen where space is
scarcest. The filled coral button is opaque and unaffected. The secondary
button is transparent at rest, so its ink label does sit over the mark, which
is what sets the opacity: measured, ink on the blended ground is 12.94:1.

**Key Characteristics:**
- Warm paper ground (#faf9f5), never pure white
- Serif body, geometric-sans display — reading voice and title voice are distinct
- One motion primitive sitewide, plus two approved and scoped: the pitch flow's
  step transition (`/events/pitch`) and the events page's hover reveal. All
  three are removed under `prefers-reduced-motion` (see Components)
- Borders and tonal shifts instead of shadows; the system is flat
- Sentence case everywhere; no eyebrows, no chips, no section numbers
- Generous vertical space, body measure held to 65–75ch

## Colors

A warm, low-contrast paper palette with a single earthy accent that is used
sparingly and almost never as text.

### Primary
- **Claude Coral** (`{colors.claude-coral}`): The highlighter. Used as a *fill* —
  the sweep behind marked phrases, the primary button's hover fill, selection
  highlight. It is the brand's one saturated note and appears on well under 10% of
  any screen.
- **Burnt Terracotta** (`{colors.burnt-terracotta}`): The readable coral. Every
  coral-colored *word* on the site is this value, never the accent above. Links,
  inline emphasis, initials in board placeholders.

### Neutral
- **Warm Paper** (`{colors.warm-paper}`): The page ground everywhere. The site has
  no white surfaces.
- **Near-Black Ink** (`{colors.near-black-ink}`): All headings and body text, and
  the ground for inverted sections.
- **Stone Gray** (`{colors.stone-gray}`): Secondary text — leads, meta, captions,
  supporting copy.
- **Oat** (`{colors.oat}`): Card and panel surfaces, subtle section fills. Depth
  comes from this tonal step, not from shadow.
- **Hairline** (`{colors.hairline}`): 1px dividers and quiet borders.
- **Pale Clay** (`{colors.pale-clay}`): Decorative only — never text at any size.

### Tertiary
- **Slate Blue** (`{colors.slate-blue}`) and **Olive** (`{colors.olive}`): Rare
  categorical accents. Fills with dark text on them, never text on paper.

### Named Rules

**The Fill-Not-Text Rule.** Claude Coral is a fill color. It never sets type on
paper. Measured, it is 2.96:1 against the paper ground — failing not only the
4.5:1 body threshold but the 3:1 large-text and non-text threshold as well. Any
coral *word* uses Burnt Terracotta (5.58:1 on paper, 4.70:1 on Oat). Any coral
*border* that must be perceivable needs a second cue — thickness, a label, or a
tonal shift — because the color alone does not carry it.

**The No-Gray-Text-Above-Stone Rule.** Pale Clay is 2.11:1 on paper. It is
decorative. Secondary text stops at Stone Gray, which clears 4.5:1 on both paper
and Oat.

## Typography

**Display Font:** Poppins (fallback Arial, system-ui)
**Body Font:** Lora (fallback Georgia, Times New Roman)

Both are self-hosted woff2, latin subset, `font-display: swap`. Anthropic's real
faces — Styrene, Tiempos, Copernicus — are commercially licensed and are
deliberately not used; Poppins and Lora are Anthropic's own published stand-ins.

**Character:** A geometric sans that is confident at large sizes over a
bookish serif that is comfortable at length. The pairing puts the *title-page*
voice and the *reading* voice in obvious contrast, which is what lets the page
carry hierarchy without icons, rules, or colored chips.

### Hierarchy
- **Display** (600, `clamp(2.75rem → 5rem)`, 1.04, -0.03em): Hero headline only.
  One per page, capped around 16ch so it wraps into a shape rather than a stripe.
- **Headline** (600, `clamp(2rem → 3.25rem)`, 1.08, -0.025em): Page titles.
- **Title** (600, `clamp(1.5rem → 2.125rem)`, 1.15, -0.02em): Section headings.
- **Body** (400, 17px, 1.65): All prose, held to a 68ch measure.
- **Lead** (400, `clamp(1.125rem → 1.3125rem)`, 1.5, Stone Gray): Hero subhead and
  section intros, held tighter at 46ch.
- **Label** (500, 13px, +0.06em, uppercase): Meta and eyebrow-free small caps —
  dates, categories, field labels.

- **Banner display** (Lora 700, `clamp(2.5rem → 4.375rem)`, 0.96, -0.04em):
  the interest banner's headline only. It tops out at 70px, a step below the
  hero, and is the one place a heading is set in the serif rather than Poppins.

### Named Rules

**The Two-Voice Rule.** Poppins titles, Lora prose. A block of Poppins running
longer than two lines is a mistake; so is a heading set in Lora. The interest
banner is the single, pinned exception: its supplied design sets the headline
in the serif, and that design is authority.

**The Tracking Floor.** Display and headline sizes carry negative tracking
(-0.02em to -0.03em). Body text never does.

## Layout

A single centered column, max 72rem, with generous asymmetric vertical rhythm:
more space above a heading than below it, so headings bind to the content they
introduce. Spacing follows a 4px base on an 8px rhythm (4 / 8 / 16 / 32 / 64 / 96).

Body copy is capped at 68ch (`--measure`); leads and hero subheads at 46ch
(`--measure-tight`). Line length is a hard constraint, not a suggestion — full-bleed
paragraphs are the most common way this system gets broken.

Responsive behavior is fluid rather than stepped: type scales via `clamp()` between
320px and roughly 1400px, so there are few hard breakpoints. The layout must hold
to 320px with no horizontal overflow. Horizontal padding steps 24px → 40px → 64px
as the viewport widens.

## Elevation & Depth

**This system has no shadows.** Depth is entirely tonal: Oat panels sit on Warm
Paper, Near-Black Ink sections invert the page, and 1px Hairline rules separate
what tone alone does not. Nothing lifts, nothing casts.

### Named Rules

**The Flat Rule.** If a surface needs to feel separate, change its tone or give it
a hairline. Reaching for `box-shadow` means the tonal step was not doing its job.

## Shapes

Corners are nearly sharp: 4px as the default, 8px on large panels. The system
reads as printed matter, and printed matter does not have soft corners.

Board cards are the one deliberate exception, at 14px with a 10px photo slot
inside. They are portrait objects rather than sheets of paper, and the softer
corner is what makes them read as cards rather than cropped panels. Nothing
else on the site uses those two steps.

Borders are 1px Hairline; no colored left-borders, no thick rules. Images sit in
fixed aspect-ratio containers so the page never reflows as they load.

## Components

### Buttons
- **Shape:** Nearly sharp (4px radius)
- **Primary:** Ink text on a transparent ground inside a 1px Ink border, 16px/24px
  padding. At rest it is an outline; the coral fills it on interaction.
- **Hover / Focus:** The highlighter sweep — Claude Coral fills the button left to
  right over 150ms `ease-out`. Not a fade, not a lift.
- **Secondary:** Identical geometry with a Hairline border; Oat fills instead of
  coral, so the two actions read as clearly unequal.

### Cards / Containers
- **Corner Style:** 8px on panels, 4px on small surfaces
- **Background:** Oat on Warm Paper
- **Shadow Strategy:** None — see Elevation & Depth
- **Border:** 1px Hairline where tone alone is insufficient
- **Internal Padding:** 32px, 24px below 640px

### Interest banner
A dark console panel carrying the Claude Code blocky display type, built from a
supplied high-fidelity design ("3b, Blocky arcade"). It is the site's only
inverted full-width band and its only textured surface.

- **Panel:** Near-Black Ink, 8px corners, locked to the reference's **3.14:1**
  band (1320 x 421).
- **Everything inside is sized in `cqw` against the band's own width**, each
  value being the reference pixel measurement divided by 1320: `3.48cqw`
  padding (46px), `35.61cqw` graphic column (470px), `5.30cqw` headline (70px),
  and so on. Reproducing the raw pixel values at this site's narrower 1024px
  content column gave a 1.8:1 block instead: the headline ran to three lines,
  the body to four, and the actions wrapped onto two rows. Scaling by container
  width holds the designed proportions at any size.
- Below 1024px the aspect lock and the `cqw` sizing both come off and the band
  stacks. Holding 3.14:1 on a phone would shrink the copy to nothing, and the
  handoff's own responsive note says to step the headline down instead.
- **Three static background layers**, in order: a 26px dot grid at 10% paper, a
  680x420 coral glow at 84%/46%, and 1px scanlines at 4.5% paper. None of them
  move.
  > **Approved exception.** A detector flags tiled hairline grid backgrounds as
  > a generated-UI signature. Here it is the pinned design's own console
  > texture, not a default reached for, so the finding is a known false
  > positive. It applies to this band only; do not introduce grid fields
  > elsewhere.
- **Primary CTA:** clay `#c4795c` with an ink label, 6px radius. Hover
  **brightens** to Claude Coral rather than darkening: the supplied hover put
  the label at 3.92:1, under this system's floor.
- **Secondary link:** system monospace, 15px, over a hairline underline. The
  only monospace on the site, and the only place a system face is used, since
  self-hosting a mono for one label is not worth the weight.

### Board cards
The one inverted surface in the system. A Near-Black Ink card, 14px corners,
with a light photo slot at the top that resolves into the ink base before any
text begins. The blend is confined to the photo region on purpose: running it
across the whole card puts the role label on a mid-tone band where Claude Coral
fails contrast.

- **Role:** the anchor of the card. Uppercase, tracked +0.12em, in Claude Coral,
  set above the name. Coral measures 5.90:1 on ink, so on this surface, and only
  on this surface, the accent may carry text.
- **Name:** Lora 600 at title size in Warm Paper.
- **Photo slot:** 4:5, 10px corners, dashed hairline while empty, holding the
  member's initials. The box is identical whether or not a photo exists, so
  adding one shifts nothing.
- **Hover:** the card border takes Claude Coral. Nothing lifts.

### Navigation
Poppins 500 at 15px, Ink, no underline at rest. Hover and focus draw the
highlighter sweep beneath the label. The current page is marked with a persistent
sweep rather than a color change. Below 768px the nav collapses to a disclosure
menu; the join action stays a filled coral button and never hides behind the menu.

### Homepage events block

The interest banner ("Build with us this semester") leads this block and appears
nowhere else. It used to be the block's *empty state* and also sat at the top of
the events page; it now lives here unconditionally, so the homepage carries the
persuasion and the events page carries the operating detail. Moving it also took
its 27KB graphic off the events page, which is why that route measures faster
than the rest of the site.

Directly beneath it, up to three upcoming events as plain rows: date, title,
time and location from the left, and the RSVP pushed to the right edge, which is
the banner's right edge since both share the container. Detail first and action
second, so it reads in that order and the RSVP lands last in the tab order,
where an action belongs. Below 520px the row stacks and the action sits under
its event rather than beside it.

Each RSVP carries a visually hidden "on Luma for {title}", because a page of
links all reading "RSVP" is unusable in a screen reader's link list. An entry
with no link yet shows a dashed, inert "Details soon" in the same slot.

The time and the location run inline with a middot between them on a wide
screen and stack on a phone, where the two together wrap mid-phrase.

There is no "see the full calendar" link under the list. The banner's own ghost
link covers it, and that link always points at `/events` rather than the Google
Calendar embed: sending people off-site to a Google view of the same events is
the reason "Open the full calendar" came off the events page too.

The section takes its accessible name from the banner's own heading, so the list
sits directly under the flyer with no heading wedged between them.

### Events page (`/events`)

The page title and the section title are one heading, "Upcoming events", set at
the section size rather than the page-title size. A page title above a section
title saying nearly the same thing was noise.

Built from the "Workshops & Events calendar page" handoff. That handoff's
structure is kept in full; its visual language is not, because it specifies a
different design system (Hanken Grotesk, Source Serif 4, JetBrains Mono,
shadows, pill radii, a `kraft` accent) and says in its own words to prefer the
target codebase's system where one exists. This one exists.

**Event kinds.** Three, derived from the calendar entry's own title, because a
Google Calendar ICS feed carries no colour or category field.

| Kind | Fill | Label on it | Trigger |
|---|---|---|---|
| Info session | Near-Black Ink | Warm Paper, 17.50:1 | "info session", "intro", "orientation", "kickoff" |
| Workshop | Claude Coral | Near-Black Ink, 5.90:1 | the default |
| Hackathon | Olive | Near-Black Ink, 5.01:1 | anything ending "athon", "hack night" |

Olive replaces the handoff's `kraft` #CD9A6B. It is already defined as a rare
categorical accent, which is exactly this use. This was Slate Blue first, which
separated from coral more cleanly but read as foreign against warm paper; olive
sits in the same earth family as the coral and the ground.

**Colour is never the only cue.** Every chip, tile and legend row names its kind
in text, which is what carries the distinction rather than hue alone. Legend
swatches carry a hairline because Claude Coral is 2.96:1 against paper as a bare
fill, under the 3:1 floor for a graphic that means something.

- **Feature tiles.** Up to three upcoming events above the calendar. Oat panels
  on a hairline; the next event up is the one inverted tile, the same emphasis
  device the board cards use, which keeps coral to the small accent the system
  budgets for. The handoff fills tiles one, two and three dark, coral, light
  regardless of content; that is dropped.

  **Two faces, swapped in place.** At rest a tile shows its kind, the day, the
  title, and time plus location. Hovering or clicking replaces that content with
  the detail face: kind and date on one line, title, description, When, Where,
  and an RSVP button. **The card does not change size**, so nothing on the page
  moves. Both faces are always rendered, stacked in a single grid cell, so the
  box is as tall as the taller of them whichever is showing; the hidden one
  keeps its space and leaves the accessibility tree.

  Hover and click are two independent reasons to be open: hovering is transient
  and closes when the pointer leaves, clicking pins it. Touch and keyboard have
  no hover at all, so the click path is what serves them. The toggle is a real
  `<button>` carrying `aria-expanded`, laid over the card rather than wrapping
  it, because the detail face contains a link and a link cannot sit inside a
  button.

  The handoff's hover lift and shadow are dropped; the border takes coral
  instead. The RSVP button fills with paper on the inverted tile, where the
  standard ink-on-ink outline would be invisible.

  The design's third detail row, "Who: Open to all", is **not** built. A Google
  Calendar entry has no such field, and inventing one would be making up facts
  about a session. When and Where come from real fields; Who does not.

- **Row filling.** The Upcoming row is always three columns wide and never ends
  ragged. Three events fill it. One or two leave a dashed "No additional events"
  card spanning the remainder. None at all gives a single dashed card across the
  whole row reading "No events planned at this time! Check back at a later
  date." Dashed rather than solid, the same way the empty board photo slot reads
  as reserved rather than broken.
- **Filter chips.** Single select, defaulting to All, filtering the tiles and
  the grid together. The handoff's pill is squared to the 4px corner. Selected
  is an ink fill rather than a colour change. A chip only appears for a kind
  that is actually on the calendar.
- **Month grid.** Sunday-first, per the handoff. Stays a real `<table>` so a
  screen reader can announce the weekday for a cell. Days carrying events take
  the Oat tonal step.

  **On a phone the grid fits the viewport rather than scrolling sideways.** Seven
  columns at that width are roughly 36px each, which cannot carry an event
  title, so the weekday headers drop to a single letter and the chips become
  plain colour bars, with every word of the detail moving into the card that
  opens on tap. The titles are visually hidden rather than removed, so a screen
  reader still reads "Chatathon with AINU, 11:00am, Hackathon" off a bar. Bars
  hold 24px of height, the smallest target WCAG 2.5.8 allows.
- **Event detail.** A popover anchored to the chip, above it where there is room
  and below it near the top of the grid, carrying the same facts as a tile's
  detail face plus its RSVP. It is a sibling of the scroll shell rather than a
  child, because the shell clips horizontally on narrow screens and would cut
  the card in half; its position is measured against the wrapper on open and
  clamped so it cannot hang off an edge. It has no shadow, per the system: a 1px
  ink border is what separates it from the grid underneath, a step stronger than
  the usual hairline because it has to read as floating rather than inset.

  It opens on hover, on focus and on click. Hover closes on a short delay, which
  is what lets the pointer cross the gap between chip and card. Clicking pins
  it, and pinning is the only case that moves focus, since stealing focus on
  hover would be hostile. Escape closes it.
- **Legend.** Three swatch-and-label rows under the grid.

> **Approved exception 5 — the reveal.** Both hover details animate: a short
> fade with a few pixels of travel, `--reveal-in` 190ms in and `--reveal-out`
> 110ms out on the sweep's own ease-out curve. This is a third motion primitive
> and the system otherwise permits one. It was approved explicitly, on the
> grounds that a detail card which simply blinks in and out under the pointer
> reads as a glitch rather than as a response.
>
> Three details make it feel deliberate rather than decorative:
> - **The tile's two faces cross-fade with a handoff, not a dissolve.** The
>   outgoing face clears in 110ms and the incoming one waits that long before
>   starting, so two sets of text are never stacked half-visible on each other.
> - **`visibility` is staggered against the fade**, instant on the way in and
>   delayed on the way out, so the hidden face leaves the accessibility tree and
>   stops taking pointer events without cutting the fade short.
> - **The calendar card stays mounted while you move from chip to chip**, so its
>   `left` and `top` glide it to the next anchor instead of blinking out and
>   back. That travel is what makes moving along a row of events feel
>   continuous.
>
> It is confined to the events page, and under `prefers-reduced-motion: reduce`
> it is removed entirely: the faces still swap and the card still appears, they
> simply do not travel or fade.
- **Not here.** "Open the full calendar" was removed: it sent people off the
  site to a Google view of the events already on the page. The ICS subscribe
  link stays, because that is the one thing the page cannot do itself.

The handoff's "Sponsored by Anthropic" footer credit is **not** built. The club
is affiliated with Anthropic's program, not sponsored by it, and PRODUCT.md is
explicit that the relationship must not be overstated. A previous revision
removed the sponsor lockup for the same reason.

### Pitch flow (`/events/pitch`)

A full-viewport, one-question-at-a-time form in the manner of a Typeform,
supplied as a direct instruction. It is the only chromeless route: no site
header, no footer, no sticky CTA, just a hairline bar carrying the club lockup
and a close control back to `/events`.

- **Screens.** A welcome screen, five questions, an ending. Each screen owns the
  page's single `<h1>`, because on a surface showing one question that question
  is the page's subject. The prerendered HTML therefore ships the welcome
  screen's heading, which is also what a crawler should read.
- **Question type** is Poppins at Title scale (`--step-2`), a step below the
  welcome and ending screens, which sit at Headline scale. No new type token.
- **Answer field** is underlined rather than boxed, set at `--step-lead` so it
  clears the 16px threshold that triggers zoom on iOS. The coral underline is a
  supporting cue only; the focus indicator is the system's 2px Burnt Terracotta
  ring, because coral at 2.96:1 cannot carry a focus indicator on its own.
- **Progress** is a 4px rail pinned to the bottom of the viewport, filled in
  Claude Coral, reporting questions *completed* rather than questions reached.
- **Step controls** are a 44px pair at bottom right. Disabled states use Pale
  Clay, which is below every contrast floor and correct here: WCAG exempts
  inactive controls, and reading as unavailable is the point.

> **Approved exception 3 — the second motion primitive.** Advancing a step
> raises the incoming screen 24px and fades it in over 260ms on the sweep's
> ease-out curve, reversing direction on the way back, with the progress rail
> travelling on the same curve. This is a second animation and the system
> otherwise permits exactly one. It was approved explicitly, on the grounds that
> one-question-at-a-time is the pattern that was asked for and that without a
> transition the screen simply cuts, which reads as a page load rather than as
> moving through a form. It is confined to this route, it never fires on first
> paint — so no screen on this site animates itself into view on load — and
> under `prefers-reduced-motion: reduce` it is removed entirely, exactly as the
> highlighter is. Do not generalise it to any other surface.

> **Approved exception 4 — the question number.** Each question is preceded by
> its number in Burnt Terracotta, which the system otherwise bans as a section
> number above a heading. Here it is wayfinding inside a five-step form rather
> than decoration on a page heading: the progress rail says how far along you
> are but not which question you are answering. It is `aria-hidden`, so the
> field's accessible name stays the question alone, and the count is given to
> assistive tech separately as "Question N of 5".

### The Highlighter (signature)

The system's primary motion primitive and its defining component. A coral band, 0.34em
tall (0.42em at display size), painted as a background gradient sitting at 88% of
the line box so it reads as marked *beneath* the words rather than boxed around
them. It grows from 0% to 100% width over 150ms on an ease-out curve.

It appears in exactly three places: the primary CTA on hover, navigation links on
hover and focus, and one phrase in the hero that marks itself once on load. The
pitch flow's step transition and the events page's hover reveal are the system's
only other animations, both documented above as approved exceptions.
`box-decoration-break: clone` makes it mark each line separately when a phrase
wraps, the way a real highlighter would.

Under `prefers-reduced-motion: reduce` the transition is removed entirely — the
mark still appears, it simply does not travel.

## Do's and Don'ts

### Do:
- **Do** use Burnt Terracotta (#a34a2a) for every coral word, and Claude Coral
  (#d97757) only as a fill.
- **Do** hold body copy to the 68ch measure and leads to 46ch.
- **Do** convey depth with tone — Oat on Warm Paper — and hairline rules.
- **Do** keep the highlighter to its three sanctioned uses.
- **Do** give every interactive element a visible focus ring (2px Burnt Terracotta,
  3px offset).
- **Do** write in sentence case, including headings and buttons.

### Don't:
- **Don't** substitute the warm-paper-plus-terracotta palette. A slop detector will
  flag it as an AI tell; on this project it is the client's actual brand and the
  finding is a known false positive. This is recorded in PRODUCT.md and is binding.
- **Don't** add a fourth animation. No scroll reveals, no parallax, no counters,
  no hover-lifts, no page transitions, no smooth scrolling. The highlighter, the
  pitch flow's step transition and the events page's hover reveal are the
  complete set, and the latter two are confined to their own surfaces.
- **Don't** use `box-shadow` for depth. The single permitted use is a focus
  ring: the interest banner's CTA carries `0 0 0 3px rgba(217,119,87,0.45)` on
  `:focus-visible`, which is an accessibility affordance, not decoration.
- **Don't** put an eyebrow, kicker, chip, or section number above a heading. The
  pitch flow's question number is the single approved exception.
- **Don't** set Pale Clay (#b0aea5) as text at any size.
- **Don't** nest cards, or use same-size icon-plus-heading-plus-text cards as the
  page's structure.
- **Don't** use emoji as an icon system. Icons are drawn SVG at one consistent
  stroke weight; the club's custom emoji set is the single sanctioned exception and
  only in the link hub.
- **Don't** self-host Styrene, Tiempos, or Copernicus. They are licensed.
