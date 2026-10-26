import { BracketButton } from "./BracketButton";
import { WordmarkBlocks } from "./WordmarkBlocks";
import { APPLY, EVENT, LINKS } from "../lib/event";
import { withBase } from "../lib/base";
import { useApplicationsOpen } from "../lib/apply";
import { ASCII } from "../lib/ascii";

/**
 * Hero.
 *
 * The mark, when and where, two ways in. The hook, the subhead and the proof
 * row have all come out; the date and venue came out with them and are back,
 * because they are the two things someone checks before reading a word of the
 * rest. What the four claims said is still on the page — the tracks, the
 * prizes and the cost each have a section of their own.
 *
 * THE BACKGROUND IS ASCII. A field of red glyphs in soft diagonal bars, like
 * light through blinds, fills the hero behind the mark (src/ascii/hero.html,
 * from tools/ascii_scenes.py). The scanlines are still drawn over it on the
 * mark's own grid. Nothing in this section animates.
 *
 * THE MARK IS THE ONE-PAGER'S. HACK1984 drawn cell by cell on a 5 x 7 grid
 * with real gaps between the cells — see WordmarkBlocks.jsx. It replaced a
 * pixelate filter over Funnel Display, which gives stepped edges but never
 * gaps, and the gaps are the whole character of it. Smaller than the type it
 * replaced, because a bitmap at 180px is shouting.
 *
 * WHEN AND WHERE sit directly under the mark: they are the two facts someone
 * needs before any claim matters, and they come out of EVENT rather than being
 * typed here, so the footer and the details cannot drift away from them.
 *
 * THE BUTTONS. While applications are open: Apply, See the tracks, and the
 * deadline under them, the third fact someone needs. Once they close, See
 * the tracks, with "Applications are closed" as a line under it in the
 * deadline's place rather than as a button: as a button it went nowhere.
 * The decision date is the applicants' business, not a visitor's; the Apply
 * section further down still says it.
 */
export function Hero() {
  const open = useApplicationsOpen();
  return (
    <section className="hk-hero hk-bleed">
      {/* Decorative, and the same build-time file as every ASCII banner; see
          src/lib/ascii.js on the raw HTML. */}
      <div
        className="hk-hero__field"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: ASCII.hero }}
      />

      <h1 className="hk-hero__title">
        <WordmarkBlocks />
      </h1>

      <ul className="hk-hero__where">
        <li>{EVENT.dateLong}</li>
        <li>{EVENT.venue}</li>
      </ul>

      {open ? (
        <>
          <div className="hk-hero__actions">
            <BracketButton className="hk-btn--big" href={withBase(LINKS.signUp)}>
              Apply
            </BracketButton>
            <BracketButton className="hk-hero__secondary" href="#tracks">
              See the tracks
            </BracketButton>
          </div>
          <p className="hk-hero__deadline">Apply by {APPLY.deadlineLabel}</p>
        </>
      ) : (
        <>
          <div className="hk-hero__actions">
            <BracketButton href="#tracks">See the tracks</BracketButton>
          </div>
          <p className="hk-hero__deadline">Applications are closed</p>
        </>
      )}
    </section>
  );
}
