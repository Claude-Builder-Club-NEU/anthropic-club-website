import { SocialIcon } from "./SocialIcons";
import { LINKS, SOCIAL } from "../lib/event";

/**
 * Find us.
 *
 * claudeneu.com's link hub, in this site's language. Theirs is a band ruled
 * off from the page holding a heading and four cards, each an actual bordered
 * box with an icon on the left, the platform over one line about what you get
 * there, and an arrow pushed to the right edge. The anatomy is theirs down to
 * the mail icon on the first card; the dashed borders, square corners, mono
 * caps and black ground are this site's.
 *
 * It is left-aligned like theirs, which also keeps it from reading as another
 * centred row of tiles — the sponsors and the organizers are both already that.
 *
 * The first card is the sign-up, matching claudeneu's "Get updates" slot: it
 * is the one thing someone who has just read the date actually wants, and it
 * comes from LINKS so it cannot disagree with the two hero buttons.
 */

const CARDS = [
  { label: "Sign up", note: "Claim a seat", href: LINKS.signUp, icon: "mail" },
  ...SOCIAL,
];

export function FindUs() {
  return (
    <section
      id="find-us"
      aria-labelledby="find-us-h"
      className="hk-find hk-bleed"
    >
      <h2 id="find-us-h" className="hk-chip hk-find__label">
        FIND US
      </h2>

      <ul className="hk-find__grid">
        {CARDS.map((item) => (
          <li key={item.label}>
            <a
              className="hk-find__card"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hk-find__mark">
                <SocialIcon name={item.icon} />
              </span>

              <span className="hk-find__text">
                <span className="hk-find__name">{item.label}</span>
                <span className="hk-find__note">{item.note}</span>
              </span>

              <span className="hk-find__go" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" focusable="false">
                  <path
                    d="M3 11 L11 3 M4 3 H11 V10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
