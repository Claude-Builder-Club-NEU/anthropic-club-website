import { upcoming, formatEventDate, formatEventTimeRange } from "../lib/events";
import { LUMA_URL } from "../lib/links";
import InterestBanner from "./InterestBanner";

/**
 * Homepage events block: the interest banner, then whatever is coming up listed
 * directly beneath it, each row ending in an RSVP pushed to the right so it
 * lines up with the banner's own right edge.
 *
 * The banner used to be this block's *empty state* and also sat on the events
 * page. It now leads here unconditionally and appears nowhere else, so the
 * homepage carries the persuasion and the events page carries the operating
 * detail. With nothing on the calendar the banner is the whole block, which is
 * the honest empty state anyway: it already says the calendar is being put
 * together.
 *
 * The section takes its accessible name from the banner's own heading, so the
 * list sits directly under the flyer with no heading wedged in between.
 */
const EventsPanel = ({ limit }) => {
  const events = upcoming();
  const shown = limit ? events.slice(0, limit) : events;

  return (
    <section
      aria-labelledby="ib-heading"
      className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16"
    >
      <InterestBanner />

      {shown.length > 0 && (
        <ul className="home-events">
          {shown.map((event) => {
            const rsvp = event.rsvpUrl || LUMA_URL;
            return (
              <li key={event.id} className="home-event">
                {/* Detail first, action second: it reads in that order and it
                    puts the RSVP last in the tab order, where an action
                    belongs. The button is pushed to the row's right edge, which
                    is the banner's right edge, since both share the container. */}
                <div className="home-event__body">
                  <p className="meta" style={{ maxWidth: "none" }}>
                    {formatEventDate(event)}
                  </p>
                  <h3 className="home-event__title">{event.title}</h3>
                  {/* Two spans rather than one string: they run inline with a
                      separator on a wide screen and stack on a narrow one,
                      where a time and a room name on one line wrap badly. */}
                  <p className="home-event__meta">
                    <span className="home-event__time">
                      {formatEventTimeRange(event)}
                    </span>
                    {event.location && (
                      <span className="home-event__where">
                        {event.location}
                      </span>
                    )}
                  </p>
                </div>

                {rsvp ? (
                  <a
                    className="home-event__rsvp"
                    href={rsvp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    RSVP
                    {/* Several rows each labelled only "RSVP" would be
                        indistinguishable in a screen reader's link list. */}
                    <span className="sr-only"> on Luma for {event.title}</span>
                  </a>
                ) : (
                  <span className="home-event__rsvp home-event__rsvp--none">
                    Details soon
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default EventsPanel;
