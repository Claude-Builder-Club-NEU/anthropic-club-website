/**
 * The NYC campus interest form: its questions' options, validation, and how a
 * signup reaches the club.
 *
 * A SIBLING OF lib/join.js, NOT A CHANGE TO IT. The Boston interest form on
 * /join and its table are untouched. This one writes to public.nyc_signups
 * through submit_nyc_signup() (supabase/nyc-signups.sql), which has to be run
 * in the Supabase SQL editor once before the form can accept anything.
 *
 * The five questions come from the board's "Claude Builders Club NYC: Interest
 * Form" spec: name, email, major, preferred interest meeting month, and which
 * weekdays work.
 *
 * OPTION KEYS ARE STORED, LABELS ARE RENDERED. Same rule as lib/join.js:
 * improve a label freely, never change a `value` once rows carry it.
 */

import { rpc, hasBackend } from "./supabase";
import { normalizeEmail, validateName, validateOne, validateMany, EMAIL_MAX } from "./join";

export { hasBackend, validateName, validateOne, validateMany };

/** Any well-formed address. The NYC form does not require a Northeastern one. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function validateEmail(v) {
  const clean = normalizeEmail(v);
  if (!clean) return "Please add your email.";
  if (clean.length > EMAIL_MAX) return "That address is too long.";
  if (!EMAIL_SHAPE.test(clean)) return "Check that address and try again.";
  return "";
}

export const MAJORS = [
  { value: "computer_science", label: "Computer Science" },
  { value: "engineering", label: "Engineering" },
  { value: "business", label: "Business" },
  { value: "health_sciences", label: "Health Sciences" },
  { value: "arts_media_design", label: "Arts, Media and Design" },
  { value: "humanities_social_sciences", label: "Humanities and Social Sciences" },
  { value: "undecided", label: "Undecided" },
  { value: "other", label: "Other" },
];

export const MEETING_MONTHS = [
  { value: "december", label: "December" },
  { value: "january", label: "January" },
  { value: "either", label: "Either works" },
];

export const WEEKDAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
];

const REASONS = {
  name_required: "Please tell us your name.",
  name_invalid: "Please start your name with a letter.",
  email_invalid: "Check that address and try again.",
  major_required: "Pick your major, or Other.",
  month_required: "Pick a month, or Either works.",
  days_required: "Pick at least one day.",
  too_many: "That is more answers than the form offers.",
};

export function reasonMessage(reason) {
  return REASONS[reason] || "That did not go through. Try again in a moment.";
}

/**
 * Record an NYC signup. Resolves when the row is durable, throws when not.
 *
 * @param {{name:string,email:string,major:string,month:string,days:string[]}} answers
 * @param {{signal?: AbortSignal}} [options]
 */
export async function submitNycSignup(answers, options = {}) {
  const data = await rpc(
    "submit_nyc_signup",
    {
      p_name: (answers.name || "").trim(),
      p_email: normalizeEmail(answers.email),
      p_major: answers.major,
      p_meeting_month: answers.month,
      p_meet_days: answers.days,
    },
    { signal: options.signal }
  );

  if (!data?.ok) {
    const err = new Error(data?.reason || "rejected");
    err.reason = data?.reason;
    throw err;
  }
  return true;
}
