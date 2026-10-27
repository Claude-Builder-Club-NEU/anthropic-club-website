import { SocialIcon } from "./SocialIcons";
import { APPLY, LINKS, SOCIAL } from "../lib/event";
import { withBase } from "../lib/base";
import { useApplicationsOpen } from "../lib/apply";

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
 * The first card is the application, matching claudeneu's "Get updates" slot: it
 * is the one thing someone who has just read the date actually wants, and it
 * comes from LINKS so it cannot disagree with the hero. Its note is the
 * deadline while applications are open and says they are closed after; it
 * still goes to the signup page, whose closed notice says the same.
 *
 * No heading on the band: the cards say what they are, and a FIND US chip
 * straight under the hero was one label too many. The section keeps the name
 * for a screen reader as its aria-label.
 */
export function FindUs() {
  const open = useApplicationsOpen();
  const cards = [
    {
      label: "Apply",
      note: open ? `By ${APPLY.deadlineLabel}` : "Applications are closed",
      href: withBase(LINKS.signUp),
      icon: "mail",
      internal: true,
    },
    ...SOCIAL,
  ];

  return (
    <section id="find-us" aria-label="Find us" className="hk-find hk-bleed">
      <ul className="hk-find__grid">
        {cards.map((item) => (
          <li key={item.label}>
            <a
              className="hk-find__card"
              href={item.href}
              // The sign-up card is this site; the rest leave it.
              {...(item.internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
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
