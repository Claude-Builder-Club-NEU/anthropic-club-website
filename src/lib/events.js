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

/** @typedef {{id:string,title:string,start:string,end:string|null,location:string|null,description:string|null,url:string|null,allDay:boolean}} ClubEvent */

/** @type {ClubEvent[]} */
const ALL = Array.isArray(generated) ? generated : [];

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

export const hasEvents = ALL.length > 0;
export default ALL;
