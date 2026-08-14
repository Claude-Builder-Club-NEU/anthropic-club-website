import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { INTEREST_FORM } from "../lib/links";

/**
 * Workshop pitch flow, posted to Web3Forms. Lives on /events/pitch.
 *
 * Presented one question per screen in the manner of a Typeform, which is what
 * this surface was asked for. The mechanics that make that pattern work rather
 * than merely look right:
 *
 * - Each screen is a real <form> with a submit button, so Enter advances for
 *   free and no key handler is needed on single-line fields. The long answer
 *   keeps Enter for newlines and takes Ctrl or Cmd plus Enter instead.
 * - Focus moves to the field on every step change, but never on first paint:
 *   stealing focus on load would scroll the page and fight a screen reader
 *   reading the welcome screen. `moved` gates it.
 * - The field is labelled by the question heading, so moving focus there is
 *   what announces the new question. No live region, and so no double-read.
 *
 * BLOCKED (revision 2, §6.2): the access key comes from VITE_WEB3FORMS_KEY and
 * is never hardcoded. Until it is set the flow does not render at all and the
 * page routes people to the general interest form, rather than walking someone
 * through five questions and then failing to send them.
 *
 * Spam handling uses Web3Forms' own honeypot field, `botcheck`. It is visually
 * hidden and hidden from assistive tech; a submission with it filled is
 * discarded server-side. It sits outside the keyed step so it survives every
 * step change.
 */

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "";
const ENDPOINT = "https://api.web3forms.com/submit";

/**
 * Anchored at both ends. The previous version tested only the suffix, so
 * "someone@gmail.com.jordan@northeastern.edu" satisfied it. The form sets
 * noValidate, so the browser's own type="email" check does not run and this is
 * the only gate the address passes through.
 */
const NEU_EMAIL = /^[^\s@]+@(northeastern\.edu|husky\.neu\.edu|neu\.edu)$/i;

const STEPS = [
  {
    name: "name",
    question: "What's your name?",
    type: "text",
    autoComplete: "name",
    validate: (v) => (v.trim() ? "" : "Please tell us your name."),
  },
  {
    name: "email",
    question: "What's your Northeastern email?",
    hint: "Use your northeastern.edu or husky.neu.edu address.",
    type: "email",
    autoComplete: "email",
    validate: (v) => {
      if (!v.trim()) return "Please add your email.";
      if (!NEU_EMAIL.test(v.trim())) return "Please use a Northeastern address.";
      return "";
    },
  },
  {
    name: "topic",
    question: "What would the workshop be about?",
    hint: "One line is enough. Something like building a Discord bot with Claude.",
    type: "text",
    validate: (v) => (v.trim() ? "" : "What would the workshop cover?"),
  },
  {
    name: "timeframe",
    question: "Roughly when were you thinking?",
    hint: "A month or a week is fine. It does not have to be exact.",
    type: "text",
    validate: (v) => (v.trim() ? "" : "Roughly when were you thinking?"),
  },
  {
    name: "description",
    question: "What would you cover?",
    hint: "A sentence or two is plenty. Say what someone would walk out able to do.",
    long: true,
    validate: (v) => {
      if (!v.trim()) return "A sentence or two is plenty.";
      if (v.trim().length > 600) return "Please keep this under 600 characters.";
      return "";
    },
  },
];

const TOTAL = STEPS.length;
const EMPTY = { name: "", email: "", topic: "", timeframe: "", description: "" };

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
const NavButtons = ({ onBack, onNext, backDisabled, nextDisabled }) => (
  <div className="pf-nav">
    <button
      type="button"
      className="pf-navbtn"
      onClick={onBack}
      disabled={backDisabled}
      aria-label="Previous question"
    >
      <Chevron up />
    </button>
    <button
      type="button"
      className="pf-navbtn"
      onClick={onNext}
      disabled={nextDisabled}
      aria-label="Next question"
    >
      <Chevron />
    </button>
  </div>
);

const WorkshopForm = () => {
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

  // Move focus to whatever the new screen is asking for. Gated on `moved` so
  // the first paint leaves the page alone.
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

  const setValue = (e) => {
    const { value } = e.target;
    setValues((v) => ({ ...v, [step.name]: value }));
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

  function restart() {
    setValues(EMPTY);
    setError("");
    setServerError("");
    setStatus("idle");
    setDirection("next");
    setMoved(true);
    setIndex(0);
  }

  async function send() {
    setStatus("sending");
    setServerError("");

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `Workshop pitch: ${values.topic}`,
          from_name: "Claude Builders Club website",
          botcheck: botRef.current?.checked ? "true" : "",
          ...values,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setStatus("sent");
      } else {
        setStatus("error");
        setServerError(
          data.message || "Something went wrong on our end. Please try again."
        );
      }
    } catch {
      setStatus("error");
      setServerError(
        "We could not reach the server. Check your connection and try again."
      );
    }
  }

  /* --- Blocked: no access key, so the flow would collect five answers and
         then drop them. Route to the interest form instead. --------------- */
  if (!ACCESS_KEY) {
    return (
      <div className="pf-step">
        <h1 className="pf-title">Pitches are open by email for now.</h1>
        <p className="pf-lead">
          Tell us what you want to run through the interest form and one of the
          board will get back to you about scheduling it.
        </p>
        <div className="pf-actions">
          <a
            className="btn btn--primary"
            href={INTEREST_FORM}
            target="_blank"
            rel="noopener noreferrer"
          >
            Pitch a workshop
          </a>
          <Link className="btn btn--secondary" to="/events">
            Back to workshops
          </Link>
        </div>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="pf-step pf-step--next">
        <h1 className="pf-title" tabIndex={-1} ref={endRef}>
          Got it. Thank you.
        </h1>
        <p className="pf-lead">
          One of the board will email you about scheduling it.
        </p>
        <div className="pf-actions">
          <Link className="btn btn--primary" to="/events">
            Back to workshops
          </Link>
          <button type="button" className="btn btn--secondary" onClick={restart}>
            Pitch another
          </button>
        </div>
      </div>
    );
  }

  if (index === -1) {
    return (
      <div className={`pf-step${moved ? " pf-step--back" : ""}`}>
        <h1 className="pf-title">Want to run a workshop?</h1>
        <p className="pf-lead">
          If you can build something in an hour, you can teach it. Answer five
          questions and we&apos;ll handle the room, the promotion, and the
          turnout.
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
          <span className="pf-kbd">Takes about two minutes</span>
        </div>
      </div>
    );
  }

  const describedBy = [
    error ? "pf-error" : null,
    step.hint ? "pf-hint" : null,
    "pf-count",
  ]
    .filter(Boolean)
    .join(" ");

  const fieldProps = {
    id: `pf-${step.name}`,
    name: step.name,
    ref: fieldRef,
    className: "pf-input",
    value: values[step.name],
    onChange: setValue,
    placeholder: "Type your answer here",
    "aria-labelledby": "pf-question",
    "aria-describedby": describedBy,
    "aria-invalid": error ? "true" : undefined,
  };

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

          {step.long ? (
            <textarea {...fieldProps} rows={3} maxLength={600} />
          ) : (
            <input
              {...fieldProps}
              type={step.type}
              autoComplete={step.autoComplete}
              /* Enter advances. A lone text input inside a form with a submit
                 button already does this natively, but implicit submission is
                 inconsistent from on-screen keyboards, so it is made explicit.
                 preventDefault suppresses the native path, so this cannot
                 double-fire. */
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
              {isLast ? (sending ? "Sending…" : "Submit") : "OK"}
            </button>
            <span className="pf-kbd">
              {step.long ? "press Ctrl + Enter" : "press Enter"}
            </span>
          </div>
        </div>
      </form>

      {/* A long answer keeps Enter for newlines, so it gets the modifier
          instead. Bound on the field rather than the window so it can never
          swallow a keystroke meant for something else. */}
      {step.long && (
        <KeyboardSubmit target={fieldRef} onSubmit={goNext} />
      )}

      <NavButtons
        onBack={goBack}
        onNext={goNext}
        backDisabled={sending}
        nextDisabled={sending}
      />

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

/**
 * Ctrl or Cmd plus Enter on the long answer. A component rather than an inline
 * effect so the listener is attached and torn down with the field it belongs
 * to, which is the only element that should respond to it.
 */
const KeyboardSubmit = ({ target, onSubmit }) => {
  useEffect(() => {
    const el = target.current;
    if (!el) return undefined;
    const onKey = (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onSubmit();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [target, onSubmit]);
  return null;
};

export default WorkshopForm;
