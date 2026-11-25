import { useMemo } from "react";
import { Link } from "react-router-dom";
import NycSkyline from "../components/NycSkyline";
import EventRow from "../components/EventRow";
import Faq from "../components/Faq";
import { PixelIcon, BosToNyc } from "../components/NycArt";
import { ArrowRightIcon } from "../components/Icons";
import { upcoming, isNyc } from "../lib/events";
import { JOIN_PATH, NYC_JOIN_PATH } from "../lib/links";
import claudeSpark from "../assets/brand/claude-spark.svg";

/**
 * NYC campus hub. Mode: Persuade, for a student at Northeastern's New York
 * campus who has just heard the club exists.
 *
 * It wears the site chrome and the site's own sections (containers, h2s, the
 * rule and gray-light bands, the FAQ accordion, the homepage event rows), and
 * borrows the NYC ribbon's identity for its graphics: the golden hour skyline,
 * JetBrains Mono, and pixel art in the same sunset palette.
 *
 * Events are the club calendar filtered with isNyc(), so an entry shows up
 * here on the next hourly rebuild once it has "NYC" in its title. Nothing is
 * hardcoded: with no NYC events the section says so and points at the form.
 */

const RUN = [
  {
    icon: "laptop",
    title: "Workshops",
    body: "Hands-on sessions that each teach one specific skill with Claude. Bring a laptop. You do not need to know how to code.",
  },
  {
    icon: "tower",
    title: "Build nights",
    body: "Evenings to work on your own project with other builders in the room, then show everyone what you made.",
  },
  {
    icon: "trophy",
    title: "Hackathons",
    body: "We run the biggest hackathons at Northeastern with our partner clubs, and we want New York in on them.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Fill out the interest form",
    body: "Five questions, about thirty seconds. This is how you get on the NYC list.",
    now: true,
  },
  {
    n: "2",
    title: "Interest meeting",
    body: "In December or January, whichever most of you pick on the form. We'll email you the invite.",
  },
  {
    n: "3",
    title: "First sessions",
    body: "We plan the first workshops around the days you told us work best.",
  },
  {
    n: "4",
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

  return (
    <>
      {/* Hero: the ribbon's golden hour scene, full bleed under the header. */}
      <section className="nyc-hero" aria-labelledby="nyc-hub-heading">
        <NycSkyline className="nyc-hero__art" />
        <span className="nyc-hero__shade" aria-hidden="true" />

        <div className="nyc-hero__inner mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-16">
          <p className="nyc-hero__eyebrow">
            <span>NYC campus</span>
            <span aria-hidden="true">·</span>
            <span>40.7° N 74.0° W</span>
          </p>
          <h1 id="nyc-hub-heading" className="nyc-hero__heading">
            Claude Builders Club, New York.
          </h1>
          <p className="nyc-hero__body">
            Northeastern&apos;s Claude Builders Club is opening a branch at the
            NYC campus. Same club, same workshops and hackathons, now in New
            York.
          </p>
          <div className="nyc-hero__actions">
            <Link className="nyc-btn nyc-btn--cream" to={NYC_JOIN_PATH}>
              Fill out the interest form
            </Link>
            <a className="nyc-btn nyc-btn--ghost" href="#nyc-events-heading">
              See NYC events
            </a>
          </div>
        </div>
      </section>

      {/* What the branch is, beside the Boston to New York route. */}
      <section
        aria-labelledby="nyc-about-heading"
        className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="nyc-kicker">01 · The branch</p>
            <h2 id="nyc-about-heading" className="mt-3">
              One club, two campuses
            </h2>
            <p className="mt-6 text-gray-text">
              Claude Builder Clubs are Anthropic&apos;s student-led campus
              communities. Ours started in Boston in 2025, running hands-on
              workshops, showcase nights where members demo what they have
              built, and the biggest hackathons at Northeastern.
            </p>
            <p className="mt-4 text-gray-text">
              Now we&apos;re bringing it to New York. The NYC branch is the same
              club, not a copy of it, and it will be shaped by the people who
              show up to the first meeting.
            </p>
          </div>
          <BosToNyc />
        </div>
      </section>

      {/* What we'll run, as three cards with pixel icons. */}
      <section
        aria-labelledby="nyc-run-heading"
        className="border-t border-rule bg-gray-light"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <p className="nyc-kicker">02 · What we&apos;ll run</p>
          <h2 id="nyc-run-heading" className="mt-3">
            What the NYC branch will do
          </h2>
          <ul className="nyc-cards">
            {RUN.map((item) => (
              <li key={item.title} className="nyc-card">
                <div className="nyc-card__art">
                  <PixelIcon name={item.icon} size={96} />
                </div>
                <h3 className="nyc-card__title">{item.title}</h3>
                <p className="nyc-card__body">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it starts, drawn as a transit line. */}
      <section
        aria-labelledby="nyc-steps-heading"
        className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16"
      >
        <p className="nyc-kicker">03 · How it starts</p>
        <h2 id="nyc-steps-heading" className="mt-3">
          From the form to your first build
        </h2>
        <ol className="nyc-line">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="nyc-stop"
              data-now={step.now ? "true" : undefined}
            >
              <span className="nyc-stop__dot" aria-hidden="true">
                {step.n}
              </span>
              <div>
                {step.now && <p className="nyc-stop__now">You are here</p>}
                <h3 className="nyc-stop__title">{step.title}</h3>
                <p className="nyc-stop__body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* NYC events from the club calendar. */}
      <section
        aria-labelledby="nyc-events-heading"
        className="border-t border-rule"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <p className="nyc-kicker">04 · Calendar</p>
          <h2 id="nyc-events-heading" className="mt-3">
            Upcoming in New York
          </h2>

          {events.length > 0 ? (
            <ul className="home-events nyc-events">
              {events.map((event) => (
                <EventRow key={event.id} event={event} hideCampusTag />
              ))}
            </ul>
          ) : (
            <div className="nyc-empty">
              <PixelIcon name="calendar" size={64} />
              <div>
                <p className="nyc-empty__title">
                  Nothing on the NYC calendar yet.
                </p>
                <p className="nyc-empty__body">
                  The first event is the interest meeting. Fill out the form and
                  you&apos;ll get the invite.
                </p>
              </div>
            </div>
          )}

          <p className="mt-8">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
            >
              See the full club calendar <ArrowRightIcon width={16} height={16} />
            </Link>
          </p>
        </div>
      </section>

      <Faq items={NYC_FAQ} id="nyc-faq-heading" heading="NYC campus FAQs" />

      {/* Closing call to action on a Manhattan street grid. */}
      <section className="nyc-close" aria-labelledby="nyc-close-heading">
        <span className="nyc-close__grid" aria-hidden="true" />
        <img
          className="nyc-close__spark"
          src={claudeSpark}
          alt=""
          aria-hidden="true"
          width="94"
          height="94"
        />
        <div className="nyc-close__inner mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-16">
          <h2 id="nyc-close-heading" className="nyc-close__heading">
            Be one of the first builders in New York.
          </h2>
          <p className="nyc-close__body">
            Tell us you&apos;re in and we&apos;ll invite you to the first
            interest meeting.
          </p>
          <Link className="nyc-btn nyc-btn--coral" to={NYC_JOIN_PATH}>
            Fill out the interest form
          </Link>
        </div>
      </section>
    </>
  );
};

export default Nyc;
