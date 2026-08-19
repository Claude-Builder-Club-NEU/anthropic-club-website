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
