import {
  GLYPH_ROWS,
  GRID_COLS,
  LOGO_WORD_CELLS,
  LOGO_YEAR_CELLS,
  WORD,
  YEAR,
} from "../lib/wordmarkBlocks";

/**
 * The logo, as the sponsorship packet has it: HACK1984 in a pixel face on a
 * 47 x 7 grid, solid cells that touch, "HACK" in ink and "1984" in the
 * wordmark red. The packet sets "HACK" near black on paper; on this black
 * ground it is the page's white. Used small, in the header and the footer.
 * The hero draws the same grid with gaps between the cells (WordmarkBlocks).
 *
 * Each row's lit cells are merged into runs and drawn as one rect per run,
 * with crisp edges, so neighbouring cells meet without a hairline between
 * them. The CSS sizes it to a whole number of pixels per cell.
 */

/** Cells to horizontal runs: [{ x, y, w }]. */
function runsOf(cells) {
  const byRow = new Map();
  for (const { x, y } of cells) {
    if (!byRow.has(y)) byRow.set(y, []);
    byRow.get(y).push(x);
  }
  const runs = [];
  for (const [y, xs] of byRow) {
    xs.sort((a, b) => a - b);
    let start = xs[0];
    let prev = xs[0];
    for (const x of xs.slice(1).concat(Infinity)) {
      if (x === prev + 1) {
        prev = x;
        continue;
      }
      runs.push({ x: start, y, w: prev - start + 1 });
      start = x;
      prev = x;
    }
  }
  return runs;
}

const WORD_RUNS = runsOf(LOGO_WORD_CELLS);
const YEAR_RUNS = runsOf(LOGO_YEAR_CELLS);

export function Wordmark({ className = "" }) {
  return (
    <svg
      className={`hk-logo ${className}`.trim()}
      viewBox={`0 0 ${GRID_COLS} ${GLYPH_ROWS}`}
      role="img"
      aria-label={`${WORD}${YEAR}`}
      shapeRendering="crispEdges"
      focusable="false"
    >
      <g className="hk-logo__word">
        {WORD_RUNS.map((run) => (
          <rect key={`${run.x}-${run.y}`} x={run.x} y={run.y} width={run.w} height={1} />
        ))}
      </g>
      <g className="hk-logo__year">
        {YEAR_RUNS.map((run) => (
          <rect key={`${run.x}-${run.y}`} x={run.x} y={run.y} width={run.w} height={1} />
        ))}
      </g>
    </svg>
  );
}
