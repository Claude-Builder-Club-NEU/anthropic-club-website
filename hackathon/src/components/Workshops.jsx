import { SectionHeading } from "./SectionHeading";
import { WORKSHOPS, WORKSHOP_SLOTS, clockTime } from "../lib/workshops";
import { capitalize, inWords } from "../lib/words";

/**
 * The public workshops, under the schedule: every session on Saturday
 * afternoon, by the hour, each with its RSVP. The rows are the roster's
 * dashed boxes. The timeline's panel draws the same WorkshopRow for the hour
 * it has open.
 */
export function Workshops() {
  return (
    <section id="workshops" aria-labelledby="workshops-h" className="hk-section">
      <SectionHeading id="workshops-h" chip="WORKSHOPS" title="Open to the public">
        {capitalize(inWords(WORKSHOPS.length))} sessions on Saturday, Nov 7, from 2 to 6 PM.
        Anyone can come, hacker or not. RSVP for the ones you want on Partiful.
      </SectionHeading>

      <ol className="hk-ws">
        {WORKSHOP_SLOTS.map((slot) => (
          <li className="hk-ws__slot" key={slot.time}>
            <h3 className="hk-ws__time">{clockTime(slot.time)}</h3>
            <ul className="hk-ws__rows">
              {slot.sessions.map((session) => (
                <WorkshopRow key={session.title} session={session} />
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** One session: the title and its host, the room, the format, the RSVP. */
export function WorkshopRow({ session }) {
  const { title, host, about, room, format, rsvp } = session;
  return (
    <li className="hk-ws__row">
      <div className="hk-ws__what">
        <h4 className="hk-ws__title">{title}</h4>
        {host ? <p className="hk-ws__host">{host}</p> : null}
        {about ? <p className="hk-ws__about">{about}</p> : null}
      </div>
      <span className="hk-ws__room">{room}</span>
      <span className="hk-ws__format">{format}</span>
      <span className="hk-ws__action">
        {rsvp ? (
          <a
            className="hk-cal hk-cal--small"
            href={rsvp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`RSVP for ${title} on Partiful`}
          >
            <span className="hk-cal__label">RSVP</span>
            <span className="hk-cal__arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 14 14">
                <path d="M3 11 L11 3 M4 3 H11 V10" fill="none" stroke="#000000" strokeWidth="1.6" />
              </svg>
            </span>
          </a>
        ) : null}
      </span>
    </li>
  );
}
