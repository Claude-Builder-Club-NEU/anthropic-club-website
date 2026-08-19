import { CARD_SLOTS, remainingLabel, toStrip } from "../lib/attendance";

/**
 * The punch strip from mockup 2a-stamped.
 *
 * The card is not stored anywhere. It is derived from the check-ins that share
 * one email address, which is the whole identity model: same address next
 * Thursday, same card, no account in between.
 *
 * Eight slots always render, even when the term has fewer sessions scheduled.
 * The card is a promise about the term rather than a report on the calendar, so
 * a student can see how far they have to go before the dates exist.
 */

/** The stamp mark. Filled circles get it; empty ones get their slot number. */
const Spark = () => (
  <svg
    viewBox="0 0 24 24"
    className="stamp__spark"
    aria-hidden="true"
    focusable="false"
  >
    {/* Eight strokes from the centre. Drawn rather than imported so the stroke
        weight can track the circle size without shipping two SVG assets. */}
    {Array.from({ length: 8 }, (_, i) => {
      const angle = (i * Math.PI) / 4;
      const inner = 3.2;
      const outer = 9.5;
      return (
        <line
          key={i}
          x1={12 + Math.cos(angle) * inner}
          y1={12 + Math.sin(angle) * inner}
          x2={12 + Math.cos(angle) * outer}
          y2={12 + Math.sin(angle) * outer}
        />
      );
    })}
  </svg>
);

const StampCard = ({ term, name, email, card = [] }) => {
  const strip = toStrip(card);
  const stamped = strip.filter((slot) => slot.stamped).length;

  return (
    <section
      className="stampcard"
      aria-label={`Stamp card, ${stamped} of ${CARD_SLOTS} sessions`}
    >
      <div className="stampcard__id">
        <p className="stampcard__term">{term}</p>
        <h2 className="stampcard__heading">Stamp card</h2>
        {name && <p className="stampcard__name">{name}</p>}
        {/* The address sizes itself against this column. --email-chars lets the
            CSS do the arithmetic: a monospace glyph advances about 0.62em, so
            dividing the column width by (chars x 0.62) is the largest size that
            still fits on one line. A short address keeps the normal size. */}
        {email && (
          <p
            className="stampcard__email"
            style={{ "--email-chars": email.length }}
          >
            {email}
          </p>
        )}
      </div>

      <div className="stampcard__body">
        {/* A list, not a row of divs: a screen reader should be able to count
            the stamps, and each one carries its own date. */}
        <ol className="stampcard__strip">
          {strip.map((slot) => (
            <li key={slot.slot} className="stamp">
              <span
                className={`stamp__mark${slot.stamped ? " stamp__mark--on" : ""}`}
              >
                {slot.stamped ? (
                  <Spark />
                ) : (
                  <span className="stamp__num" aria-hidden="true">
                    {String(slot.slot).padStart(2, "0")}
                  </span>
                )}
              </span>
              <span className="stamp__date">{slot.label || " "}</span>
              <span className="sr-only">
                {slot.stamped
                  ? `Session ${slot.slot}, attended${
                      slot.title ? `, ${slot.title}` : ""
                    }`
                  : `Session ${slot.slot}, not yet`}
              </span>
            </li>
          ))}
        </ol>

        {/* No reward is named here. The card should not promise something the
            club has not committed to handing out; a full card can earn whatever
            the board decides at the time. */}
        <p className="stampcard__foot">
          <span className="stampcard__togo">{remainingLabel(card)}</span>
        </p>
      </div>
    </section>
  );
};

export default StampCard;
