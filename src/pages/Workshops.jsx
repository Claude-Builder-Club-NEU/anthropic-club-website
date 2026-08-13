import { Link } from "react-router-dom";
import EventsPanel from "../components/EventsPanel";
import MonthGrid from "../components/MonthGrid";
import Breadcrumbs from "../components/Breadcrumbs";
import DraftNote from "../components/DraftNote";
import { hasEvents } from "../lib/events";
import { INTEREST_FORM } from "../lib/links";

/**
 * Workshops. Mode: Operate — this surface is for current members finding out
 * what is happening and how to take part, so scanability beats persuasion.
 *
 * Order is fixed by the brief: upcoming events (calendar + list), get involved,
 * then showcase underneath.
 */
const Workshops = () => (
  <>
    <Breadcrumbs current="Workshops" />

    <section className="mx-auto max-w-6xl px-6 pb-4 pt-8 sm:px-10 lg:px-16">
      <h1 style={{ maxWidth: "18ch" }}>Workshops and events</h1>
      <p className="lead mt-6" style={{ maxWidth: "var(--measure-tight)" }}>
        What we&apos;re running, how to take part, and what we&apos;ve built
        before.
      </p>
      {hasEvents && <MonthGrid />}
    </section>

    <EventsPanel headingId="upcoming-heading" />

    <section
      aria-labelledby="involved-heading"
      className="border-t border-rule bg-gray-light"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        <h2 id="involved-heading">Get involved</h2>
        <div className="mt-8 grid gap-10 sm:grid-cols-3">
          <div>
            <h3 className="text-step-3">Run a workshop</h3>
            <p className="mt-3 text-small text-gray-text">
              If you can build something in an hour, you can teach it. Pitch the
              topic and we&apos;ll handle the room, the promotion, and the
              turnout.
            </p>
          </div>
          <div>
            <h3 className="text-step-3">Join a build team</h3>
            <p className="mt-3 text-small text-gray-text">
              Small groups working on one project across a few weeks. Useful if
              you want to finish something rather than start five things.
            </p>
          </div>
          <div>
            <h3 className="text-step-3">Pitch a project</h3>
            <p className="mt-3 text-small text-gray-text">
              Have a problem worth solving, or a partnership to bring in? Tell
              us and we&apos;ll find the people for it.
            </p>
          </div>
        </div>
        <DraftNote>
          Confirm these three routes match how you actually take people on, and
          say where a pitch should go if it is not the interest form.
        </DraftNote>
        <a
          className="btn btn--primary mt-8"
          href={INTEREST_FORM}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get in touch
        </a>
      </div>
    </section>

    <section
      aria-labelledby="showcase-heading"
      className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16"
    >
      <h2 id="showcase-heading">Showcase</h2>
      <div className="mt-8 rounded-lg border border-rule p-8 sm:p-10">
        <p className="font-display text-step-3 font-semibold text-ink">
          Nothing here yet.
        </p>
        <p className="mt-3 text-gray-text">
          This is where past hackathons and workshop projects will live. The
          first ones go up after this semester&apos;s events run.
        </p>
        <DraftNote>
          Send photos, project names, and dates from past hackathons and I will
          build this out. Deliberately left empty rather than filled with
          placeholder projects.
        </DraftNote>
        <p className="mt-6 text-small text-gray-text">
          In the meantime,{" "}
          <Link to="/about" className="sweep">
            read about what we build
          </Link>
          .
        </p>
      </div>
    </section>
  </>
);

export default Workshops;
