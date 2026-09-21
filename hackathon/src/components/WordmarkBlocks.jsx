import {
  GLYPH_ROWS,
  GRID_COLS,
  WORD,
  WORD_CELLS,
  YEAR,
  YEAR_CELLS,
} from "../lib/wordmarkBlocks";

/**
 * The hero's wordmark, drawn cell by cell.
 *
 * One rect per lit cell on a 47 x 7 grid. The cell pitch is 1 and the block
 * is 0.74 of it, centred, so the gap between cells is even on all four sides
 * — that 26% of air is what separates this from a pixelate filter, which can
 * give stepped edges but never gaps. It is also the hero's scanline pitch:
 * both read --hk-cell, so the lines cannot drift off the mark's rows.
 *
 * The one-pager sets a short red rule under the lockup. It is not here; it
 * read as an underline rather than as part of the mark.
 *
 * `role="img"` with a label, because eight glyphs of geometry are not text to
 * anything that cannot see them. The <h1> around it contributes no text of its
 * own, so this label is the heading.
 *
 * The two colour runs are separate groups rather than per-rect fills, so the
 * split is one CSS declaration each and the tokens stay in the stylesheet.
 */

/** Of a 1-unit cell. 0.74 leaves 13% of air on each side. */
const BLOCK = 0.74;
const INSET = (1 - BLOCK) / 2;

function Cells({ cells, className }) {
  return (
    <g className={className}>
      {cells.map((cell) => (
        <rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x + INSET}
          y={cell.y + INSET}
          width={BLOCK}
          height={BLOCK}
        />
      ))}
    </g>
  );
}

export function WordmarkBlocks({ className = "" }) {
  return (
    <svg
      className={`hk-blocks ${className}`.trim()}
      viewBox={`0 0 ${GRID_COLS} ${GLYPH_ROWS}`}
      role="img"
      aria-label={`${WORD}${YEAR}`}
      focusable="false"
    >
      <Cells cells={WORD_CELLS} className="hk-blocks__word" />
      <Cells cells={YEAR_CELLS} className="hk-blocks__year" />
    </svg>
  );
}
