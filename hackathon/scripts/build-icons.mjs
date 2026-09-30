/**
 * Draws the favicon and the link-preview image from the hero's block mark.
 *
 *   npm run icons
 *
 * Writes, into public/ (served at /hackathon/...):
 *
 *   favicon.svg           the tab icon: the block H with a red square full stop
 *   favicon-32.png        the same, for browsers that ignore SVG icons
 *   apple-touch-icon.png  180 x 180, for home screens and some previews
 *   og.png                1200 x 630, the image iMessage, Slack, LinkedIn and
 *                         the rest show when the link is shared
 *
 * Run by hand and commit the output, like the club site's own og.png. It needs
 * Chrome (for og.png, see below) and sharp, which it finds in the club site's
 * node_modules one folder up, so nothing is added to this app's dependencies.
 * Re-run it when the date, the venue or the mark changes.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { EVENT } from "../src/lib/event.js";
import {
  GLYPH_ROWS,
  GRID_COLS,
  WORD_CELLS,
  YEAR_CELLS,
} from "../src/lib/wordmarkBlocks.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

const INK = "#e6e6e6";
const BODY = "#a3a3a3";
const RED = "#d4190e"; // the wordmark's red, not the interface accent
const ACCENT = "#ff3b2f";
const BLOCK = 0.74; // of a cell, as in WordmarkBlocks.jsx
const INSET = (1 - BLOCK) / 2;

const rects = (cells, fill, dx = 0, dy = 0) =>
  cells
    .map((c) => `<rect x="${c.x + dx + INSET}" y="${c.y + dy + INSET}" width="${BLOCK}" height="${BLOCK}" fill="${fill}"/>`)
    .join("");

// ---------------------------------------------------------------------------
// Favicon: the H of the mark, and a red square full stop after it, on black.
// A 9 x 9 grid: one cell of margin, the 5 x 7 glyph, a gap, the stop.
// ---------------------------------------------------------------------------

const H = WORD_CELLS.filter((c) => c.x < 5);
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9" width="64" height="64">
  <rect width="9" height="9" fill="#000"/>
  ${rects(H, "#ffffff", 1, 1)}
  ${rects([{ x: 6, y: 6 }], RED, 1, 1)}
</svg>
`;
writeFileSync(join(PUBLIC, "favicon.svg"), favicon);
await sharp(Buffer.from(favicon)).resize(32, 32).png().toFile(join(PUBLIC, "favicon-32.png"));
await sharp(Buffer.from(favicon)).resize(180, 180).png().toFile(join(PUBLIC, "apple-touch-icon.png"));

// ---------------------------------------------------------------------------
// Link preview, 1200 x 630: the hero in miniature.
//
// Rendered by headless Chrome, not by sharp. sharp's SVG renderer ignores
// embedded woff2 fonts, and the preview is the one place a stranger sees the
// page's type before they click, so it has to be the real faces. Set CHROME
// to the browser's path if it is not in the usual place.
// ---------------------------------------------------------------------------

const CHROME =
  process.env.CHROME ||
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find((p) => existsSync(p));
if (!CHROME) throw new Error("[icons] no Chrome found; set CHROME to its path");

const fontUrl = (file) => pathToFileURL(join(PUBLIC, "fonts", file)).href;
const MARK_W = 940;
const CELL = MARK_W / GRID_COLS;
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID_COLS} ${GLYPH_ROWS}" width="${MARK_W}">${rects(WORD_CELLS, INK)}${rects(YEAR_CELLS, RED)}</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Geist Mono'; src: url(${fontUrl("GeistMono-100-900.woff2")}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Funnel Display'; src: url(${fontUrl("FunnelDisplay-300-800.woff2")}) format('woff2'); font-weight: 300 800; }
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #000; }
.card { position: relative; width: 1200px; height: 630px; box-sizing: border-box; padding: 150px 0 0;
  display: flex; flex-direction: column; align-items: center; gap: 30px; overflow: hidden;
  background-color: #000;
  background-image: linear-gradient(180deg, #111 0 13%, transparent 13% 87%, #111 87% 100%);
  background-size: 100% ${CELL}px; background-position: 0 150px; }
.card::after { content: ""; position: absolute; left: 50%; bottom: -330px; width: 1500px; height: 620px;
  transform: translateX(-50%); background: radial-gradient(closest-side, rgba(255,59,47,.34), rgba(160,20,12,.14) 55%, transparent); }
.card > * { position: relative; z-index: 1; }
.top { position: absolute; top: 48px; left: 60px; right: 60px; display: flex; justify-content: space-between; align-items: center;
  font: 600 20px 'Geist Mono'; letter-spacing: .14em; color: ${BODY}; }
.chip { padding: 8px 14px; background: ${ACCENT}; color: #000; font-weight: 700; font-size: 17px; }
.line { font: 500 42px 'Funnel Display'; letter-spacing: -.02em; color: ${INK}; margin-top: 12px; }
.when { font: 500 22px 'Geist Mono'; letter-spacing: .06em; color: ${BODY}; }
</style></head><body><div class="card">
<div class="top"><span>CLAUDENEU.COM/HACKATHON</span><span class="chip">SIGN UP</span></div>
${markSvg}
<div class="line">A hackathon for software that doesn’t watch you.</div>
<div class="when">${EVENT.dateLong.toUpperCase()} · ${EVENT.venue.toUpperCase()}</div>
</div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), "hk-og-"));
const page = join(dir, "og.html");
writeFileSync(page, html);
execFileSync(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--user-data-dir=${join(dir, "profile")}`,
  "--window-size=1200,630",
  "--virtual-time-budget=4000",
  `--screenshot=${join(PUBLIC, "og.png")}`,
  pathToFileURL(page).href,
], { stdio: "ignore" });
rmSync(dir, { recursive: true, force: true });

console.log("[icons] favicon.svg, favicon-32.png, apple-touch-icon.png, og.png");
