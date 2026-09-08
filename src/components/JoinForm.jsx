import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  YEARS,
  COLLEGES,
  DAYS,
  INTERESTS,
  hasBackend,
  reasonMessage,
  submitSignup,
  validateEmail,
  validateMany,
  validateName,
  validateOne,
} from "../lib/join";
import { upcoming, formatEventTimeRange, rsvpLabel } from "../lib/events";
import { track } from "../lib/analytics";
import { ArrowRightIcon } from "./Icons";

/**
 * The interest form, posted to Supabase. Lives on /join.
 *
 * Presented one question per screen in the manner of a Typeform, because that
 * is what it replaces: the club ran this as Typeform RH9sxEqE for a term and
 * this flow is the same six screens on the club's own domain, with the answers
 * landing in a table the board owns.
 *
 * IT IS THE SIBLING OF WorkshopForm.jsx, deliberately and closely. The step
 * mechanics, the focus rules, the honeypot, the nav chevrons and the progress
 * rail are the same, and the two share the whole .pf-* block in index.css. Read
 * that file's header for why each of those works the way it does; the notes
 * here cover only what is different, which is:
 *
 *   - Four of the six questions are choices rather than text, so this flow
 *     renders radio and checkbox groups. Those reuse the .choice / .choices
 *     block that BallotQuestion.jsx already established, rather than inventing
 *     a second choice control in the same codebase.
 *   - It writes to Supabase rather than posting to Web3Forms, so the blocked
 *     state is `hasBackend` rather than an access key, and a rejection comes
 *     back as a `reason` to be mapped rather than as an HTTP status.
 *   - The ending screen is not a thank-you. It hands the reader the next thing
 *     to do, which is the info session, read live from the calendar.
 */

/* -------------------------------------------------------------------------- *
 * The six questions.
 *
 * `name` is both the state key and the field id. `choices` makes a step a
 * choice step; `multi` makes that choice a checkbox group. Everything else is
 * a text field.
 * -------------------------------------------------------------------------- */

const STEPS = [
  {
    name: "name",
    question: "What's your name?",
    hint: "First and last is great.",
    type: "text",
    autoComplete: "name",
    validate: validateName,
  },
  {
    name: "email",
    question: "What's your Northeastern email?",
    // Names all three domains the regex accepts. WorkshopForm's hint names only
    // two, which is wrong for a neu.edu student.
    hint: "Use your northeastern.edu, husky.neu.edu or neu.edu address so we can add you to the list.",
    type: "email",
    autoComplete: "email",
    validate: validateEmail,
  },
  {
    name: "year",
    question: "What year are you?",
    hint: "Go by the year you are in, not your credit count. Time on co-op counts.",
    choices: YEARS,
    validate: (v) => validateOne(v, "Pick the year you are in."),
  },
  {
    name: "colleges",
    question: "What Northeastern college are you in?",
    hint: "Pick both if your major spans two colleges. Explore counts if you have not declared.",
    choices: COLLEGES,
    multi: true,
    validate: (v) =>
      validateMany(v, "Pick at least one, or Something else if none fit."),
  },
  {
    name: "days",
    question: "Which days usually work best for you to meet?",
    hint: "Pick as many as you like. We schedule around whatever gets the most votes.",
    choices: DAYS,
    multi: true,
    validate: (v) => validateMany(v, "Pick at least one day."),
  },
  {
    name: "interests",
    question: "What do you want to see from the club?",
    hint: "Pick as many as you like. This is what we plan the semester around.",
    choices: INTERESTS,
    multi: true,
    validate: (v) =>
      validateMany(v, "Pick at least one thing you would come for."),
  },
];

const TOTAL = STEPS.length;

const EMPTY = {
  name: "",
  email: "",
  year: "",
  colleges: [],
  days: [],
  interests: [],
};

const Chevron = ({ up }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {up ? (
      <polyline points="6,15 12,9 18,15" />
    ) : (
      <polyline points="6,9 12,15 18,9" />
    )}
  </svg>
);

/** Bottom-right step controls. Up goes back, down validates and advances. */
const NavButtons = ({ onBack, onNext, disabled }) => (
  <div className="pf-nav">
    <button
      type="button"
      className="pf-navbtn"
      onClick={onBack}
      disabled={disabled}
      aria-label="Previous question"
    >
      <Chevron up />
    </button>
    <button
      type="button"
      className="pf-navbtn"
      onClick={onNext}
      disabled={disabled}
      aria-label="Next question"
    >
      <Chevron />
    </button>
  </div>
);

/**
 * A choice question.
 *
 * MARKUP, and the reasoning, because this is the part that is easy to get
 * subtly wrong:
 *
 * A <fieldset> groups the options so a screen reader announces "Monday, radio
 * button, 1 of 6" rather than six unattached controls. It carries NO <legend>.
 * The question is already the page's <h1 id="pf-question">, and the fieldset
 * takes its accessible name from that id, so the question is announced once,
 * on entry, and the prerendered heading is left alone. A visually hidden legend
 * would double-read it; a legend wrapping the h1 would put the page's largest
 * type inside the one element this codebase has already recorded as unreliable
 * to lay out (see BallotQuestion.jsx).
 *
 * The grid goes on an inner div rather than the fieldset for the same family of
 * reason, and `min-width: 0` is not cosmetic: a fieldset carries a UA
 * `min-width: min-content`, so without it "Speaker talks from industry leaders"
 * refuses to wrap and pushes the flow sideways.
 *
 * Real <input type="radio"> and <input type="checkbox"> rather than buttons
 * with ARIA. That buys arrow-key selection with wrap-around, Home and End,
 * Space to toggle, roving tabindex and the checked state reaching the
 * accessibility tree, all of it native, none of it ours to keep in sync.
 */
const ChoiceStep = ({ step, value, onChange, describedBy, firstRef }) => {
  const multi = Boolean(step.multi);
  const selected = multi ? value || [] : value;

  const toggle = (key) => {
    if (!multi) {
      onChange(key);
      return;
    }
    const set = new Set(selected);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    // Preserve option order rather than click order: a multi-select carries no
    // ranking, and a stable order keeps the stored answer diffable. Same rule
    // as BallotQuestion's Choice.
    onChange(step.choices.filter((o) => set.has(o.value)).map((o) => o.value));
  };

  return (
    <fieldset
      className="pf-fieldset"
      aria-labelledby="pf-question"
      aria-describedby={describedBy}
    >
      <div className="choices">
        {step.choices.map((option, i) => {
          const isOn = multi
            ? selected.includes(option.value)
            : selected === option.value;
          return (
            <label
              key={option.value}
              className={`choice${isOn ? " choice--on" : ""}`}
            >
              <input
                ref={i === 0 ? firstRef : undefined}
                type={multi ? "checkbox" : "radio"}
                name={step.name}
                value={option.value}
                checked={isOn}
                onChange={() => toggle(option.value)}
                className="choice__input"
              />
              <span className="choice__mark" aria-hidden="true" />
              <span className="choice__label">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

const JoinForm = () => {
  const [index, setIndex] = useState(-1); // -1 is the welcome screen
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [serverError, setServerError] = useState("");
  const [direction, setDirection] = useState("next");
  const [moved, setMoved] = useState(false);

  const fieldRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);
  const botRef = useRef(null);

  const step = STEPS[index];
  const isLast = index === TOTAL - 1;
  const sending = status === "sending";

  /**
   * The next thing to do after signing up, read from the calendar rather than
   * written down here. The info session is preferred by name; failing that the
   * next event of any kind, because a printed QR code outlives the day it was
   * printed for and a real upcoming event beats a dead link to a past one.
   *
   * Build-time data, so this is resolved during the prerender and the ending
   * screen ships in the HTML. `upcoming()` reads `new Date()` at call time,
   * which during the prerender is the build clock; the site rebuilds hourly
   * from the calendar, so it does not drift.
   */
  const nextEvent = useMemo(() => {
    const events = upcoming();
    return (
      events.find((e) => /info\s*session/i.test(e.title || "")) ||
      events[0] ||
      null
    );
  }, []);

  // Move focus to whatever the new screen is asking for. Gated on `moved` so
  // the first paint leaves the page alone: stealing focus on load would scroll
  // the page and fight a screen reader reading the welcome screen.
  useEffect(() => {
    if (!moved) return;
    if (status === "sent") {
      endRef.current?.focus();
      return;
    }
    if (index === -1) {
      startRef.current?.focus();
      return;
    }
    fieldRef.current?.focus();
  }, [index, status, moved]);

  const setValue = (next) => {
    setValues((v) => ({ ...v, [step.name]: next }));
    if (error) setError("");
  };

  function goBack() {
    if (index < 0 || sending) return;
    setError("");
    setDirection("back");
    setMoved(true);
    setIndex(index - 1);
  }

  function goNext() {
    if (sending) return;
    const message = step.validate(values[step.name]);
    if (message) {
      setError(message);
      fieldRef.current?.focus();
      return;
    }
    setError("");
    setDirection("next");
    setMoved(true);
    if (isLast) {
      send();
      return;
    }
    setIndex(index + 1);
  }

  function start() {
    setDirection("next");
    setMoved(true);
    setIndex(0);
  }

  async function send() {
    setStatus("sending");
    setServerError("");
    try {
      await submitSignup(values, { botcheck: botRef.current?.checked });
      setStatus("sent");
      // The conversion event, fired on a CONFIRMED write and nowhere else.
      // lib/analytics.js used to fire this from the click that left for
      // Typeform, because that was the last thing the site could see. It can
      // see the actual outcome now, so this counts signups rather than
      // intentions. No answer is sent with it: the whole point of the roster
      // living in Supabase is that it does not also go to Google.
      track("email_signup", { location: window.location.pathname });
    } catch (err) {
      setStatus("error");
      // `reason` means the database considered the answers and refused them, so
      // there is something specific to say and a field to say it about.
      // Anything else is a transport or configuration failure, and the honest
      // message does NOT name a cause: this branch catches an unreachable
      // server, a 500, and a schema that has not had signups.sql run against it
      // yet, and telling somebody to check their connection when the connection
      // is fine sends them to fix the one thing that is not broken.
      setServerError(
        err?.reason
          ? reasonMessage(err.reason)
          : "That did not go through. Try again in a moment."
      );
    }
  }

  /* --- Blocked: no backend, so the flow would collect six answers and then
         drop them. Say so rather than pretending. Mirrors the shape of
         WorkshopForm's missing-access-key screen and CheckInForm's. -------- */
  if (!hasBackend) {
    return (
      <div className="pf-step">
        <h1 className="pf-title">Sign-ups are by email for now.</h1>
        <p className="pf-lead">
          The form is not connected yet. Email the board at{" "}
          <a href="mailto:claudebuildersclubneu@gmail.com">
            claudebuildersclubneu@gmail.com
          </a>{" "}
          and we will add you to the list by hand.
        </p>
        <div className="pf-actions">
          <Link className="btn btn--primary" to="/events">
            See what is coming up
          </Link>
        </div>
      </div>
    );
  }

  /* --- The ending. Not a thank-you screen: the next thing to do. ---------- */
  if (status === "sent") {
    const rsvp = nextEvent?.rsvpUrl || "";
    const label = rsvpLabel(rsvp);
    return (
      <div className="pf-step pf-step--next">
        <h1 className="pf-title" tabIndex={-1} ref={endRef}>
          You&apos;re on the list.
        </h1>

        {nextEvent ? (
          <>
            <p className="pf-lead">
              Come and meet us. {nextEvent.title} is on{" "}
              {new Date(nextEvent.start).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              , {formatEventTimeRange(nextEvent)}
              {nextEvent.location ? `, ${nextEvent.location}` : ""}.
            </p>
            <div className="pf-actions">
              {rsvp && (
                <a
                  className="btn btn--primary"
                  href={rsvp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label.full} <ArrowRightIcon width={16} height={16} />
                </a>
              )}
              <Link className="btn btn--secondary" to="/events">
                See the full calendar
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="pf-lead">
              We will email you before the first meeting. Nothing is on the
              calendar just yet.
            </p>
            <div className="pf-actions">
              <Link className="btn btn--primary" to="/events">
                See the full calendar
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }

  if (index === -1) {
    return (
      <div className={`pf-step${moved ? " pf-step--back" : ""}`}>
        <h1 className="pf-title">Let&apos;s get you on the list.</h1>
        <p className="pf-lead">
          This is the whole sign-up. Answer six questions and we will build the
          semester around your answers.
        </p>
        <div className="pf-actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={start}
            ref={startRef}
          >
            Start
          </button>
          <span className="pf-kbd">Takes about thirty seconds</span>
        </div>
      </div>
    );
  }

  const isChoice = Boolean(step.choices);

  const describedBy = [
    error ? "pf-error" : null,
    step.hint ? "pf-hint" : null,
    "pf-count",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <form
        className="pf-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          goNext();
        }}
      >
        {/* Honeypot. Hidden from sight and from assistive tech, and outside the
            keyed step so it is not remounted on every question. */}
        <input
          type="checkbox"
          name="botcheck"
          ref={botRef}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ display: "none" }}
        />

        {/* The key remounts the screen, which is what replays the step
            transition. `moved` keeps it off the first paint. */}
        <div
          key={step.name}
          className={`pf-step${moved ? ` pf-step--${direction}` : ""}`}
        >
          <h1 id="pf-question" className="pf-question">
            <span className="pf-num" aria-hidden="true">
              {index + 1}
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                <line x1="4" y1="12" x2="18" y2="12" />
                <polyline points="12,6 18,12 12,18" />
              </svg>
            </span>
            {step.question}
          </h1>

          {step.hint && (
            <p id="pf-hint" className="pf-hint">
              {step.hint}
            </p>
          )}

          <p id="pf-count" className="sr-only">
            Question {index + 1} of {TOTAL}
          </p>

          {isChoice ? (
            <ChoiceStep
              step={step}
              value={values[step.name]}
              onChange={setValue}
              describedBy={describedBy}
              firstRef={fieldRef}
            />
          ) : (
            <input
              id={`pf-${step.name}`}
              name={step.name}
              ref={fieldRef}
              className="pf-input"
              type={step.type}
              autoComplete={step.autoComplete}
              value={values[step.name]}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type your answer here"
              aria-labelledby="pf-question"
              aria-describedby={describedBy}
              aria-invalid={error ? "true" : undefined}
              /* Enter advances. A lone text input inside a form with a submit
                 button already does this natively, but implicit submission is
                 inconsistent from on-screen keyboards, so it is made explicit.
                 preventDefault suppresses the native path, so this cannot
                 double-fire. Not bound on a choice step: Enter there is the
                 form's own submit, and a radio group needs its arrow keys. */
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  goNext();
                }
              }}
            />
          )}

          {error && (
            <p id="pf-error" className="pf-error" role="alert">
              {error}
            </p>
          )}

          {status === "error" && (
            <p className="pf-error" role="alert">
              {serverError}
            </p>
          )}

          <div className="pf-actions">
            <button type="submit" className="btn btn--primary" disabled={sending}>
              {isLast
                ? sending
                  ? "Signing you up…"
                  : "Join the club"
                : "OK"}
            </button>
            <span className="pf-kbd">
              {isChoice
                ? step.multi
                  ? "pick as many as you like"
                  : "arrow keys to choose"
                : "press Enter"}
            </span>
          </div>
        </div>
      </form>

      <NavButtons onBack={goBack} onNext={goNext} disabled={sending} />

      <div
        className="pf-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL}
        aria-valuenow={index}
        aria-valuetext={`Question ${index + 1} of ${TOTAL}`}
        aria-label="Progress"
      >
        <div
          className="pf-progress__fill"
          style={{ transform: `scaleX(${index / TOTAL})` }}
        />
      </div>
    </>
  );
};

export default JoinForm;
