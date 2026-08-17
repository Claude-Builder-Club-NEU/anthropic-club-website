// Single source of truth for external destinations.
// Anything the site links off-site lives here so it is changed in one place.

/** Primary conversion action. Verified live: "Claude Club Interest Form". */
export const INTEREST_FORM = "https://form.typeform.com/to/RH9sxEqE";

export const INSTAGRAM = "https://www.instagram.com/claudeclub.nu/";
export const LINKEDIN =
  "https://www.linkedin.com/company/northeastern-anthropic-builders-club";
export const LINKTREE = "https://linktr.ee/claudeNortheastern";

/**
 * Slack domain signup. Set 2026-08-17.
 *
 * This is the /signup path, NOT the bare workspace URL and NOT a shared
 * invite. Each of the three behaves differently and only this one is correct
 * here:
 *
 *   https://claudebuildersclub.slack.com          resolves only for people who
 *                                                 are already members, so the
 *                                                 one link aimed at prospective
 *                                                 members was the one link they
 *                                                 could not use.
 *
 *   https://join.slack.com/.../shared_invite/...  admits anyone holding the
 *                                                 link, regardless of email
 *                                                 domain. That is what a shared
 *                                                 invite is FOR, which makes it
 *                                                 the wrong thing to publish on
 *                                                 a public website: it is the
 *                                                 documented bypass around the
 *                                                 workspace's own domain rule.
 *
 *   /signup                                       self-service, and gated on
 *                                                 the approved email domain.
 *
 * The workspace already restricts signup to northeastern.edu, so this page
 * renders an email field suffixed with @northeastern.edu and tells anyone
 * without one to ask an admin for an invitation. A prospective student gets in
 * without a board member in the loop, and nobody else gets in at all.
 *
 * NOTE: only northeastern.edu is on Slack's approved list. The pitch form
 * accepts husky.neu.edu and neu.edu as well (see NEU_EMAIL in
 * components/WorkshopForm.jsx), so a student on a husky address can pitch a
 * workshop but cannot join the Slack. Add the other two in Slack under
 * Settings and administration, Workspace settings, to close that gap.
 *
 * The name is kept as SLACK_WORKSPACE because three consumers import it
 * (Layout, LinkHub and the outbound-click tracker in analytics.js), and the
 * destination, not the identifier, is what changed.
 */
export const SLACK_WORKSPACE = "https://claudebuildersclub.slack.com/signup";

/**
 * Canonical origin. Moved from claudebuildersneu.com on 2026-08-17.
 *
 * Every canonical tag, OG image URL, sitemap entry and the robots.txt sitemap
 * line derive from this one value, so a domain move is this constant and
 * nothing else. It is baked in at BUILD time, so none of them change until the
 * site rebuilds.
 *
 * No trailing slash: consumers concatenate a route path directly onto it, and
 * one here would emit "//about" in every canonical.
 *
 * https, not http: Netlify serves this domain over TLS only, and the CSP sets
 * upgrade-insecure-requests, so an http origin here would advertise a URL that
 * only ever redirects.
 *
 * Keep claudebuildersneu.com attached to the same Netlify site as an alias.
 * Netlify 301s aliases to the primary domain, which is what stops the printed
 * flyers, the QR codes and the Instagram bio from dying on the move.
 *
 * Note: claudebuilders.com is a parked domain and has never been this site.
 */
export const SITE_ORIGIN = "https://claudeneu.com";

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
