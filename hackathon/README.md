# HACK1984

A single-page site for HACK1984, a 36-hour hackathon in Boston, Nov 6–8 2026,
published at **[claudeneu.com/hackathon](https://claudeneu.com/hackathon/)**.

## Where it lives

This folder is a self-contained app inside the club site's repository. The
club site's build runs it as a `postbuild` step and copies its output to
`dist/hackathon/`; see "The hackathon page" in the root README. Three things
follow from being mounted there rather than at a domain root:

- **`base` is `/hackathon/`** in `vite.config.js`. Vite rewrites everything it
  owns against it. Paths that sit in data files — the organizer logos, the
  calendar file — are not Vite's to rewrite, so they are written base-relative
  and resolved by `withBase()` in `src/lib/base.js` at render.
- **The fonts are self-hosted** in `public/fonts/`, under the file names
  `tokens.json` gives them, and declared with `@font-face` in
  `src/index.css` — below the `@import` of the tokens, because postcss refuses
  an `@import` that follows any other rule, and a refused tokens import is a
  page with no colours. The club site's CSP is `font-src 'self'`, so a font
  CDN is not an option.
- **`SITE_ORIGIN` and `SITE_PATH`** in `src/lib/head.js` give the canonical
  URL. If the mount point moves, they and `base` move together.

There is no `netlify.toml` here: Netlify reads only the one at the repository
root, and a second policy file in this folder would be inert and misleading.

Built from the handoff in `hack1984-website-handoff/` — `SPEC.md`,
`reference/index.html`, `tokens.json`, `ascii/` — and then taken past it. The
**Where this departs from the handoff** section below is the list of places the
design has deliberately moved on; everywhere else the handoff still rules.

## Stack

React 19 + Vite 7 + Tailwind 3, prerendered to static HTML, deployed on
Netlify — the same stack as [claudeneu.com](https://claudeneu.com), matching
its build pipeline, its ESLint config and its `netlify.toml` conventions.

Two deliberate differences from that project:

- **No react-router.** This is one page with anchor links.
- **Tailwind is configured but the design system is CSS.** The design is full
  of values Tailwind has no scale for, and writing them as arbitrary values
  (`text-[15px] tracking-[-0.035em]`) would scatter the system across the
  markup. It lives in `src/index.css` as named classes over the generated
  variables, which is how claudeneu's own `index.css` is organised.
  `tailwind.config.js` maps Tailwind's scales onto the same variables so a
  utility and a component class cannot disagree.

## Commands

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

| Script | What it does |
|---|---|
| `npm run dev` | Regenerate tokens and the .ics, then Vite dev server |
| `npm run build` | Generate → client build → SSR build → prerender |
| `npm run preview` | Serve `dist/` |
| `npm run lint` | ESLint |
| `npm run tokens` | `tokens.json` → `src/styles/tokens.css` |
| `npm run ics` | `src/lib/event.js` → `public/hacking-starts.ics` |

Artwork is generated separately and checked in, because nothing at build time
should need Python:

```bash
cd tools && pip install numpy pillow && python ascii_scenes.py
```

`ascii_scenes.py` writes `src/ascii/*` — four track banners at 160 × 18 plus
the sponsors masthead at 200 × 10 (its grid is in `GRIDS`, and must match
`GRID` in `src/lib/ascii.js` and `--hk-ascii-em` in `index.css`). It is the
only generator left; the detail icons are hand-written vector.

## Layout

| Where | What |
|---|---|
| `tokens.json` → `scripts/build-tokens.mjs` → `src/styles/tokens.css` | Colour, type, spacing (generated, gitignored) |
| `src/index.css` | The whole design system, and the responsive rules |
| `src/components/` | One component per section, plus the shared pieces |
| `src/lib/event.js` | Every launch placeholder, in one file |
| `src/lib/tracks.js` `schedule.js` `details.js` `sponsors.js` | Copy and data |
| `src/components/DetailIcons.jsx` | The five detail-card icons, as vector |
| `src/components/SocialIcons.jsx` | The four Find us icons, as vector |
| `src/lib/wordmarkBlocks.js` + `WordmarkBlocks.jsx` | The hero mark, cell by cell |
| `src/lib/seatDigits.js` + `SeatFigure.jsx` | The seats-left number, block by block |
| `src/lib/organizers.js` | The four orgs running the event |
| `src/ascii/` + `src/lib/ascii.js` | The four track banners |
| `tools/ascii_scenes.py` | The generator for the banners |

### Tokens

`tokens.json` is the single source of truth and is copied in from the handoff
unchanged. `scripts/build-tokens.mjs` turns it into 44 CSS custom properties in
`src/styles/tokens.css`, which is **generated and gitignored** — edit
`tokens.json`, not the CSS. Only the Night theme is emitted; the site is dark
only, so a `[data-theme="day"]` block would be unreachable CSS nobody
maintains.

### The ASCII art

The four `src/ascii/*.html` files are used as HTML, inlined by the bundler and
rendered with `dangerouslySetInnerHTML`. Each is 18 rows of per-run colour
spans; turning that into JSX would cost a component tree to render something
that never changes, and JSX whitespace handling eats the art if it goes
through a `<pre>`. The input is four files in this repo, generated by
`tools/ascii_scenes.py` — nothing from a user, a network response or a URL
reaches it.

`tools/ascii_scenes.py` has a long comment on the one thing that governs
whether ASCII art reads at all: at 160 × 18 a character covers about 10 × 17
source pixels, so detail below roughly 20px is not in the output. That is why
these are abstract patterns and not pictures — a banner a sixth as tall as it
is wide has no room for a subject. Every scene is a near-black ground with
bright marks on it; a mid-grey field resolves to an even wash of `#` and `%`
and reads as noise.

## Where this departs from the handoff

The handoff's `SPEC.md` said to keep every value exact, and the first build
did. These are the changes made since, all of them requested.

| Change | Notes |
|---|---|
| **The page fills the screen.** | The 1440px cap is gone. Everything that was a fixed size and now has to survive a 2560px monitor is a `clamp()` against `vw`: the hero mark is `clamp(260px, 48vw, 760px)` wide, which is 691 x 130 at 1440. |
| **The side gutter grows with the window.** | `clamp(40px, 9vw, 260px)` rather than a flat 32px — 115px at 1280, 130px at 1440, 173px at 1920, and the 260px ceiling from 2890 up. With no max-width holding the content in, a fixed gutter ran text to within an inch of the bezel; this is the breathing room the cap used to provide, without capping. It was `clamp(32px, 6vw, 160px)` and was widened on request. The hero mark is the constraint on going further: at 1440 it is 691px wide against 1181px of content box. Phones keep the handoff's 16px: the header needs 318px of the 343px a 375px screen leaves, and 9vw would take 18px of that slack and wrap `[ SIGN UP ]` onto two lines. |
| **One dashed rule above the socials, none below them.** | It is on `.hk-find` rather than the hero because the hero is full-bleed — a border there would run the whole width of the window, and every other dashed rule on the page stops at the gutter. `.hk-sponsors` used to carry one too; a second rule 130px later split the socials from the banner into two things when they read better as one run down to the tracks. |
| **The track art is abstract, and a banner.** | 160 × 18, about 5.2:1, where the handoff was 80 × 35 — nearly square in a panel twice as wide as it is tall. Four abstract systems rather than four pictures: redaction bars, scanlines, a fracture, board traces. At eighteen rows there is no room to draw an object and still have it read as that object; pattern is what survives. |
| **The art fills its panel at any width.** | `.hk-ascii` is a container query: 160 columns at 0.6em each is 96em, so the type is the panel's width over 96. Never cropped, never letterboxed, at any window size. |
| **Square corners everywhere.** | The detail icons are stroked paths in `DetailIcons.jsx` with square caps and mitred joins, and the radius is 0 on every box on the page. The one deliberately blocky thing is the hero mark, which is drawn cells — see `WordmarkBlocks.jsx`. |
| **The wordmark's red is `#d4190e`, not `accent`.** | Accent is the interface red — buttons, the seconds digit, the accent stroke in an icon. Sharing it made the logo read as another control. |
| **Each track carries a spec list.** | What to build, what the judges look at, what it pays. A title and one sentence sorted teams by vibe; this lets someone decide whether they can enter. |
| **There is no countdown.** | It moved from mid-page to the band above the footer, then became one 76-column ASCII clock over an interference field, then came out altogether on request. Gone with it: `Countdown.jsx`, `asciiClock.js`, the `chrono` scene in `tools/ascii_scenes.py` and its two generated files, the `.hk-countdown` and `.hk-clock` blocks, `.hk-sr-only` (the clock was its only user), `LINKS.saveYourSpot` and the COUNTDOWN item in `NAV`. The four deleted files are in this session's scratchpad under `removed-countdown/` if any of it is wanted back; this repo is not under version control, so that copy is the only one. The prerendered page dropped from 188KB to 129KB. |
| **The buttons do not move on hover.** | The stepped bracket-gap animation is gone; a pointer turns the label white instead. To make a button white at rest too, move the colour off `.hk-btn:hover` onto `.hk-btn`. |
| **The hero is the mark, when and where, and two ways in.** | The hook, the subhead and the four-claim proof row have all come out; the date and venue came out with them and are back, because they are the two things someone checks first. `EVENT.tagline` is still the page's one-sentence description — the meta description and the .ics use it — it is just no longer on screen, and `HERO_PROOF` is gone from `event.js` entirely. What the claims said still has sections of its own: the tracks, the prizes and the cost. |
| **The hero mark is the sponsor one-pager's, redrawn.** | HACK1984 as a 5 × 7 bitmap: one `<rect>` per lit cell on a 47 × 7 grid, with the cell pitch at 1 and the block at 0.74 of it so there is even air on all four sides. Redrawn rather than traced: the one-pager came out of a browser print and its stroke weights and counters drift. The short red rule it sets under the lockup is not here — it read as an underline rather than as part of the mark. **This is why it is drawn and not filtered:** a filter over real type gives stepped edges but never gaps between the cells, and the gaps are the whole character of the mark. `#px` and `#px-sm` went with it, and `#hk-pixel` followed when the Seats figure became drawn blocks too. |
| **Workbench cannot do squares, which is why it is gone again.** | It went back in for one round and came straight out. Its units are round by construction: `BLED` changes how far they bleed and `SCAN` merges each row sideways into a bar, but neither is a shape axis — there is no setting of that face whose elements are square. Squares have to come from a filter over ordinary type, which is what `#px` is. `--font-retro` is an unused generated token again and nothing loads the family. **If it ever goes back:** `<Wordmark>` replaces its class rather than adding to it, so `.hk-hero__title` does not carry `.hk-wordmark`, and any face setting written on only one of those two rules silently misses the hero. |
| **The mark is smaller than the type it replaced.** | `clamp(260px, 48vw, 760px)` of width, so 691 × 130 at 1440 where the filtered type was 949px of ink. The floor is what matters: 47 columns across 260px is a 5.5px cell, which is the smallest the gaps survive at. The header and footer keep the wordmark as type — a 5 × 7 bitmap at 20px is a 2.9px cell, and this page has already learned twice what small plus blocky costs. |
| **There are no SVG filters left.** | The pixelate filter (feFlood, feTile, feMorphology) failed twice by rendering **nothing at all**: first below 1× device pixel ratio — any browser zoom under 100% — where a 1px flood dot rounds away and the tile grid comes back empty, and then on phones, where the Seats figure simply was not there. Both big numerals are drawn blocks now. **If a pixelate filter ever comes back:** 2 × 2 dots, never 1 × 1, with the dilation radius dropped by what the dot gains; and check it on an iPhone before trusting it. |
| **The hero wordmark's tracking is `calc(-0.03em + 5px)`.** | -0.03em is the drawn tracking; the +5px is what the dilation takes back. Growing every glyph by 2px on each side closes 4px of every gap, and 1984 is where that showed first — the 4's crossbar has almost no right sidebearing and it was welding itself to the 8. In px rather than em because the dilation is a fixed pixel radius that does not scale with the type — which is also why the clamp floor dropped to 56px, since the same 40px of tracking across eight characters ran a 64px wordmark past the phone gutter. |
| **A Find us band, between the hero and the sponsors.** | claudeneu.com's link hub, down to its anatomy: four bordered cards, each an icon on the left, the platform over one line about what you get there, and an arrow pushed to the right edge — on their breaks too, one column, two from 560, four from 1024. Separated by a 12px gap rather than sharing dividers, which is the thing that makes them read as cards at all; the first pass used the organizer row's shared rules and read as a table. The dashed borders, square corners, mono caps and black ground are this site's, and it is left-aligned like theirs, which also keeps it from being a third centred row of tiles after the sponsors and the organizers. The first card is the sign-up, matching their "Get updates" slot, and its href comes from `LINKS` so it cannot disagree with the two hero buttons. `SOCIAL` moved from `Footer.jsx` to `src/lib/event.js`, since two places render it now. |
| **The band sits 64px off the banner.** | It was 212 — 72px of its own bottom padding plus the sponsors' 140 — and the two read as unrelated things rather than as one run down to the tracks. 48 and 64 now. |
| **Nothing separates the timeline from Organized by.** | Not a rule and not padding. The rule came out first; the 96px of top padding that was left, on top of the schedule's own 160px of section padding, made a hole rather than a gap. It is 0 now, so that transition is the page's standard 160px — the same as every other one. |
| **The scanlines are the mark's own grid.** | One tile exactly `--hk-cell` tall — the hero mark's width over 47 — lit across the 13% at each end and dark through the middle 74%, which is the mark's cell. So a line falls in every gap between the mark's rows and the wordmark reads as cells lifted out of the field rather than as a graphic sitting on one. Phase comes from `background-position`: the tile is one period tall, so offsetting it by the hero's top padding puts a boundary exactly at the top of the mark, and `--hk-pad-top` feeds both that and the padding so they cannot be changed apart. Measured 0px of misalignment at 790 and at 390, where the padding differs. `#161616` and no brighter: a quarter of the frame is line, where the 22px dot grid this replaced covered about a two-hundredth. The hero clips that ellipse just short of its own centre, so what shows is the top of a glow, brightest at the cut — which is what makes it rise off the bottom edge rather than sit in the frame as a spotlight. It replaced the character rain, which replaced a perspective floor grid and a scanline layer. `HeroRain.jsx` is deleted; a copy is in this session's scratchpad under `removed-rain/`, and this repo is not under version control, so that copy is the only one. Nothing in this section animates now except the wordmark. |
| **Selection is red, everywhere.** | `::selection` is `--accent` behind `--on-accent`, which is the same black-on-red pairing the buttons use and 5.9:1. The browser default is a blue this page has nowhere else. |
| **The hero says when and where, under the mark.** | `EVENT.dateLong` and `EVENT.venue`, on the proof row's construction — a flex row on the page's dashed hairline — a step up in size and in mixed case, because a street address at 0.12em of tracking is hostile. They stack with no rules on a phone. Both come out of `EVENT`, so the footer and the details cannot drift away from them; `dateLong` sits directly beside `dateRange` in that file because two strings for one fact is a hazard and moving one means moving the other. |
| **The wordmark does not glitch.** | It did for one round: four `aria-hidden` copies clipped to horizontal bands, tearing sideways on `steps(1)` every 3.2s. Removed on request along with the pixelate filter under it. The hero `<h1>` is a plain `<Wordmark>` again and nothing in the section animates. |
| **There is no logo mark, and there is no eye.** | A pixel eye, then a vector eye, then a bracketed `( o )`, then one peeking out of the bottom of the hero — four attempts, all removed. The honest read is that this page does not want a drawn eye anywhere on it. The wordmark carries the brand in the header and footer; the sponsors section gets a fifth ASCII banner where the mark used to be — an aperture on its own 200 × 10 grid, about 11.6:1, running edge to edge with no frame. |
| **Buttons are white at rest, accent on hover.** | The inverse of what they were. Red buttons on a page whose logo, seconds digit and meter fill are all red made every control look like part of the artwork. |
| **The detail icons are one colour.** | Each carried a single accent stroke, and five two-tone glyphs in a row read as five unrelated marks rather than a set. |
| **A Seats section, after Tracks.** | The figure sits behind the meter at poster size, drawn in blocks like the hero wordmark, so the two big numerals on the page are the same kind of object. The meter is **100 characters wide, one column per seat**: capacity is 100, so the bar is a literal count, not a proportion. Two rows, offset along the ramp, with **no background and no border**, so the number shows through the gaps between glyphs and the ribbon runs *through* it rather than sitting on it in a black box — built the same way as the ribbon above the sponsor tiers. `68% FULL` sits at the right-hand end, where the free seats are dim dots and a small pad costs nothing. |
| **The meter's rectangle is CSS; only its texture is ASCII.** | Three attempts at an all-character bar failed the same way. `@` at 17px does not fill its cell, so any run of them reads as texture rather than as fill, and the block characters that would fill it — U+2588 and the shade blocks — **are not in Geist Mono**: they measure 28.34px against the font's 24px advance at 40px, so they fall back to another face and break the one-column-per-seat arithmetic outright. Verify with `measureText` before reaching for them again. So `.hk-seats__track` is all hundred seats as a near-black slot and `.hk-seats__fill` is the taken ones as a faint wash exactly `pct`% wide with a 2px inset hairline at the level. Between them they draw the rectangle and nothing else. |
| **The slabs recede; the characters are the bar.** | First pass at the above made the fill a lit slab with light text on it, which read as a coloured box with a caption rather than as ASCII. Now the track is `#120302`, the fill is `rgba(255,59,47,0.09→0.2)`, and everything you actually look at is type: the fill walks the ramp `-=+*#%@` from a third of the way up to full across its width, jittered per row so it has no visible period, under a dark-to-light gradient clipped to the text with `background-clip`. The `@supports` fallback is not decoration — without background-clip the text is transparent and the bar disappears. |
| **A 3px black rule around the bar.** | `outline`, not `border`: a border would shrink the bar's content box, and the ribbon inside it is sized off the stage — a hundred columns have to stay exactly the stage's width. On black ground the rule is only visible where it matters, which is the few pixels between the bar and the numerals it is cut into. |
| **The bar cuts the figure in half.** | `.hk-seats__figure` is masked with a channel knocked straight through the numerals, and the bar is sized and positioned to fill it exactly — same centre line, same height, both derived from `--hk-meter-half` so they cannot drift. That is also what earns the rectangle: a slab lying across the numerals would bury them; set into them it does not. The centre line is 50%: the figure's box is exactly its ink, cap top to baseline, so the middle of the box is the middle of the digits. The figure's em is `clamp(150px, 23vw, 420px)` — bigger than the wordmark's 13.9vw, because the bar takes a slice out of the middle of it and the halves that survive still have to read. |
| **The empty seats are a scale.** | A dot per free seat with a tick every tenth, so the remainder is countable. Before this they were `--ascii-1` on black — invisible — which meant the fill had nothing to be a proportion *of*, and the whole thing read as a smear that stopped somewhere rather than as a meter. The percentage is hidden below 640px: the bar is 358px there and the label is 93 of them, and the legend under it says the same fact in better words. |
| **An Organized by section.** | The four Northeastern orgs, on the same dashed cells as the sponsor tiers but kept separate — an organiser is not a sponsor and one row would say they are. Each cell is a link to that club's own site with the name under the mark: four monochrome logos and no wordmark are not four identifiable clubs to someone who has not met them, and the caption is what turns the row from decoration into a credit. The whole 220 × 124 cell is the hit area rather than a 44px logo and an 11px caption. Two up below 1100px, on a grid, because four 220px cells in a wrapping flex row each kept a left-hand dash and read as four unrelated fragments. The row wraps below 1073px, not just on phones, so the grid starts there. |
| **No Sleep card; the fee is $5.** | There is no overnight quiet room, so the card is gone rather than softened, and "Free for students" is now "$5 per student". |
| **The schedule is an interactive timeline.** | It was nine 104px rows in one dashed frame, which told you the order and nothing else. The rail is **to scale**: a marker's `--x` is its real position between check-in on Friday and prizes on Sunday, so the two hours before the opening ceremony and the eleven overnight hours look like what they are. The 36 hours are drawn as a lit span between their two ends — the section is called "36 hours, start to finish" and now the graphic says so. Both ends are named in the data (`window: "start"` / `"end"`) rather than inferred from titles or cross-checked against `EVENT`'s ISO timestamps, because a timeline that disagreed with the row it is drawn from would be worse than no timeline. |
| **The timeline is a tablist.** | Because that is what it is: a row of selectors over one panel. Click or arrow-key between markers, Home and End jump to the ends, focus roves with selection, and the panel carries the full detail so the rail never has to fit nine titles across. It opens on "Hacking starts", chosen by looking up `highlight` in the data so the server and the client cannot disagree. The panel is the row the list used to be — same red-on-white chip, same display-face title, same tag or the same white button, one at a time instead of nine at once. |
| **Stamps alternate above and below the rail.** | Three Friday-evening events fall inside seven per cent of it and two Sunday-morning ones inside two, so every other stamp goes on the far side. The day sits on its own line above the time, which halves the width of the widest stamps; side by side, "FRI 18:00" ran into "21:00". Verified by measuring every same-side pair: no overlaps at 1280, and 9px of clearance at 900. |
| **The rail turns vertical at 900px, not 720.** | Nine stamps across the 498px a 720px window leaves still collide at the ends, so the horizontal rail needs more room than any other block on the page and gets its own breakpoint. Below it the markers stack and each shows its title inline. The scale does not come with them — proportional spacing down a phone would be a very tall section with nothing in most of it. The dot also stops growing when it is selected there and takes an outline ring instead: in a flex row a 15px active dot shunts its own title 6px right and the column of titles develops a kink. |
| **Details IS the old schedule row.** | Not just its frame — the whole treatment, inherited when the schedule became a timeline: dashed box, 104px rhythm, a red mono chip on the left, a line of display face across the middle, a small grey box on the right. The three slots map straight across, so nothing is left over and nothing is invented: the chip takes the title, the display line takes the body at 22px instead of 30, and the icon moves out from beside the title into the tag box at the right-hand end. The chip has a 152px floor rather than a natural width, because "WHAT TO BRING" is nearly three times "COST" and ragged chips would lose the one thing the row is for. On a phone it takes §6's schedule wrap too — chip above the line, grey box hidden. Icons are Lucide geometry (ISC), inlined, with square caps and the corner radii flattened to 0. |
| **Organizers sits between the timeline and the details.** | It breaks up two long blocks of the same kind of object, and the credit reads better once someone has seen what the weekend actually is. |
| **The footer is claudeneu.com's.** | A four-column block — brand lockup, pages, follow, a call to action — over a rule, with the small print and the affiliation disclaimer under it. Structure is claudeneu's; palette, dashed rules and bracket button are this site's. It was a single line with a wordmark at one end and a date at the other, which is a masthead, not a footer. |
| **The masthead banner is a 20:1 strip.** | 240 × 7, full-bleed, no frame. At seven rows nothing survives as a picture, so it is drawn as a signal strip — rings flattened until they read as converging scan lines. |
| **The four organizer logos are monochrome white.** | Cut from the artwork each club supplied and flattened to pure white with the alpha channel carrying the shape, so four different brand palettes read as one row. ACM's is keyed from the red diamond with its letters knocked out — the supplied file is a filled navy disc, and a white disc is not a logo. Sized to a common **height**, not width: a wide starburst and a tall lightbulb set to one width read as two different weights. |
| **The track frames are not grey.** | `#3a0a07`, the darkest step of the ASCII ramp, instead of the neutral chip grey. Grey read as a UI border around a picture; this belongs to the picture's palette. |
| **The Seats figure is drawn, not filtered.** | It was Funnel Display 800 under `#hk-pixel`, and on phones it did not render at all. Now `SeatFigure.jsx` draws it from `src/lib/seatDigits.js`: all ten digits of that same face, rasterised on a canvas and sampled one cell at a time, lit where the glyph covers at least half the cell, cap top on a row boundary, one shared box because the digits are tabular. Each row's lit cells merge into runs and the figure is one `<path>`, which has no seams between cells and is a few hundred commands rather than a thousand rects. Two densities, both in the markup and one shown by CSS: 25 cells to the em up to 1024px and 48 above, so the blocks stay 6–9px as the figure scales, where one density would run from 6px to 17. Regenerate the same way if the face changes. |
| **Sponsor tiers are a ruled grid below 1100px.** | Same fault as the organizer row, and the same fix, applied to both at the same breakpoint so they stay one kind of object: two up, a dash above every row and under the last, one down the middle, none outside, 440px at most. An odd tier gives its **first** cell the whole top row, so there is no orphan at the bottom and the lead sponsor gets a line to itself. Above 1100px each tier is capped at the column's width, so the five-cell tier's cells shrink rather than running past the gutter. |
| **Anthropic is the first sponsor.** | `public/logos/anthropic.svg` is the club repo's official wordmark (`src/assets/brand/anthropic-wordmark.svg` there) with its fill changed to white, like the organizer logos. It is 180 × 21 rather than 28–32px tall: it is all capitals at 8.7:1, so its whole height is cap height, and it sits level with a taller mark that has a symbol in it. |
| **The timeline says it is clickable.** | A prompt line over the rail: `> CLICK A TIME FOR DETAILS`, or `> TAP A TIME. DETAILS BELOW THE LIST` on a touch screen (`hover: none` and `pointer: coarse`), because there the panel sits under a 400px list and the answer lands out of sight. "Pick a moment on the timeline" came out of the lede, since it was only a hint if you already knew the stamps were buttons. |
| **One button in the hero on a phone.** | "See the tracks" is hidden below 640px. Stacked, it sat level with Sign up as a second primary, and the tracks are one scroll away regardless. |
| **The sponsors banner has a 7px floor on a phone.** | Fitting all 240 columns across 390px made each character 2.7px and the banner 20px tall. It stops shrinking at 7px and centre-crops instead, which is safe because 90% of its ink is in the middle 131 columns. About 93 show at 390. |

Reverted along the way, and worth knowing about: the hero briefly had its
gradient replaced by a field of ASCII characters whose density was the
gradient. The red `linear-gradient` is back and that code is gone.

## Before launch

Every one of these is marked `PLACEHOLDER` at the point it occurs.

- [ ] **Doors time.** `EVENT.doorsISO` / `doorsLabel` in `src/lib/event.js`.
      Drives the schedule's "Doors" row and the `.ics` file.
- [ ] **Hacking window.** `EVENT.hackingStartISO` / `hackingEndISO`. Drives the
      `.ics` file.
- [ ] **Schedule.** Every time in `src/lib/schedule.js` is a draft.
- [ ] **Track prizes.** The `[$1,000]` figures in `src/lib/tracks.js` and the
      "SPONSOR [TBD]" line in `src/components/Tracks.jsx`. The `[$4,000]` total
      went with the hero's proof row and is no longer anywhere on the page.
- [ ] **Seats taken.** `SEATS.seatsTaken` in `src/lib/event.js` is typed in by
      hand. There is no signup backend, so nothing updates it; when one exists
      this is the single value to wire up and the whole Seats section, and the
      hero's seat line, follow from it.
- [ ] **Confirm which logo is Rev.** `public/logos/rev.png` is the four-pointed
      star from the supplied set, assigned by elimination — the lightbulb with a
      neural net in it is clearly AINU and the other two are unambiguous. The
      four club URLs in `src/lib/organizers.js` are confirmed; which mark
      belongs to Rev is not. Worth one look before launch.
- [ ] **Social links.** `SOCIAL` in `src/components/Footer.jsx` — Instagram,
      LinkedIn and Slack all point at `#`.
- [ ] **Details copy.** Meals, quiet room, team size, student ID and "Free for
      students" in `src/lib/details.js`.
- [ ] **Sponsors.** `src/lib/sponsors.js` — Anthropic is in; replace each
      remaining `null` with `{ src, alt, height }`. Monochrome white, 28–32px
      tall.
- [ ] **Link targets.** `LINKS.signUp` and `LINKS.saveYourSpot` are `#`.
- [ ] **Domain.** `SITE_ORIGIN` in `src/lib/head.js`.

## Known trade-offs

- **Fonts come from Google Fonts**, as the handoff specifies. `tokens.json`
  names local woff2 files for all four faces, but those files are not in the
  handoff. Self-hosting them would remove the third-party request and let
  `netlify.toml` drop two CSP origins.
- **The banners ship twice** — once in the prerendered HTML and once in the JS
  bundle, so React can hydrate markup it already rendered. At 18 rows this is
  now about 60KB raw rather than the 170KB the taller art cost, and it
  compresses well. If it matters, the art is decorative and static and could be
  dropped from the client bundle.

## Verified

Checked at 1920, 1280 and 375px, on the dev server and on the production
build: the page fills the screen at every width with no horizontal overflow;
the gutter resolves to 173px at 1920, 130px at 1440, 115px at 1280 and 16px at
375; the banners
fill their panel exactly (773/773px at 1920) and are never cropped; the hero
carries the red gradient again and the character field is gone; the wordmark
renders `rgb(212, 25, 14)`; no `shape-rendering` element remains on the page;
no button label wraps; every detail icon strokes a single colour; no countdown,
clock or `chrono` reference survives anywhere in `src/` or `tools/`, and the nav
is four items; the hero mark is 691 × 130 at 1440 and 260 × 49 at 390, inside
the gutter at both, and its `<h1>` reads as exactly "HACK1984"; the Find us
cards sit four across at 1200, two up at 790 and one per line at 390, with all
four icons resolving and no note clipped, 64px clear of the banner at every
width; the scanline tile matches the
mark's cell to three decimals at both 790 and 390 and is 0px out of phase with
the top of the mark at both; the gap from the timeline panel
to ORGANIZED BY is 160px, the same as the gap from the organizer row to the
Details chip; there is no horizontal overflow at 1440, 790 or 390;
all five detail rows are exactly 104px at 1280 with 152px chips and 72px icon
boxes; the timeline's stamps have no same-side overlap at 1280 and 9px of clearance
at 900, the rail is horizontal above 900px and vertical below it, and clicking,
arrow keys, Home and End all move both the selection and the panel;
the meter's track is the stage's full 1035px at 1280 and its fill is 704px —
68.02% of it — over 68 fill characters drawn from six ramp steps, 32 track
characters and four ticks, with the channel mask applied to a 294px figure and
a 3px black outline on the bar; the organizer row is
four 220 x 124 cells
at 1280 and a two-column grid at 375, each linking out to its club; the hero
wordmark spans 315 of the 343px a 375px screen leaves, so nothing crosses the
gutter; all four logos build into `dist/logos/` and serve 200 as `image/png`; the
Seats figure is drawn blocks at 174 × 102 on a 390px screen and 337 × 202 at
1280, with the bar's centre line exactly on the figure's.

Screenshots stopped painting in the preview pane partway through this round —
the tool reports it as a window-focus problem, not a page error — so the last
few changes were verified by measuring the live DOM rather than by eye. Worth
a look in a real browser. The production
build hydrates with an empty console.
