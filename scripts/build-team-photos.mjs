/**
 * Team photo derivative generator, for the pictures on /about.
 *
 * Modelled on scripts/build-blog-images.mjs: same three formats, same quality
 * settings, same mtime skip, same refusal to break a deploy when sharp is
 * missing. Runs as part of `prebuild`, and from `npm run images`, because
 * `npm run dev` does not run `prebuild`.
 *
 * Masters live in `team-src/` and are never deployed, for the reason
 * board-src/ records: everything in `public/` is copied verbatim into `dist/`.
 * Keep them at about 2000px on the long edge; that is the widest rung, so
 * anything bigger is bytes nobody is served and every clone pays for.
 *
 * One ladder for every master: <name>-{480,960,1440,2000}.{avif,webp,jpg}.
 * The group photo is drawn at the full 1024px content width, so 2000 covers
 * it at 2x; the candid row draws each photo at about 244px, which 480 and 960
 * cover. Shapes are kept, never cropped: the box on the page carries the
 * aspect ratio and object-fit does the framing. The ladder and the matching
 * `sizes` strings live together in src/lib/team.js.
 */

import { readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname, extname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(__dirname, "../team-src");
const OUT_DIR = resolve(__dirname, "../public/team");

/** Kept in step with TEAM_WIDTHS in src/lib/team.js. */
const WIDTHS = [480, 960, 1440, 2000];
const SOURCE_EXT = /\.(jpe?g|png)$/i;

/** Quality settings copied from build-headshots.mjs so the three agree. */
const FORMATS = [
  { ext: "avif", apply: (p) => p.avif({ quality: 52 }) },
  { ext: "webp", apply: (p) => p.webp({ quality: 70 }) },
  { ext: "jpg", apply: (p) => p.jpeg({ quality: 76, mozjpeg: true }) },
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

    for (const w of WIDTHS) {
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
