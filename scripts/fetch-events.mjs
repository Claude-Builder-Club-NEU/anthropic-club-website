/**
 * Build-time calendar fetch.
 *
 * Reads the club's public Google Calendar ICS feed and writes
 * src/lib/events.generated.json. Runs before every build (see package.json
 * "prebuild"), so a Netlify scheduled rebuild is what keeps the site fresh.
 *
 * NO CONFIGURATION IS REQUIRED. The calendar address falls back to CALENDAR_ID
 * in src/lib/links.js, which is committed, so a fresh deploy builds with events
 * out of the box. Set GCAL_ID in the environment only to point a build at a
 * different calendar.
 *
 * Deliberate choices:
 * - ICS, not the REST API, so there is no API key to leak or restrict.
 * - Runs at build time only. Nothing calls Google from the browser.
 * - A failed fetch never fails the build; it writes an empty array and warns.
 *   A calendar outage should not take the site down.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CALENDAR_ID } from "../src/lib/links.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/lib/events.generated.json");

/**
 * Load .env for local runs.
 *
 * This script runs under plain Node as a prebuild step, not through Vite, so it
 * never saw the .env file that .env.example tells you to create. Setting
 * GCAL_ID there did nothing and the script reported "GCAL_ID not set", which
 * made it impossible to test the calendar locally without exporting the
 * variable by hand.
 *
 * A real environment variable always wins, so Netlify's build environment is
 * unaffected by anything in a local file.
 */
function loadDotEnv() {
  const file = resolve(__dirname, "../.env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (!m) continue;
    const key = m[1];
    if (process.env[key] !== undefined) continue;
    process.env[key] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadDotEnv();

/**
 * Calendar address, resolved in order of precedence:
 *
 *   1. GCAL_ID in the real environment  (Netlify build variable)
 *   2. GCAL_ID in a local .env          (a developer's machine)
 *   3. CALENDAR_ID committed in src/lib/links.js
 *
 * Step 3 is what lets a deploy work with no build configuration at all. The
 * calendar address is not a secret: it is the public identifier of a publicly
 * shared calendar, it is already committed as CALENDAR_ID because the site
 * builds human-facing links from it, and it authorises nothing. Requiring it to
 * be set a second time in a dashboard only creates a way for the deployed site
 * to silently build with no events while local builds have them.
 *
 * The first two still win, so pointing a branch deploy at a different calendar
 * remains a one-variable change.
 */
const GCAL_ID = process.env.GCAL_ID || CALENDAR_ID || "";
const HORIZON_DAYS = 400;

function write(events, note) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(events, null, 2) + "\n");
  console.log(`[events] wrote ${events.length} event(s) — ${note}`);
}

/** Unfold RFC 5545 line continuations (a leading space continues the line). */
function unfold(ics) {
  return ics.replace(/\r?\n[ \t]/g, "");
}

function decode(value) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

/**
 * Split a Google Calendar description into an RSVP link and prose.
 *
 * The club writes the entry description as the RSVP link followed by the blurb:
 *
 *   https://lu.ma/claude-info-session
 *   What the club is, what we build, and how to get involved. Open to all.
 *
 * The link drives the "RSVP on Luma" button and is never shown as text; the
 * prose after it becomes the description line. Descriptions typed in the Google
 * Calendar web UI often arrive as HTML rather than plain text, with the URL
 * wrapped in an anchor, so tags and entities are stripped first.
 *
 * If there is nothing after the link, the text *before* it is used instead
 * (minus the link and any "RSVP:" style label). Losing a blurb because someone
 * put it above the link would be a silly way to fail.
 */
const URL_RE = /https?:\/\/[^\s<>"')\]]+/;

/**
 * Only http and https survive into a link.
 *
 * Everything on this page ultimately comes from a Google Calendar entry, which
 * is data this codebase does not control: the calendar is edited by whoever
 * holds that account, and an ICS feed is fetched over the network. An entry
 * whose URL property read `javascript:...` would otherwise be written straight
 * into an anchor's href and become script execution on click.
 *
 * The description parser already constrains its own match to http(s) by regex.
 * This is the gate for the ICS URL property, which has no such constraint, and
 * a second check on anything else that reaches an href.
 */
function safeUrl(value) {
  if (!value) return null;
  let parsed;
  try {
    parsed = new URL(String(value).trim());
  } catch {
    return null;
  }
  return parsed.protocol === "http:" || parsed.protocol === "https:"
    ? parsed.href
    : null;
}

function stripHtml(s) {
  return s
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'");
}

const tidy = (s) =>
  s
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n")
    .trim();

export function parseDescription(raw) {
  if (!raw) return { description: null, rsvpUrl: null };

  const text = stripHtml(raw);
  const match = text.match(URL_RE);

  if (!match) return { description: tidy(text) || null, rsvpUrl: null };

  const rsvpUrl = match[0].replace(/[.,;]+$/, "");
  const after = tidy(text.slice(match.index + match[0].length));
  if (after) return { description: after, rsvpUrl };

  const before = tidy(text.slice(0, match.index))
    .replace(/^(rsvp|register|sign\s*up)\s*[:\-–—]?\s*/i, "")
    .trim();

  return { description: before || null, rsvpUrl };
}

/** "20260901T183000Z" | "20260901" -> ISO string. */
function toIso(raw, isDate) {
  if (!raw) return null;
  if (isDate || /^\d{8}$/.test(raw)) {
    const y = raw.slice(0, 4), m = raw.slice(4, 6), d = raw.slice(6, 8);
    return `${y}-${m}-${d}T00:00:00.000Z`;
  }
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  // Floating (no Z) times are treated as UTC. Acceptable here: the site shows
  // dates in the visitor's locale and the club publishes in one timezone.
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}${z ? "Z" : "Z"}`).toISOString();
}

function parseIcs(ics) {
  const events = [];
  const blocks = unfold(ics).split("BEGIN:VEVENT").slice(1);

  for (const block of blocks) {
    const body = block.split("END:VEVENT")[0];
    const get = (key) => {
      const re = new RegExp(`^${key}(;[^:]*)?:(.*)$`, "m");
      const m = body.match(re);
      return m ? { params: m[1] || "", value: m[2] } : null;
    };

    const summary = get("SUMMARY");
    if (!summary) continue;

    const dtstart = get("DTSTART");
    const dtend = get("DTEND");
    if (!dtstart) continue;

    const allDay = /VALUE=DATE(?!-TIME)/.test(dtstart.params);
    const start = toIso(dtstart.value.trim(), allDay);
    if (!start) continue;

    // Skip cancelled entries rather than showing them.
    const status = get("STATUS");
    if (status && /CANCELLED/i.test(status.value)) continue;

    const uid = get("UID");
    const loc = get("LOCATION");
    const desc = get("DESCRIPTION");
    const url = get("URL");

    const { description, rsvpUrl } = parseDescription(
      desc ? decode(desc.value) : ""
    );

    events.push({
      id: uid ? decode(uid.value) : `${start}-${decode(summary.value)}`,
      title: decode(summary.value),
      start,
      end: dtend ? toIso(dtend.value.trim(), allDay) : null,
      location: loc ? decode(loc.value) || null : null,
      description,
      // The RSVP link parsed out of the description. Falls back to the entry's
      // own URL property, which Google sets for events created with one.
      rsvpUrl: safeUrl(rsvpUrl) || safeUrl(url ? decode(url.value) : null),
      url: safeUrl(url ? decode(url.value) : null),
      allDay,
    });
  }
  return events;
}

async function main() {
  if (!GCAL_ID) {
    // Never clobber a good file with an empty one on a local build.
    if (existsSync(OUT)) {
      console.log("[events] GCAL_ID not set — keeping existing generated file");
      return;
    }
    write([], "GCAL_ID not set (expected until the calendar is created)");
    return;
  }

  const url = `https://calendar.google.com/calendar/ical/${encodeURIComponent(
    GCAL_ID
  )}/public/basic.ics`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) {
      write([], `calendar responded ${res.status} — check it is public`);
      return;
    }
    const horizon = Date.now() + HORIZON_DAYS * 864e5;
    const events = parseIcs(await res.text())
      .filter((e) => new Date(e.start).getTime() < horizon)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
    write(events, `fetched from ${GCAL_ID}`);
  } catch (err) {
    // A calendar outage must not fail the build.
    write([], `fetch failed (${err.message}) — shipping empty state`);
  }
}

/* Only fetch when run as a script. This module also exports parseDescription,
   and importing that to test it should not hit the network or rewrite the
   generated file. */
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  main();
}
