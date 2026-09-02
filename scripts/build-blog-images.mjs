/**
 * Blog image derivative generator.
 *
 * Modelled on scripts/build-headshots.mjs: same three formats, same quality
 * settings, same mtime skip, same refusal to break a deploy when sharp is
 * missing. Runs as part of `prebuild`. No sources means no output and no error,
 * which is the state this ships in.
 *
 * TO ADD A PICTURE TO A POST
 *   1. Put the master at `blog-src/<post-slug>/<name>.jpg`. Resize it to about
 *      2560px on the long edge FIRST: these masters are committed, and a
 *      multi-megabyte camera file is paid for by every clone forever.
 *   2. Reference it from the post by bare filename:
 *        ![What the picture shows](name.jpg "An optional caption")
 *      Or make it the index thumbnail with `thumb: name.jpg` in the
 *      frontmatter, plus a `thumbAlt` describing it.
 *   3. `npm run images` once, because `npm run dev` does not run `prebuild`.
 *
 * Masters live outside `public/` for the reason board-src/ records: everything
 * in `public/` is copied verbatim into `dist/`, so keeping masters there would
 * deploy megabytes nothing on the site ever requests.
 *
 * Output goes to `public/blog-img/<slug>/`, NOT `public/blog/`. A Netlify
 * header rule written for "/blog/*" would also match the prerendered
 * `/blog/<slug>/index.html` and put an image cache policy on the post pages.
 * The two namespaces stay disjoint.
 *
 * Two derivative sets per master:
 *   <name>-{848,1272,1696}.{avif,webp,jpg}       full-width figure, no crop
 *   <name>-card-{480,720,1024}.{avif,webp,jpg}  16:9 crop for a /blog card
 *
 * Card crops are generated for EVERY master rather than for a conventional
 * filename, because they are small and because "the thumbnail silently did not
 * build" is a worse failure than nine extra files. The width ladders and the
 * matching `sizes` strings live together in src/lib/blog.js.
 */

import { readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname, extname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = resolve(__dirname, "../blog-src");
const OUT_DIR = resolve(__dirname, "../public/blog-img");

/** Kept in step with FIGURE_WIDTHS and CARD_WIDTHS in src/lib/blog.js. */
const FIGURE_WIDTHS = [848, 1272, 1696];
const CARD_WIDTHS = [480, 720, 1024];
const CARD_RATIO = 16 / 9;

const SOURCE_EXT = /\.(jpe?g|png)$/i;

/** Quality settings copied from build-headshots.mjs so the two agree. */
const FORMATS = [
  { ext: "avif", apply: (p) => p.avif({ quality: 52 }) },
  { ext: "webp", apply: (p) => p.webp({ quality: 70 }) },
  { ext: "jpg", apply: (p) => p.jpeg({ quality: 76, mozjpeg: true }) },
];

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.log("[blog-images] blog-src/ does not exist — nothing to do");
    return;
  }

  const slugs = readdirSync(SRC_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  if (slugs.length === 0) {
    console.log("[blog-images] no post folders — nothing to do");
    return;
  }

  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    console.warn(
      "[blog-images] sharp is not installed; skipping. Run: npm i -D sharp"
    );
    return;
  }

  let made = 0;
  let bytes = 0;
  let sources = 0;

  for (const slug of slugs) {
    const inDir = join(SRC_DIR, slug);
    const outDir = join(OUT_DIR, slug);
    const files = readdirSync(inDir).filter((f) => SOURCE_EXT.test(f));
    if (files.length === 0) continue;

    mkdirSync(outDir, { recursive: true });

    for (const file of files) {
      const name = basename(file, extname(file));
      const src = join(inDir, file);
      const srcTime = statSync(src).mtimeMs;
      sources += 1;

      const jobs = [
        // Figures keep the master's own shape. The box they sit in carries the
        // aspect ratio, and object-fit: cover does the framing, so cropping
        // here as well would crop twice.
        ...FIGURE_WIDTHS.map((w) => ({
          out: join(outDir, `${name}-${w}`),
          resize: (p) => p.resize({ width: w, withoutEnlargement: true }),
        })),
        // Cards are a real 16:9 crop. `position: "attention"` picks the busiest
        // region, which is usually but not always the right framing: look at
        // the result and re-frame the master if it cuts something in half.
        // There is deliberately no per-post crop config anywhere in this repo.
        ...CARD_WIDTHS.map((w) => ({
          out: join(outDir, `${name}-card-${w}`),
          resize: (p) =>
            p.resize(w, Math.round(w / CARD_RATIO), {
              fit: "cover",
              position: "attention",
            }),
        })),
      ];

      for (const job of jobs) {
        for (const { ext, apply } of FORMATS) {
          const out = `${job.out}.${ext}`;
          // Skip work when the derivative is newer than its source.
          if (existsSync(out) && statSync(out).mtimeMs >= srcTime) continue;

          await apply(job.resize(sharp(src).rotate())).toFile(out);
          made += 1;
          bytes += statSync(out).size;
        }
      }
    }
  }

  console.log(
    `[blog-images] ${sources} source(s) -> ${made} file(s), ` +
      `${(bytes / 1024).toFixed(0)} KB total`
  );
}

main().catch((err) => {
  // Image processing must not break a deploy.
  console.warn(`[blog-images] skipped: ${err.message}`);
});
