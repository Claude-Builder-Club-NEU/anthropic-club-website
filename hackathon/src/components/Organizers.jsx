import { SectionHeading } from "./SectionHeading";
import { SocialIcon } from "./SocialIcons";
import { BACKERS, ORGANIZERS, ROLES, TEAM } from "../lib/organizers";
import { withBase } from "../lib/base";
import { capitalize, inWords } from "../lib/words";

/**
 * Organized by, the partner organizations, and the organizing team, in that
 * order: the clubs, then the people.
 *
 * The clubs running the event are laid out the way claudeneu.com's executive
 * board is: no card surface, a square panel with the club's logo in it and
 * the type hanging under it, the name, the role in the accent colour and a
 * line. Square-cornered here, where the club site rounds them.
 *
 * The partner clubs are their logos: one small square panel each, the
 * organizing clubs' panel in miniature, in a centred run seven to a row, with
 * the club's name in a red band across the panel's foot, the Details chips'
 * recipe the full width of the box. Every band's type is one size, the
 * largest at which the longest name still fits a box (see .hk-logos__name).
 *
 * The people are a list, one dashed box each, in the Details rows' build: a
 * small headshot, the name in the display face, the person's title in the
 * red chip, and their LinkedIn in a small grey box at the right-hand end.
 *
 * An organiser is not a sponsor, and putting them in one row would say they
 * are, so the clubs running the event get their own section.
 */

const ORGANIZING = TEAM.filter((person) => person.role === ROLES.organizer);
const PRESIDENTS = TEAM.filter((person) => person.role === ROLES.partner);

/** A partner's name in its band: its own `band` if it has one, else its name. */
const bandName = (club) => club.band ?? club.name;

/** The longest band name, in characters, which sets every band's type size. */
const BAND_CHARS = Math.max(...BACKERS.map((club) => bandName(club).length));

export function Organizers() {
  return (
    <>
      <section id="organizers" aria-labelledby="organizers-h" className="hk-section">
        <SectionHeading
          id="organizers-h"
          chip="ORGANIZED BY"
          title={`Run by ${inWords(ORGANIZERS.length)} Northeastern clubs`}
        >
          HACK1984 is organized by {inWords(ORGANIZERS.length)} recognized student
          organizations at Northeastern University.
        </SectionHeading>
        <ul className="hk-members">
          {ORGANIZERS.map((org) => (
            <li className="hk-member" key={org.name}>
              <a
                className="hk-member__media hk-member__media--logo"
                href={org.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={org.name}
              >
                <img className="hk-member__logo" src={withBase(org.logo.src)} alt="" loading="lazy" />
              </a>
              <h3 className="hk-member__name">{org.name}</h3>
              <p className="hk-member__role">{org.tag}</p>
              {org.about ? <p className="hk-member__detail">{org.about}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section id="backers" aria-labelledby="backers-h" className="hk-section">
        <SectionHeading
          id="backers-h"
          chip="PARTNER ORGANIZATIONS"
          title={`Partnered with ${inWords(BACKERS.length)} clubs`}
        >
          From Northeastern, Boston University and Tufts.
        </SectionHeading>
        <ul className="hk-logos" style={{ "--hk-band-chars": BAND_CHARS }}>
          {BACKERS.map((club) => (
            <ClubLogo key={club.name} club={club} />
          ))}
        </ul>
      </section>

      <section id="team" aria-labelledby="team-h" className="hk-section">
        <SectionHeading
          id="team-h"
          chip="ORGANIZING TEAM"
          title="The people running it"
        >
          {capitalize(inWords(ORGANIZING.length))} organizers, and the presidents of {inWords(PRESIDENTS.length)} partner organizations.
        </SectionHeading>
        <ol className="hk-roster">
          {TEAM.map((person) => (
            <RosterRow key={person.name} person={person} />
          ))}
        </ol>
      </section>
    </>
  );
}

/** One person: headshot, name, their title in the red chip, their LinkedIn. */
function RosterRow({ person }) {
  return (
    <li className="hk-roster__row">
      <img
        className="hk-roster__photo"
        src={withBase(person.photo)}
        alt=""
        width="56"
        height="56"
        loading="lazy"
      />
      <h3 className="hk-roster__name">{person.name}</h3>
      <span className="hk-roster__role">{person.title}</span>
      <span className="hk-roster__socials">
        {person.linkedin ? (
          <a
            href={person.linkedin}
            aria-label={`${person.name} on LinkedIn`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SocialIcon name="linkedin" />
          </a>
        ) : null}
      </span>
    </li>
  );
}

/** A partner club: its logo in a small square panel, its name in a band under it. */
function ClubLogo({ club }) {
  const body = (
    <>
      <span className="hk-logos__panel">
        {club.logo ? (
          <img className="hk-logos__img" src={withBase(club.logo.src)} alt="" loading="lazy" />
        ) : (
          <span className="hk-logos__typed">{club.name}</span>
        )}
      </span>
      <span className="hk-logos__name">{bandName(club)}</span>
    </>
  );

  // The panel and the name band under it are one box, and one link; the
  // club's name is the link's label, and its tooltip.
  return (
    <li className="hk-logos__item">
      {club.url ? (
        <a
          className="hk-logos__card"
          href={club.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={club.name}
          title={club.name}
        >
          {body}
        </a>
      ) : (
        <span className="hk-logos__card" role="img" aria-label={club.name} title={club.name}>
          {body}
        </span>
      )}
    </li>
  );
}
