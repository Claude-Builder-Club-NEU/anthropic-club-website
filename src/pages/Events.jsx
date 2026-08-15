import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MonthGrid from "../components/MonthGrid";
import EventTile from "../components/EventTile";
import { upcoming, kindOf, KINDS, KIND_ORDER } from "../lib/events";
import { CALENDAR_ICS, hasCalendar } from "../lib/links";
import { ArrowRightIcon, CalendarIcon } from "../components/Icons";

/**
 * Events. Mode: Operate. This surface is for current and prospective members
 * finding out what is happening, so scanability beats persuasion.
 *
 * Built from the "Workshops & Events calendar page" handoff, in this project's
 * own design language rather than the handoff's raw values. The handoff itself
 * asks for that: "If the target codebase already carries this brand system, use
 * its tokens and components instead of the raw hex values below." So the
 * structure is the handoff's (hero band, Upcoming row of feature tiles, filter
 * chips, month grid, legend) and the language is this system's: Poppins and
 * Lora rather than Hanken Grotesk and Source Serif 4, flat and tonal rather
 * than shadowed, sharp corners rather than pills, no hover-lift.
 *
 * Everything below the fold reads from the club's Google Calendar at build
 * time. Nothing here is hardcoded, so an empty calendar renders empty states
 * rather than invented sessions. The handoff's seven sample events are not
 * carried across: its own README marks five of them as filled-in guesses with
 * placeholder rooms, and inventing programming the club has not scheduled is
 * not something this site does.
 */
const Events = () => {
  // Memoised because upcoming() builds a fresh array on every call. Without
  // this, `all` changes identity each render, so every downstream useMemo and
  // effect keyed on it re-runs every render too.  Events come from a
  // build-time JSON import and cannot change during a session.
  const all = useMemo(() => upcoming(), []);
  const [kind, setKind] = useState("ALL");

  const events = useMemo(
    () => (kind === "ALL" ? all : all.filter((e) => kindOf(e) === kind)),
    [all, kind]
  );

  const hasAny = all.length > 0;
  const featured = events.slice(0, 3);

  /* The Upcoming row is three columns. `fillSpan` is what is left over, and 0
     when three events already fill it. */
  const fillSpan = 3 - featured.length;
  const isFilterEmpty = featured.length === 0 && hasAny;
  const fillMessage =
    featured.length > 0
      ? "No additional events"
      : hasAny
        ? `No ${KINDS[kind]?.plural.toLowerCase() ?? "events"} coming up.`
        : "No events planned at this time! Check back at a later date.";

  // Only offer a filter for a kind that actually appears on the calendar.
  const availableKinds = useMemo(
    () => KIND_ORDER.filter((k) => all.some((e) => kindOf(e) === k)),
    [all]
  );

  return (
    <>
      {/* One heading, not a page title above a section title saying nearly the
          same thing. Set at the section size the old "Upcoming" carried rather
          than the page-title size, which is what was asked for. The interest
          banner that used to sit here now leads the homepage. */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-4 pt-14 sm:px-10 sm:pt-16 lg:px-16">
        <div className="upcoming-head">
          <div>
            <h1 className="page-title--section">Upcoming events</h1>
            <p className="mt-2 text-small text-gray-text">
              Everything is free and open to any student.
            </p>
          </div>

          {availableKinds.length > 1 && (
            <div
              className="filter-row"
              role="group"
              aria-label="Filter events by kind"
            >
              <button
                type="button"
                className="filter-chip"
                aria-pressed={kind === "ALL"}
                onClick={() => setKind("ALL")}
              >
                All
              </button>
              {availableKinds.map((k) => (
                <button
                  key={k}
                  type="button"
                  className="filter-chip"
                  data-kind={k}
                  aria-pressed={kind === k}
                  onClick={() => setKind(k)}
                >
                  {KINDS[k].plural}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* The row is always three columns wide. Whatever the events do not
            fill is taken by one card spanning the remainder, so the band never
            ends in a ragged gap: three events fill it outright, two or one
            leave a "no additional events" card beside them, and none at all
            gives a single card across the whole row. */}
        <ul className="event-tiles">
          {featured.map((event, i) => (
            <EventTile key={event.id} event={event} lead={i === 0} />
          ))}

          {fillSpan > 0 && (
            <li
              className={`event-fill${featured.length === 0 ? " event-fill--full" : ""}`}
              style={{ "--fill-span": String(fillSpan) }}
            >
              <p className="event-fill__text">{fillMessage}</p>
              {isFilterEmpty && (
                <p className="event-fill__action">
                  <button
                    type="button"
                    className="link-button sweep"
                    onClick={() => setKind("ALL")}
                  >
                    Show all events
                  </button>
                </p>
              )}
            </li>
          )}
        </ul>
      </section>

      {/* The calendar always renders, whether or not there are events, so the
          page has a visible calendar rather than nothing below the top block. */}
      <section
        aria-labelledby="calendar-heading"
        className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12 sm:px-10 sm:pb-24 lg:px-16"
      >
        <h2 id="calendar-heading">Calendar</h2>

        <MonthGrid events={events} />

        {hasAny && (
          <ul className="legend" aria-label="Event kinds">
            {KIND_ORDER.map((k) => (
              <li key={k} className="legend__item" data-kind={k}>
                <span className="kind-swatch" aria-hidden="true" />
                {KINDS[k].label}
              </li>
            ))}
          </ul>
        )}

        {/* "Open the full calendar" was removed: it sent people off the site to
            a Google Calendar view of the same events already on this page. The
            subscribe link stays, because that is something this page cannot
            do itself. */}
        {hasCalendar && (
          <p className="mt-8">
            <a
              className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
              href={CALENDAR_ICS}
            >
              <CalendarIcon width={16} height={16} /> Add to your own calendar
            </a>
          </p>
        )}
      </section>

      {/* The "Other ways to get involved" heading was removed; the band keeps
          its two columns. With no heading above them the columns are no longer
          subordinate to one, so they are h2 rather than h3 and the section
          carries no accessible name. */}
      <section className="border-t border-rule bg-gray-light">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2>Want to run a workshop?</h2>
              <p className="mt-4 text-gray-text">
                If you can build something in an hour, you can teach it. Tell us
                what you have in mind and we&apos;ll handle the room, the
                promotion, and the turnout.
              </p>
              {/* Deliberately the outline button, not the coral fill. The
                  interest form is the site's one conversion action and a second
                  filled CTA on the same page would compete with it. */}
              <p className="mt-6">
                <Link className="btn btn--primary" to="/events/pitch">
                  Pitch a workshop
                </Link>
              </p>
              <p className="mt-3 text-meta text-gray-text">
                Five questions, about two minutes.
              </p>
            </div>

            <div>
              <h2>Join a build team</h2>
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
          <p
            className="font-display text-step-2 font-semibold text-ink"
            style={{ maxWidth: "20ch" }}
          >
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

export default Events;
