/**
 * The interest form: what it asks, what counts as a valid answer, and how a
 * signup reaches the club.
 *
 * THE DATABASE IS THE RECORD. A signup is written to the club's own Supabase
 * project, the same one attendance, polls and unsubscribes already use, and the
 * board reads it from the dashboard. The email notification below is a nudge
 * and is allowed to fail; the row is not. This is the shape lib/unsubscribe.js
 * arrived at the hard way, and its header records why: an earlier version
 * posted only to Web3Forms, which returned 200 and delivered into an inbox
 * nobody was reading, so requests were accepted and then invisible.
 *
 * WHY THIS FORM EXISTS AT ALL. It replaces Typeform RH9sxEqE, which was the
 * club's front door for its first term. Everything that form asked is asked
 * here, in the same order, plus two questions it never asked: year and college.
 *
 * OPTION KEYS ARE STORED, LABELS ARE RENDERED, and the two must not be confused.
 * The `value` is what lands in the database and what an officer writes in a
 * query. The `label` is disposable prose. Improve a label freely; changing a
 * `value` silently orphans every row already carrying the old one, and nothing
 * warns you, because supabase/signups.sql deliberately does not enumerate these
 * keys (see rule 4 in that file).
 */

import { rpc, hasBackend } from "./supabase";

export { hasBackend };

/**
 * Anchored at both ends, matching WorkshopForm's NEU_EMAIL, attendance's
 * MEMBER_EMAIL and is_member_email() in supabase/schema.sql. The suffix-only
 * form of this pattern was already found once in this codebase to accept
 * "someone@gmail.com.jordan@northeastern.edu".
 *
 * All four copies accept the same three domains. If that ever stops being true,
 * the database is right and this one is wrong.
 */
export const NEU_EMAIL =
  /^[^\s@]+@(northeastern\.edu|husky\.neu\.edu|neu\.edu)$/i;

/** RFC 5321 caps an address at 254 characters. */
export const EMAIL_MAX = 254;

/** Lowercase and trim, so one person is one row. Mirrors the SQL. */
export function normalizeEmail(raw) {
  return (raw || "").trim().toLowerCase();
}

/* -------------------------------------------------------------------------- *
 * The option lists.
 * -------------------------------------------------------------------------- */

/**
 * Year of study, asked as an ordinal rather than as class standing.
 *
 * The registrar assigns freshman/sophomore/junior/senior by earned credit
 * hours, and co-op is exactly what makes that diverge from the calendar: a
 * student six months into a co-op earns few credits and stays a "sophomore"
 * while living their third year. Ask by credit standing and half the answers
 * are to a different question. Ask by ordinal year and you get what students
 * say out loud.
 *
 * "Fifth year or more" rather than "Fifth year": the co-op track genuinely ends
 * at five, but a leave of absence, a change of major or a third co-op puts real
 * students in year six, and a required question with no true answer is a bounce.
 */
export const YEARS = [
  { value: "first", label: "First year" },
  { value: "second", label: "Second year" },
  { value: "third", label: "Third year" },
  { value: "fourth", label: "Fourth year" },
  { value: "fifth_plus", label: "Fifth year or more" },
  { value: "grad", label: "Graduate student" },
];

/**
 * The colleges, verified against northeastern.edu/academics/colleges-and-schools
 * rather than from memory. All ten the university lists are here, plus two
 * answers that are true for real students and are not colleges:
 *
 *   explore  a first year who has not declared is genuinely in no college, which
 *            is what the Explore Program is. Without this they would have to
 *            pick one at random, and the data would be worse than missing.
 *   other    the escape hatch that makes this question safe to require. A
 *            required question is only cruel when somebody has no true answer.
 *
 * MULTI-SELECT, and that is the important decision here. Combined majors span
 * two colleges routinely at this university, and Computer Science and Business
 * Administration is exactly this club's audience. See the long note in
 * supabase/signups.sql above the `colleges` column.
 */
export const COLLEGES = [
  { value: "khoury", label: "Khoury College of Computer Sciences" },
  { value: "coe", label: "College of Engineering" },
  { value: "cos", label: "College of Science" },
  { value: "dmsb", label: "D'Amore-McKim School of Business" },
  { value: "camd", label: "College of Arts, Media and Design" },
  { value: "cssh", label: "College of Social Sciences and Humanities" },
  { value: "bouve", label: "Bouvé College of Health Sciences" },
  { value: "cps", label: "College of Professional Studies" },
  { value: "law", label: "School of Law" },
  { value: "mills", label: "Mills College at Northeastern" },
  { value: "explore", label: "Explore Program, not declared yet" },
  { value: "other", label: "Something else" },
];

/** Carried from the Typeform unchanged. Weekends is one option, as it was. */
export const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "weekend", label: "Weekends" },
];

/**
 * Carried from the Typeform, labels verbatim including the ampersand.
 *
 * "Social and community" reads a little oddly as an option and is kept anyway:
 * it is the label people have already been answering, and the point of the
 * migration is that the two terms of data line up.
 */
export const INTERESTS = [
  { value: "workshops", label: "Hands-on build workshops" },
  { value: "hackathons", label: "Hackathons & build nights" },
  { value: "speakers", label: "Speaker talks from industry leaders" },
  { value: "projects", label: "Team projects to ship together" },
  { value: "social", label: "Social and community" },
];

/* -------------------------------------------------------------------------- *
 * Validation.
 *
 * Everything here is also enforced in supabase/signups.sql, and that duplication
 * is deliberate rather than redundant: this copy exists to say something useful
 * before a round trip, and the SQL copy exists because the browser is not a
 * place to enforce anything. If the two disagree, the database is right.
 *
 * Wording is the reader's next action, not a description of their mistake,
 * matching lib/attendance.js and lib/unsubscribe.js.
 * -------------------------------------------------------------------------- */

export function validateName(v) {
  const clean = (v || "").trim();
  if (!clean) return "Please tell us your name.";
  if (clean.length > 120) return "Please use a shorter name.";
  // Refused for the same reason the SQL refuses it: a leading =, +, - or @ is
  // evaluated as a formula by Excel and Google Sheets when the board exports
  // the roster to CSV.
  if ("=+-@".includes(clean[0])) return "Please start with a letter.";
  return "";
}

export function validateEmail(v) {
  const clean = normalizeEmail(v);
  if (!clean) return "Please add your email.";
  if (clean.length > EMAIL_MAX) return "That address is too long.";
  if (!NEU_EMAIL.test(clean)) return "Please use a Northeastern address.";
  return "";
}

/** A pick-one question. */
export function validateOne(v, message) {
  return v ? "" : message;
}

/** A pick-many question. */
export function validateMany(v, message) {
  return Array.isArray(v) && v.length ? "" : message;
}

/**
 * Why a signup was refused, in the reader's terms.
 *
 * Keyed by the `reason` strings submit_signup() returns. An unrecognised reason
 * falls back to something honest rather than to the raw key: a new failure mode
 * added to the SQL should degrade to a sentence, not to "email_domain".
 */
const REASONS = {
  name_required: "Please tell us your name.",
  name_invalid: "Please start your name with a letter.",
  email_invalid: "Check that address and try again.",
  email_domain: "Please use a Northeastern address.",
  year_required: "Pick the year you are in.",
  college_required: "Pick at least one, or Something else if none fit.",
  days_required: "Pick at least one day.",
  interests_required: "Pick at least one thing you would come for.",
  too_many: "That is more answers than the form offers.",
};

export function reasonMessage(reason) {
  return REASONS[reason] || "That did not go through. Try again in a moment.";
}

/* -------------------------------------------------------------------------- *
 * Submission.
 * -------------------------------------------------------------------------- */

/**
 * Same key and endpoint as the workshop pitch and the unsubscribe page. Absent
 * key is a designed state: the notification is simply not sent, and the signup
 * is unaffected.
 */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "";
const ENDPOINT = "https://api.web3forms.com/submit";

/**
 * Record a signup.
 *
 * The Supabase write is the one that matters and the only one that can fail the
 * call. The email is fired afterwards and its outcome discarded: a broken
 * notification must never turn into a lost member.
 *
 * Resolves when the row is durable. Throws when it is not, so the flow can ask
 * the person to try again rather than reporting a success that did not happen.
 *
 * @param {{name:string,email:string,year:string,colleges:string[],days:string[],interests:string[]}} answers
 * @param {{botcheck?: boolean, signal?: AbortSignal}} [options]
 */
export async function submitSignup(answers, options = {}) {
  const clean = normalizeEmail(answers.email);

  const data = await rpc(
    "submit_signup",
    {
      p_name: (answers.name || "").trim(),
      p_email: clean,
      p_class_year: answers.year,
      p_colleges: answers.colleges,
      p_meet_days: answers.days,
      p_interests: answers.interests,
    },
    { signal: options.signal }
  );

  if (!data?.ok) {
    const err = new Error(data?.reason || "rejected");
    err.reason = data?.reason;
    throw err;
  }

  notify(answers, clean, options.botcheck).catch(() => {});

  return true;
}

/** Turn stored keys back into labels, for the notification email only. */
function labelsFor(list, values) {
  return list
    .filter((o) => (values || []).includes(o.value))
    .map((o) => o.label)
    .join(", ");
}

/** The optional email nudge. Never throws into the caller. */
async function notify(answers, clean, botcheck) {
  if (!ACCESS_KEY) return;

  await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: ACCESS_KEY,
      subject: `New signup: ${(answers.name || "").trim()}`,
      from_name: "Claude Builders Club website",
      botcheck: botcheck ? "true" : "",
      name: (answers.name || "").trim(),
      email: clean,
      year: labelsFor(YEARS, [answers.year]),
      colleges: labelsFor(COLLEGES, answers.colleges),
      days: labelsFor(DAYS, answers.days),
      interests: labelsFor(INTERESTS, answers.interests),
      message:
        "This signup is also recorded in Supabase, table public.signups, " +
        "which is the authoritative copy. Add the address to the mailing " +
        "list and stamp added_to_list_at.",
    }),
  });
}
