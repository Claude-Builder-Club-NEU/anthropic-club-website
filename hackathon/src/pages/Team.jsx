import { SocialIcon } from "../components/SocialIcons";
import { ASCII } from "../lib/ascii";
import { withBase } from "../lib/base";
import { TEAM } from "../lib/organizers";

/**
 * /hackathon/team/: why the event exists, then who runs it.
 *
 * The one place the people are listed; the home page's team section is a
 * button to here. Each has their photo, what they did for HACK1984 where that
 * is written, and a line of background. It is built on the sponsor page's
 * hero and blocks, so the two read as the same site.
 */
export function Team() {
  return (
    <main className="hk-sp">
      <section className="hk-sp__hero hk-tm__hero" aria-labelledby="tm-h">
        {/* Decorative, and the same build-time file as every ASCII banner; see
            src/lib/ascii.js on the raw HTML. */}
        <div
          className="hk-tm__art"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: ASCII.contours }}
        />
        <h1 id="tm-h" className="hk-sp__title">
          Northeastern was missing a{" "}
          <span className="hk-sp__accent">real hackathon.</span>
        </h1>
        <div className="hk-tm__synopsis">
          <p className="hk-sp__lede">
            Hackathons have never been a big thing at Northeastern. For a school
            with this many people building things, there was surprisingly little
            to show up to: a few small events a year, each run by one club and
            each drawing from its own corner of campus.
          </p>
          <p className="hk-sp__lede">
            When we started planning, we expected to run one more of those. Then
            we looked at who was in the room. Four clubs were already working
            together, and with our partners we could reach students in almost
            every major. We realized we could create the largest hackathon at
            Northeastern, so that&rsquo;s what we decided to do.
          </p>
        </div>
      </section>

      <section className="hk-sp__block" aria-labelledby="tm-team">
        <h2 id="tm-team" className="hk-sp__label">THE PEOPLE RUNNING IT</h2>
        <ol className="hk-tm__list">
          {TEAM.map((person) => (
            <Profile key={person.name} person={person} />
          ))}
        </ol>
      </section>
    </main>
  );
}

/** One person: their photo, then everything the home page's row leaves out. */
function Profile({ person }) {
  return (
    <li className="hk-tm__person">
      <img
        className="hk-tm__photo"
        src={withBase(person.photo)}
        alt=""
        width="160"
        height="160"
        loading="lazy"
      />
      <div className="hk-tm__text">
        <div className="hk-tm__head">
          <h3 className="hk-tm__name">{person.name}</h3>
          {person.linkedin ? (
            <a
              className="hk-tm__linkedin"
              href={person.linkedin}
              aria-label={`${person.name} on LinkedIn`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SocialIcon name="linkedin" />
            </a>
          ) : null}
        </div>
        <p className="hk-tm__title">{person.title}</p>
        {person.focus ? <p className="hk-tm__focus">{person.focus}</p> : null}
        {person.blurb ? <p className="hk-tm__blurb">{person.blurb}</p> : null}
        <p className="hk-tm__background">{person.background.join(" · ")}</p>
      </div>
    </li>
  );
}
