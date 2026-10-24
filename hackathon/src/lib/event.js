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
    "Every tool you opened today is watching you. Spend a weekend building the ones that don't.",

  // SPEC §3.2 meta line, and the footer's date range.
  venue: "300 Massachusetts Ave, Boston",
  dateRange: "NOV 7–8, 2026",
  // The same range spelled out, for the line under the hero wordmark. Two
  // strings for one fact is a hazard, so: IF ONE MOVES, MOVE THE OTHER. They
  // are written next to each other for exactly that reason.
  dateLong: "Sat Nov 7 – Sun Nov 8, 2026",

  /**
   * PLACEHOLDER until the backup room bookings are confirmed. Doors Sat Nov 7,
   * 2026 at 9:00 AM ET; hacking from noon Saturday to 1:00 PM Sunday; judging
   * and pitching after, done by 5:00 PM.
   *
   * These drive the .ics file (scripts/build-ics.mjs). -05:00 is Eastern
   * Standard Time: US DST ends Nov 1 2026, so November 7 is EST, not EDT.
   * Written as a fixed offset so the calendar entry is the same moment in
   * every timezone. The on-page schedule is src/lib/schedule.js; IF THESE
   * MOVE, MOVE THAT TOO.
   */
  doorsISO: "2026-11-07T09:00:00-05:00",
  doorsLabel: "Sat Nov 7 at [9:00 AM] ET",
  hackingStartISO: "2026-11-07T12:00:00-05:00",
  hackingEndISO: "2026-11-08T13:00:00-05:00",
};

/**
 * How getting in works: applications, not first come first served.
 *
 * Anyone can apply until the deadline. The organizers pick `spots` people and
 * email every applicant on decision day. The event is free: there is
 * no fee to apply and none to attend (the old $5 fee is gone).
 *
 * `deadlineISO` is the one date that DOES something: after it the signup page
 * closes its form, and /api/register refuses new applications
 * (netlify/functions/hackathon-register.mjs reads it from this file). -04:00
 * is Eastern Daylight Time, which is still in force in late October. The
 * labels are only words; IF A DATE MOVES, MOVE ITS LABEL WITH IT.
 *
 * `decisionsOut` stays false until the database matches the decisions: the
 * ticket page then stops saying "application received" and shows each
 * person's seat or waitlist place, read from their row. Before that, a row's
 * seat number is only the order it arrived in and means nothing.
 */
export const APPLY = {
  spots: 100,
  deadlineISO: "2026-10-25T23:59:59-04:00",
  deadlineLabel: "Sun Oct 25",
  deadlineShort: "Oct 25",
  decisionsLabel: "Mon Oct 26",
  decisionsShort: "Oct 26",
  decisionsOut: false,
};

/** Whether applications are still open at `now` (ms). Pure, so the server
 *  and the register function can both ask it. */
export function applicationsOpen(now = Date.now()) {
  return now <= Date.parse(APPLY.deadlineISO);
}

/**
 * Where the buttons go. All base-relative, resolved against the mount point by
 * withBase() at render: this file is also read by scripts/build-ics.mjs under
 * bare Node, where import.meta.env does not exist.
 *
 * `signUp` is the application form at /hackathon/signup/ (the path kept its
 * old name so links already shared still work); `ticket` is where someone's
 * application, and later their ticket, lives; `sponsor` is the sponsor
 * one-pager at /hackathon/sponsor/; `calendar` is the .ics file
 * scripts/build-ics.mjs generates.
 */
export const LINKS = {
  signUp: "signup/",
  ticket: "ticket/",
  sponsor: "sponsor/",
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
