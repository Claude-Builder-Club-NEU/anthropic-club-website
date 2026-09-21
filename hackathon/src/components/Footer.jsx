import { BracketButton } from "./BracketButton";
import { Wordmark } from "./Wordmark";
import { EVENT, LINKS, NAV, SOCIAL } from "../lib/event";
import { ORGANIZERS } from "../lib/organizers";

/**
 * Footer, laid out the way claudeneu.com's is: a four-column block — brand
 * lockup, pages, follow, a call to action — over a rule, with the small print
 * and the affiliation disclaimer under it.
 *
 * It was a single line with a wordmark at one end and a date at the other,
 * which is a masthead, not a footer. The structure here is claudeneu's; the
 * palette, the dashed rules and the bracket button are this site's, so it
 * reads as the same organisation rather than as a transplant.
 *
 * PLACEHOLDER: the three social links. They point at `#` until the accounts
 * exist — see SOCIAL in src/lib/event.js, which the Find us band renders too.
 */

export function Footer() {
  return (
    <footer className="hk-footer hk-bleed">
      <div className="hk-footer__grid">
        <div className="hk-footer__brand">
          <Wordmark />
          <p className="hk-footer__line">Northeastern University</p>
          <p className="hk-footer__meta">{EVENT.dateRange}</p>
          <p className="hk-footer__meta">{EVENT.venue}</p>
        </div>

        <nav className="hk-footer__col" aria-label="Footer">
          <h2 className="hk-footer__head">Pages</h2>
          <ul className="hk-footer__list">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label.toLowerCase()}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hk-footer__col">
          <h2 className="hk-footer__head">Follow</h2>
          <ul className="hk-footer__list">
            {SOCIAL.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="hk-footer__col">
          <h2 className="hk-footer__head">Get involved</h2>
          <p className="hk-footer__line">
            Claim a seat and we will write with everything you need for the
            weekend.
          </p>
          <BracketButton href={LINKS.signUp}>Sign up</BracketButton>
        </div>
      </div>

      <div className="hk-footer__fine">
        <p>
          HACK1984 is run by {ORGANIZERS.map((o) => o.name).join(", ")} — four
          recognized student organizations at Northeastern University. It is not
          an official communication of Northeastern University.
        </p>
        <p>
          Times are Eastern and the schedule is tentative until the week of the
          event.
        </p>
      </div>
    </footer>
  );
}
