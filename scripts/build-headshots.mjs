/**
 * Headshot derivative generator.
 *
 * Reads masters from `board-src/` and writes optimised derivatives into
 * `public/board/`. For each source it emits 320/480/640 in AVIF, WebP and
 * JPEG. BoardCard consumes them through a <picture> with matching `sizes`.
 *
 * Why the masters live outside `public/`: everything in `public/` is copied
 * verbatim into `dist/`. Keeping 800px masters there would ship roughly half a
 * megabyte of images that nothing on the site ever requests. Sources in
 * `board-src/` are committed for the record but never deployed.
 *
 * Adding a member's photo is therefore: drop `board-src/<slug>.jpg` in, and set
 * `photo: true` on that member in src/lib/board.js.
 *
 * Widths stop at 640 on purpose. The masters are 800px and the slot renders at
 * about 300 CSS px, so 640 already covers a 2x display. Generating a 960 would
 * mean upscaling, which adds bytes and no detail.
 *
 * Runs as part of `prebuild`. No sources means no output and no error.
 */

import { readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname, extname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(__dirname, "../board-src");
const OUT_DIR = resolve(__dirname, "../public/board");
const WIDTHS = [320, 480, 640];
const SOURCE_EXT = /\.(jpe?g|png)$/i;

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.log("[headshots] board-src/ does not exist — nothing to do");
    return;
  }

  const sources = readdirSync(SRC_DIR).filter((f) => SOURCE_EXT.test(f));
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

  mkdirSync(OUT_DIR, { recursive: true });

  let made = 0;
  let bytes = 0;

  for (const file of sources) {
    const slug = basename(file, extname(file));
    const src = join(SRC_DIR, file);
    const srcTime = statSync(src).mtimeMs;

    for (const w of WIDTHS) {
      const jobs = [
        { ext: "avif", apply: (p) => p.avif({ quality: 52 }) },
        { ext: "webp", apply: (p) => p.webp({ quality: 70 }) },
        { ext: "jpg", apply: (p) => p.jpeg({ quality: 76, mozjpeg: true }) },
      ];

      for (const { ext, apply } of jobs) {
        const out = join(OUT_DIR, `${slug}-${w}.${ext}`);
        // Skip work when the derivative is newer than its source.
        if (existsSync(out) && statSync(out).mtimeMs >= srcTime) continue;

        await apply(
          sharp(src).rotate().resize(w, w, { fit: "cover", position: "attention" })
        ).toFile(out);

        made += 1;
        bytes += statSync(out).size;
      }
    }
  }

  console.log(
    `[headshots] ${sources.length} source(s) -> ${made} file(s), ` +
      `${(bytes / 1024).toFixed(0)} KB total`
  );
}

main().catch((err) => {
  // Image processing must not break a deploy.
  console.warn(`[headshots] skipped: ${err.message}`);
});
