import {
  formatEventDate,
  formatEventTimeRange,
  rsvpLabel,
  statusOf,
  isNyc,
} from "../lib/events";
import { LUMA_URL } from "../lib/links";

/**
 * One upcoming event as a row: date, title, time and room on the left, the
 * RSVP pushed to the right. Used by the homepage list (EventsPanel) and the
 * NYC hub (pages/Nyc.jsx), so both read the same way.
 *
 * `hideCampusTag` drops the "NYC campus" tag, for the NYC hub, where every row
 * is NYC and the tag would only repeat the page's own title.
 */
const EventRow = ({ event, hideCampusTag = false }) => {
  const status = statusOf(event);
  /**
   * Same rule the events page tile follows, for the same reason: a
   * full session keeps no signup link at all. Luma still serves the
   * page of a closed session and still draws a button on it, so a
   * live RSVP here would send somebody off to find out on a third
   * party's page what this row already knows. The note takes the
   * button's slot and says it outright.
   */
  const rsvp = status.full ? null : event.rsvpUrl || LUMA_URL;
  const label = rsvpLabel(rsvp);
  // NYC campus events get a slate-blue rule and tag so Boston
  // students can tell at a glance which campus a row is for.
  const nyc = isNyc(event);
  return (
    <li
      className="home-event"
      data-full={status.full ? "true" : undefined}
      data-kind={nyc ? "nyc" : undefined}
    >
      {/* Detail first, action second: it reads in that order and it
          puts the RSVP last in the tab order, where an action
          belongs. The button is pushed to the row's right edge, which
          is the banner's right edge, since both share the container. */}
      <div className="home-event__body">
        <p className="meta" style={{ maxWidth: "none" }}>
          {formatEventDate(event)}
          {nyc && !hideCampusTag && (
            <span className="home-event__tag" data-kind="nyc">
              NYC campus
            </span>
          )}
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
          {label.action}
          {/* Several rows each labelled only "RSVP" would be
              indistinguishable in a screen reader's link list. The
              service is named here only when rsvpLabel supplies one,
              so a Google Form reads "Sign up for <event>" rather
              than claiming to be Luma. */}
          <span className="sr-only">
            {label.via ? ` ${label.via}` : ""} for {event.title}
          </span>
        </a>
      ) : (
        /* Two inert states, worded apart. "No more space" is a fact
           about the room; "Details soon" is a gap in the calendar
           entry. Both read as not-a-button, so neither is mistaken
           for something to click. */
        <span
          className={`home-event__rsvp ${
            status.full
              ? "home-event__rsvp--full"
              : "home-event__rsvp--none"
          }`}
        >
          {status.full ? status.note : "Details soon"}
          {status.full && (
            <span className="sr-only"> for {event.title}</span>
          )}
        </span>
      )}
    </li>
  );
};

export default EventRow;
