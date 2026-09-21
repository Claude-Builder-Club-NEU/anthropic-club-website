import { ASCII } from "../lib/ascii";

/**
 * One track's ASCII image, in its frame (SPEC §3.4).
 *
 * aria-hidden: the drawing is decorative and the track's own title and
 * description say everything it says. Read aloud, 2,800 punctuation marks
 * would be worse than silence.
 *
 * On the raw HTML, and why it is not a security hole, see src/lib/ascii.js.
 */
export function AsciiPanel({ art, bare = false }) {
  const html = ASCII[art];

  if (!html) {
    throw new Error(
      `AsciiPanel: no art named "${art}". Known images: ${Object.keys(
        ASCII
      ).join(", ")}.`
    );
  }

  const box = (
    <div
      className={bare ? `hk-ascii hk-ascii--${art}` : "hk-ascii"}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  // `bare` drops the hairline frame and its 7px inset. The track banners sit
  // inside a panel and want the frame; the masthead runs the full width of the
  // page, where a border would draw a box around the whole thing.
  return bare ? box : <div className="hk-ascii-frame">{box}</div>;
}
