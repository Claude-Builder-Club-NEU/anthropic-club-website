import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  answerKey,
  castBallot,
  clearProgress,
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
    /**
     * ?reset reopens the ballot for somebody who has already cast one.
     *
     * An officer has to take this thing several times before a session, and
     * the cast screen deliberately offers no way back in: see the comment above
     * that screen, which argues that nothing there should restart something
     * that cannot be restarted. That argument is about the STUDENT in the room
     * and it still holds, which is why this is a URL and not a button. Nothing
     * on screen invites a second ballot.
     *
     * IT GRANTS NOTHING THAT WAS NOT ALREADY AVAILABLE. There is no dedupe and
     * cannot be, for the reasons in the header of lib/polls.js: the poll stores
     * nothing that identifies a voter, so clearing site data has always reopened
     * the ballot, and a second browser was always a second vote. This only saves
     * an officer a trip through devtools. If one ballot per person ever has to
     * be real, the fix is a door-issued code, not deleting this.
     *
     * CLEARING LOCALSTORAGE BY HAND IS NOT ENOUGH ON ITS OWN, which is the whole
     * reason this exists. The persist effect below re-saves { cast: true } on
     * the next render, so deleting the key from the devtools Application tab
     * without also reloading puts it straight back and looks like the reset
     * silently failed.
     *
     * The parameter is stripped immediately. Left in the address bar it would
     * turn every later refresh into a wipe of real answers, which is the exact
     * data loss the resume behaviour exists to prevent.
     */
    let wasReset = false;
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.has("reset")) {
          clearProgress(poll.slug);
          wasReset = true;
          params.delete("reset");
          const query = params.toString();
          window.history.replaceState(
            null,
            "",
            window.location.pathname + (query ? `?${query}` : "")
          );
        }
      } catch {
        // A blocked history API or an exotic URL is not a reason to fail to
        // render the ballot. Worst case the reset does not happen and the
        // person sees the screen they saw before.
      }
    }

    const saved = wasReset ? null : loadProgress(poll.slug);
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
     The ballot is closed, so this screen offers no way back into it. Two ways
     out, both real buttons, and nothing that restarts a thing that cannot be
     restarted. */
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

  /* No breadcrumb, no section bars, no "Section 1 of 3" eyebrow. The section
     opens on its own heading, the same way the cast screen does, and the
     submit button still names which section it closes. */
  return (
    <div className="ballot">
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

export default Ballot;
