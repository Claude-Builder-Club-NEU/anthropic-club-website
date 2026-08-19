import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  POLLS,
  STATUS,
  hasBackend,
  loadProgress,
  outcomeLine,
  pollResults,
  pollSize,
  statusOf,
} from "../lib/polls";

/**
 * The polls hub. Mockups polls-01-hub and polls-07-results.
 *
 * Three filters, and the open ballot is a near-black card while everything else
 * on the page stays quiet, so the one thing to do is unmistakable.
 *
 * Status is computed in the browser rather than baked in at build time. The
 * site is prerendered, so a status decided during the build would be wrong for
 * every visitor after it: a poll opening at 6pm would read "opening soon" all
 * evening on a page built that morning. The prerendered HTML therefore ships
 * the frame and the filters, which is the right thing to serve before the
 * clock is known.
 */

const FILTERS = [
  { key: STATUS.open, label: "Open now" },
  { key: STATUS.soon, label: "Opening soon" },
  { key: STATUS.closed, label: "Results" },
];

const Polls = () => {
  const [filter, setFilter] = useState(STATUS.open);
  const [now, setNow] = useState(null);

  // Deliberately not new Date() in the initial state: that would run during the
  // prerender too and bake a build-time clock into the HTML.
  useEffect(() => setNow(new Date()), []);

  const shown = now
    ? POLLS.filter((poll) => statusOf(poll, now) === filter)
    : [];

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
      <div className="pollhub__head">
        <div>
          <h1 className="pollhub__title">Polls</h1>
          <p className="pollhub__lead">
            You decide what we run. Nothing asks for your name.
          </p>
        </div>

        <div className="pollhub__filters" role="tablist" aria-label="Poll status">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={`pollfilter${filter === f.key ? " is-on" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <h2 className="pollhub__section">
        {FILTERS.find((f) => f.key === filter)?.label}
      </h2>

      {!now ? null : shown.length === 0 ? (
        <p className="pollhub__empty">
          {filter === STATUS.open
            ? "Nothing open right now. The next ballot opens at an info session."
            : filter === STATUS.soon
              ? "Nothing scheduled yet."
              : "No closed polls yet."}
        </p>
      ) : filter === STATUS.closed ? (
        <ul className="pollresults">
          {shown.map((poll) => (
            <ResultRow key={poll.slug} poll={poll} />
          ))}
        </ul>
      ) : (
        shown.map((poll) => <PollCard key={poll.slug} poll={poll} />)
      )}
    </section>
  );
};

/** The near-black ballot card. */
const PollCard = ({ poll }) => {
  const { sections, questions } = pollSize(poll);
  const [resume, setResume] = useState(null);

  useEffect(() => setResume(loadProgress(poll.slug)), [poll.slug]);

  const inProgress = resume && !resume.cast;
  const sectionLabel = inProgress
    ? poll.sections?.[resume.index]?.label
    : null;

  return (
    <article className="pollcard">
      <div className="pollcard__body">
        <h3 className="pollcard__title">{poll.title}</h3>
        {poll.subtitle && <p className="pollcard__sub">{poll.subtitle}</p>}
        <p className="pollcard__meta">
          {questions} question{questions === 1 ? "" : "s"}, {sections} section
          {sections === 1 ? "" : "s"}
          <br />
          About {Math.max(1, Math.round(questions * 0.6))} minutes
        </p>
        <Link className="btn btn--coral" to={`/polls/${poll.slug}`}>
          {inProgress && sectionLabel
            ? `Resume: ${sectionLabel}`
            : "Open the ballot"}
        </Link>
      </div>
      {/* Watermark. aria-hidden: it is texture, not information. */}
      <span className="pollcard__mark" aria-hidden="true" />
    </article>
  );
};

/**
 * One line per closed poll, per the spec.
 *
 * The outcome is computed from the counts rather than typed by an officer, so
 * the sentence on this page cannot drift from what people actually chose.
 */
const ResultRow = ({ poll }) => {
  const [line, setLine] = useState(null);

  useEffect(() => {
    if (!hasBackend) return undefined;
    const ac = new AbortController();
    pollResults(poll.slug, { signal: ac.signal })
      .then((results) => setLine(outcomeLine(poll, results)))
      .catch(() => setLine(null));
    return () => ac.abort();
  }, [poll]);

  const closed = poll.closesAt
    ? new Date(poll.closesAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <li className="pollresult">
      <span className="pollresult__when">{closed} · Closed</span>
      <span className="pollresult__title">{poll.title}</span>
      <span className="pollresult__outcome">
        {line || "Counting the ballots."}
      </span>
    </li>
  );
};

export default Polls;
