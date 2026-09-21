import { SEAT_DIGITS } from "../lib/seatDigits";

/**
 * The seats-left number, drawn in blocks.
 *
 * The digits are bitmaps of Funnel Display 800 (see lib/seatDigits.js), not
 * text under a filter, so the number renders the same in every browser. Each
 * row's lit cells are merged into runs and the whole figure is one <path> per
 * density: a rect per cell would be over a thousand elements at the fine
 * density, and cells drawn as separate shapes show hairline seams where their
 * antialiased edges meet. One path has none.
 *
 * Both densities are rendered and the stylesheet shows one, so the choice
 * needs no JavaScript and the server and the client always agree.
 */

/** One empty column between digits. Most pairs already have air between
 *  them inside the shared box; this keeps a 0 off the stem of a 4. */
const GAP = 1;

function widthOf(text, set) {
  return text.length * set.cols + (text.length - 1) * GAP;
}

function pathFor(text, set) {
  let d = "";
  [...text].forEach((ch, i) => {
    const glyph = set.glyphs[ch];
    if (!glyph) throw new Error(`SeatFigure: no glyph for "${ch}"`);
    const left = i * (set.cols + GAP);
    glyph.forEach((row, y) => {
      for (const run of row.matchAll(/#+/g)) {
        const w = run[0].length;
        d += `M${left + run.index} ${y}h${w}v1h-${w}z`;
      }
    });
  });
  return d;
}

export function SeatFigure({ value }) {
  const text = String(value);
  return (
    <span className="hk-seats__figure" aria-hidden="true">
      {Object.entries(SEAT_DIGITS).map(([density, set]) => {
        const cols = widthOf(text, set);
        return (
          <svg
            key={density}
            className={`hk-seats__digits hk-seats__digits--${density}`}
            viewBox={`0 0 ${cols} ${set.rows}`}
            focusable="false"
            // Its size in ems of the figure, so CSS can scale it with the
            // same clamp() the text version used.
            style={{
              "--w": String(cols / set.cellsPerEm),
              "--h": String(set.rows / set.cellsPerEm),
            }}
          >
            <path d={pathFor(text, set)} />
          </svg>
        );
      })}
    </span>
  );
}
