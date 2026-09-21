import { DetailIcon } from "./DetailIcons";
import { SectionHeading } from "./SectionHeading";
import { DETAILS } from "../lib/details";

/**
 * Details.
 *
 * This is the old schedule row, inherited. When the schedule became a
 * timeline it gave up a treatment that was working — a dashed frame, rows on
 * a 104px rhythm, a mono chip in red on the left, a line of display face
 * across the middle, a small grey box on the right — and this is the section
 * that wanted it. A fixed set of facts someone scans rather than reads is
 * exactly what that row is for.
 *
 * The three slots map straight across: the chip takes the title, the display
 * line takes the body, and the icon moves from beside the title into the tag
 * box at the right-hand end. Nothing is left over and nothing is invented.
 *
 * The chip has a floor width rather than a natural one so five of them line
 * up down the left edge the way nine time chips did — "WHAT TO BRING" is
 * nearly three times the width of "COST".
 *
 * <dl>, because that is still what it is: a term and its description, five
 * times. The icon sits inside the <dd>, not loose in the row — a <div> inside
 * a <dl> may only hold <dt> and <dd>.
 */
export function Details() {
  return (
    <section id="details" aria-labelledby="details-h" className="hk-section">
      <SectionHeading
        id="details-h"
        chip="DETAILS"
        title="Everything you need for the weekend"
      >
        Food, a place to work and people to build with. Show up with a laptop
        and an idea, or just the laptop.
      </SectionHeading>

      <dl className="hk-details">
        {DETAILS.map((item) => (
          <div className="hk-detail" key={item.icon}>
            <dt className="hk-detail__chip">{item.title.toUpperCase()}</dt>
            <dd className="hk-detail__line">
              <span className="hk-detail__body">{item.body}</span>
              <span className="hk-detail__mark">
                <DetailIcon name={item.icon} />
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
