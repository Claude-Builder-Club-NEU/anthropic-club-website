import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  answerKey,
  castBallot,
  hasBackend,
  KNOWN_TYPES,
  loadProgress,
  missingIn,
  saveProgress,
  sectionComplete,
} from "../lib/polls";
import BallotQuestion from "./BallotQuestion";

/**
 * The ballot flow: sections, the break between them, and the cast screen.
 *
 * THE BREAK EXISTS SO THE ROOM MOVES TOGETHER. Submitting a section starts a
 * countdown rather than opening the next one, so the presenter can talk through
 * what just closed and nobody is three sections ahead. It is client-side, which
 * means it paces rather than enforces: two people who started a minute apart
 * finish a minute apart. If pacing ever has to be enforced, the unlock time has
 * to come from the server so every device counts down against one clock.
 *
 * ONE BUG FROM THE EXPORT, FIXED HERE. The mockup export left the questions of
 * the last section rendered above the thank-you screen. The guard is the
 * `phase` state below: exactly one of section, break, or cast is ever rendered,
 * so there is no path where two of them are on screen at once.
 */

const PHASE = { section: "section", break: "break", cast: "cast" };

const Ballot = ({ poll }) => {
  const sections = useMemo(() => poll.sections || [], [poll]);
  const settings = poll.settings || {};
  const breakSeconds = settings.breakSeconds ?? 120;
  const requireAll = settings.requireAllAnswers !== false;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState(PHASE.section);
  const [remaining, setRemaining] = useState(breakSeconds);
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [error, setError] = useState("");
  const [showMissing, setShowMissing] = useState(false);
  const [restored, setRestored] = useState(false);

  const headingRef = useRef(null);

  // Resume. Runs once on mount, after the prerendered HTML has hydrated, so
  // the server-rendered markup and the first client render agree.
  useEffect(() => {
    const saved = loadProgress(poll.slug);
    if (saved && !saved.cast) {
      setAnswers(saved.answers || {});
      setIndex(Math.min(saved.index || 0, Math.max(sections.length - 1, 0)));
    } else if (saved?.cast) {
      setPhase(PHASE.cast);
    }
    setRestored(true);
  }, [poll.slug, sections.length]);

  // Persist after every change, so a refresh mid-question loses nothing.
  useEffect(() => {
    if (!restored) return;
    saveProgress(poll.slug, {
      index,
      answers,
      cast: phase === PHASE.cast,
    });
  }, [poll.slug, index, answers, phase, restored]);

  // The break clock. One interval, cleared on unmount and on phase change, so
  // leaving mid-break cannot leave a timer running against a dead component.
  useEffect(() => {
    if (phase !== PHASE.break) return undefined;
    const id = setInterval(() => {
      setRemaining((n) => {
        if (n <= 1) {
          clearInterval(id);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // autoOpen advances by itself; otherwise the screen offers a button, which is
  // the default because a room usually wants the presenter to call it.
  useEffect(() => {
    if (phase === PHASE.break && remaining === 0 && settings.autoOpen) {
      openNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, remaining, settings.autoOpen]);

  // Move focus to the new section heading so the change is announced.
  useEffect(() => {
    if (phase === PHASE.section && restored) headingRef.current?.focus();
  }, [index, phase, restored]);

  const section = sections[index];
  const isLast = index === sections.length - 1;

  const setAnswer = useCallback(
    (key) => (value) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
      setShowMissing(false);
    },
    []
  );

  function openNext() {
    setPhase(PHASE.section);
    setIndex((i) => Math.min(i + 1, sections.length - 1));
    setRemaining(breakSeconds);
  }

  async function submitSection() {
    if (status === "sending") return;

    if (!sectionComplete(section, answers, requireAll)) {
      setShowMissing(true);
      return;
    }

    if (!isLast) {
      setRemaining(breakSeconds);
      setPhase(PHASE.break);
      return;
    }

    // Last section: the whole ballot goes up in one write. Sections are a
    // pacing device for the room, not a save point, and posting each one
    // separately would leave half-ballots in the table whenever somebody walks
    // out at the break.
    setStatus("sending");
    setError("");
    try {
      const data = await castBallot(poll.slug, answers);
      if (data?.ok) {
        setPhase(PHASE.cast);
        setStatus("idle");
        return;
      }
      setError("That did not go through. Try once more.");
      setStatus("error");
    } catch {
      setError("We could not reach the server. Check your connection.");
      setStatus("error");
    }
  }

  /* --- Not configured --------------------------------------------------- */
  if (!hasBackend) {
    return (
      <div className="ballot__notice">
        <h1 className="ballot__title">Voting is not switched on yet.</h1>
        <p className="ballot__lead">
          The ballot needs its database credentials before it can record
          anything. Nothing you enter here would be counted.
        </p>
        <Link className="btn btn--secondary" to="/polls">
          Back to polls
        </Link>
      </div>
    );
  }

  /* --- Break ------------------------------------------------------------ */
  if (phase === PHASE.break) {
    const mm = Math.floor(remaining / 60);
    const ss = String(remaining % 60).padStart(2, "0");
    const done = remaining === 0;
    const pct = breakSeconds ? ((breakSeconds - remaining) / breakSeconds) * 100 : 100;

    return (
      <div className="pollbreak">
        <p className="pollbreak__eyebrow">
          {done
            ? `Section 0${index + 2} is ready`
            : `Section 0${index + 2} opens in`}
        </p>
        {/* aria-live=off: a countdown that announced every second would make
            the page unusable with a screen reader. The heading below changes
            once, when it matters. */}
        <p className="pollbreak__clock" aria-hidden="true">
          {mm}:{ss}
        </p>
        <p className="pollbreak__note">{done ? "" : "Please wait."}</p>
        {done && (
          <button type="button" className="btn btn--coral" onClick={openNext}>
            Open section 0{index + 2}
          </button>
        )}
        <div className="pollbreak__bar">
          <div className="pollbreak__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  /* --- Cast -------------------------------------------------------------
     The ballot is closed, so this screen carries no progress bars, no eyebrow
     and no way back into it. Section bars would invite a reader to look for a
     step still to do; there is none, and the copy already said this closes the
     ballot. Two ways out, both real buttons, and nothing that restarts a thing
     that cannot be restarted. */
  if (phase === PHASE.cast) {
    return (
      <div className="ballot">
        <h1 className="ballot__title" tabIndex={-1} ref={headingRef}>
          {poll.castTitle || "Your ballot is in."}
        </h1>
        {poll.castBody && <p className="ballot__lead">{poll.castBody}</p>}
        <div className="ballot__actions">
          <Link className="btn btn--coral" to="/events">
            View calendar
          </Link>
          <Link className="btn btn--secondary" to="/polls">
            Back to polls
          </Link>
        </div>
      </div>
    );
  }

  /* --- A section -------------------------------------------------------- */
  if (!section) return null;
  const missing = missingIn(section, answers);

  return (
    <div className="ballot">
      <p className="ballot__crumbs">
        <Link to="/polls">Polls</Link>
        <span aria-hidden="true"> / </span>
        <span>{poll.title}</span>
      </p>

      <Progress sections={sections} index={index} />

      <p className="ballot__eyebrow">
        Section {index + 1} of {sections.length} · {section.label}
      </p>
      <h1 className="ballot__title" tabIndex={-1} ref={headingRef}>
        {section.title}
      </h1>
      {section.lead && <p className="ballot__lead">{section.lead}</p>}

      <form
        className="ballot__form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submitSection();
        }}
      >
        {(section.questions || [])
          .filter((q) => KNOWN_TYPES.has(q.type))
          .map((question) => {
            const key = answerKey(section, question);
            return (
              <BallotQuestion
                key={key}
                name={key}
                question={question}
                value={answers[key]}
                onChange={setAnswer(key)}
              />
            );
          })}

        {showMissing && missing.length > 0 && (
          <p className="ballot__error" role="alert">
            {missing.length === 1
              ? "One question still needs an answer."
              : `${missing.length} questions still need an answer.`}
          </p>
        )}
        {error && (
          <p className="ballot__error" role="alert">
            {error}
          </p>
        )}

        <div className="ballot__submit">
          <button
            type="submit"
            className="btn btn--coral"
            disabled={status === "sending"}
          >
            {isLast
              ? status === "sending"
                ? "Casting…"
                : "Cast your ballot"
              : `Submit section ${index + 1}`}
          </button>
          <span className="ballot__submitnote">
            {isLast
              ? "This closes your ballot."
              : `A ${Math.round(breakSeconds / 60)}-minute break starts once you submit.`}
          </span>
        </div>
      </form>
    </div>
  );
};

/** The three bars across the top. Filled behind you, coral on the current one. */
const Progress = ({ sections, index }) => (
  <ol className="ballotprog">
    {sections.map((section, i) => (
      <li
        key={section.key}
        className={`ballotprog__step${
          i < index ? " is-done" : i === index ? " is-current" : ""
        }`}
      >
        <span className="ballotprog__bar" aria-hidden="true" />
        <span className="ballotprog__label">
          0{i + 1} {section.label}
        </span>
      </li>
    ))}
  </ol>
);

export default Ballot;
