import { useEffect, useRef, useState } from "react";
import {
  CODE_LENGTH,
  checkIn,
  currentSession,
  hasBackend,
  normalizeCode,
  reasonField,
  reasonMessage,
  validate,
} from "../lib/attendance";
import StampCard from "./StampCard";

/**
 * Check-in, mockups 2a-check-in and 2a-stamped.
 *
 * Two states in one component because they are one task: the stamped screen is
 * the result of the form, and routing between them would put a page load
 * between a student pressing a button and seeing whether it worked.
 *
 * IDENTITY: there is no account and no password. The Northeastern email is the
 * key, and the card is simply the check-ins that share it.
 *
 * THE FORM IS REVEALED IN TWO STEPS. The code comes first on its own, and the
 * name and email appear only once six characters are in. Everything on screen
 * at once was three things to read before knowing which one to start with; this
 * way the screen asks for exactly one thing, and the thing it asks for is the
 * one written on the wall in front of the student. The reveal latches, so
 * backspacing a character does not snatch the fields away mid-typing.
 *
 * The six boxes are ONE input, not six. Six inputs with focus-forwarding is the
 * usual approach and it is consistently hostile: paste puts one character in
 * one box, backspace at a boundary does nothing, and a screen reader announces
 * six unlabelled fields. This renders a single field and paints the characters
 * behind it, so paste, autofill, arrow keys and select-all all work because
 * they were never broken.
 */

const CheckInForm = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState({ code: "", name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [result, setResult] = useState(null);
  const [serverError, setServerError] = useState("");
  const [revealed, setRevealed] = useState(false);

  const doneRef = useRef(null);
  const nameRef = useRef(null);

  // Which session the room is in. The name of it still heads the page; only the
  // date/time/room line was dropped, since a student standing in the room does
  // not need to be told which room they are standing in.
  useEffect(() => {
    if (!hasBackend) {
      setLoading(false);
      return undefined;
    }
    const ac = new AbortController();
    currentSession({ signal: ac.signal })
      .then((data) => setSession(data))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  // Move focus to the confirmation heading so the outcome is announced.
  useEffect(() => {
    if (status === "done") doneRef.current?.focus();
  }, [status]);

  // Once the code is complete, reveal the rest and put the caret in it. The
  // latch means it never disappears again.
  useEffect(() => {
    if (!revealed && values.code.length === CODE_LENGTH) {
      setRevealed(true);
      // After paint, so the field exists to receive focus.
      requestAnimationFrame(() => nameRef.current?.focus());
    }
  }, [values.code, revealed]);

  const setField = (field) => (e) => {
    const raw = e.target.value;
    const value = field === "code" ? normalizeCode(raw) : raw;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (serverError) setServerError("");
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;

    const found = validate(values);
    if (Object.keys(found).length) {
      setErrors(found);
      const first = found.code ? "code" : found.name ? "name" : "email";
      document.getElementById(`ci-${first}`)?.focus();
      return;
    }

    setStatus("sending");
    setServerError("");
    try {
      const data = await checkIn(values);
      if (data?.ok) {
        setResult(data);
        setStatus("done");
        return;
      }
      const field = reasonField(data?.reason);
      const message = reasonMessage(data?.reason);
      if (field) setErrors({ [field]: message });
      else setServerError(message);
      setStatus("idle");
      document.getElementById(`ci-${field || "code"}`)?.focus();
    } catch {
      setServerError("We could not reach the server. Try again in a moment.");
      setStatus("error");
    }
  }

  /* --- Not configured --------------------------------------------------- */
  if (!hasBackend) {
    return (
      <div className="checkin__notice">
        <h1 className="checkin__title">Check-in is not switched on yet.</h1>
        <p className="checkin__lead">
          Attendance needs its database credentials set before it can record
          anything. Until then an officer can add you to the session by hand.
        </p>
      </div>
    );
  }

  /* --- Stamped ---------------------------------------------------------- */
  if (status === "done" && result) {
    // Both halves of the line come from one instant. Taking the time from now
    // and the date from the session prints the wrong date either side of
    // midnight, which is the kind of detail someone notices on a screenshot.
    const at = new Date();
    const time = at
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .replace(" ", "")
      .toUpperCase();
    const month = at.toLocaleDateString("en-US", { month: "long" });

    return (
      <div className="checkin checkin--done">
        <p className="checkin__stampline">
          Checked In at {time} on {month} {ordinal(at.getDate())}
        </p>
        <h1 className="checkin__title" tabIndex={-1} ref={doneRef}>
          You&apos;re stamped for {result.session?.title}.
        </h1>
        {/* Echo the address back. A typo caught here is caught while the
            student is still in the room, which is the only time it is cheap. */}
        <p className="checkin__saved">Saved to {result.email}</p>

        <StampCard
          term={termLabel(result.session?.term)}
          name={result.name}
          email={result.email}
          card={result.card}
        />
      </div>
    );
  }

  /* --- Check in --------------------------------------------------------- */
  const sending = status === "sending";
  const boxes = Array.from({ length: CODE_LENGTH }, (_, i) => values.code[i] || "");

  return (
    <div className="checkin">
      <h1 className="checkin__title">
        {loading
          ? "Check in"
          : session
            ? `Check in to ${session.title}`
            : "Check in"}
      </h1>

      <p className="checkin__lead">
        Enter the six characters on the screen at the front of the room. The
        code changes every session.
      </p>

      <form className="checkin__form" noValidate onSubmit={onSubmit}>
        {/* One field, six painted boxes. See the note at the top of the file. */}
        <div className="codefield">
          <label className="sr-only" htmlFor="ci-code">
            Six-character room code
          </label>
          <input
            id="ci-code"
            className="codefield__input"
            value={values.code}
            onChange={setField("code")}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="one-time-code"
            spellCheck="false"
            maxLength={CODE_LENGTH}
            aria-describedby={errors.code ? "ci-code-error" : undefined}
            aria-invalid={errors.code ? "true" : undefined}
          />
          <div className="codefield__boxes" aria-hidden="true">
            {boxes.map((ch, i) => (
              <span
                key={i}
                className={`codebox${
                  i === values.code.length ? " codebox--next" : ""
                }`}
              >
                {ch}
              </span>
            ))}
          </div>
        </div>
        {errors.code && (
          <p id="ci-code-error" className="checkin__error" role="alert">
            {errors.code}
          </p>
        )}

        {/* Step two. Labels are visually hidden rather than removed: the
            placeholder is the visible label, and a placeholder alone leaves a
            screen reader with an unnamed field. */}
        {revealed && (
          <>
            <div className="checkin__fields">
              <div className="field">
                <label className="sr-only" htmlFor="ci-name">
                  Name
                </label>
                <input
                  id="ci-name"
                  ref={nameRef}
                  className="field__input"
                  placeholder="Name"
                  value={values.name}
                  onChange={setField("name")}
                  autoComplete="name"
                  aria-describedby={errors.name ? "ci-name-error" : undefined}
                  aria-invalid={errors.name ? "true" : undefined}
                />
                {errors.name && (
                  <p id="ci-name-error" className="checkin__error" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="field">
                <label className="sr-only" htmlFor="ci-email">
                  Northeastern email
                </label>
                <input
                  id="ci-email"
                  className="field__input field__input--mono"
                  type="email"
                  placeholder="Northeastern email"
                  value={values.email}
                  onChange={setField("email")}
                  autoComplete="email"
                  spellCheck="false"
                  aria-describedby={errors.email ? "ci-email-error" : undefined}
                  aria-invalid={errors.email ? "true" : undefined}
                />
                {errors.email && (
                  <p id="ci-email-error" className="checkin__error" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {serverError && (
              <p className="checkin__error" role="alert">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              className="btn btn--coral checkin__submit"
              disabled={sending}
            >
              {sending ? "Checking in…" : "Check in"}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

/** 1st, 2nd, 3rd, 4th … 21st. The teens are the exception that needs the %100. */
function ordinal(n) {
  const suffixes = ["th", "st", "nd", "rd"];
  const teen = n % 100;
  return `${n}${suffixes[(teen - 20) % 10] || suffixes[teen] || suffixes[0]}`;
}

/** "fall-2026" is what the database stores; "Fall 2026" is what a card shows. */
function termLabel(term) {
  if (!term) return "";
  return term
    .split("-")
    .map((part) => (/^\d+$/.test(part) ? part : part[0].toUpperCase() + part.slice(1)))
    .join(" ");
}

export default CheckInForm;
