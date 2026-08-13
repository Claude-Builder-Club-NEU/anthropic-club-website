import { Link } from "react-router-dom";
import { upcoming, formatEventDate } from "../lib/events";
import { INTEREST_FORM, CALENDAR_URL } from "../lib/links";
import { ArrowRightIcon } from "./Icons";

/**
 * The no-events state.
 *
 * Deliberately not an apology. With no calendar yet, this block is the
 * homepage's second pitch, so it carries a real headline, a route to the
 * calendar and the interest form, and a visible action. Its min-height matches
 * a populated three-event list so the page does not collapse when the calendar
 * empties out.
 */
export const EventsEmpty = ({ showCalendarLink = true }) => (
  <div
    className="flex flex-col justify-center rounded-lg border border-rule bg-gray-light p-8 sm:p-12"
    style={{ minHeight: "clamp(280px, 34vw, 360px)" }}
  >
    <p className="font-display text-step-2 font-semibold leading-tight text-ink" style={{ maxWidth: "18ch" }}>
      Build with us this semester.
    </p>
    <p className="mt-4 text-gray-text" style={{ maxWidth: "46ch" }}>
      We&apos;re putting the calendar together now. Tell us you&apos;re
      interested and you&apos;ll hear about workshops, showcase nights and
      hackathons before they fill up.
    </p>
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <a
        className="btn btn--coral self-start"
        href={INTEREST_FORM}
        target="_blank"
        rel="noopener noreferrer"
      >
        Join the club
      </a>
      {showCalendarLink &&
        (CALENDAR_URL ? (
          <a
            className="inline-flex items-center gap-1.5 self-start font-display text-small no-underline sweep"
            href={CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            See the full calendar <ArrowRightIcon width={16} height={16} />
          </a>
        ) : (
          <Link
            to="/workshops"
            className="inline-flex items-center gap-1.5 self-start font-display text-small no-underline sweep"
          >
            See the full calendar <ArrowRightIcon width={16} height={16} />
          </Link>
        ))}
    </div>
  </div>
);

/** The populated state: a dated list, no cards. */
export const EventsList = ({ events }) => (
  <ul className="list-none space-y-0 p-0">
    {events.map((event) => (
      <li
        key={event.id}
        className="border-t border-rule py-6 first:border-t-0 first:pt-0"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
          <p className="meta shrink-0" style={{ maxWidth: "none" }}>
            {formatEventDate(event)}
          </p>
          <div className="min-w-0">
            <h3 className="text-step-3">{event.title}</h3>
            {event.location && (
              <p className="mt-1 text-small text-gray-text">{event.location}</p>
            )}
            {event.description && (
              <p className="mt-2 text-small text-gray-text">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </li>
    ))}
  </ul>
);

/**
 * Upcoming events section. `limit` caps the homepage at three; the workshops
 * page passes none.
 */
const EventsPanel = ({ limit, headingId = "events-heading", showViewAll }) => {
  const events = upcoming();
  const shown = limit ? events.slice(0, limit) : events;

  return (
    <section
      aria-labelledby={headingId}
      className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 id={headingId}>Upcoming events</h2>
        {showViewAll && shown.length > 0 && (
          <Link
            to="/workshops"
            className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
          >
            View full calendar <ArrowRightIcon width={16} height={16} />
          </Link>
        )}
      </div>

      <div className="mt-10">
        {shown.length === 0 ? <EventsEmpty /> : <EventsList events={shown} />}
      </div>
    </section>
  );
};

export default EventsPanel;
