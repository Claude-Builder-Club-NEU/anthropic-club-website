/**
 * Get featured: what /featureme asks, what counts as a valid answer, and how an
 * application reaches the board.
 *
 * THE DATABASE IS THE RECORD. An application is written to the club's own
 * Supabase project, the same one attendance, polls, unsubscribes and signups
 * already use, and the board reads it from the dashboard. The email
 * notification below is a nudge and is allowed to fail; the row is not. This is
 * the shape lib/unsubscribe.js arrived at the hard way and lib/join.js repeated,
 * and their headers record why: an earlier version posted only to Web3Forms,
 * which returned 200 and delivered into an inbox nobody was reading, so requests
 * were accepted and then invisible.
 *
 * WHY THIS FORM EXISTS. The blog publishes two kinds of thing that need a person
 * on the other end: an interview with a member, and a write-up of something a
 * member built. Both used to start with somebody remembering to ask in Slack,
 * which means the people who got asked were the people the board already knew.
 * A form is not a better editorial process, it is a wider one.
 *
 * SIX QUESTIONS, and no more. /join is six questions and about thirty seconds,
 * and this has to be shorter still, because a signup is a person joining and
 * this is a person volunteering. Everything here is something the board cannot
 * decide or schedule without:
 *
 *   name, email    who, and where to write back
 *   kind           which of the two things they are asking for
 *   pitch          the thing the board actually says yes or no to
 *   link           the thing the board looks at before saying it, when it exists
 *   reach          how to get hold of them to book a time
 *
 * Deliberately NOT asked: year, college, major, how long they have been in the
 * club, when they are free. The first four are already on their signup row, and
 * "when are you free" is a conversation, not a checkbox: whoever schedules the
 * interview will ask, and a grid of times collected weeks early is wrong by the
 * time anyone reads it.
 *
 * OPTION KEYS ARE STORED, LABELS ARE RENDERED, and the two must not be confused.
 * The `value` is what lands in the database and what an officer writes in a
 * query. The `label` is disposable prose. Improve a label freely; changing a
 * `value` silently orphans every row already carrying the old one, and nothing
 * warns you, because supabase/features.sql deliberately does not enumerate these
 * keys, for the reason signups.sql sets out as rule 4 in that file.
 */

import { rpc, hasBackend } from "./supabase";

/**
 * The email rules are IMPORTED, not restated.
 *
 * lib/join.js's own header records that its NEU_EMAIL pattern is one of four
 * copies of the same regex in this codebase, that all four accept the same three
 * domains, and that when they disagree the SQL is right. A fifth copy typed out
 * by hand here would be the exact failure that note is warning about: the copies
 * do not drift because somebody rewrites one on purpose, they drift because
 * somebody fixes one and does not know about the others.
 *
 * validateName, validateEmail, validateOne and validateMany come across for the
 * same reason. This form's name field carries the identical CSV guard and the
 * identical domain rule as /join's, so it is the same validator, not a similar
 * one. They are re-exported so a component importing from this module does not
 * have to know which of the two files a given check lives in.
 *
 * The import costs nothing measurable: join.js has no module side effects and
 * its option lists are plain arrays, so Rollup drops the ones this page never
 * renders.
 */
import {
  NEU_EMAIL,
  EMAIL_MAX,
  normalizeEmail,
  validateName,
  validateEmail,
  validateOne,
  validateMany,
} from "./join";

export {
  hasBackend,
  NEU_EMAIL,
  EMAIL_MAX,
  normalizeEmail,
  validateName,
  validateEmail,
  validateOne,
  validateMany,
};

/**
 * Where the page lives.
 *
 * One spelling, exported, so the route table, the router, the link in the blog
 * footer and the page itself cannot drift apart. lib/unsubscribe.js exports its
 * path for the same reason.
 *
 * "featureme" and not "feature": /feature reads like a section of the site that
 * lists features, and the club asked for the verb.
 */
export const FEATURE_PATH = "/featureme";

/* -------------------------------------------------------------------------- *
 * The option lists.
 * -------------------------------------------------------------------------- */

/**
 * What they are asking for.
 *
 * PICK ONE, with a third option that means "I do not mind". The brief was
 * "interview and/or project feature", and the honest reading of the "or" is that
 * a lot of people have built something and would be equally happy either being
 * interviewed about it or having it written up. Forcing that person to guess
 * which one the board prefers makes them guess wrong half the time, and the
 * board then has to write back to ask a question the form could have not asked.
 *
 * `either` rather than `both`: the board decides which fits the blog, and
 * promising both in the label would be a promise the form cannot keep.
 */
export const KINDS = [
  { value: "interview", label: "An interview with me" },
  { value: "project", label: "A project I built" },
  { value: "either", label: "Either one, whichever suits the blog" },
];

/**
 * How to reach them to book a time.
 *
 * PICK MANY, because the whole purpose of the question is to find a channel the
 * person actually reads, and "email or Slack, both fine" is the true answer for
 * most students. A pick-one would force them to name one and then wonder why
 * nobody replied for a week.
 *
 * `email` is offered even though the form already has their address, and it is
 * not redundant: having the address is not the same as knowing they read it.
 * A student on a husky forwarding address who lives in Slack should be able to
 * say so.
 */
export const REACH = [
  { value: "email", label: "Email, at the address above" },
  { value: "slack", label: "Slack, in the club workspace" },
  { value: "instagram", label: "Instagram DM" },
  { value: "in_person", label: "Catch me at a meeting" },
];

/* -------------------------------------------------------------------------- *
 * Validation.
 *
 * Everything here is also enforced in supabase/features.sql, and that
 * duplication is deliberate rather than redundant: this copy exists to say
 * something useful before a round trip, and the SQL copy exists because the
 * browser is not a place to enforce anything. If the two disagree, the database
 * is right.
 *
 * Wording is the reader's next action, not a description of their mistake,
 * matching lib/join.js, lib/attendance.js and lib/unsubscribe.js.
 * -------------------------------------------------------------------------- */

/**
 * A few sentences, not an essay.
 *
 * 600 characters is roughly a full paragraph, which is as much as the board
 * needs to say yes or no and as much as anyone will write in a text area on a
 * phone. It is also the ceiling on what one anonymous POST can put in the table,
 * which is the other half of why the number exists: this is the only free-text
 * column on the site that a stranger can fill, so it is bounded here and bounded
 * again in SQL.
 */
export const PITCH_MAX = 600;

/**
 * Long enough for a real project URL with a path on it, short enough that the
 * column cannot be used as free storage. Real links that overrun this are
 * tracking-parameter tails, and the bare URL still works.
 */
export const LINK_MAX = 500;

export function validatePitch(v) {
  const clean = (v || "").trim();
  if (!clean) return "Tell us in a sentence or two what this is.";
  if (clean.length > PITCH_MAX) {
    return `Please trim this to ${PITCH_MAX} characters or fewer.`;
  }
  return "";
}

/**
 * The link field, which is the one genuinely new check on this page.
 *
 * OPTIONAL: an empty value is valid and returns "". Plenty of good projects are
 * a private repository, a class assignment, or a thing that only runs on the
 * author's laptop, and refusing those would filter out exactly the first-time
 * builders the blog is trying to find.
 *
 * ONLY http AND https, and this is the part that matters. A link submitted here
 * is read later by a board member from the Supabase dashboard, where it is a
 * clickable value. A `javascript:` URL pasted into this field is script that
 * runs in the dashboard session of whoever clicks it, and a `data:text/html`
 * URL is a page the attacker wrote, served from an origin the browser trusts
 * more than it should. Neither is hypothetical enough to leave to chance, and
 * the fix is the same allowlist safeUrl() applies to calendar URLs in
 * scripts/fetch-events.mjs: parse it, then admit two protocols and nothing else.
 *
 * PARSED, not pattern matched. `new URL()` is the same parser the browser uses
 * when it follows the link, so it cannot be talked out of agreeing with itself
 * by whitespace, mixed case, or a scheme spelled `JaVaScRiPt:`. A relative or
 * bare-host value such as "github.com/me/thing" throws, which is why the message
 * asks for the whole thing rather than saying the value is wrong.
 *
 * SSR-SAFE: URL is a global in Node as well as the browser, so nothing here
 * touches window and the prerender can call it.
 */
export function validateLink(v) {
  const clean = (v || "").trim();
  if (!clean) return "";
  // Cheap guard first, on the raw value, so a megabyte of pasted text is
  // refused without being handed to the URL parser at all.
  if (clean.length > LINK_MAX) return "Please use a shorter link.";

  let parsed;
  try {
    parsed = new URL(clean);
  } catch {
    return "Please paste the whole link, starting with https://.";
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "Please use a link that starts with http:// or https://.";
  }
  // MEASURED AGAIN, ON THE NORMALISED VALUE, because that is the string the
  // column actually holds: normalizeLink() stores parsed.href, and href is not
  // always what was typed. "https://ex.com" canonicalises to "https://ex.com/",
  // so a link of exactly LINK_MAX characters can arrive at the database one
  // character over its own cap. Checking only the raw value here would let the
  // form accept a link that submit_feature() then refuses with link_too_long,
  // which reads to the person as the site losing their answer for no reason.
  if (parsed.href.length > LINK_MAX) return "Please use a shorter link.";
  return "";
}

/**
 * The form of the link that gets stored.
 *
 * A parseable http or https URL comes back as its canonical href, so the same
 * repository submitted twice with and without a trailing slash is one string in
 * the table.
 *
 * ANYTHING ELSE COMES BACK UNCHANGED, and that is on purpose. The tempting
 * version returns "" for a value it cannot parse, which quietly deletes what
 * somebody typed if validation was ever skipped or bypassed. Handing the raw
 * value to the database instead means submit_feature() refuses it with
 * `link_invalid` and the person is told, rather than having their link vanish
 * and the board wondering what they meant.
 */
export function normalizeLink(raw) {
  const clean = (raw || "").trim();
  if (!clean) return "";
  try {
    const parsed = new URL(clean);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    /* falls through to the raw value, see above */
  }
  return clean;
}

/**
 * Why an application was refused, in the reader's terms.
 *
 * Keyed by the `reason` strings submit_feature() returns. An unrecognised reason
 * falls back to something honest rather than to the raw key: a new failure mode
 * added to the SQL should degrade to a sentence, not to "email_domain".
 */
const REASONS = {
  name_required: "Please tell us your name.",
  name_invalid: "Please start your name with a letter.",
  email_invalid: "Check that address and try again.",
  email_domain: "Please use a Northeastern address.",
  kind_required: "Pick an interview, a project, or either one.",
  pitch_required: "Tell us in a sentence or two what this is.",
  pitch_too_long: `Please trim this to ${PITCH_MAX} characters or fewer.`,
  link_invalid: "Please use a link that starts with http:// or https://.",
  link_too_long: "Please use a shorter link.",
  reach_required: "Pick at least one way to reach you.",
  too_many: "That is more answers than the form offers.",
};

export function reasonMessage(reason) {
  return REASONS[reason] || "That did not go through. Try again in a moment.";
}

/* -------------------------------------------------------------------------- *
 * Submission.
 * -------------------------------------------------------------------------- */

/**
 * Same key and endpoint as the interest form, the workshop pitch and the
 * unsubscribe page. Absent key is a designed state: the notification is simply
 * not sent, and the application is unaffected.
 */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "";
const ENDPOINT = "https://api.web3forms.com/submit";

/**
 * Record an application.
 *
 * The Supabase write is the one that matters and the only one that can fail the
 * call. The email is fired afterwards and its outcome discarded: a broken
 * notification must never turn into a member who volunteered and heard nothing.
 *
 * Resolves when the row is durable. Throws when it is not, so the flow can ask
 * the person to try again rather than reporting a success that did not happen.
 * A thrown error carries `reason` when the database considered the answers and
 * refused them, which is what reasonMessage() above turns into a sentence.
 *
 * @param {{name:string,email:string,kind:string,pitch:string,link?:string,reach:string[]}} answers
 * @param {{botcheck?: boolean, signal?: AbortSignal}} [options]
 */
export async function submitFeature(answers, options = {}) {
  const clean = normalizeEmail(answers.email);

  const data = await rpc(
    "submit_feature",
    {
      p_name: (answers.name || "").trim(),
      p_email: clean,
      p_kind: answers.kind,
      p_pitch: (answers.pitch || "").trim(),
      p_link: normalizeLink(answers.link),
      p_reach: answers.reach,
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

/**
 * Turn stored keys back into labels, for the notification email only.
 *
 * A near-copy of the same helper in lib/join.js, which is private there. Two
 * four-line functions is a smaller problem than exporting an internal from that
 * module so this one can borrow it, and neither is on a path where a bug would
 * cost anything but a wrong word in an email.
 */
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
      subject: `Feature request: ${(answers.name || "").trim()}`,
      from_name: "Claude Builders Club website",
      botcheck: botcheck ? "true" : "",
      name: (answers.name || "").trim(),
      email: clean,
      asking_for: labelsFor(KINDS, [answers.kind]),
      pitch: (answers.pitch || "").trim(),
      link: normalizeLink(answers.link),
      reach: labelsFor(REACH, answers.reach),
      message:
        "This application is also recorded in Supabase, table " +
        "public.feature_requests, which is the authoritative copy. Decide it, " +
        "then stamp decided_at and set outcome.",
    }),
  });
}
