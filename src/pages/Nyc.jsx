import { useMemo } from "react";
import { Link } from "react-router-dom";
import NycSkyline from "../components/NycSkyline";
import EventTile from "../components/EventTile";
import { upcoming, isNyc, statusOf } from "../lib/events";
import { NYC_INSTAGRAM, NYC_JOIN_PATH } from "../lib/links";
import { InstagramIcon } from "../components/Icons";

// "See NYC events" glides down to the events row instead of jumping. People
// who ask for reduced motion still get the instant jump.
const scrollToEvents = (e) => {
  const target = document.getElementById("nyc-events-heading");
  if (!target) return;
  e.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  window.history.replaceState(null, "", "#nyc-events-heading");
};

/* Line icons for the "What we'll run" cards, drawn on the same 24px grid and
   stroke as Icons.jsx. */
const runIcon = {
  viewBox: "0 0 24 24",
  width: 22,
  height: 22,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

const RUN_ICONS = {
  Workshops: (
    <svg {...runIcon}>
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path d="M2.5 19h19" />
      <path d="m10 9-2 1.75L10 12.5M14 9l2 1.75-2 1.75" />
    </svg>
  ),
  "Build nights": (
    <svg {...runIcon}>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
      <path d="M17 3.5v3M15.5 5h3" />
    </svg>
  ),
  Hackathons: (
    <svg {...runIcon}>
      <path d="M13 2.5 5 13.5h6l-1 8 8-11h-6l1-8Z" />
    </svg>
  ),
};

/**
 * NYC campus hub. Mode: Persuade, for a student at Northeastern's New York
 * campus who has just heard the club exists.
 *
 * Built from the site's own parts so it reads like every other page: the
 * two-column text section, flat hairline cards, the events page's tile row.
 * The hero is the homepage ribbon's golden hour scene, made
 * full bleed, so the page opens on the same picture the ribbon links from.
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

const Nyc = () => {
  const events = useMemo(() => upcoming().filter(isNyc), []);
  const featured = events.slice(0, 3);
  // Same rule as the events page: the inverted tile goes to the first event
  // that still has room, never to a full one.
  const leadIndex = featured.findIndex((e) => !statusOf(e).full);
  const fillSpan = 3 - featured.length;

  return (
    <>
      {/* Hero: the golden hour scene from the homepage ribbon, full bleed
          and tucked up under the floating header. */}
      <section className="nyc-hero" aria-labelledby="nyc-hub-heading">
        <NycSkyline className="nyc-hero__art" />
        <span className="nyc-hero__shade" aria-hidden="true" />
        <div className="nyc-hero__copy">
          <h1 id="nyc-hub-heading" className="nyc-hero__heading">
            Now building in New York City.
          </h1>
          <p className="nyc-hero__body">
            Northeastern&apos;s Claude Builders Club is opening a branch at the
            NYC campus. Same club, same workshops and hackathons, now in New
            York.
          </p>
          <div className="nyc-hero__actions">
            <Link className="nyc-pill nyc-pill--cream" to={NYC_JOIN_PATH}>
              Fill out the interest form
            </Link>
            <a
              className="nyc-pill nyc-pill--ghost"
              href="#nyc-events-heading"
              onClick={scrollToEvents}
            >
              See NYC events
            </a>
            <a
              className="nyc-pill nyc-pill--ghost nyc-pill--icon"
              href={NYC_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NYC branch on Instagram (opens in a new tab)"
              title="@claudeclub.neunyc on Instagram"
            >
              <InstagramIcon width={20} height={20} />
            </a>
          </div>
        </div>
      </section>

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

      {/* What we'll run, as flat hairline cards with a small icon each. */}
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
                className="nyc-run-card rounded-lg border border-rule bg-paper p-6 sm:p-8"
              >
                <span className="nyc-run-card__icon">
                  {RUN_ICONS[item.title]}
                </span>
                <h3 className="mt-5">{item.title}</h3>
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

    </>
  );
};

export default Nyc;
