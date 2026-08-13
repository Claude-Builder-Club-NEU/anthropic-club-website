import { Link } from "react-router-dom";
import { upcoming, formatEventDate } from "../lib/events";
import { INTEREST_FORM } from "../lib/links";
import { ArrowRightIcon, CalendarIcon } from "./Icons";

/**
 * Upcoming events.
 *
 * `limit` caps the homepage at three; the workshops page passes no limit.
 *
 * The empty state is the shipping state right now — the club has no scheduled
 * events. It is written as an invitation rather than an apology, and it routes
 * to the interest form because that is the working conversion path (the Slack
 * invite link is dead; see src/lib/links.js).
 */
const EventsPanel = ({ limit, headingId = "events-heading", showViewAll }) => {
  const events = upcoming();
  const shown = limit ? events.slice(0, limit) : events;

  return (
    <section
      aria-labelledby={headingId}
      className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16"
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

      {shown.length === 0 ? (
        <div className="mt-8 rounded-lg border border-rule bg-gray-light p-8 sm:p-10">
          <span className="text-coral-text">
            <CalendarIcon width={26} height={26} />
          </span>
          <p className="mt-4 font-display text-step-3 font-semibold text-ink">
            Nothing on the calendar just yet.
          </p>
          <p className="mt-3 text-gray-text">
            We&apos;re putting the semester together now. Tell us you&apos;re
            interested and you&apos;ll be the first to know what we&apos;re
            running — workshops, build nights, and a hackathon.
          </p>
          <a
            className="btn btn--primary mt-6"
            href={INTEREST_FORM}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the club
          </a>
        </div>
      ) : (
        <ul className="mt-8 list-none space-y-0 p-0">
          {shown.map((event) => (
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
                    <p className="mt-1 text-small text-gray-text">
                      {event.location}
                    </p>
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
      )}
    </section>
  );
};

export default EventsPanel;
