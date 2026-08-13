/**
 * Build-time calendar fetch.
 *
 * Reads the club's public Google Calendar ICS feed and writes
 * src/lib/events.generated.json. Runs before every build (see package.json
 * "prebuild"), so a Netlify scheduled rebuild is what keeps the site fresh.
 *
 * Configure with GCAL_ID in the Netlify build environment, e.g.
 *   GCAL_ID=abc123@group.calendar.google.com
 *
 * Deliberate choices:
 * - ICS, not the REST API, so there is no API key to leak or restrict.
 * - Runs at build time only. Nothing calls Google from the browser.
 * - A failed fetch never fails the build; it writes an empty array and warns.
 *   A calendar outage should not take the site down.
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/lib/events.generated.json");

const GCAL_ID = process.env.GCAL_ID || "";
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

    events.push({
      id: uid ? decode(uid.value) : `${start}-${decode(summary.value)}`,
      title: decode(summary.value),
      start,
      end: dtend ? toIso(dtend.value.trim(), allDay) : null,
      location: loc ? decode(loc.value) || null : null,
      description: desc ? decode(desc.value) || null : null,
      url: url ? decode(url.value) || null : null,
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

main();
