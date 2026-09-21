import { ORGANIZERS } from "../lib/organizers";
import { withBase } from "../lib/base";

/**
 * Organized by.
 *
 * The four student orgs running the event. The footer has always said "BUILT
 * BY FOUR NORTHEASTERN ORGS"; this says which four.
 *
 * Each cell is a link to that club's own site, and the name sits under the
 * mark. Four monochrome logos with no wordmark are not four identifiable
 * clubs to someone who has not met them — the caption is what turns the row
 * from decoration into a credit. The whole cell is the hit area rather than
 * just the text, because a 44px logo above a 12px caption is a mean target.
 *
 * Laid out on the same dashed cells as the sponsor tiers, so the two blocks
 * read as the same kind of object — but kept as its own section with its own
 * heading, because an organiser is not a sponsor and putting them in one row
 * would say they are.
 *
 * The logos are monochrome white so four different brand palettes read as one
 * row; see src/lib/organizers.js. A cell falls back to the org's name alone if
 * its `logo` is ever null.
 */
export function Organizers() {
  return (
    <section
      id="organizers"
      aria-labelledby="organizers-h"
      className="hk-organizers"
    >
      <h2 id="organizers-h" className="hk-chip hk-organizers__label">
        ORGANIZED BY
      </h2>

      <ul className="hk-organizers__row">
        {ORGANIZERS.map((org) => (
          <li className="hk-organizers__item" key={org.name}>
            <a
              className="hk-organizers__cell"
              href={org.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {org.logo ? (
                <img
                  className="hk-organizers__logo"
                  src={withBase(org.logo.src)}
                  alt=""
                  loading="lazy"
                />
              ) : null}
              <span className="hk-organizers__name">{org.short}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
