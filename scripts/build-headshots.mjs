/**
 * Headshot derivative generator.
 *
 * Source spec: public/board/<slug>.jpg, 1600x1600, square, subject centred,
 * neutral background.
 *
 * For each source it emits 320/480/640/960 in AVIF, WebP, and JPEG. BoardCard
 * consumes them through a <picture> with matching `sizes`.
 *
 * Adding a member's photo is therefore two steps: drop the file in, and set
 * `photo: true` on that member in src/lib/board.js.
 *
 * Runs as part of `prebuild`. No sources means no output and no error — that is
 * the current state, since no headshots have been supplied yet.
 */

import { readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname, extname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(__dirname, "../public/board");
const WIDTHS = [320, 480, 640, 960];
const SOURCE_EXT = /\.(jpe?g|png)$/i;
/** Files already produced by this script. */
const DERIVATIVE = /-(320|480|640|960)\.(avif|webp|jpe?g)$/i;

async function main() {
  if (!existsSync(DIR)) {
    mkdirSync(DIR, { recursive: true });
    console.log("[headshots] public/board/ created — no sources yet");
    return;
  }

  const sources = readdirSync(DIR).filter(
    (f) => SOURCE_EXT.test(f) && !DERIVATIVE.test(f)
  );

  if (sources.length === 0) {
    console.log("[headshots] no source images — nothing to do");
    return;
  }

  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    console.warn(
      "[headshots] sharp is not installed; skipping. Run: npm i -D sharp"
    );
    return;
  }

  let made = 0;
  for (const file of sources) {
    const slug = basename(file, extname(file));
    const src = join(DIR, file);
    const srcTime = statSync(src).mtimeMs;

    for (const w of WIDTHS) {
      const jobs = [
        { ext: "avif", opts: { quality: 55 } },
        { ext: "webp", opts: { quality: 72 } },
        { ext: "jpg", opts: { quality: 78, mozjpeg: true } },
      ];

      for (const { ext, opts } of jobs) {
        const out = join(DIR, `${slug}-${w}.${ext}`);
        // Skip work when the derivative is newer than its source.
        if (existsSync(out) && statSync(out).mtimeMs >= srcTime) continue;

        const pipeline = sharp(src)
          .resize(w, w, { fit: "cover", position: "attention" })
          .rotate();

        if (ext === "avif") await pipeline.avif(opts).toFile(out);
        else if (ext === "webp") await pipeline.webp(opts).toFile(out);
        else await pipeline.jpeg(opts).toFile(out);

        made += 1;
      }
    }
    console.log(`[headshots] ${slug} → ${WIDTHS.length * 3} derivatives`);
  }

  console.log(
    `[headshots] ${sources.length} source(s), ${made} file(s) written`
  );
}

main().catch((err) => {
  // Image processing must not break a deploy.
  console.warn(`[headshots] skipped: ${err.message}`);
});
