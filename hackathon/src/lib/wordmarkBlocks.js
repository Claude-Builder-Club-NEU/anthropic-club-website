/**
 * The wordmark, as a 5 x 7 bitmap.
 *
 * Taken from the sponsor one-pager, where HACK1984 is set as a dot-matrix of
 * square cells with real gaps between them rather than as type. Redrawn here
 * rather than traced: the one-pager's glyphs came out of a browser print and
 * their stroke weights and counters drift, so these are a clean, consistent
 * 5 x 7 set on one grid. That is the "improve on" — same idea, even colour.
 *
 * Why data and not a font or a filter: a filter over real type gives stepped
 * edges but no gaps between the cells, and there is no weight of any face
 * that has them. The gaps are the whole character of this mark, so the cells
 * have to be drawn.
 *
 * One column of gap between glyphs, so eight glyphs are 8 * 5 + 7 = 47
 * columns across. Rows are 7. See WordmarkBlocks.jsx for the geometry.
 */

/** Each glyph is seven strings of five characters. `#` is a lit cell. */
const GLYPHS = {
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  1: ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", "#####"],
  9: [".###.", "#...#", "#...#", ".####", "....#", "#...#", ".###."],
  8: [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  4: ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
};

export const GLYPH_COLS = 5;
export const GLYPH_ROWS = 7;

/** The two halves of the mark, so each can take its own colour. */
export const WORD = "HACK";
export const YEAR = "1984";

/**
 * The logo as the sponsorship packet (HACK1984_Sponsorship_Packet_FINAL)
 * sets it: the same 47 x 7 grid, and the same glyphs but three, drawn as the
 * packet draws them: C open on its right side, 1 on a three-cell foot, and
 * 9 with a straight tail. The packet's cells are solid and touch; the header
 * and footer draw this set that way (Wordmark.jsx). The hero keeps the set
 * above, with its gaps.
 */
const LOGO_GLYPHS = {
  ...GLYPHS,
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  1: ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  9: [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
};

/**
 * Every lit cell in the mark, as { x, y } on the 47 x 7 grid, split into the
 * two colour runs. Computed once at module load — the mark never changes.
 */
function cellsFor(text, startCol, glyphs = GLYPHS) {
  const cells = [];
  let col = startCol;
  for (const ch of text) {
    const glyph = glyphs[ch];
    if (!glyph) throw new Error(`wordmarkBlocks: no glyph for "${ch}"`);
    glyph.forEach((row, y) => {
      for (let x = 0; x < GLYPH_COLS; x += 1) {
        if (row[x] === "#") cells.push({ x: col + x, y });
      }
    });
    col += GLYPH_COLS + 1;
  }
  return cells;
}

export const WORD_CELLS = cellsFor(WORD, 0);
export const YEAR_CELLS = cellsFor(YEAR, WORD.length * (GLYPH_COLS + 1));

export const LOGO_WORD_CELLS = cellsFor(WORD, 0, LOGO_GLYPHS);
export const LOGO_YEAR_CELLS = cellsFor(YEAR, WORD.length * (GLYPH_COLS + 1), LOGO_GLYPHS);

/** 8 glyphs of 5 columns with a column of gap between each pair. */
export const GRID_COLS =
  (WORD.length + YEAR.length) * GLYPH_COLS + (WORD.length + YEAR.length - 1);
