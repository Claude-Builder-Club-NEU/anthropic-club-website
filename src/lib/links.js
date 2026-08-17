// Single source of truth for external destinations.
// Anything the site links off-site lives here so it is changed in one place.

/** Primary conversion action. Verified live: "Claude Club Interest Form". */
export const INTEREST_FORM = "https://form.typeform.com/to/RH9sxEqE";

export const INSTAGRAM = "https://www.instagram.com/claudeclub.nu/";
export const LINKEDIN =
  "https://www.linkedin.com/company/northeastern-anthropic-builders-club";
export const LINKTREE = "https://linktr.ee/claudeNortheastern";

/**
 * Slack shared invite, supplied 2026-08-17.
 *
 * Replaces the bare workspace URL (https://claudebuildersclub.slack.com),
 * which only resolved for people who were already members. The one link on the
 * site aimed squarely at prospective members was therefore the one link a
 * prospective member could not use. Verified live before it shipped: the URL
 * renders a real join page rather than an expired-invite error.
 *
 * Two things to know about a shared invite, neither of which applied to the
 * workspace URL it replaces:
 *
 * Slack can set these to expire, and an expired one fails silently from the
 * site's side. Nothing here can detect it, so set the invite to never expire,
 * or re-check it at the start of each semester.
 *
 * It is a public join link on a public site, so anyone who finds the page can
 * enter the workspace, not only Northeastern students. That is the intent for
 * an open club, but it is a deliberate choice rather than a side effect.
 *
 * The name is kept as SLACK_WORKSPACE because three consumers import it
 * (Layout, LinkHub and the outbound-click tracker in analytics.js), and the
 * destination, not the identifier, is what changed.
 */
export const SLACK_WORKSPACE =
  "https://join.slack.com/t/claudebuildersclub/shared_invite/zt-463tkfvd1-88ra5Rls6VolFMdsZ~mOFQ";

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
