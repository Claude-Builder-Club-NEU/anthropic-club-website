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
 * key, and the card is simply the check-ins that share it. The line under the
 * button says so, because a student typing an address into a form is entitled
 * to know what it is for.
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

  const codeRef = useRef(null);
  const doneRef = useRef(null);

  // Which session the room is in. Runs once; a session that starts mid-visit is
  // not worth polling for, and the code itself is the real check anyway.
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

  // Move focus to the confirmation heading so the outcome is announced. Not on
  // first paint: stealing focus on load would fight a screen reader reading the
  // session name.
  useEffect(() => {
    if (status === "done") doneRef.current?.focus();
  }, [status]);

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
      // A refusal, not a failure. Put the message under the field that caused
      // it so the fix is where the eye already is.
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

  /* --- Not configured. Same posture as the pitch form without its access key:
         say what is true rather than render a form that posts into the void. */
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
    // Both halves of the eyebrow come from one instant. Taking the time from
    // now and the date from the session looks identical almost always and then
    // prints "12:05AM · NOV 5" on the sixth, which is the kind of detail
    // someone notices on a screenshot and stops trusting.
    const at = new Date();
    const stampedTime = at
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .replace(" ", "")
      .toUpperCase();
    const stampedDate = at
      .toLocaleDateString("en-US", { month: "short", day: "numeric" })
      .toUpperCase();

    return (
      <div className="checkin checkin--done">
        <p className="checkin__eyebrow">
          Checked in · {stampedTime} · {stampedDate}
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

        <p className="checkin__note">
          Same email next session, same card.
        </p>
      </div>
    );
  }

  /* --- Check in --------------------------------------------------------- */
  const sending = status === "sending";
  const boxes = Array.from({ length: CODE_LENGTH }, (_, i) => values.code[i] || "");

  return (
    <div className="checkin">
      <p className="checkin__eyebrow">
        {loading
          ? "Loading the session"
          : session
            ? sessionMeta(session)
            : "No session open right now"}
      </p>

      <h1 className="checkin__title">
        {session ? `Check in to ${session.title}` : "Check in"}
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
            ref={codeRef}
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

        <div className="checkin__fields">
          <div className="field">
            <label className="field__label" htmlFor="ci-name">
              Name
            </label>
            <input
              id="ci-name"
              className="field__input"
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
            <label className="field__label" htmlFor="ci-email">
              Northeastern email
            </label>
            <input
              id="ci-email"
              className="field__input field__input--mono"
              type="email"
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

        {/* The identity model, said out loud. */}
        <p className="checkin__note">
          No account, no password. Your Northeastern email is the card. Check in
          with the same one every week and the stamps stack up.
        </p>
      </form>
    </div>
  );
};

/** "WORKSHOP · THU NOV 5 · 6:30PM · SNELL 108" */
function sessionMeta(session) {
  const d = new Date(session.starts_at);
  const day = d
    .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    .toUpperCase();
  const time = d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace(" ", "")
    .toUpperCase();
  return [day, time, session.room].filter(Boolean).join(" · ");
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
