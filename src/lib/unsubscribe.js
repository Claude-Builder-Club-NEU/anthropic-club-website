/**
 * Unsubscribe: where the page lives, and how a request reaches the board.
 *
 * It posts to Web3Forms, the same service and the same access key the workshop
 * pitch already uses, so a request arrives as an email in the club inbox and an
 * officer removes the address from the mailing list by hand.
 *
 * WHY NOT THE DATABASE. Supabase is already wired up for attendance and polls,
 * and a table would give a deduplicated queue with a handled/not-handled
 * column. It would also mean a schema to run, a new public write endpoint to
 * reason about, and a stored list of people leaving the club, which is a thing
 * worth not accumulating. An inbox needs none of that, and at this volume an
 * email per request is the whole workflow. The trade you accept: no dedupe, so
 * a person who clicks twice sends two emails, and no record of which ones you
 * have already actioned beyond your own inbox.
 *
 * A useful side effect: there is no lookup anywhere in this path, so the page
 * cannot be used to ask whether an address is on the list. A database-backed
 * version has to be careful never to answer that question. This one cannot.
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

export const hasForm = Boolean(ACCESS_KEY);

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
 * Send the request.
 *
 * Resolves true when Web3Forms accepted it. Every other outcome, a rejection or
 * a network failure, throws, so the caller has one success path and one failure
 * path rather than three states to tell apart.
 *
 * @param {string} email
 * @param {{botcheck?: boolean, signal?: AbortSignal}} [options]
 */
export async function requestUnsubscribe(email, options = {}) {
  const clean = normalizeEmail(email);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: ACCESS_KEY,
      // Prefixed so these sort together in the inbox and can be filtered into
      // their own label without reading the body.
      subject: `Unsubscribe: ${clean}`,
      from_name: "Claude Builders Club website",
      botcheck: options.botcheck ? "true" : "",
      email: clean,
      // Spelled out because the email is read by a person who then goes and
      // does something. A bare address in an inbox is a puzzle at 8am.
      message: `Please remove ${clean} from the newsletter mailing list.`,
    }),
    signal: options.signal,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || `Request failed (${res.status}).`);
  }
  return true;
}
