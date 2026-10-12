import { BracketButton } from "./BracketButton";
import { WordmarkBlocks } from "./WordmarkBlocks";
import { APPLY, EVENT, LINKS } from "../lib/event";
import { withBase } from "../lib/base";
import { useApplicationsOpen } from "../lib/apply";

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
 *
 * THE DEADLINE sits under the buttons: getting in is by application, so the
 * third fact someone needs is how long they have.
 */
export function Hero() {
  const open = useApplicationsOpen();
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
        <BracketButton className={open ? "hk-btn--big" : ""} href={open ? withBase(LINKS.signUp) : "#apply"}>
          {open ? "Apply" : "Applications closed"}
        </BracketButton>
        <BracketButton className="hk-hero__secondary" href="#tracks">
          See the tracks
        </BracketButton>
      </div>

      <p className="hk-hero__deadline">
        <span>{open ? `Apply by ${APPLY.deadlineLabel}` : `Applications closed ${APPLY.deadlineLabel}`}</span>
        <span className="hk-hero__deadline-sep" aria-hidden="true"> · </span>
        <span>Decisions {APPLY.decisionsLabel}</span>
      </p>
    </section>
  );
}
