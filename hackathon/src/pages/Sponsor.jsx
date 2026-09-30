import { BracketButton } from "../components/BracketButton";
import { withBase } from "../lib/base";
import { EVENT } from "../lib/event";
import { ORGANIZERS } from "../lib/organizers";
import { SPONSOR_TIERS } from "../lib/sponsors";
import { TRACKS } from "../lib/tracks";
import { HACK_WINDOW } from "../lib/schedule";
import {
  BENEFITS,
  CONTACTS,
  OTHER_WAYS,
  SPONSOR_MAILTO,
  TIERS,
} from "../lib/sponsorship";

/**
 * /hackathon/sponsor/: the sponsor one-pager, as a page.
 *
 * Same content, same order: the pitch, three ways to win, the tier table,
 * other ways to help, who to write to, and who is behind it. It is set in
 * this site's system rather than traced from the PDF — dashed rules, mono
 * caps, square corners — so it reads as the same event as /hackathon/.
 *
 * THE TABLE HAS TWO LAYOUTS. Six columns of benefits cannot be read on a
 * phone, and scrolling a table sideways hides the column you are comparing
 * against. So below 900px the same data is drawn per tier, each card listing
 * only what that tier includes. Both are in the markup and CSS shows one, so
 * nothing depends on measuring the window.
 */

const BACKERS = SPONSOR_TIERS[0].logos.filter(Boolean);

export function Sponsor() {
  return (
    <main className="hk-sp">
      <section className="hk-sp__hero" aria-labelledby="sp-h">
        <p className="hk-chip hk-sp__eyebrow">SPONSORSHIP OPPORTUNITIES</p>
        <h1 id="sp-h" className="hk-sp__title">
          A hackathon for software that{" "}
          <span className="hk-sp__accent">doesn&rsquo;t watch</span> the people
          using it.
        </h1>
        <ul className="hk-sp__facts">
          <li>{HACK_WINDOW ? `${HACK_WINDOW.hours} hours of hacking` : "One weekend"}</li>
          <li>{EVENT.dateLong}</li>
          <li>{EVENT.venue}</li>
          <li>100 builders</li>
        </ul>
        <p className="hk-sp__lede">
          100 Northeastern students build privacy-first products over one weekend.
          Sponsors mentor, judge, run challenges on their own tools, and meet
          the co-op and new-grad talent Boston hires from.
        </p>
        <div className="hk-sp__actions">
          <BracketButton href={SPONSOR_MAILTO}>Become a sponsor</BracketButton>
          <BracketButton className="hk-sp__secondary" href="#tiers">
            See the tiers
          </BracketButton>
        </div>
      </section>

      <section className="hk-sp__block" aria-labelledby="sp-win">
        <h2 id="sp-win" className="hk-sp__label">THREE WAYS TO WIN</h2>
        <ol className="hk-sp__win">
          {TRACKS.map((track) => (
            <li key={track.index}>
              <span className="hk-sp__win-kind">
                {track.index} · {track.kind}
              </span>
              <span className="hk-sp__win-title">{track.title}</span>
              <span className="hk-sp__win-text">{track.pitch}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="tiers" className="hk-sp__block" aria-labelledby="sp-tiers">
        <h2 id="sp-tiers" className="hk-sp__label">SPONSORSHIP TIERS</h2>

        <table className="hk-sp__table">
          <thead>
            <tr>
              <td />
              {TIERS.map((tier) => (
                <th key={tier.id} scope="col">
                  <span className="hk-sp__tier-name">{tier.name}</span>
                  <span className="hk-sp__tier-price">{tier.price}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BENEFITS.map((benefit) => (
              <tr key={benefit.label}>
                <th scope="row">{benefit.label}</th>
                {benefit.values.map((value, i) => (
                  <td key={TIERS[i].id}>
                    <Value value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="hk-sp__cards">
          {TIERS.map((tier, i) => (
            <li className="hk-sp__card" key={tier.id}>
              <h3 className="hk-sp__card-head">
                <span className="hk-sp__tier-name">{tier.name}</span>
                <span className="hk-sp__tier-price">{tier.price}</span>
              </h3>
              <ul className="hk-sp__card-list">
                {BENEFITS.filter((b) => b.values[i]).map((b) => (
                  <li key={b.label}>
                    <span>{b.label}</span>
                    {typeof b.values[i] === "string" ? (
                      <span className="hk-sp__card-value">{b.values[i]}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="hk-sp__block hk-sp__split">
        <div>
          <h2 className="hk-sp__label">OTHER WAYS TO HELP</h2>
          <p className="hk-sp__help">
            {OTHER_WAYS.map((way) => (
              <span key={way.strong}>
                <strong>{way.strong}</strong>
                {way.rest ? ` ${way.rest}` : ""}{" "}
              </span>
            ))}
            We&rsquo;re happy to build a custom package.
          </p>
        </div>
        <div>
          <h2 className="hk-sp__label">CONTACT</h2>
          <ul className="hk-sp__contacts">
            {CONTACTS.map((person) => (
              <li key={person.email}>
                <strong>{person.name}</strong>
                <a href={`mailto:${person.email}`}>{person.email}</a>
              </li>
            ))}
          </ul>
          <BracketButton href={SPONSOR_MAILTO}>Email us both</BracketButton>
        </div>
      </section>

      <section className="hk-sp__credits" aria-label="Organized by and backed by">
        <div className="hk-sp__credit">
          <h2 className="hk-sp__credit-label">ORGANIZED BY</h2>
          <ul className="hk-sp__logos">
            {ORGANIZERS.map((org) => (
              <li key={org.name}>
                <a href={org.url} target="_blank" rel="noopener noreferrer">
                  <img
                    className="hk-sp__logo"
                    src={withBase(org.logo.src)}
                    alt={org.logo.alt}
                    loading="lazy"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="hk-sp__credit">
          <h2 className="hk-sp__credit-label">BACKED BY</h2>
          <ul className="hk-sp__logos">
            {BACKERS.map((logo) => (
              <li key={logo.src}>
                <img
                  className="hk-sp__logo hk-sp__logo--wide"
                  src={withBase(logo.src)}
                  alt={logo.alt}
                  style={{ height: logo.height }}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function Value({ value }) {
  // Drawn rather than typed: U+2713 is not in any of this page's three faces,
  // so as text it would fall back to whatever the system has.
  if (value === true) {
    return (
      <svg className="hk-sp__check" viewBox="0 0 14 14" width="14" height="14" role="img" aria-label="Included">
        <path d="M2 7.5 L5.5 11 L12 3" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (typeof value === "string") return <span className="hk-sp__text">{value}</span>;
  return <span className="hk-sp__none" aria-label="Not included" />;
}
