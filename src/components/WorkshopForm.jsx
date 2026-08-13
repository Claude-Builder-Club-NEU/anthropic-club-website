import { useState } from "react";
import { INTEREST_FORM } from "../lib/links";

/**
 * Workshop pitch form, posted to Web3Forms.
 *
 * BLOCKED (revision 2, §6.2): the access key comes from VITE_WEB3FORMS_KEY and
 * is never hardcoded. Until it is set, the form renders in full but submission
 * is closed and the section routes people to the general interest form, rather
 * than shipping a control that silently fails.
 *
 * Spam handling uses Web3Forms' own honeypot field, `botcheck`. It is visually
 * hidden and hidden from assistive tech; a submission with it filled is
 * discarded server-side.
 */

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "";
const ENDPOINT = "https://api.web3forms.com/submit";

const NEU_EMAIL = /@(northeastern\.edu|husky\.neu\.edu|neu\.edu)$/i;

const FIELDS = [
  { name: "name", label: "Your name", type: "text", autoComplete: "name" },
  {
    name: "email",
    label: "Northeastern email",
    type: "email",
    autoComplete: "email",
    hint: "Use your northeastern.edu or husky.neu.edu address.",
  },
  { name: "topic", label: "Workshop topic", type: "text" },
  {
    name: "timeframe",
    label: "Rough date or timeframe",
    type: "text",
    hint: "A month or a week is fine. It does not have to be exact.",
  },
];

const EMPTY = { name: "", email: "", topic: "", timeframe: "", description: "" };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please tell us your name.";
  if (!values.email.trim()) errors.email = "Please add your email.";
  else if (!NEU_EMAIL.test(values.email.trim()))
    errors.email = "Please use a Northeastern address.";
  if (!values.topic.trim()) errors.topic = "What would the workshop cover?";
  if (!values.timeframe.trim())
    errors.timeframe = "Roughly when were you thinking?";
  if (!values.description.trim())
    errors.description = "A sentence or two is plenty.";
  else if (values.description.trim().length > 600)
    errors.description = "Please keep this under 600 characters.";
  return errors;
}

const WorkshopForm = () => {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [serverError, setServerError] = useState("");

  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = document.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }

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
          botcheck: e.target.botcheck?.checked ? "true" : "",
          ...values,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setStatus("sent");
        setValues(EMPTY);
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

  if (!ACCESS_KEY) {
    return (
      <div className="mt-6 rounded-lg border border-rule bg-paper p-6">
        <p className="font-display text-step-3 font-semibold text-ink">
          Pitches are open by email for now.
        </p>
        <p className="mt-3 text-small text-gray-text">
          Tell us what you want to run and we&apos;ll get back to you.
        </p>
        <a
          className="btn btn--coral mt-5"
          href={INTEREST_FORM}
          target="_blank"
          rel="noopener noreferrer"
        >
          Pitch a workshop
        </a>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div
        className="mt-6 rounded-lg border border-coral bg-paper p-6"
        role="status"
      >
        <p className="font-display text-step-3 font-semibold text-ink">
          Got it. Thank you.
        </p>
        <p className="mt-3 text-small text-gray-text">
          One of the board will email you about scheduling it.
        </p>
        <button
          type="button"
          className="btn btn--secondary mt-5"
          onClick={() => setStatus("idle")}
        >
          Pitch another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 max-w-measure">
      {/* Honeypot. Hidden from sight and from assistive tech. */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: "none" }}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.name} className={f.name === "topic" ? "sm:col-span-2" : ""}>
            <label className="field-label" htmlFor={`wf-${f.name}`}>
              {f.label}
            </label>
            <input
              id={`wf-${f.name}`}
              name={f.name}
              type={f.type}
              autoComplete={f.autoComplete}
              value={values[f.name]}
              onChange={set(f.name)}
              aria-invalid={errors[f.name] ? "true" : undefined}
              aria-describedby={
                errors[f.name]
                  ? `wf-${f.name}-err`
                  : f.hint
                    ? `wf-${f.name}-hint`
                    : undefined
              }
              className="field-input"
            />
            {errors[f.name] ? (
              <p id={`wf-${f.name}-err`} className="field-error">
                {errors[f.name]}
              </p>
            ) : f.hint ? (
              <p id={`wf-${f.name}-hint`} className="field-hint">
                {f.hint}
              </p>
            ) : null}
          </div>
        ))}

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="wf-description">
            What would you cover?
          </label>
          <textarea
            id="wf-description"
            name="description"
            rows={4}
            value={values.description}
            onChange={set("description")}
            aria-invalid={errors.description ? "true" : undefined}
            aria-describedby={
              errors.description ? "wf-description-err" : undefined
            }
            className="field-input"
          />
          {errors.description && (
            <p id="wf-description-err" className="field-error">
              {errors.description}
            </p>
          )}
        </div>
      </div>

      {status === "error" && (
        <p className="field-error mt-5" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        className="btn btn--coral mt-7"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send pitch"}
      </button>
    </form>
  );
};

export default WorkshopForm;
