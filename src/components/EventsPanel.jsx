import { Link } from "react-router-dom";
import { upcoming, formatEventDate } from "../lib/events";
import { ArrowRightIcon } from "./Icons";
import InterestBanner from "./InterestBanner";

/**
 * The no-events state is now the interest banner from the 3b handoff.
 * Re-exported under the old name so both call sites keep working.
 */
export const EventsEmpty = () => <InterestBanner />;

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
