import { useMemo } from "react";
import { Link } from "react-router-dom";
import NycSkyline from "../components/NycSkyline";
import EventTile from "../components/EventTile";
import Faq from "../components/Faq";
import { upcoming, isNyc, statusOf } from "../lib/events";
import { JOIN_PATH, NYC_JOIN_PATH } from "../lib/links";
import claudeSpark from "../assets/brand/claude-spark.svg";

/**
 * NYC campus hub. Mode: Persuade, for a student at Northeastern's New York
 * campus who has just heard the club exists.
 *
 * Built from the site's own parts so it reads like every other page: the
 * homepage hero, the two-column text section, flat hairline cards, the events
 * page's tile row and the FAQ accordion. The one NYC flourish is the ribbon's
 * skyline, shown as the page's picture the way /about shows its group photo.
 *
 * Events are the club calendar filtered with isNyc(), so an entry shows up
 * here on the next hourly rebuild once it has "NYC" in its title. Nothing is
 * hardcoded: with no NYC events the row says so.
 */

const RUN = [
  {
    title: "Workshops",
    body: "Hands-on sessions that each teach one specific skill with Claude. Bring a laptop. You do not need to know how to code.",
  },
  {
    title: "Build nights",
    body: "Evenings to work on your own project with other builders in the room, then show everyone what you made.",
  },
  {
    title: "Hackathons",
    body: "We run the biggest hackathons at Northeastern with our partner clubs, and we want New York in on them.",
  },
];

const STEPS = [
  {
    title: "Fill out the interest form",
    body: "Five questions, about thirty seconds. This is how you get on the NYC list.",
  },
  {
    title: "Come to the interest meeting",
    body: "In December or January, whichever most of you pick on the form. We'll email you the invite.",
  },
  {
    title: "First sessions",
    body: "We plan the first workshops around the days you told us work best.",
  },
  {
    title: "Build all semester",
    body: "Workshops, build nights and hackathons, at the NYC campus.",
  },
];

const NYC_FAQ = [
  {
    q: "Who can join the NYC branch?",
    a: "Any Northeastern student at the NYC campus, from any program and any major. You do not need to know how to code.",
  },
  {
    q: "Does it cost anything?",
    a: "No. There is no fee and no application. Fill out the NYC interest form and we will be in touch.",
    links: [{ text: "NYC interest form", to: NYC_JOIN_PATH }],
  },
  {
    q: "When does it start?",
    a: "With an interest meeting in December or January. The form asks which month works for you, and we pick the one most people choose.",
  },
  {
    q: "Is this a different club from the one in Boston?",
    a: "No. It is the same Claude Builders Club at Northeastern, opening a branch in New York. NYC members are full members of the club.",
  },
  {
    q: "I'm on the Boston campus. Which form do I fill out?",
    a: "The main interest form. The NYC form is only for people who will be at the New York campus.",
    links: [{ text: "main interest form", to: JOIN_PATH }],
  },
];

const Nyc = () => {
  const events = useMemo(() => upcoming().filter(isNyc), []);
  const featured = events.slice(0, 3);
  // Same rule as the events page: the inverted tile goes to the first event
  // that still has room, never to a full one.
  const leadIndex = featured.findIndex((e) => !statusOf(e).full);
  const fillSpan = 3 - featured.length;

  return (
    <>
      {/* Hero, as on the homepage. */}
      <section
        aria-labelledby="nyc-hub-heading"
        className="hero relative overflow-hidden pb-12 pt-16 sm:pb-16 sm:pt-24 lg:pt-28"
      >
        <img
          src={claudeSpark}
          alt=""
          aria-hidden="true"
          className="hero-mark"
          width="94"
          height="94"
        />
        <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-16">
          <h1
            id="nyc-hub-heading"
            className="font-display text-ink"
            style={{
              fontSize: "var(--step-display)",
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              maxWidth: "15ch",
            }}
          >
            Claude Builders Club, New York.
          </h1>
          <p
            className="lead mt-7 sm:mt-8"
            style={{ maxWidth: "var(--measure-tight)" }}
          >
            Northeastern&apos;s Claude Builders Club is opening a branch at the
            NYC campus. Same club, same workshops and hackathons, now in New
            York.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Link className="btn btn--coral" to={NYC_JOIN_PATH}>
              Fill out the interest form
            </Link>
            <a className="btn btn--secondary" href="#nyc-events-heading">
              See NYC events
            </a>
          </div>
        </div>
      </section>

      {/* The page's picture: the NYC ribbon's skyline. */}
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-16">
        <figure className="nyc-picture">
          <NycSkyline className="nyc-picture__art" />
        </figure>
      </div>

      {/* What it is and who it's for, laid out like the homepage's two
          columns. */}
      <section
        aria-label="About the NYC branch"
        className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16"
      >
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2>What we&apos;re bringing to New York</h2>
            <p className="mt-6 text-gray-text">
              Claude Builder Clubs are Anthropic&apos;s student-led campus
              communities. Ours started in Boston in 2025, running hands-on
              workshops, showcase nights where members demo what they have
              built, and the biggest hackathons at Northeastern.
            </p>
            <p className="mt-4 text-gray-text">
              The NYC branch is the same club, not a copy of it, and it will be
              shaped by the people who show up to the first meeting.
            </p>
          </div>
          <div>
            <h2>Who it&apos;s for</h2>
            <p className="mt-6 text-gray-text">
              Any Northeastern student at the NYC campus, from any program and
              any major. You do not need to know how to code. That is the whole
              point: you describe what you want in plain English and build it
              from there.
            </p>
            <p className="mt-4 text-gray-text">
              It&apos;s free, and there is no application. Fill out the interest
              form and we&apos;ll invite you to the first meeting.
            </p>
          </div>
        </div>
      </section>

      {/* What we'll run, as flat hairline cards. */}
      <section
        aria-labelledby="nyc-run-heading"
        className="border-t border-rule bg-gray-light"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <h2 id="nyc-run-heading">What we&apos;ll run</h2>
          <ul className="mt-10 grid list-none gap-6 p-0 md:grid-cols-3">
            {RUN.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-rule bg-paper p-6 sm:p-8"
              >
                <h3>{item.title}</h3>
                <p className="mt-3 text-gray-text">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it starts. */}
      <section
        aria-labelledby="nyc-steps-heading"
        className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16"
      >
        <h2 id="nyc-steps-heading">How it starts</h2>
        <ol className="nyc-steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className="nyc-step">
              <span className="nyc-step__n" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="nyc-step__title">{step.title}</h3>
              <p className="mt-2 text-gray-text">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* NYC events, as the events page shows them. */}
      <section
        aria-labelledby="nyc-events-heading"
        className="border-t border-rule"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <h2 id="nyc-events-heading" className="nyc-anchor">
            Upcoming in New York
          </h2>
          <p className="mt-2 text-small text-gray-text">
            Everything is free and open to any student.
          </p>

          <ul className="event-tiles">
            {featured.map((event, i) => (
              <EventTile key={event.id} event={event} lead={i === leadIndex} />
            ))}
            {fillSpan > 0 && (
              <li
                className={`event-fill${featured.length === 0 ? " event-fill--full" : ""}`}
                style={{ "--fill-span": String(fillSpan) }}
              >
                <p className="event-fill__text">
                  {featured.length > 0
                    ? "No additional events"
                    : "No NYC events yet. The first one is the interest meeting."}
                </p>
                {featured.length === 0 && (
                  <p className="event-fill__action">
                    <Link className="sweep" to={NYC_JOIN_PATH}>
                      Fill out the interest form to get the invite
                    </Link>
                  </p>
                )}
              </li>
            )}
          </ul>

          <p className="mt-8">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
            >
              See the full club calendar
            </Link>
          </p>
        </div>
      </section>

      <Faq items={NYC_FAQ} id="nyc-faq-heading" />
    </>
  );
};

export default Nyc;
