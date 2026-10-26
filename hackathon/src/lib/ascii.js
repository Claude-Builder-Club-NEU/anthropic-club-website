/**
 * The ASCII banners: one per track, and the field behind the hero.
 *
 * The sponsors masthead (src/ascii/masthead.html, 240 x 7) is off the page
 * since the sponsors moved up under the hero, which is ASCII already; its
 * file and its scene in tools/ascii_scenes.py are kept for it to come back.
 *
 * WHY RAW HTML AND NOT JSX.
 *
 * Each file is 18 rows of per-run colour spans. Parsing
 * that into JSX would cost a large component tree to render something that
 * never changes, and JSX whitespace handling eats the art if it goes through
 * a <pre>. The files are generated as HTML precisely so they can be used as
 * HTML, so they are.
 *
 * dangerouslySetInnerHTML is safe here in the way that word is supposed to
 * mean: the input is four files in this repo, written by tools/ascii_scenes.py
 * and inlined by the bundler at build time. No value from a user, a network
 * response or a URL reaches it, and it cannot change at runtime.
 *
 * The generator emits `<div class="hk-ascii__row">` itself, so nothing is
 * rewritten on the way in. The handoff's files carried an inline
 * `height: 13px` on every row, which had to be stripped because an inline
 * style beats the stylesheet and would have pinned the rows at 13px while the
 * type around them scaled.
 */

import ministryOfTruth from "../ascii/ministry-of-truth.html?raw";
import telescreen from "../ascii/telescreen.html?raw";
import sledgehammer from "../ascii/sledgehammer.html?raw";
import room101 from "../ascii/room-101.html?raw";
import hero from "../ascii/hero.html?raw";

/**
 * The grid each image was generated on. Keep in step with COLS/ROWS and GRIDS
 * in tools/ascii_scenes.py.
 *
 * The column count is also what the CSS scales the type against — 160 columns
 * at 0.6em is 96em — so a mismatch here is a banner that does not fill its
 * box. See `--hk-ascii-em` in index.css.
 */
const GRID = {
  "ministry-of-truth": [160, 18],
  telescreen: [160, 18],
  sledgehammer: [160, 18],
  "room-101": [160, 18],
  // The whole hero, behind the mark, cropped to it like a cover image.
  hero: [220, 96],
};

const ROW = '<div class="hk-ascii__row">';

function check(html, name) {
  const expected = GRID[name][1];
  const rows = html.split(ROW).length - 1;

  // A generator change that altered the row markup or the grid would
  // otherwise fail silently: the art would still render, at the wrong size.
  if (rows !== expected) {
    throw new Error(
      `ascii/${name}.html: expected ${expected} rows matching ${ROW}, ` +
        `found ${rows}. Re-run tools/ascii_scenes.py, or update GRID.`
    );
  }

  return html;
}

/** Keyed by the `art` field on each track in src/lib/tracks.js. */
export const ASCII = {
  "ministry-of-truth": check(ministryOfTruth, "ministry-of-truth"),
  telescreen: check(telescreen, "telescreen"),
  sledgehammer: check(sledgehammer, "sledgehammer"),
  "room-101": check(room101, "room-101"),
  hero: check(hero, "hero"),
};
