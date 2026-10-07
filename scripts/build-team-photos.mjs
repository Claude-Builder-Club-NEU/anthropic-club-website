/**
 * Team photo derivative generator, for the pictures on /about.
 *
 * Modelled on scripts/build-blog-images.mjs: same three formats, same mtime
 * skip, same refusal to break a deploy when sharp is missing. Runs as part of
 * `prebuild`, and from `npm run images`, because `npm run dev` does not run
 * `prebuild`.
 *
 * NOT the blog's quality settings. Those (AVIF 52, WebP 70, JPEG 76) suit a
 * thumbnail, and on the group photo, drawn up to 1024px wide as the page's
 * main picture, AVIF 52 visibly smeared hair and skin. Measured on the group
 * photo at 1920px against its master (SSIM, 1.0 = identical):
 *
 *   AVIF 52  121 KB  0.965      AVIF 66  198 KB  0.985
 *   AVIF 58  153 KB  0.974      AVIF 70  223 KB  0.990   <- chosen
 *   AVIF 62  176 KB  0.980      AVIF 75  246 KB  0.993
 *
 * 70 is where the curve flattens: each step past it buys less fidelity per
 * kilobyte, and 0.99 is past the point a viewer can see. Re-measured at 2048px
 * on the camera-original master: AVIF 70 is 260 KB at 0.990, the same knee,
 * more bytes only because there is more real detail to keep. WebP and JPEG
 * are only fallbacks for browsers without AVIF; JPEG 82 is 0.994 at 322 KB.
 *
 * Masters live in `team-src/` and are never deployed, for the reason
 * board-src/ records: everything in `public/` is copied verbatim into `dist/`.
 * Keep them at about 2000px on the long edge; that is the widest rung, so
 * anything bigger is bytes nobody is served and every clone pays for.
 *
 * Two ladders, <name>-<width>.{avif,webp,jpg}:
 *   group      640 / 1024 / 1536 / 2048. Drawn at up to the 1024px content
 *              width, so 2048 is exactly 2x. Its master is 2560px wide, from
 *              the camera original rather than a copy sent through chat,
 *              which had been shrunk to 2000px and recompressed to about one
 *              bit per pixel and showed it as blotchy suits.
 *   the rest   480 / 960 / 1440 / 1920. The candid row draws each photo at
 *              about 244px, which 480 and 960 cover; their masters are 2000px.
 * A rung must never claim more pixels than its master has, which is why the
 * ladders differ rather than sharing the group's. Shapes are kept, never
 * cropped: the box on the page carries the aspect ratio and object-fit does
 * the framing. The ladders and the matching `sizes` strings live together in
 * src/lib/team.js.
 */

import { readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname, extname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(__dirname, "../team-src");
const OUT_DIR = resolve(__dirname, "../public/team");

/** Kept in step with GROUP_WIDTHS and TEAM_WIDTHS in src/lib/team.js. */
const LADDERS = { group: [640, 1024, 1536, 2048] };
const WIDTHS = [480, 960, 1440, 1920];
const SOURCE_EXT = /\.(jpe?g|png)$/i;

/** Measured on the group photo; see the table above. */
const FORMATS = [
  { ext: "avif", apply: (p) => p.avif({ quality: 70 }) },
  { ext: "webp", apply: (p) => p.webp({ quality: 85 }) },
  { ext: "jpg", apply: (p) => p.jpeg({ quality: 82, mozjpeg: true }) },
];

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.log("[team-photos] team-src/ does not exist — nothing to do");
    return;
  }

  const sources = readdirSync(SRC_DIR).filter((f) => SOURCE_EXT.test(f));
  if (sources.length === 0) {
    console.log("[team-photos] no source images — nothing to do");
    return;
  }

  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    console.warn(
      "[team-photos] sharp is not installed; skipping. Run: npm i -D sharp"
    );
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });

  let made = 0;
  let bytes = 0;

  for (const file of sources) {
    const name = basename(file, extname(file));
    const src = join(SRC_DIR, file);
    const srcTime = statSync(src).mtimeMs;

    for (const w of LADDERS[name] || WIDTHS) {
      for (const { ext, apply } of FORMATS) {
        const out = join(OUT_DIR, `${name}-${w}.${ext}`);
        // Skip work when the derivative is newer than its source.
        if (existsSync(out) && statSync(out).mtimeMs >= srcTime) continue;

        await apply(
          sharp(src).rotate().resize({ width: w, withoutEnlargement: true })
        ).toFile(out);

        made += 1;
        bytes += statSync(out).size;
      }
    }
  }

  console.log(
    `[team-photos] ${sources.length} source(s) -> ${made} file(s), ` +
      `${(bytes / 1024).toFixed(0)} KB total`
  );
}

main().catch((err) => {
  // Image processing must not break a deploy.
  console.warn(`[team-photos] skipped: ${err.message}`);
});
