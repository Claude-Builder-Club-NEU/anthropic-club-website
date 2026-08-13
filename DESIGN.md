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
rounded:
  sm: "4px"
  md: "8px"
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

**Key Characteristics:**
- Warm paper ground (#faf9f5), never pure white
- Serif body, geometric-sans display — reading voice and title voice are distinct
- Exactly one motion primitive sitewide
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

### Named Rules

**The Two-Voice Rule.** Poppins titles, Lora prose. A block of Poppins running
longer than two lines is a mistake; so is a heading set in Lora.

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

Corners are nearly sharp — 4px as the default, 8px only on large panels. The
system reads as printed matter, and printed matter does not have soft corners.
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

### Navigation
Poppins 500 at 15px, Ink, no underline at rest. Hover and focus draw the
highlighter sweep beneath the label. The current page is marked with a persistent
sweep rather than a color change. Below 768px the nav collapses to a disclosure
menu; the join action stays a filled coral button and never hides behind the menu.

### The Highlighter (signature)

The system's one motion primitive and its defining component. A coral band, 0.34em
tall (0.42em at display size), painted as a background gradient sitting at 88% of
the line box so it reads as marked *beneath* the words rather than boxed around
them. It grows from 0% to 100% width over 150ms on an ease-out curve.

It appears in exactly three places: the primary CTA on hover, navigation links on
hover and focus, and one phrase in the hero that marks itself once on load.
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
- **Don't** add a second animation. No scroll reveals, no fades, no parallax, no
  counters, no hover-lifts, no page transitions, no smooth scrolling.
- **Don't** use `box-shadow` anywhere.
- **Don't** put an eyebrow, kicker, chip, or section number above a heading.
- **Don't** set Pale Clay (#b0aea5) as text at any size.
- **Don't** nest cards, or use same-size icon-plus-heading-plus-text cards as the
  page's structure.
- **Don't** use emoji as an icon system. Icons are drawn SVG at one consistent
  stroke weight; the club's custom emoji set is the single sanctioned exception and
  only in the link hub.
- **Don't** self-host Styrene, Tiempos, or Copernicus. They are licensed.
