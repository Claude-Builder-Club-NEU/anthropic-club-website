import { SectionHeading } from "./SectionHeading";
import { withBase } from "../lib/base";
import { SPONSORS, SPONSOR_TIERS } from "../lib/sponsors";
import { capitalize, inWords } from "../lib/words";

/**
 * 3.3 Sponsors, the first section under the hero.
 *
 * The section heading, then the two tiers. Backed by comes straight under
 * the heading, with no label of its own; With support from is the page's
 * grey chip over its run. Backed by is laid out the way the organizing
 * clubs are (and the way claudeneu.com's executive board is): a panel with
 * the sponsor's logo in it over a red glow, the name in a red band across
 * its foot, the Details chips' recipe the full width of the box, then the
 * sponsor's part in the accent colour and one line about them, every card
 * the same size, four to a row. With support from is a step down and a
 * different build (`compact` in src/lib/sponsors.js): one short rectangle
 * each, the logo in it and the name in the same red band, nothing under it,
 * four to a row.
 *
 * The role line is the tier's (`role` in src/lib/sponsors.js) unless the
 * sponsor has one of its own, as the Surge track's two and the prize
 * sponsor do. Amounts are never printed.
 */
export function Sponsors() {
  return (
    <section id="sponsors" aria-labelledby="sponsors-h" className="hk-section hk-sponsors">
      <SectionHeading id="sponsors-h" chip="SPONSORS" title="Backing the weekend">
        {capitalize(inWords(SPONSORS.length))} companies and campus organizations are
        putting cash, API credits and swag behind HACK1984.
      </SectionHeading>

      <div className="hk-tiers">
        {SPONSOR_TIERS.map((tier) => (
          <div className="hk-tier" key={tier.id}>
            {/* The lead tier sits straight under the section heading; only
                the supporting tier, a step down, carries its label. */}
            {tier.compact ? <h3 className="hk-chip">{tier.label}</h3> : null}
            {tier.compact ? (
              <ul className="hk-supporters">
                {tier.sponsors.map((sponsor) => (
                  <Supporter key={sponsor.name} sponsor={sponsor} />
                ))}
              </ul>
            ) : (
              <ul className="hk-members">
                {tier.sponsors.map((sponsor) => (
                  <Sponsor key={sponsor.name} sponsor={sponsor} role={sponsor.role ?? tier.role} />
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * A supporting sponsor: one short rectangle, the panel's ground and glow with
 * the logo in it (or the name set as type, with no logo yet), and the name
 * in a red band across its foot, as the Backed by boxes have. Nothing under
 * the box.
 */
function Supporter({ sponsor }) {
  const { name, logo, url } = sponsor;
  const body = (
    <>
      <span className="hk-supporter__panel">
        {logo ? (
          <img
            className="hk-supporter__logo"
            src={withBase(logo.src)}
            alt=""
            style={{ "--h": `${logo.height}px` }}
            loading="lazy"
          />
        ) : (
          <span className="hk-supporter__typed">{name}</span>
        )}
      </span>
      <span className="hk-supporter__band">{name}</span>
    </>
  );

  return (
    <li className="hk-supporter">
      {url ? (
        <a className="hk-supporter__box" href={url} target="_blank" rel="noopener noreferrer">
          {body}
        </a>
      ) : (
        <div className="hk-supporter__box">{body}</div>
      )}
    </li>
  );
}

/**
 * A Backed by sponsor: one box, the logo in its panel (or the name set as
 * type, with no logo yet) and the name in a red band across the panel's
 * foot, then the sponsor's part and one line under the box.
 */
function Sponsor({ sponsor, role }) {
  const { name, logo, about, url } = sponsor;
  const body = (
    <>
      <span className="hk-member__panel">
        {logo ? (
          <img
            className="hk-member__logo hk-member__logo--sized"
            src={withBase(logo.src)}
            alt=""
            style={{ "--h": `${logo.height}px` }}
            loading="lazy"
          />
        ) : (
          <span className="hk-member__typed">{name}</span>
        )}
      </span>
      <h4 className="hk-member__band">{name}</h4>
    </>
  );

  return (
    <li className="hk-member">
      {url ? (
        <a
          className="hk-member__media hk-member__media--banded"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {body}
        </a>
      ) : (
        <div className="hk-member__media hk-member__media--banded">{body}</div>
      )}
      <p className="hk-member__role">{role}</p>
      {about ? <p className="hk-member__detail">{about}</p> : null}
    </li>
  );
}
