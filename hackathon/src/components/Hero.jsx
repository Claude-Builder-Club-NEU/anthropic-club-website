import { BracketButton } from "./BracketButton";
import { WordmarkBlocks } from "./WordmarkBlocks";
import { EVENT, LINKS } from "../lib/event";

/**
 * Hero.
 *
 * The mark, when and where, two ways in. The hook, the subhead and the proof
 * row have all come out; the date and venue came out with them and are back,
 * because they are the two things someone checks before reading a word of the
 * rest. What the four claims said is still on the page — the tracks, the
 * prizes and the cost each have a section of their own.
 *
 * THE BACKGROUND IS CSS. Scanlines on pure black with one red haze rising off
 * the bottom edge. Nothing in this section animates.
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
 */
export function Hero() {
  return (
    <section className="hk-hero hk-bleed">
      <h1 className="hk-hero__title">
        <WordmarkBlocks />
      </h1>

      <ul className="hk-hero__where">
        <li>{EVENT.dateLong}</li>
        <li>{EVENT.venue}</li>
      </ul>

      <div className="hk-hero__actions">
        <BracketButton href={LINKS.signUp}>Sign up</BracketButton>
        <BracketButton className="hk-hero__secondary" href="#tracks">
          See the tracks
        </BracketButton>
      </div>
    </section>
  );
}
