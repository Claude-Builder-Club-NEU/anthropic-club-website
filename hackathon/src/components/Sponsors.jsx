import { SectionHeading } from "./SectionHeading";
import { withBase } from "../lib/base";
import { SPONSORS, SPONSOR_TIERS } from "../lib/sponsors";
import { capitalize, inWords } from "../lib/words";

/**
 * 3.3 Sponsors, the first section under the hero.
 *
 * The section heading, then the tiers, each under the page's grey chip.
 * Platinum is laid out the way the organizing clubs are (and the way
 * claudeneu.com's executive board is): a panel with the sponsor's logo in it
 * over a red glow, the name in a red band across its foot, the Details chips'
 * recipe the full width of the box, then the sponsor's part in the accent
 * colour and one line about them, every card the same size, three to a row.
 * The lower tiers are a step down and a different build (`compact` in
 * src/lib/sponsors.js): one short rectangle each, the logo in it and the name
 * in the same red band, nothing under it. Silver is three to a row, and
 * Bronze and Supporter share one line of smaller boxes.
 *
 * The role line is the tier's (`role` in src/lib/sponsors.js) unless the
 * sponsor has one of its own, as the Surge track's two and the prize
 * sponsor do. Amounts are never printed.
 */
const FULL_TIERS = SPONSOR_TIERS.filter((tier) => !tier.small);
const SMALL_TIERS = SPONSOR_TIERS.filter((tier) => tier.small);
const SMALL_COUNT = SMALL_TIERS.reduce((count, tier) => count + tier.sponsors.length, 0);

export function Sponsors() {
  return (
    <section id="sponsors" aria-labelledby="sponsors-h" className="hk-section hk-sponsors">
      <SectionHeading id="sponsors-h" chip="SPONSORS" title="Backing the weekend">
        {capitalize(inWords(SPONSORS.length))} companies and campus organizations are
        putting cash, API credits and swag behind HACK1984.
      </SectionHeading>

      <div className="hk-tiers">
        {FULL_TIERS.map((tier) => (
          <Tier key={tier.id} tier={tier} />
        ))}
        {/* Each small tier spans as many of the line's columns as it has
            sponsors, so every box on the line is the same width. */}
        <div className="hk-tiers__small" style={{ "--n": SMALL_COUNT }}>
          {SMALL_TIERS.map((tier) => (
            <Tier key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** One tier: its label over its sponsors, in the tier's build and width. */
function Tier({ tier }) {
  const classes = [
    "hk-tier",
    tier.columns === 3 && "hk-tier--three",
    tier.small && "hk-tier--small",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={tier.small ? { "--n": tier.sponsors.length } : undefined}>
      <h3 className="hk-chip">{tier.label}</h3>
      {tier.compact ? (
        <ul className="hk-supporters">
          {tier.sponsors.map((sponsor) => (
            <Supporter key={sponsor.name} sponsor={sponsor} />
          ))}
        </ul>
      ) : (
        <ul className="hk-members">
          {tier.sponsors.map((sponsor) =>
            sponsor.members ? (
              <SharedSponsor key={sponsor.name} sponsor={sponsor} role={sponsor.role ?? tier.role} />
            ) : (
              <Sponsor key={sponsor.name} sponsor={sponsor} role={sponsor.role ?? tier.role} />
            ),
          )}
        </ul>
      )}
    </div>
  );
}

/**
 * A supporting sponsor: one short rectangle, the panel's ground and glow with
 * the logo in it (or the name set as type, with no logo yet), and the name
 * in a red band across its foot, as the Platinum boxes have. Nothing under
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
 * Two sponsors giving together: one Platinum box, both logos side by side in
 * its panel, each linking to its own site, and both names in the band.
 */
function SharedSponsor({ sponsor, role }) {
  const { name, about, members } = sponsor;
  return (
    <li className="hk-member">
      <div className="hk-member__media hk-member__media--banded">
        <span className="hk-member__panel hk-member__panel--shared">
          {members.map((member) => (
            <a
              key={member.name}
              className="hk-member__shared"
              style={{ "--share": `${member.logo.share}%` }}
              href={member.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={member.name}
            >
              <img className="hk-member__shared-logo" src={withBase(member.logo.src)} alt="" loading="lazy" />
            </a>
          ))}
        </span>
        <h4 className="hk-member__band">{name}</h4>
      </div>
      <p className="hk-member__role">{role}</p>
      {about ? <p className="hk-member__detail">{about}</p> : null}
    </li>
  );
}

/**
 * A Platinum sponsor: one box, the logo in its panel (or the name set as
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
