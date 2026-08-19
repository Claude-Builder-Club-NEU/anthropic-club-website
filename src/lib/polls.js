/**
 * Polls.
 *
 * A poll is DATA, not code. Every poll is one JSON file in lib/polls/, and the
 * ballot renders whatever question types it finds there. Adding the next poll
 * is therefore dropping a file in and adding one line to POLLS below: no new
 * component, no new route, no layout work. That is the whole reason this file
 * exists rather than a Ballot component per poll.
 *
 * IDENTITY: deliberately nobody.
 *
 * Attendance identifies people by their Northeastern email. This does the exact
 * opposite and says so twice on screen. Nothing here collects a name, an
 * address, or anything that could be joined back to one. What that buys is
 * honest answers about experience level and what people actually want; what it
 * costs is that a second device or a cleared browser can vote twice, and there
 * is no server-side way to tell two ballots from one person apart.
 *
 * If one-ballot-per-person ever matters more than anonymity, the change that
 * preserves both is to check the email against the attendance list at the door
 * and hand out a one-time ballot code. The ballot itself still stores no
 * address. That decision belongs to the club before a poll allocates anything
 * scarce, and nothing in this file presumes it.
 */

import { rpc } from "./supabase";
import infoSession202609 from "./polls/info-session-2026-09.json";

/**
 * Every poll the site knows about, newest first.
 *
 * Adding one: drop the JSON in lib/polls/, import it, put it at the top.
 */
export const POLLS = [infoSession202609];

/* -------------------------------------------------------------------------- *
 * Question types
 *
 * The five the mockups use. A type the renderer does not recognise is skipped
 * rather than crashing the ballot, so a typo in a hand-written poll file costs
 * one question and not the whole session.
 * -------------------------------------------------------------------------- */

export const TYPES = {
  /** Ordered picks from a pool. The ORDER is the ranking. */
  slots: "slots",
  /** One option. */
  single: "single",
  /** Any number of options. */
  multi: "multi",
  /** Single with two fixed options. */
  yesno: "yesno",
  /** Free text. */
  text: "text",
};

export const KNOWN_TYPES = new Set(Object.values(TYPES));

/* -------------------------------------------------------------------------- *
 * Status
 *
 * Computed from the clock in the browser, not baked in at build time. The site
 * is prerendered, so a status decided during the build would be wrong for every
 * visitor after it: a poll that opens at 6pm would read "opening soon" all
 * evening on a page built that morning.
 * -------------------------------------------------------------------------- */

export const STATUS = { soon: "soon", open: "open", closed: "closed" };

export function statusOf(poll, now = new Date()) {
  const opens = poll.opensAt ? new Date(poll.opensAt) : null;
  const closes = poll.closesAt ? new Date(poll.closesAt) : null;
  if (opens && now < opens) return STATUS.soon;
  if (closes && now >= closes) return STATUS.closed;
  return STATUS.open;
}

export function pollsByStatus(status, now = new Date()) {
  return POLLS.filter((poll) => statusOf(poll, now) === status);
}

export function findPoll(slug) {
  return POLLS.find((poll) => poll.slug === slug) || null;
}

/** "7 questions, 3 sections" — the card meta on the hub. */
export function pollSize(poll) {
  const sections = poll.sections?.length || 0;
  const questions = (poll.sections || []).reduce(
    (total, section) => total + (section.questions?.length || 0),
    0
  );
  return { sections, questions };
}

/* -------------------------------------------------------------------------- *
 * Answers
 *
 * One flat map keyed "sectionKey.questionKey", so a section can be validated
 * without walking the whole ballot and the stored shape survives a poll being
 * edited between someone starting and finishing.
 * -------------------------------------------------------------------------- */

export function answerKey(section, question) {
  return `${section.key}.${question.key}`;
}

/** Has this question been answered well enough to submit its section? */
export function isAnswered(question, value) {
  if (question.optional) return true;
  switch (question.type) {
    case TYPES.slots:
      // Every slot filled. A partly ranked ballot is not a ranking.
      return (
        Array.isArray(value) &&
        value.filter(Boolean).length === (question.slots?.length || 0)
      );
    case TYPES.multi:
      return Array.isArray(value) && value.length > 0;
    case TYPES.text:
      return typeof value === "string" && value.trim().length > 0;
    default:
      return value !== undefined && value !== null && value !== "";
  }
}

/** Which questions in a section still need an answer. */
export function missingIn(section, answers) {
  return (section.questions || [])
    .filter((q) => KNOWN_TYPES.has(q.type))
    .filter((q) => !isAnswered(q, answers[answerKey(section, q)]))
    .map((q) => q.key);
}

export function sectionComplete(section, answers, requireAll = true) {
  if (!requireAll) return true;
  return missingIn(section, answers).length === 0;
}

/* -------------------------------------------------------------------------- *
 * Progress, kept in the browser
 *
 * localStorage rather than a server session, because a server session would
 * need something to key on and the only honest key is a person. A refresh
 * resumes the same ballot; a different device is a different ballot. That is
 * the documented trade and it is the price of the anonymity above.
 * -------------------------------------------------------------------------- */

const STORE_PREFIX = "cbc.poll.";

/** SSR-safe: the prerender has no window and must not throw reaching for one. */
function store() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    // Safari in private mode throws on access rather than returning null.
    return null;
  }
}

export function loadProgress(slug) {
  const ls = store();
  if (!ls) return null;
  try {
    const raw = ls.getItem(STORE_PREFIX + slug);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProgress(slug, progress) {
  const ls = store();
  if (!ls) return;
  try {
    ls.setItem(STORE_PREFIX + slug, JSON.stringify(progress));
  } catch {
    // Quota or private mode. Losing resume is survivable; crashing mid-ballot
    // in front of a room is not.
  }
}

export function clearProgress(slug) {
  const ls = store();
  if (!ls) return;
  try {
    ls.removeItem(STORE_PREFIX + slug);
  } catch {
    /* see saveProgress */
  }
}

/* -------------------------------------------------------------------------- *
 * Network
 *
 * Two calls, both thin. See supabase/polls.sql for why cast_ballot returns
 * nothing but ok and why poll_results returns counts and never rows.
 * -------------------------------------------------------------------------- */

export { hasBackend } from "./supabase";

/**
 * Send a completed ballot.
 *
 * Answers go up as the flat "section.question" map they were collected in, so
 * the tally in SQL can group on the key without knowing anything about the poll
 * definition. That is what lets a new poll be a JSON file and nothing else.
 */
export async function castBallot(slug, answers, options) {
  return rpc("cast_ballot", { p_slug: slug, p_answers: answers }, options);
}

/** Counts per option for a closed poll. Never returns write-in text. */
export async function pollResults(slug, options) {
  return rpc("poll_results", { p_slug: slug }, options);
}

/**
 * "Thursday 6pm won with 41% of 78 ballots."
 *
 * Built from the counts rather than typed by an officer, so the line on the hub
 * cannot drift from what people actually chose. Returns null when a poll has no
 * ballots, because "won with 0% of 0" is worse than saying nothing.
 */
export function outcomeLine(poll, results) {
  const total = results?.total || 0;
  if (!total) return null;

  const headline = poll.headlineQuestion || firstChoiceQuestion(poll);
  if (!headline) return null;

  const tally = results.questions?.[headline.key] || {};
  const [winner, count] = Object.entries(tally).sort((a, b) => b[1] - a[1])[0] || [];
  if (!winner) return null;

  const label = headline.options?.find((o) => o.key === winner)?.label || winner;
  const pct = Math.round((count / total) * 100);
  return `${label} won with ${pct}% of ${total} ballot${total === 1 ? "" : "s"}.`;
}

/** The first question whose winner is worth putting on the results line. */
function firstChoiceQuestion(poll) {
  for (const section of poll.sections || []) {
    for (const question of section.questions || []) {
      if (question.type === TYPES.single || question.type === TYPES.yesno) {
        return {
          key: answerKey(section, question),
          options:
            question.type === TYPES.yesno
              ? [
                  { key: "yes", label: "Yes" },
                  { key: "no", label: "No" },
                ]
              : question.options,
        };
      }
    }
  }
  return null;
}
