import { upcoming } from "../lib/events";
import EventRow from "./EventRow";
import InterestBanner from "./InterestBanner";
import NycBanner from "./NycBanner";

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
      {/* NYC campus ribbon first, then the main banner, per the board. */}
      <NycBanner />
      <InterestBanner />

      {shown.length > 0 && (
        <ul className="home-events">
          {shown.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default EventsPanel;
