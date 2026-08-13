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
 * CAVEAT — this is a workspace URL, not a join link. It resolves (HTTP 200) but
 * serves Slack's sign-in screen, so it only works for people who are ALREADY
 * members. The site's primary audience is prospective members, for whom this is
 * a dead end.
 *
 * The old shared-invite recovered from /join is confirmed dead: it 403s, and it
 * pointed at a different workspace entirely (claudebuilder-vzb9586), not this
 * one. It has been dropped rather than shipped broken.
 *
 * TODO: Jackson — generate a shared-invite link for this workspace
 * (Slack → People → Invite people → "Share invite link") and replace this.
 * Until then the link hub should send prospective members to INTEREST_FORM.
 */
export const SLACK_WORKSPACE = "https://claudebuildersclub.slack.com";

/** Canonical origin. Note: claudebuilders.com is a parked domain, not this site. */
export const SITE_ORIGIN = "https://claudebuildersneu.com";
