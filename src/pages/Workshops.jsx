import { Link } from "react-router-dom";
import { EventsEmpty, EventsList } from "../components/EventsPanel";
import MonthGrid from "../components/MonthGrid";
import Breadcrumbs from "../components/Breadcrumbs";
import WorkshopForm from "../components/WorkshopForm";
import { upcoming } from "../lib/events";
import { CALENDAR_URL, CALENDAR_ICS, hasCalendar } from "../lib/links";
import { ArrowRightIcon, CalendarIcon } from "../components/Icons";

/**
 * Workshops. Mode: Operate. This surface is for current members finding out
 * what is happening and how to take part, so scanability beats persuasion.
 *
 * Order per revision 2 §4.1: the events block sits at the very top, the
 * calendar directly under it, everything else after. The top block swaps
 * automatically, so the page never shows "nothing on the calendar" above a
 * calendar full of events.
 *
 * The calendar is board-editable in Google Calendar itself and the site has no
 * write path. Following the original brief's event system section, events are
 * rendered with our own components rather than an iframed Google embed; the
 * embed lives behind the "Full calendar" link alongside an ICS subscribe.
 * Both links appear once the calendar ID arrives (§6.1).
 */
const Workshops = () => {
  const events = upcoming();
  const hasEvents = events.length > 0;

  return (
    <>
      <Breadcrumbs current="Workshops" />

      <section className="mx-auto w-full max-w-6xl px-6 pb-8 pt-8 sm:px-10 lg:px-16">
        <h1 style={{ maxWidth: "18ch" }}>Workshops and events</h1>
        <p className="lead mt-7" style={{ maxWidth: "var(--measure-tight)" }}>
          What we&apos;re running, how to take part, and what we&apos;ve built
          before.
        </p>

        <div className="mt-12">
          {hasEvents ? (
            <>
              <h2 className="mb-8">Upcoming events</h2>
              <EventsList events={events} />
            </>
          ) : (
            <EventsEmpty />
          )}
        </div>
      </section>

      {/* The calendar always renders, whether or not there are events, so the
          page has a visible calendar rather than nothing below the top block. */}
      <section
        aria-labelledby="calendar-heading"
        className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10 sm:pb-24 lg:px-16"
      >
        <h2 id="calendar-heading">Calendar</h2>
        <MonthGrid />
        {hasCalendar && (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-8">
              <a
                className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
                href={CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the full calendar <ArrowRightIcon width={16} height={16} />
              </a>
              <a
                className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
                href={CALENDAR_ICS}
              >
                <CalendarIcon width={16} height={16} /> Add to your own calendar
              </a>
            </div>
        )}
      </section>

      <section
        aria-labelledby="involved-heading"
        className="border-t border-rule bg-gray-light"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <h2 id="involved-heading">Other ways to get involved</h2>

          <div className="mt-12 grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <h3 className="text-step-2">Want to run a workshop?</h3>
              <p className="mt-4 text-gray-text">
                If you can build something in an hour, you can teach it. Get in
                touch with an executive board member and we&apos;ll handle the
                room, the promotion, and the turnout.
              </p>
              <WorkshopForm />
            </div>

            <div>
              <h3 className="text-step-2">Join a build team</h3>
              <p className="mt-4 text-gray-text">
                Small groups working on one project across a few weeks. Useful
                if you want to finish something rather than start five things.
              </p>
              <p className="mt-6">
                <button type="button" className="btn btn--soon" disabled>
                  Coming soon
                </button>
              </p>
              <p className="mt-3 text-meta text-gray-text">
                We&apos;re setting these up for next semester.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="showcase-heading"
        className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16"
      >
        <h2 id="showcase-heading">Showcase</h2>
        <div className="mt-10 rounded-lg border border-rule bg-gray-light p-8 sm:p-12">
          <p className="font-display text-step-2 font-semibold text-ink" style={{ maxWidth: "20ch" }}>
            The first projects go up after this semester.
          </p>
          <p className="mt-4 text-gray-text" style={{ maxWidth: "46ch" }}>
            Hackathon builds and workshop projects will live here. Come to a
            session and yours could be among them.
          </p>
          <p className="mt-8">
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
            >
              Read about what we build <ArrowRightIcon width={16} height={16} />
            </Link>
          </p>
        </div>
      </section>
    </>
  );
};

export default Workshops;
