/**
 * Unsubscribe: where the page lives, and how a request reaches the board.
 *
 * THE DATABASE IS THE RECORD. The request is written to the club's own
 * Supabase project, the same one attendance and polls already use, and the
 * board reads it from the dashboard.
 *
 * It used to post ONLY to Web3Forms, which emails the club inbox. That failed
 * in the worst possible way: Web3Forms accepted every submission with a 200 and
 * delivered the mail to an inbox nobody was reading, so requests were taken and
 * then invisible. People asked to be removed and nothing reached anyone. An
 * emailed notification is a convenience and must never be the only copy.
 *
 * The email is still sent, best effort, so the board gets a nudge if the inbox
 * is ever fixed. It cannot fail the request: the write happens first, and a
 * rejected or unreachable Web3Forms is swallowed. Losing a notification is an
 * annoyance; losing an unsubscribe is the thing this page exists to prevent.
 *
 * NO ORACLE. request_unsubscribe() answers identically whether or not the
 * address was on any list, so the page cannot be used to ask who is a member.
 * See supabase/unsubscribes.sql, which enforces that in SQL.
 *
 * THE URL IS UNGUESSABLE, NOT SECRET, and the difference matters.
 *
 * This is a static site. The slug below is compiled into the client bundle and
 * committed to a public repository, so anyone who looks can find it. What the
 * random path actually buys is that the page is not reachable by guessing
 * /unsubscribe, and is not linked from anywhere on the site. Search engines are
 * kept away by the `noindex` on its route in lib/seo.js, which also keeps it
 * out of sitemap.xml.
 *
 * It is deliberately NOT in robots.txt. A Disallow line is a public list of the
 * paths you did not want found, so adding it there would publish the very thing
 * the random slug is for.
 *
 * None of that needs to hold a secret, because the page holds none. The worst
 * an unwanted visitor can do is send the board an email asking us to stop
 * writing to an address, which a person reads before acting on.
 */

import { rpc, hasBackend } from "./supabase";

export { hasBackend };

/**
 * Where the page lives. Twenty characters from a 27-symbol alphabet, about 95
 * bits, generated once with crypto.randomBytes.
 *
 * No vowels, so it cannot accidentally spell anything, and none of the
 * characters that are confusable when read aloud. Exported rather than written
 * inline so the route table, the router and the page cannot drift apart.
 *
 * CHANGING IT retires the old link. Anything already sent out stops working, so
 * only rotate it if the current one is being abused, and expect to reissue the
 * newsletter footer.
 */
export const UNSUBSCRIBE_SLUG = "js7hc4qc5xjppcghkhh3";
export const UNSUBSCRIBE_PATH = `/${UNSUBSCRIBE_SLUG}`;

/**
 * Same key and endpoint as the workshop pitch. The key is inlined into the
 * bundle at build time and that is how Web3Forms is designed: it identifies the
 * destination inbox and authorises reading nothing. Abuse is restricted in the
 * Web3Forms dashboard, by allowed domain and rate limit, not by hiding it.
 *
 * Absent key is a designed state, not a crash: the page says so and points at a
 * board member, rather than rendering a field that would report success and
 * send nothing.
 */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "";
const ENDPOINT = "https://api.web3forms.com/submit";

/**
 * Whether the OPTIONAL email notification can be sent. The page does not gate
 * on this: storage is `hasBackend` from lib/supabase.js, and an unsubscribe is
 * recorded whether or not anyone gets an email about it.
 */
const canEmail = Boolean(ACCESS_KEY);

/**
 * Any syntactically plausible address, NOT just a Northeastern one.
 *
 * Attendance restricts the domain because a stamp card is a membership
 * artefact. This is the opposite case: refusing an unsubscribe because the
 * address looks unfamiliar leaves somebody receiving mail they asked to stop.
 * The interest form takes any address, so this has to as well.
 *
 * Anchored at both ends. The suffix-only form of this pattern was already found
 * once in this codebase to accept "someone@gmail.com.jordan@northeastern.edu".
 */
export const ANY_EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** RFC 5321 caps an address at 254 characters. */
export const EMAIL_MAX = 254;

/** Lowercase and trim, so the inbox gets one consistent form of the address. */
export function normalizeEmail(raw) {
  return (raw || "").trim().toLowerCase();
}

/**
 * The message shown under the field, or "" when the value is fine.
 *
 * Wording is the next action, not a description of the mistake. The form sets
 * noValidate, so the browser's own type="email" check does not run and this is
 * the only gate the address passes through.
 */
export function validate(email) {
  const clean = normalizeEmail(email);
  if (!clean) return "Enter the email address you want removed.";
  if (clean.length > EMAIL_MAX) return "That address is too long.";
  if (!ANY_EMAIL.test(clean)) return "Check that address and try again.";
  return "";
}

/**
 * Record the request.
 *
 * The Supabase write is the one that matters and the only one that can fail the
 * call. The email is fired afterwards and its outcome is discarded: a broken
 * notification must never turn into a lost unsubscribe.
 *
 * Resolves when the row is durable. Throws when it is not, so the page can tell
 * the person to try again rather than reporting a success that did not happen.
 *
 * @param {string} email
 * @param {{botcheck?: boolean, signal?: AbortSignal}} [options]
 */
export async function requestUnsubscribe(email, options = {}) {
  const clean = normalizeEmail(email);

  const data = await rpc(
    "request_unsubscribe",
    { p_email: clean },
    { signal: options.signal }
  );

  if (!data?.ok) {
    throw new Error(data?.reason || "rejected");
  }

  // Best effort, deliberately not awaited into the result. A notification is a
  // convenience; the row above is the record.
  notify(clean, options.botcheck).catch(() => {});

  return true;
}

/** The optional email nudge. Never throws into the caller. */
async function notify(clean, botcheck) {
  if (!canEmail) return;

  await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: ACCESS_KEY,
      subject: `Unsubscribe: ${clean}`,
      from_name: "Claude Builders Club website",
      botcheck: botcheck ? "true" : "",
      email: clean,
      message:
        `Please remove ${clean} from the newsletter mailing list. ` +
        `This request is also recorded in Supabase, table public.unsubscribes, ` +
        `which is the authoritative copy.`,
    }),
  });
}