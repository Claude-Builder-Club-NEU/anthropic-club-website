import { useEffect, useId, useRef, useState } from "react";
import { BracketButton } from "../components/BracketButton";
import { withBase } from "../lib/base";
import { APPLY, EVENT, LINKS } from "../lib/event";
import { useApplicationsOpen } from "../lib/apply";
import {
  COLLEGES,
  HEADSHOT_TYPES,
  YEARS,
  finish,
  normalizePhone,
  pending,
  reasonToError,
  register,
  upload,
  validate,
} from "../lib/signup";

/**
 * /hackathon/signup/: apply.
 *
 * Getting in is by application: anyone can apply until APPLY.deadlineISO,
 * the organizers pick APPLY.spots people, and decisions go out by email. The
 * path is still /signup/ so links already shared keep working.
 *
 * Three steps behind one button:
 *
 *   1. /api/register stores the answers as a PENDING row and hands back two
 *      one-time upload URLs.
 *   2. The resume and headshot go straight to the private Supabase bucket.
 *   3. /api/finish files the application, and they land on its page.
 *
 * NOTHING IS CHARGED, HERE OR LATER. The event is free (the old $5 fee is
 * gone), and the page says so plainly. (Step 3 still files the row as 'seated' or 'waitlist',
 * in arrival order; that order means nothing until the organizers set the
 * rows to match their decisions. See APPLY.decisionsOut in event.js.)
 *
 * COMING BACK. The pending id is kept in sessionStorage for the back button
 * (and Stripe's cancel link, if payments are ever switched on, returns here
 * with ?resume=<id>). Either way the answers and files are already saved, so
 * the page offers to finish instead of the whole form.
 *
 * AFTER THE DEADLINE the form is replaced by a closed notice, and
 * /api/register refuses anything that gets past it.
 */

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  year: "",
  college: "",
  linkedin: "",
  dietary: "",
  resume: null,
  headshot: null,
  consent: false,
};

const FIELD_ORDER = ["name", "email", "phone", "year", "college", "linkedin", "resume", "headshot", "dietary", "consent"];

export function Signup() {
  const open = useApplicationsOpen();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [general, setGeneral] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [resumeId, setResumeId] = useState(null);
  const formRef = useRef(null);

  // Back from Stripe without paying, or back-buttoned out of it.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("resume");
    const id = fromUrl || pending.get();
    if (id && /^[0-9a-f-]{36}$/i.test(id)) setResumeId(id);

    // A page restored from the back-forward cache keeps its "Opening Stripe"
    // state; put the controls back.
    const onShow = (e) => {
      if (e.persisted) {
        setBusy(false);
        setStep("");
        const id2 = pending.get();
        if (id2) setResumeId(id2);
      }
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function proceed(id) {
    setStep("Submitting your application…");
    const done = await finish(id);
    if (done.ok && done.checkout) {
      window.location.assign(done.checkout);
      return;
    }
    if (done.ok && done.token) {
      pending.clear();
      window.location.assign(withBase(`ticket/?t=${done.token}`));
      return;
    }
    const { field, message } = reasonToError(done.reason);
    if (done.reason === "not_found" || done.reason === "already_registered") {
      // Show the form again: already_registered is an error on its email
      // field, which the "pick up where you left off" panel would hide.
      pending.clear();
      setResumeId(null);
    } else {
      // The row and files are saved, and finish may even have filed it with
      // the reply lost on the way back (a dropped phone connection). Offer
      // to finish THIS row again, which is idempotent and returns the
      // ticket. Re-submitting the form instead would register a second row
      // and be refused as "already applied" by the first one.
      setResumeId(id);
    }
    if (field) setErrors((e) => ({ ...e, [field]: message }));
    setGeneral(field ? "" : message);
    setBusy(false);
    setStep("");
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setGeneral("");

    const found = validate(form);
    setErrors(found);
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) {
      formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }

    setBusy(true);
    setStep("Saving your details…");
    const result = await register({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: normalizePhone(form.phone),
      year: form.year,
      college: form.college,
      linkedin: form.linkedin.trim(),
      dietary: form.dietary.trim(),
      consent: form.consent,
      resume: { type: form.resume.type, size: form.resume.size },
      headshot: { type: form.headshot.type, size: form.headshot.size },
    });

    if (!result.ok) {
      const { field, message } = reasonToError(result.reason);
      if (field) {
        setErrors({ [field]: message });
        formRef.current?.querySelector(`[name="${field}"]`)?.focus();
      }
      setGeneral(field ? "" : message);
      setBusy(false);
      setStep("");
      return;
    }

    pending.set(result.id);

    for (const [key, label] of [["resume", "resume"], ["headshot", "headshot"]]) {
      const ok = await upload(result.uploads[key], form[key], (p) =>
        setStep(`Uploading your ${label}… ${Math.round(p * 100)}%`),
      );
      if (!ok) {
        pending.clear();
        setGeneral(`Your ${label} didn't upload. Check your connection and try again.`);
        setBusy(false);
        setStep("");
        return;
      }
    }

    await proceed(result.id);
  }

  async function onResume() {
    setBusy(true);
    setGeneral("");
    await proceed(resumeId);
  }

  function startOver() {
    pending.clear();
    setResumeId(null);
    setGeneral("");
    if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
  }

  if (!open) {
    return (
      <main className="hk-su">
        <header className="hk-su__head">
          <span className="hk-chip">APPLICATIONS CLOSED</span>
          <h1 className="hk-su__title">Applications are closed.</h1>
          <p className="hk-su__lede">
            Applications for {EVENT.name} closed {APPLY.deadlineLabel}.
            Decisions go out by email on <strong>{APPLY.decisionsLabel}</strong>.
            If you applied, your application page has what you sent.
          </p>
          <BracketButton href={withBase(LINKS.ticket)}>Find my application</BracketButton>
        </header>
      </main>
    );
  }

  return (
    <main className="hk-su">
      <header className="hk-su__head">
        <span className="hk-chip">APPLY</span>
        <h1 className="hk-su__title">Apply for {EVENT.name}.</h1>
        <p className="hk-su__lede">
          {EVENT.dateLong} at {EVENT.venue}. <strong>{APPLY.spots} spots</strong>,
          chosen from applications. Apply by <strong>{APPLY.deadlineLabel}</strong> at
          11:59 PM ET; decisions go out by email on{" "}
          <strong>{APPLY.decisionsLabel}</strong>.
        </p>
        <p className="hk-su__fee">
          <span className="hk-su__fee-tag">FREE</span>
          <span>
            {EVENT.name} is <strong>completely free</strong>. There&rsquo;s no
            fee to apply and no fee if you&rsquo;re accepted.
          </span>
        </p>
      </header>

      {resumeId ? (
        <section className="hk-su__resume" aria-live="polite">
          <p className="hk-su__resume-title">Your details are saved.</p>
          <p className="hk-su__resume-text">
            Your application wasn&rsquo;t finished. Pick up where you left off —
            nothing to fill in again.
          </p>
          {general ? <p className="hk-su__error" role="alert">{general}</p> : null}
          <div className="hk-su__resume-actions">
            <BracketButton onClick={onResume} disabled={busy}>
              {busy ? step || "Working…" : "Submit my application"}
            </BracketButton>
            <button type="button" className="hk-su__link" onClick={startOver} disabled={busy}>
              Start over
            </button>
          </div>
        </section>
      ) : null}

      <div className="hk-su__grid" hidden={Boolean(resumeId)}>
        <form ref={formRef} className="hk-su__form" onSubmit={onSubmit} noValidate>
          <Group index="01" title="You">
            <TextField
              name="name" label="Full name" autoComplete="name"
              value={form.name} onChange={set("name")} error={errors.name}
            />
            <TextField
              name="email" label="Northeastern email" type="email" autoComplete="email"
              inputMode="email" placeholder="you@northeastern.edu"
              value={form.email} onChange={set("email")} error={errors.email}
            />
            <TextField
              name="phone" label="Phone" type="tel" wide autoComplete="tel" inputMode="tel"
              placeholder="(617) 555-0100"
              value={form.phone} onChange={set("phone")} error={errors.phone}
            />
          </Group>

          <Group index="02" title="School">
            <ChoiceField
              name="year" label="Year" options={YEARS}
              value={form.year} onChange={set("year")} error={errors.year}
            />
            <SelectField
              name="college" label="Northeastern college" options={COLLEGES}
              value={form.college} onChange={set("college")} error={errors.college}
            />
          </Group>

          <Group index="03" title="Profile" note="Shared with sponsors who are hiring.">
            <TextField
              name="linkedin" label="LinkedIn" type="url" wide autoComplete="url" inputMode="url"
              placeholder="linkedin.com/in/your-name"
              value={form.linkedin} onChange={set("linkedin")} error={errors.linkedin}
            />
            <FileField
              name="resume" label="Resume" accept="application/pdf"
              hint="PDF · 5MB max"
              file={form.resume} onChange={set("resume")} error={errors.resume}
            />
            <FileField
              name="headshot" label="Headshot" accept={HEADSHOT_TYPES.join(",")}
              hint="JPG, PNG or WebP · 5MB max" image
              file={form.headshot} onChange={set("headshot")} error={errors.headshot}
            />
          </Group>

          <Group index="04" title="The weekend">
            <TextField
              name="dietary" label="Dietary needs" optional multiline
              placeholder="Vegetarian, allergies, anything we should know"
              value={form.dietary} onChange={set("dietary")} error={errors.dietary}
            />
            <label className={errors.consent ? "hk-su__consent is-invalid" : "hk-su__consent"}>
              <input
                type="checkbox" name="consent" checked={form.consent}
                onChange={(e) => set("consent")(e.target.checked)}
                aria-invalid={Boolean(errors.consent)}
              />
              <span className="hk-su__box" aria-hidden="true" />
              <span>
                I agree that my resume, LinkedIn and headshot can be shared with
                HACK1984&rsquo;s sponsors for recruiting. Nothing else I enter
                here is shared.
              </span>
            </label>
            {errors.consent ? <p className="hk-su__field-error">{errors.consent}</p> : null}
          </Group>

          <div className="hk-su__submit">
            {general ? <p className="hk-su__error" role="alert">{general}</p> : null}
            <BracketButton type="submit" disabled={busy}>
              {busy ? step || "Working…" : "Submit application"}
            </BracketButton>
            <p className="hk-su__status" aria-live="polite">
              {busy ? `> ${step}` : "> Completely free. No fee to apply or attend."}
            </p>
          </div>
        </form>

      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

function Group({ index, title, note, children }) {
  return (
    <fieldset className="hk-su__group">
      <legend className="hk-su__legend">
        <span className="hk-su__legend-index">{index}</span> {title.toUpperCase()}
        {note ? <span className="hk-su__legend-note">{note}</span> : null}
      </legend>
      <div className="hk-su__fields">{children}</div>
    </fieldset>
  );
}

function Label({ id, label, optional }) {
  return (
    <label className="hk-su__label" htmlFor={id}>
      {label}
      {optional ? <span className="hk-su__optional">Optional</span> : null}
    </label>
  );
}

function FieldError({ id, error }) {
  return error ? (
    <p className="hk-su__field-error" id={`${id}-error`}>
      {error}
    </p>
  ) : null;
}

function TextField({ name, label, value, onChange, error, optional, multiline, wide, ...rest }) {
  const id = useId();
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className={`hk-su__field${multiline || wide ? " hk-su__field--wide" : ""}`}>
      <Label id={id} label={label} optional={optional} />
      <Tag
        id={id}
        name={name}
        className="hk-su__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        rows={multiline ? 3 : undefined}
        {...rest}
      />
      <FieldError id={id} error={error} />
    </div>
  );
}

function SelectField({ name, label, options, value, onChange, error }) {
  const id = useId();
  return (
    <div className="hk-su__field hk-su__field--wide">
      <Label id={id} label={label} />
      <div className="hk-su__select">
        <select
          id={id} name={name} className="hk-su__input" value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <option value="" disabled>
            Choose one
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <FieldError id={id} error={error} />
    </div>
  );
}

function ChoiceField({ name, label, options, value, onChange, error }) {
  const id = useId();
  return (
    <div className="hk-su__field hk-su__field--wide" role="radiogroup" aria-labelledby={`${id}-label`}>
      <span className="hk-su__label" id={`${id}-label`}>{label}</span>
      <div className="hk-su__choices">
        {options.map((o, i) => (
          <label key={o.value} className={value === o.value ? "hk-su__choice is-on" : "hk-su__choice"}>
            <input
              type="radio" name={name} value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              // Only the first carries the error link, so it is read once.
              aria-describedby={error && i === 0 ? `${id}-error` : undefined}
            />
            {o.label}
          </label>
        ))}
      </div>
      <FieldError id={id} error={error} />
    </div>
  );
}

function FileField({ name, label, accept, hint, file, onChange, error, image }) {
  const id = useId();
  const [preview, setPreview] = useState("");

  // A data: URL, not URL.createObjectURL(): the club site's CSP allows
  // img-src 'self' data: and nothing else, so a blob: preview would be
  // refused and render as a broken image.
  useEffect(() => {
    if (!image || !file || !file.type.startsWith("image/")) {
      setPreview("");
      return undefined;
    }
    let live = true;
    const reader = new FileReader();
    reader.onload = () => live && setPreview(String(reader.result));
    reader.readAsDataURL(file);
    return () => {
      live = false;
    };
  }, [file, image]);

  const kb = file ? Math.max(1, Math.round(file.size / 1024)) : 0;

  return (
    <div className="hk-su__field hk-su__field--wide">
      <Label id={id} label={label} />
      <label
        className={["hk-su__drop", file && "has-file", error && "is-invalid"].filter(Boolean).join(" ")}
        htmlFor={id}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) onChange(dropped);
        }}
      >
        <input
          id={id} name={name} type="file" accept={accept} className="hk-su__file"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
        />
        {preview ? <img className="hk-su__thumb" src={preview} alt="" /> : (
          <span className="hk-su__drop-mark" aria-hidden="true">{image ? "[ IMG ]" : "[ PDF ]"}</span>
        )}
        <span className="hk-su__drop-text">
          {file ? (
            <>
              <span className="hk-su__drop-name">{file.name}</span>
              <span className="hk-su__drop-hint" id={`${id}-hint`}>{kb >= 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`} · Choose another</span>
            </>
          ) : (
            <>
              <span className="hk-su__drop-name">Choose a file or drop it here</span>
              <span className="hk-su__drop-hint" id={`${id}-hint`}>{hint}</span>
            </>
          )}
        </span>
      </label>
      <FieldError id={id} error={error} />
    </div>
  );
}
