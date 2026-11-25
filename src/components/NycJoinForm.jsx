import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MAJORS,
  MEETING_MONTHS,
  WEEKDAYS,
  hasBackend,
  reasonMessage,
  submitNycSignup,
  validateEmail,
  validateMany,
  validateName,
  validateOne,
} from "../lib/nycJoin";
import { track } from "../lib/analytics";
import { ChoiceStep, NavButtons } from "./JoinForm";

/**
 * The NYC campus interest form. Lives on /join/nyc.
 *
 * Same one-question-per-screen flow as JoinForm.jsx and the same .pf-* styles,
 * so the two read as one product. The step mechanics are the same; what
 * differs is the five questions (from the board's NYC interest form spec), the
 * backend call (submit_nyc_signup, a separate table), and the copy. The Boston
 * form is not changed by any of this; it only lends its ChoiceStep and
 * NavButtons.
 */

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
    question: "What's your email?",
    hint: "Whichever address you check. We'll use it to invite you to the first NYC meeting.",
    type: "email",
    autoComplete: "email",
    validate: validateEmail,
  },
  {
    name: "major",
    question: "What's your major?",
    hint: "Pick the closest one. Other is a real answer.",
    choices: MAJORS,
    validate: (v) => validateOne(v, "Pick your major, or Other."),
  },
  {
    name: "month",
    question: "When would you prefer to attend an interest meeting?",
    choices: MEETING_MONTHS,
    validate: (v) => validateOne(v, "Pick a month, or Either works."),
  },
  {
    name: "days",
    question: "What days work best for you to meet?",
    hint: "Select all that apply.",
    choices: WEEKDAYS,
    multi: true,
    validate: (v) => validateMany(v, "Pick at least one day."),
  },
];

const TOTAL = STEPS.length;

const EMPTY = { name: "", email: "", major: "", month: "", days: [] };

const NycJoinForm = () => {
  const [index, setIndex] = useState(-1);
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
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

  useEffect(() => {
    if (!moved) return;
    if (status === "sent") return endRef.current?.focus();
    if (index === -1) return startRef.current?.focus();
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
    // Honeypot ticked: act as if it worked and write nothing.
    if (botRef.current?.checked) {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    setServerError("");
    try {
      await submitNycSignup(values);
      setStatus("sent");
      track("nyc_signup", { location: window.location.pathname });
    } catch (err) {
      setStatus("error");
      setServerError(
        err?.reason
          ? reasonMessage(err.reason)
          : "That did not go through. Try again in a moment."
      );
    }
  }

  if (!hasBackend) {
    return (
      <div className="pf-step">
        <h1 className="pf-title">NYC sign-ups are by email for now.</h1>
        <p className="pf-lead">
          The form is not connected yet. Email the board at{" "}
          <a href="mailto:claudebuildersclubneu@gmail.com">
            claudebuildersclubneu@gmail.com
          </a>{" "}
          and say you&apos;re interested in the NYC campus.
        </p>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="pf-step pf-step--next">
        <h1 className="pf-title" tabIndex={-1} ref={endRef}>
          You&apos;re on the NYC list.
        </h1>
        <p className="pf-lead">
          We&apos;ll email you when the first NYC interest meeting is set. Until
          then, see what the club is up to.
        </p>
        <div className="pf-actions">
          <Link className="btn btn--primary" to="/events">
            See the calendar
          </Link>
          <Link className="btn btn--secondary" to="/">
            Back to the homepage
          </Link>
        </div>
      </div>
    );
  }

  if (index === -1) {
    return (
      <div className={`pf-step${moved ? " pf-step--back" : ""}`}>
        <p className="pf-eyebrow-nyc">NYC campus</p>
        <h1 className="pf-title">Claude Builders Club is coming to New York.</h1>
        <p className="pf-lead">
          We&apos;re starting a branch at Northeastern&apos;s NYC campus. Answer
          five quick questions and we&apos;ll invite you to the first interest
          meeting.
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
        <input
          type="checkbox"
          name="botcheck"
          ref={botRef}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ display: "none" }}
        />

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
              {isLast ? (sending ? "Sending…" : "Count me in") : "OK"}
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

export default NycJoinForm;
