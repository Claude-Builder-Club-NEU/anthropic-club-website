/**
 * Event facts and the SPEC §5 placeholders.
 *
 * Everything listed in "Placeholders to confirm before launch" lives here and
 * nowhere else, so confirming one is a single edit rather than a search. Each
 * one is marked PLACEHOLDER. Nothing in this file may import from React or
 * touch `window`: scripts/build-ics.mjs reads it with bare Node.
 */

export const EVENT = {
  name: "HACK1984",
  // No longer shown in the hero — the wordmark and the proof row carry it —
  // but still the page's one-sentence description, so it is what the meta
  // description and the .ics both use.
  tagline:
    "Every tool you opened today is watching you. Spend 36 hours building the ones that don't.",

  // SPEC §3.2 meta line, and the footer's date range.
  venue: "300 Massachusetts Ave, Boston",
  dateRange: "NOV 6–8, 2026",
  // The same range spelled out, for the line under the hero wordmark. Two
  // strings for one fact is a hazard, so: IF ONE MOVES, MOVE THE OTHER. They
  // are written next to each other for exactly that reason.
  dateLong: "Fri Nov 6 – Sun Nov 8, 2026",

  /**
   * PLACEHOLDER (SPEC §5, "Doors time"). Fri Nov 6, 2026, 6:00 PM ET.
   *
   * This one string drives three things that must never disagree: the
   * countdown target, the countdown paragraph, and the .ics file. -05:00 is
   * Eastern Standard Time; US DST ends Nov 1 2026, so November 6 is EST and
   * not EDT. Written as a fixed offset rather than a floating local time so
   * the countdown is the same number of seconds for a visitor in any timezone.
   */
  doorsISO: "2026-11-06T18:00:00-05:00",
  doorsLabel: "Fri Nov 6 at [6:00 PM] ET",

  /**
   * PLACEHOLDER (SPEC §5, "Schedule"). The moment the clock starts, used for
   * the "Hacking starts" calendar file. 21:00 Fri to 09:00 Sun is the 36 hours
   * the name promises; if either end moves, both move.
   */
  hackingStartISO: "2026-11-06T21:00:00-05:00",
  hackingEndISO: "2026-11-08T09:00:00-05:00",
};

/**
 * Capacity, and how much of it is gone.
 *
 * PLACEHOLDER: `seatsTaken` is typed in by hand. There is no signup backend
 * yet, so nothing updates it — when one exists this is the single value to
 * wire up, and the whole Seats section follows from it.
 *
 * `capacity` is the real number: 100 builders is the room's limit.
 */
export const SEATS = {
  capacity: 100,
  seatsTaken: 68,
};

/**
 * PLACEHOLDER (SPEC §5, "Link targets"). All three are "#" in the reference
 * render and stay "#" here rather than guessing a form URL.
 *
 * `calendar` is the exception: it points at a real file this repo generates,
 * so "Add to calendar" works today. See scripts/build-ics.mjs.
 */
export const LINKS = {
  signUp: "#",
  // Base-relative: resolved against the mount point by withBase() at render.
  calendar: "hacking-starts.ics",
};

/**
 * Where to find the event.
 *
 * PLACEHOLDER (SPEC §5, "Social links"): every href is "#" until the accounts
 * exist. `note` is the one line under the name in the Find us band — it says
 * what you actually get by following, which is claudeneu.com's convention and
 * the reason that band reads as useful rather than as four logos in a row.
 *
 * Lives here rather than in Footer.jsx because two places render it now, and
 * the footer's copy was the second source of truth for the same three URLs.
 */
export const SOCIAL = [
  { label: "Instagram", href: "#", note: "@hack1984", icon: "instagram" },
  { label: "LinkedIn", href: "#", note: "Follow the event", icon: "linkedin" },
  { label: "Slack", href: "#", note: "Join the room", icon: "slack" },
];

/** The header nav (SPEC §3.1), in order. */
export const NAV = [
  { href: "#tracks", label: "TRACKS" },
  { href: "#schedule", label: "SCHEDULE" },
  { href: "#details", label: "DETAILS" },
  { href: "#sponsors", label: "SPONSORS" },
];
