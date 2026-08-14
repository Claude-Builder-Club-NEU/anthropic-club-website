// Single source of truth for external destinations.
// Anything the site links off-site lives here so it is changed in one place.

/** Primary conversion action. Verified live: "Claude Club Interest Form". */
export const INTEREST_FORM = "https://form.typeform.com/to/RH9sxEqE";

export const INSTAGRAM = "https://www.instagram.com/claudeclub.nu/";
export const LINKEDIN =
  "https://www.linkedin.com/company/northeastern-anthropic-builders-club";
export const LINKTREE = "https://linktr.ee/claudeNortheastern";

/**
 * Slack workspace, supplied 2026-08-13.
 *
 * Note this is a workspace URL, not a shared-invite link, so it only resolves
 * for people who are already members. Replace it with a shared invite
 * (Slack, People, Invite people, "Share invite link") so that a prospective
 * member can actually get in.
 */
export const SLACK_WORKSPACE = "https://claudebuildersclub.slack.com";

/** Canonical origin. Note: claudebuilders.com is a parked domain, not this site. */
export const SITE_ORIGIN = "https://claudebuildersneu.com";

/* ------------------------------------------------------------------------ *
 * BLOCKED VALUES
 *
 * Each constant below is empty on purpose. Every consumer checks for the empty
 * string and degrades to a sensible state, so supplying the real value is a
 * one-line change here and nothing else. Do not fill these with placeholders
 * that look real.
 * ------------------------------------------------------------------------ */

/**
 * Public Google Calendar ID, supplied 2026-08-13. Verified: the public ICS feed
 * returns HTTP 200, so the calendar really is shared publicly.
 *
 * Used by the FAQ "when do you meet" answer and the events calendar. The
 * build-time ICS fetch reads the same value from the GCAL_ID build env var
 * (see scripts/fetch-events.mjs); this constant is only for linking a human to
 * the calendar.
 *
 * NOTE: this is the primary calendar of a Gmail account, not a secondary
 * calendar. It works, but editing it means signing into that one account. A
 * secondary calendar shared with the board ("Make changes to events") would let
 * each member edit under their own login. Swapping to one is a change to this
 * value and the Netlify GCAL_ID variable, nothing else.
 */
export const CALENDAR_ID = "claudebuildersclubneu@gmail.com";

/** Human-facing calendar URL, derived. Empty while CALENDAR_ID is empty. */
export const CALENDAR_URL = CALENDAR_ID
  ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
      CALENDAR_ID
    )}&ctz=America%2FNew_York`
  : "";

/** Subscribe-in-your-own-calendar link, derived. */
export const CALENDAR_ICS = CALENDAR_ID
  ? `https://calendar.google.com/calendar/ical/${encodeURIComponent(
      CALENDAR_ID
    )}/public/basic.ics`
  : "";

export const hasCalendar = Boolean(CALENDAR_ID);

/**
 * Club-wide Luma page. OPTIONAL, and empty on purpose.
 *
 * RSVP links are per event: each calendar entry's description begins with its
 * own Luma link, which `scripts/fetch-events.mjs` parses into `rsvpUrl`. That
 * is the normal path and it needs nothing here.
 *
 * This constant is only a fallback for an entry whose description carries no
 * link. With neither, no RSVP button is rendered rather than one that goes
 * nowhere; the design handoff's `https://lu.ma/claudeclubneu` placeholder is
 * deliberately not shipped, its own README having said to replace it.
 *
 * The interest form remains the site's primary conversion action either way;
 * Luma is per-event RSVP, not joining the club.
 */
export const LUMA_URL = "";
