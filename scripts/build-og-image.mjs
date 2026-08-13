/**
 * Generates public/og.png (1200x630) — the real Open Graph image.
 *
 * The previous markup used the 512x512 favicon as its OG image, on a domain
 * that serves no site, so link previews were doubly broken.
 *
 * Run manually (`npm run og`) and commit the result. It is deliberately NOT
 * part of the build: the Poppins face is embedded into the SVG as base64 so the
 * output does not depend on host fonts, and there is no reason to redo that
 * work on every deploy.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const PAPER = "#faf9f5";
const INK = "#141413";
const CORAL = "#d97757";
const GRAY = "#686560";

const fontB64 = readFileSync(
  join(ROOT, "public/fonts/poppins-latin-600.woff2")
).toString("base64");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <style type="text/css">
      @font-face {
        font-family: 'PoppinsOG';
        font-weight: 600;
        src: url(data:font/woff2;base64,${fontB64}) format('woff2');
      }
      .h  { font-family: 'PoppinsOG','Poppins','Arial',sans-serif; font-weight:600; fill:${INK}; letter-spacing:-2.4px; }
      .s  { font-family: 'PoppinsOG','Poppins','Arial',sans-serif; font-weight:600; fill:${GRAY}; letter-spacing:0.5px; }
    </style>
  </defs>

  <rect width="1200" height="630" fill="${PAPER}"/>

  <!-- The highlighter, marked under "what's next" -->
  <rect x="88" y="279" width="331" height="30" fill="${CORAL}"/>

  <text class="h" x="88" y="292" font-size="82">Build what's next</text>
  <text class="h" x="88" y="388" font-size="82">with Claude.</text>

  <text class="s" x="88" y="474" font-size="27">Claude Builders Club @ Northeastern University</text>

  <rect x="88" y="536" width="86" height="5" fill="${CORAL}"/>
</svg>`;

const out = join(ROOT, "public/og.png");
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);

const { size } = await import("node:fs").then((fs) => fs.statSync(out));
console.log(`[og] wrote public/og.png (${(size / 1024).toFixed(1)} KB)`);
