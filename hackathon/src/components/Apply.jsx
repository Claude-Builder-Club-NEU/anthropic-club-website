import { BracketButton } from "./BracketButton";
import { SeatFigure } from "./SeatFigure";
import { APPLY, EVENT, LINKS } from "../lib/event";
import { withBase } from "../lib/base";
import { useApplicationsOpen } from "../lib/apply";

/**
 * How to get in, straight after the tracks.
 *
 * This was a live seats-left meter when the first hundred to sign up got the
 * seats. Getting in is by application now, so the count is gone (it only ever
 * fell to 00 and read as "closed") and the section says three things: how
 * many spots there are, the dates, and that applying is free.
 *
 * THE FIGURE IS THE SPOTS. The same block numerals as before, now a fixed
 * 100, with the channel still cut through them. What runs in the channel is
 * the old meter's empty track: one dot per spot and a tick every tenth, so
 * the hundred is something you can count. None are lit, because nobody is in
 * until decision day.
 *
 * THE DATES ARE THE CONTENT. Three steps on one row, each led by its date in
 * mono caps, because "when do I apply by" and "when do I hear back" are the two
 * questions this section exists to answer.
 */

/** Two rows, as the meter had: one read as a dashed rule. */
const RIBBON_ROWS = 2;

/** A dot per spot and a tick every tenth. */
function ribbonRow(spots) {
  let s = "";
  for (let i = 0; i < spots; i += 1) s += (i + 1) % 10 === 0 ? "|" : "·";
  return s;
}

const STEPS = [
  {
    date: APPLY.deadlineLabel,
    head: "Apply",
    text: `Applications close ${APPLY.deadlineLabel} at 11:59 PM ET. Applying is free.`,
  },
  {
    date: APPLY.decisionsLabel,
    head: "Hear back",
    text: `We pick ${APPLY.spots} builders and email every applicant on ${APPLY.decisionsLabel}. Everyone else goes on the waitlist.`,
  },
  {
    date: EVENT.dateRange,
    head: "Come build, free",
    text: `Accepted? There's no fee. Bring your laptop and student ID to ${EVENT.venue}; food, Wi-Fi and swag are covered.`,
  },
];

export function Apply() {
  const open = useApplicationsOpen();

  return (
    <section id="apply" aria-labelledby="apply-h" className="hk-section">
      <div className="hk-seats">
        <h2 id="apply-h" className="hk-apply__title">
          <span className="hk-chip">{open ? "APPLICATIONS OPEN" : "APPLICATIONS CLOSED"}</span>
          {open
            ? `${APPLY.spots} spots. Apply by ${APPLY.deadlineShort}.`
            : `Applications closed ${APPLY.deadlineShort}.`}
        </h2>

        <div className="hk-seats__stage">
          <SeatFigure value={String(APPLY.spots)} />

          <div className="hk-seats__bar" aria-hidden="true">
            <span className="hk-seats__track" />
            <span className="hk-seats__lines">
              {Array.from({ length: RIBBON_ROWS }, (_, row) => (
                <span className="hk-seats__line" key={row}>
                  <span className="hk-seats__off">{ribbonRow(APPLY.spots)}</span>
                </span>
              ))}
            </span>
            <span className="hk-seats__pct hk-seats__pct--mid">
              {APPLY.spots} SPOTS · BY APPLICATION
            </span>
          </div>
        </div>

        <ol className="hk-apply__steps">
          {STEPS.map((step, i) => (
            <li key={step.head} className="hk-apply__step">
              <p className="hk-apply__date">
                <span className="hk-apply__n">{String(i + 1).padStart(2, "0")}</span>
                {step.date.toUpperCase()}
              </p>
              <p className="hk-apply__head">{step.head}</p>
              <p className="hk-apply__text">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="hk-seats__cta">
          <p className="hk-seats__legend" aria-live="polite">
            {open ? (
              <>
                <strong>Completely free.</strong> No fee to apply or to
                attend.
              </>
            ) : (
              <>
                Decisions go out <strong>{APPLY.decisionsLabel}</strong>. Your
                application link shows what you sent.
              </>
            )}
          </p>
          {open ? (
            <BracketButton className="hk-btn--big" href={withBase(LINKS.signUp)}>
              Apply now
            </BracketButton>
          ) : (
            <BracketButton href={withBase(LINKS.ticket)}>Find my application</BracketButton>
          )}
        </div>
      </div>
    </section>
  );
}
