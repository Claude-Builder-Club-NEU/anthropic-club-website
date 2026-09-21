import { BracketButton } from "./BracketButton";
import { SeatFigure } from "./SeatFigure";
import { LINKS, SEATS } from "../lib/event";

/**
 * Seats left, straight after the tracks.
 *
 * ONE CHARACTER PER SEAT. The meter is a 100-column ribbon of monospace text,
 * not a filled div: capacity is 100, so a column is a seat and the bar is a
 * literal count rather than a proportion someone has to trust.
 *
 * IT HAS TO LOOK LIKE A BAR. Three attempts failed on this and all three
 * failed the same way: characters alone cannot make a solid rectangle. `@` at
 * 17px does not fill its cell, so any run of them reads as texture, not as
 * fill — and the block characters that would (U+2588 and friends) are not in
 * Geist Mono, so they fall back to a font with a different advance and break
 * the one-column-per-seat arithmetic outright.
 *
 * So the rectangle is CSS and everything you actually look at is ASCII:
 * `__track` is the hundred seats as a near-black slot, `__fill` is the taken
 * ones as a faint wash exactly `pct`% wide, and between them they do nothing
 * but draw the rectangle. The characters carry the tone, the colour and the
 * level. An earlier pass had this the other way round — a bright slab with
 * text on it — and it read as a coloured box rather than as ASCII.
 *
 * IT CUTS THE FIGURE IN HALF. The slab does not lie across the number, it sits
 * in a channel knocked through it: `.hk-seats__figure` is masked with a gap
 * exactly where the bar runs. That is also what earns the slab — a solid
 * rectangle over the numerals would bury them, and inside them it does not.
 */

/** Two rows. Three made a block deep enough to swallow the figure it is
 *  supposed to be cutting through; one read as a dashed rule. */
const METER_ROWS = 2;

/** Light to dense. The ASCII ramp, minus its two lightest steps — this is a
 *  filled bar, so even its quietest column has to look taken. */
const RAMP = "-=+*#%@";

/**
 * A taken seat, as tone rather than as one repeated glyph. A run of `@` with
 * every ninth swapped for `%` was a texture with a visible period, and it read
 * as wallpaper printed on a coloured box. This walks the ramp from about a
 * third of the way up to full across the fill, jittered per row.
 *
 * Deterministic — this renders on the server too, and the two have to agree.
 */
function fillRow(row, taken) {
  let s = "";
  for (let i = 0; i < taken; i += 1) {
    const t = taken > 1 ? i / (taken - 1) : 1;
    const jitter = ((i * 7 + row * 13) % 11) / 11 - 0.5;
    const k = Math.round((0.34 + t * 0.66 + jitter * 0.26) * (RAMP.length - 1));
    s += RAMP[Math.max(0, Math.min(RAMP.length - 1, k))];
  }
  return s;
}

/**
 * The seats still going, as a scale: a dot each, and a tick every tenth, so
 * the remainder is something you can count rather than an absence. The ticks
 * land on 70, 80, 90 and 100 at the current fill.
 */
function trackRow(taken, capacity) {
  let s = "";
  for (let i = taken; i < capacity; i += 1) s += (i + 1) % 10 === 0 ? "|" : "·";
  return s;
}

export function Seats() {
  const { capacity, seatsTaken } = SEATS;

  // Clamped both ways: a hand-typed `seatsTaken` above capacity would
  // otherwise render more columns than the meter has, and a negative count.
  const taken = Math.max(0, Math.min(capacity, seatsTaken));
  const left = capacity - taken;
  const pct = Math.round((taken / capacity) * 100);

  return (
    <section id="signup" aria-label="Sign up" className="hk-section">
      <div className="hk-seats">
        <div className="hk-seats__stage">
          <SeatFigure value={String(left).padStart(2, "0")} />

          {/*
            role="meter" is the honest role: this reports a level within a
            known range, it is not a task working toward completion.
            aria-valuetext carries the sentence, because "68" on its own tells
            a screen reader user nothing about which direction is good.
          */}
          <div
            className="hk-seats__bar"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={capacity}
            aria-valuenow={taken}
            aria-valuetext={`${taken} of ${capacity} seats taken, ${left} left`}
            aria-label="Seats taken"
          >
            {/* The track is all hundred seats; the fill is the taken ones.
                Both are slabs, because the characters cannot be one. */}
            <span className="hk-seats__track" aria-hidden="true" />
            <span
              className="hk-seats__fill"
              aria-hidden="true"
              style={{ width: `${pct}%` }}
            />

            <span className="hk-seats__lines" aria-hidden="true">
              {Array.from({ length: METER_ROWS }, (_, row) => (
                <span className="hk-seats__line" key={row}>
                  <span className="hk-seats__on">{fillRow(row, taken)}</span>
                  <span className="hk-seats__off">{trackRow(taken, capacity)}</span>
                </span>
              ))}
            </span>

            <span className="hk-seats__pct">{pct}% FULL</span>
          </div>
        </div>

        <div className="hk-seats__cta">
          <p className="hk-seats__legend">
            <strong>{left}</strong> seats left of {capacity}
          </p>
          <BracketButton href={LINKS.signUp}>
            {left > 0 ? "Claim a seat" : "Join the waitlist"}
          </BracketButton>
        </div>
      </div>
    </section>
  );
}
