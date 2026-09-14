import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  KINDS,
  PITCH_MAX,
  REACH,
  hasBackend,
  normalizeEmail,
  reasonMessage,
  submitFeature,
  validateEmail,
  validateLink,
  validateMany,
  validateName,
  validateOne,
  validatePitch,
} from "../lib/feature";

/**
 * The get-featured flow, posted to Supabase. Lives on /featureme.
 *
 * IT IS JoinForm.jsx, ONE QUESTION AT A TIME, AND THAT IS DELIBERATE. This is
 * the same kind of surface as /join: one task, six questions, a terminal
 * ending. The club now has three of these flows and the whole value of the
 * third one is that it behaves exactly like the first two, so a member who has
 * already filled in the interest form knows what the chevrons do, what the rail
 * at the bottom means, and that Enter advances. The step mechanics, the focus
 * rules, the honeypot, the nav chevrons and the progress rail are JoinForm's,
 * and the whole .pf-* block in index.css is shared with it. Read JoinForm's
 * header, and WorkshopForm's before it, for why each of those works the way it
 * does. What follows covers only what is different here.
 *
 * WHY THE SMALL PIECES ARE COPIED RATHER THAN SHARED. Chevron, NavButtons and
 * ChoiceStep are near-copies of JoinForm's, which are themselves near-copies of
 * WorkshopForm's. Extracting one shared set is the obvious tidy-up and it is
 * deliberately not done here: it is a change to three components at once, two
 * of which are shipped and working, in a change whose actual job is to add a
 * page. Somebody should do it, in its own commit, with all three on screen.
 * Until then the duplication is visible and cheap; a half-done extraction that
 * only two of the three use would be neither.
 *
 * THREE THINGS ARE GENUINELY NEW, and each is noted where it happens:
 *
 *   - A long answer. The pitch is up to 600 characters, so that step is a
 *     textarea and takes Ctrl or Cmd plus Enter, the way WorkshopForm's
 *     description step does. It carries a quiet character count and NO
 *     maxLength; see the note above the counter for why truncating silently
 *     was refused.
 *   - An optional answer. The link may be left blank, which validateLink()
 *     signals by returning "" for an empty value, so the ordinary "advance when
 *     the validator is happy" path already handles it and nothing special is
 *     needed beyond telling the reader it is optional.
 *   - A status live region. The send is the one moment where the screen changes
 *     without the reader having moved, so it is announced. See the note on the
 *     region itself for why it announces only "sending" and leaves the outcome
 *     to the alert and the focus move.
 *
 * NOTHING IS TRACKED. lib/analytics.js has a fixed event vocabulary and
 * `email_signup` is its one conversion, fired by /join on a confirmed write.
 * A feature request is not a signup and inventing an event name here would put
 * a seventh event into a list that file documents in its header. If the board
 * wants the count, the rows are in Supabase and the officer queries are at the
 * foot of supabase/features.sql.
 */

/* -------------------------------------------------------------------------- *
 * The six questions.
 *
 * The order is the order lib/feature.js's header sets out, and the one thing
 * worth defending in it is that the OPTIONAL link comes AFTER the required
 * pitch. A reader with nothing to paste, which is most first-time builders,
 * meets the field they can skip only once they have already said the thing the
 * board decides on. The other way round, the first question about the work
 * itself is one they have to decline.
 *
 * `name` is both the state key and the field id. `choices` makes a step a
 * choice step; `multi` makes that choice a checkbox group; `long` makes it a
 * textarea. Everything else is a text field.
 *
 * The validators are lib/feature.js's, never retyped, and the messages they
 * carry for the two choice steps are word for word the ones submit_feature()
 * returns as `kind_required` and `reach_required`. The reader sees one sentence
 * whichever of the two gates catches them.
 * -------------------------------------------------------------------------- */

const STEPS = [
  {
    name: "name",
    question: "What's your name?",
    // JoinForm's question and JoinForm's hint, word for word, because it is
    // JoinForm's field: same validator, same CSV guard, same 120 characters.
    hint: "First and last is great.",
    type: "text",
    autoComplete: "name",
    validate: validateName,
  },
  {
    name: "email",
    question: "What's your Northeastern email?",
    // Names all three domains the regex accepts, matching /join. The second
    // sentence is this form's own: on /join the address goes on a list, here it
    // is the channel the answer comes back on, and that is worth saying.
    hint: "Use your northeastern.edu, husky.neu.edu or neu.edu address. This is where we write back.",
    type: "email",
    autoComplete: "email",
    validate: validateEmail,
  },
  {
    name: "kind",
    question: "What are you asking for?",
    hint: "Pick one. The board fits it to whichever issue is next, so either one is a real answer.",
    choices: KINDS,
    validate: (v) => validateOne(v, "Pick an interview, a project, or either one."),
  },
  {
    name: "pitch",
    question: "What is it about?",
    hint: "A sentence or two. If you built something, say what it does. If it is an interview, say what you would talk about. Up to 600 characters.",
    long: true,
    validate: validatePitch,
  },
  {
    name: "link",
    question: "Anything we can look at?",
    hint: "Optional. A repo, a demo, a deck, a post. Paste the whole link, starting with https://, or leave this blank.",
    type: "url",
    // Not autoComplete="url": the browser's stored value there is the person's
    // own home page, which is almost never the thing they are pitching, and an
    // autofilled wrong link is worse than an empty field.
    autoComplete: "off",
    placeholder: "https://",
    optional: true,
    validate: validateLink,
  },
  {
    name: "reach",
    question: "How should we reach you?",
    hint: "Pick as many as you like. Whoever picks this up will use one of these to book a time.",
    choices: REACH,
    multi: true,
    validate: (v) => validateMany(v, "Pick at least one way to reach you."),
  },
];

const TOTAL = STEPS.length;

const EMPTY = {
  name: "",
  email: "",
  kind: "",
  pitch: "",
  link: "",
  reach: [],
};

/**
 * When the character count appears.
 *
 * Silent for an ordinary answer, on screen for the last hundred characters,
 * which is the only stretch where knowing the number changes what you type.
 * A count that is always showing turns a two-sentence answer into a budget.
 */
const COUNT_FROM = PITCH_MAX - 100;

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
 * A choice question. JoinForm's ChoiceStep, and the reasoning in its header
 * applies here unchanged, so it is not restated: a <fieldset> with no <legend>
 * taking its accessible name from the question's own id, the grid on an inner
 * div, `min-width: 0` so a long option wraps instead of pushing the flow
 * sideways, and real radio and checkbox inputs rather than buttons with ARIA.
 *
 * The one thing to keep in step with that file: option order is preserved
 * rather than click order, so the stored answer is diffable and two people who
 * picked the same two channels store the same array.
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

const FeatureForm = () => {
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
  // the first paint leaves the page alone: stealing focus on load would scroll
  // the page and fight a screen reader reading the welcome screen, which on
  // this route is also the whole of the prerendered HTML.
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
    // A failed send leaves its message on screen. Typing is the reader acting
    // on it, so the message goes; the answers do not.
    if (serverError) setServerError("");
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

  /**
   * Send it.
   *
   * NOTHING IS CLEARED, ON ANY PATH. `values` is untouched by a failure, so a
   * flaky network costs a second press of the button and not six answers
   * retyped. That is the failure mode this flow is designed against: the reader
   * has already written a paragraph by the time this runs, and a form that
   * empties itself on a 500 is a form they do not fill in twice.
   *
   * NO AbortSignal, although submitFeature() accepts one. Aborting the write on
   * unmount is the usual hygiene and it is wrong here: the request may already
   * have committed the row, so cancelling it would only lose our knowledge of a
   * submission that happened. The one thing worse than a failed send is a
   * successful one nobody is told about.
   */
  async function send() {
    setStatus("sending");
    setServerError("");
    try {
      await submitFeature(values, { botcheck: botRef.current?.checked });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      // `reason` means the database considered the answers and refused them, so
      // there is something specific to say. Anything else is transport or
      // configuration and the honest message does NOT name a cause: this branch
      // catches an unreachable server, a 500, and a project that has had
      // schema.sql run but not features.sql, and telling somebody to check
      // their connection when the connection is fine sends them to fix the one
      // thing that is not broken. reasonMessage() maps the key; the raw value
      // never reaches the screen.
      setServerError(
        err?.reason
          ? reasonMessage(err.reason)
          : "That did not go through. Try again in a moment."
      );
    }
  }

  /* --- Blocked: no backend, so the flow would collect six answers and then
         drop them. Say so rather than pretending, the same call Ballot.jsx
         makes for a poll with no credentials and JoinForm for a signup.

         hasBackend only reports that the URL and the key are set. It cannot
         know whether supabase/features.sql has been run, so a configured
         project with no submit_feature() function still fails, and it fails
         through the catch above rather than here. That is the right split: this
         screen is for a build that was never wired up, and the generic retry
         line is for a wired-up build that broke. ---------------------------- */
  if (!hasBackend) {
    return (
      <div className="pf-step">
        <h1 className="pf-title">Features are by email for now.</h1>
        <p className="pf-lead">
          The form is not connected yet. Email the board at{" "}
          <a href="mailto:claudebuildersclubneu@gmail.com">
            claudebuildersclubneu@gmail.com
          </a>{" "}
          with what you built or what you would talk about, and we will pick it
          up from there.
        </p>
        <div className="pf-actions">
          <Link className="btn btn--primary" to="/blog">
            Read the blog
          </Link>
        </div>
      </div>
    );
  }

  /* --- The ending, and it is terminal.
         There is no "send another": a person has one thing to put forward at a
         time, and a button offering to restart a flow that has just finished
         invites a second row for the same pitch, which supabase/features.sql
         records as the honest cost of keying on (email, pitch). Two real ways
         out instead, both real buttons, the way Ballot.jsx's cast screen ends.
         --------------------------------------------------------------------- */
  if (status === "sent") {
    return (
      <div className="pf-step pf-step--next">
        <h1 className="pf-title" tabIndex={-1} ref={endRef}>
          It&apos;s with the board.
        </h1>
        <p className="pf-lead">
          A board member reads every one of these and writes back to{" "}
          {normalizeEmail(values.email)}. If it fits an issue, they will set up
          a time with you.
        </p>
        <div className="pf-actions">
          <Link className="btn btn--primary" to="/blog">
            Read the blog
          </Link>
          <Link className="btn btn--secondary" to="/events">
            See what is coming up
          </Link>
        </div>
      </div>
    );
  }

  /* --- The welcome screen, which is also the whole of the prerendered page.
         It owns the single <h1> and says what the page is for with no
         JavaScript running, because a member arriving from a blog post and a
         crawler arriving from the sitemap both read this and nothing else. ---*/
  if (index === -1) {
    return (
      <div className={`pf-step${moved ? " pf-step--back" : ""}`}>
        <h1 className="pf-title">Want to be in the club blog?</h1>
        <p className="pf-lead">
          The blog runs interviews with members and write-ups of what they
          built. Tell us which one you are after and what it is about. Six
          questions, and a board member reads every one.
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
          <span className="pf-kbd">Takes about a minute</span>
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

  const fieldProps = {
    id: `pf-${step.name}`,
    name: step.name,
    ref: fieldRef,
    className: "pf-input",
    value: values[step.name],
    onChange: (e) => setValue(e.target.value),
    placeholder: step.placeholder || "Type your answer here",
    "aria-labelledby": "pf-question",
    "aria-describedby": describedBy,
    "aria-invalid": error ? "true" : undefined,
  };

  // What validatePitch() counts, so the number on screen and the number the
  // validator objects to are the same number.
  const used = values.pitch.trim().length;

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

        {/* Status, announced.
            The send is the only moment on this surface where the screen changes
            without the reader having moved, so it is the only thing here that
            needs a live region. It announces the SENDING state and nothing
            else: the two outcomes announce themselves already, success by
            moving focus to the ending heading and failure through the
            role="alert" below, and a region that also carried those would read
            each of them twice.

            Outside the keyed step, so it is one region for the life of the
            flow. A live region that is remounted along with its new text is a
            region the screen reader was not watching when the text arrived. */}
        <p className="sr-only" aria-live="polite">
          {sending ? "Sending your request." : ""}
        </p>

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
          ) : step.long ? (
            /* NO maxLength, and that is the decision worth defending here.
               WorkshopForm caps its long answer in the attribute, which means a
               pasted 800-character paragraph is silently cut to 600 and the
               reader is never told which 200 characters went. That is the same
               failure lib/feature.js refuses in normalizeLink(), where an
               unparseable link is handed to the database intact rather than
               quietly deleted. So the ceiling is enforced by validatePitch(),
               which states the next action, and the text the person wrote is
               still in the box for them to trim. */
            <textarea {...fieldProps} rows={3} />
          ) : (
            <input
              {...fieldProps}
              type={step.type}
              autoComplete={step.autoComplete}
              spellCheck={step.type === "url" ? "false" : undefined}
              /* Enter advances. A lone text input inside a form with a submit
                 button already does this natively, but implicit submission is
                 inconsistent from on-screen keyboards, so it is made explicit.
                 preventDefault suppresses the native path, so this cannot
                 double-fire. Not bound on a choice step: Enter there is the
                 form's own submit, and a radio group needs its arrow keys. Not
                 bound on the long answer either, which keeps Enter for
                 newlines and takes the modifier instead. */
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

          {/* Guarded on the message, not on `status`, because setValue() clears
              the message the moment the reader starts acting on it and leaves
              the status alone. Guarding on the status instead would render an
              empty role="alert" from the first keystroke onwards, which is an
              alert with nothing in it announcing itself. */}
          {serverError && (
            <p className="pf-error" role="alert">
              {serverError}
            </p>
          )}

          <div className="pf-actions">
            <button type="submit" className="btn btn--primary" disabled={sending}>
              {isLast ? (sending ? "Sending…" : "Send it") : "OK"}
            </button>

            <span className="pf-kbd">
              {isChoice
                ? step.multi
                  ? "pick as many as you like"
                  : "arrow keys to choose"
                : step.long
                  ? "press Ctrl + Enter"
                  : step.optional
                    ? "optional, press Enter to skip"
                    : "press Enter"}
            </span>

            {/* The count, and it is aria-hidden on purpose. It changes on every
                keystroke, so a live region here would read a number aloud after
                every character typed, which is unusable. The ceiling is given
                to everyone as the last sentence of the hint, on entry to the
                step, and going over it produces the role="alert" above. */}
            {step.long && used > COUNT_FROM && (
              <span className="pf-kbd" aria-hidden="true">
                {PITCH_MAX - used} characters left
              </span>
            )}
          </div>
        </div>
      </form>

      {/* A long answer keeps Enter for newlines, so it gets the modifier
          instead. Bound on the field rather than the window so it can never
          swallow a keystroke meant for something else. */}
      {step.long && <KeyboardSubmit target={fieldRef} onSubmit={goNext} />}

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

/**
 * Ctrl or Cmd plus Enter on the long answer. A component rather than an inline
 * effect so the listener is attached and torn down with the field it belongs
 * to, which is the only element that should respond to it. WorkshopForm's, and
 * the same caveat applies: it is mounted only while the long step is on screen.
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

export default FeatureForm;
