/**
 * Events.
 *
 * Source of truth is a Google Calendar the exec board can edit. The website has
 * NO write path — that is what makes it safe. Permissions live on the calendar
 * ("Make changes to events" for the board, public read for the world), never in
 * the UI.
 *
 * Because this deploy target is static (Vite + prerender on Netlify), the
 * calendar is read at BUILD time by scripts/fetch-events.mjs, which writes
 * events.generated.json. Netlify rebuilds on a schedule keep it fresh — see
 * netlify.toml. There is deliberately no client-side API key.
 *
 * Until GCAL_ID is configured the generated file is an empty array and every
 * surface renders its empty state, which is the correct shipping state: the
 * club has no scheduled events yet.
 */

import generated from "./events.generated.json";

/**
 * `description` and `rsvpUrl` are split out of the calendar entry's raw
 * description at build time by scripts/fetch-events.mjs: the entry leads with
 * its Luma link and the prose follows, so the link drives the RSVP button and
 * never appears as text.
 *
 * @typedef {{id:string,title:string,start:string,end:string|null,location:string|null,description:string|null,rsvpUrl:string|null,url:string|null,allDay:boolean}} ClubEvent
 */

/** @type {ClubEvent[]} */
const ALL = Array.isArray(generated) ? generated : [];

/* ------------------------------------------------------------------------ *
 * Event kinds
 *
 * The calendar design handoff colour-codes events as info session / workshop /
 * hackathon. A Google Calendar ICS feed carries no colour and no category
 * field, so the kind is derived from the entry's own title. The board names
 * events normally and the site works it out; there is nothing new for them to
 * learn and no code change per event.
 *
 * Colours come from the pinned palette rather than the handoff's `kraft`
 * #CD9A6B. Slate Blue is already defined as a rare categorical accent, which is
 * exactly this use, and it separates from coral far better than an earth tone
 * does for the most common form of colour blindness. Measured on the fill:
 * paper on ink 17.50:1, ink on coral 5.90:1, ink on blue 6.30:1.
 *
 * Colour is never the only cue. Every chip and tile also names its kind in
 * text, and the legend swatches carry a hairline because coral and blue are
 * both under 3:1 against paper as bare fills.
 * ------------------------------------------------------------------------ */

/** @type {Record<string, {label: string, plural: string}>} */
export const KINDS = {
  info: { label: "Info session", plural: "Info sessions" },
  workshop: { label: "Workshop", plural: "Workshops" },
  hackathon: { label: "Hackathon", plural: "Hackathons" },
};

export const KIND_ORDER = ["info", "workshop", "hackathon"];

/**
 * Title keywords, most specific first.
 *
 * `athon\b` deliberately catches "Chatathon" and "Datathon" as well as
 * "Hackathon", since the club runs all three under the same banner. It would
 * also catch "Marathon"; if the club ever runs one, rename it or add a rule.
 */
const KIND_MATCHERS = [
  [/athon\b|\bhack\s?night\b/i, "hackathon"],
  [/\binfo(rmation)?\s*(session|night)\b|\bintro\b|\borientation\b|\bkick\s?-?off\b|\binterest\s*meeting\b/i, "info"],
];

/** Everything the club runs is a workshop unless the title says otherwise. */
export function kindOf(event) {
  const title = event?.title || "";
  for (const [re, kind] of KIND_MATCHERS) if (re.test(title)) return kind;
  return "workshop";
}

/* ------------------------------------------------------------------------ *
 * Capacity and emphasis
 *
 * THE ONE THING THE CALENDAR CANNOT TELL US, and therefore the exception to
 * this file's rule that the site works everything out from what the board
 * already typed. kindOf() and rsvpLabel() can derive what they need because
 * the answer is in the title or the link. "This room is full" is in neither:
 * Google Calendar has no capacity field, and Luma's headcount is behind a
 * login and is not readable at build time even if it were not.
 *
 * So it is written down. The alternative was inferring it from the Luma page
 * at build time, which would put a scrape of a third party between the club
 * and its own events page, and would fail closed in the wrong direction: a
 * scrape that breaks would quietly stop saying a full session is full.
 *
 * MATCHED ON THE TITLE, NOT THE GOOGLE EVENT ID. Deleting and recreating a
 * calendar entry issues a new id, which would silently drop the rule and put
 * an RSVP button back on a session with no seats. A title survives that, and
 * it is also the thing a board member can read and check.
 *
 * First match wins, so the specific entries sit above the general one.
 *
 *   full     no seats left. The tile recedes and its RSVP button is replaced
 *            by `note`, because a button pointing at a closed Luma page is a
 *            promise the page cannot keep.
 *   feature  the one the room should take instead. Reversed to ink, which is
 *            the existing `lead` treatment, so the eye lands on it first.
 * ------------------------------------------------------------------------ */

const EVENT_STATUS = [
  /**
   * 17 September 2026. Demand outgrew one room, a second session was opened at
   * 7pm, and the 6pm Luma filled. Both lines go when that day passes; nothing
   * breaks if they are forgotten, since a rule that matches no upcoming event
   * does nothing at all.
   */
  { match: /\(6:00pm Slot\)/i, full: true, note: "No more space" },
  { match: /\(7:00pm Slot\)/i, feature: true },

  /**
   * The general form, so the NEXT one needs no deploy. A board member puts
   * "(Full)" in the calendar title and the tile greys out within the hour, on
   * the same refresh job that carries any other calendar edit.
   *
   * Parenthesised deliberately. A bare /\bfull\b/ would also match a perfectly
   * ordinary "Full Stack Workshop" and strike its signup button off the page.
   */
  { match: /\(\s*full\s*\)/i, full: true, note: "No more space" },
];

/**
 * Capacity and emphasis for one event.
 *
 * Always returns the same shape, so a caller never has to test for null before
 * reading `.full`. An event matching no rule is the ordinary case and gets the
 * tile everything had before any of this existed.
 *
 * @param {ClubEvent} event
 * @returns {{full: boolean, feature: boolean, note: string}}
 */
export function statusOf(event) {
  const title = event?.title || "";
  const rule = EVENT_STATUS.find((r) => r.match.test(title));
  return {
    full: Boolean(rule?.full),
    feature: Boolean(rule?.feature),
    note: rule?.note || "",
  };
}

/** "6:00pm" — the compact form used on calendar chips. */
export function formatEventTimeShort(event) {
  if (event.allDay) return "All day";
  return new Date(event.start)
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace(" ", "")
    .toLowerCase();
}

/**
 * "6:00 to 7:30pm" — the long form used in event detail.
 *
 * "to" rather than an en dash: the system bans dashes as punctuation in
 * rendered copy and says to rewrite rather than swap the character.
 */
export function formatEventTimeRange(event) {
  if (event.allDay) return "All day";
  const start = formatEventTimeShort(event);
  if (!event.end) return start;
  const end = new Date(event.end);
  const endStr = end
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace(" ", "")
    .toLowerCase();
  // Drop the meridiem from the start when both sides share it: "6:00 to 7:30pm".
  const sm = start.slice(-2);
  const em = endStr.slice(-2);
  return `${sm === em ? start.slice(0, -2) : start} to ${endStr}`;
}

/** Events that have not finished yet, soonest first. */
export function upcoming(now = new Date()) {
  return ALL.filter((e) => new Date(e.end || e.start) >= now).sort(
    (a, b) => new Date(a.start) - new Date(b.start)
  );
}

/** Events that already happened, most recent first. */
export function past(now = new Date()) {
  return ALL.filter((e) => new Date(e.end || e.start) < now).sort(
    (a, b) => new Date(b.start) - new Date(a.start)
  );
}

export function formatEventDate(event) {
  const start = new Date(event.start);
  const date = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  if (event.allDay) return date;
  const time = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

/** schema.org/Event JSON-LD for a single event. */
export function eventJsonLd(event, origin) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.start,
    ...(event.end ? { endDate: event.end } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: event.location
      ? { "@type": "Place", name: event.location }
      : {
          "@type": "Place",
          name: "Northeastern University",
          address: "Boston, MA",
        },
    organizer: {
      "@type": "Organization",
      name: "Claude Builders Club @ Northeastern University",
      url: origin,
    },
    ...(event.description ? { description: event.description } : {}),
    ...(event.url ? { url: event.url } : {}),
  };
}

/* ------------------------------------------------------------------------ *
 * Signup labels
 *
 * The RSVP link is whatever the board put on line 1 of the calendar entry, and
 * that is not always Luma. The Chatathon is run with the partner club AINU and
 * signs up through a Google Form, so a button reading "RSVP on Luma" would name
 * the wrong service and promise the wrong kind of page: Luma is an RSVP you
 * confirm in a click, a Google Form is a set of questions to fill in.
 *
 * The label is therefore derived from the destination rather than assumed. The
 * board keeps pasting a link and the site works out what to call it, which is
 * the same bargain as kindOf() above: nothing new for them to learn and no code
 * change per event.
 *
 * `via` names the service only where naming it tells the reader something. On
 * Luma it does, because "RSVP on Luma" sets the expectation of a one-click
 * confirmation on a page they may already have an account for. On a Google Form
 * it does not: "Sign up" already says what happens, and "Sign up on Google
 * Forms" reads as though the form were the point rather than the hackathon.
 * ------------------------------------------------------------------------ */

const RSVP_LABELS = [
  [/^https?:\/\/(?:www\.)?(?:lu\.ma|luma\.com)\//i, { action: "RSVP", via: "on Luma" }],
  [/^https?:\/\/(?:docs\.google\.com\/forms\/|forms\.gle\/)/i, { action: "Sign up", via: "" }],
];

/**
 * How to label an event's signup link, derived from where it points.
 *
 * Returns null when there is no link, which every caller already treats as
 * "render no button rather than one that goes nowhere".
 *
 * An unrecognised host falls back to a bare "RSVP" rather than guessing at a
 * service name. That is the safe direction: a generic verb is always true,
 * whereas naming the wrong service is a small lie printed on a button.
 *
 * @param {string|null|undefined} url
 * @returns {{action: string, via: string, full: string}|null}
 */
export function rsvpLabel(url) {
  if (!url) return null;
  const match = RSVP_LABELS.find(([re]) => re.test(url));
  const { action, via } = match ? match[1] : { action: "RSVP", via: "" };
  return { action, via, full: via ? `${action} ${via}` : action };
}

export const hasEvents = ALL.length > 0;
export default ALL;
