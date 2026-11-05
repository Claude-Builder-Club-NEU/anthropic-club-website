/**
 * The Saturday workshops, open to the public as well as the hackers. One list
 * feeds both the timeline (src/lib/schedule.js makes a marker for each hour)
 * and the Workshops section (src/components/Workshops.jsx), so they cannot
 * disagree.
 *
 * Times are the organizers' sheet, and rooms are each Partiful event's, which
 * win where the two disagree. `title` is the Partiful event's
 * name where there is one, so a visitor lands on the name they clicked.
 * `rsvp` is null where the sheet has no link, and the row then has no button.
 *
 * Intro to Options and Mathematics hides its address until you RSVP, so its
 * room is still the sheet's. Healthtech's Partiful says 1:30 PM, and the
 * sheet's time is printed here until the two are reconciled. Partiful has
 * GTFOL and Venture Capital in room 344 at the same hour.
 *
 * A session is { time, title, host, room, format, rsvp }. `time` is 24-hour,
 * as the schedule's rows are, and every session is on Saturday.
 */
const FORMATS = { workshop: "WORKSHOP", fireside: "FIRESIDE CHAT" };

const partiful = (id) => `https://partiful.com/e/${id}`;

export const WORKSHOPS = [
  {
    time: "13:00",
    title: "Healthtech",
    host: null,
    room: "Virtual",
    format: FORMATS.workshop,
    rsvp: partiful("3GTZttKQBMUOkN2NU5nA"),
  },
  {
    time: "14:00",
    title: "Fintech",
    host: "Disrupt",
    room: "Curry 344",
    format: FORMATS.workshop,
    rsvp: partiful("51eo6VoN723aZcSFF19r"),
  },
  {
    time: "14:00",
    title: "Product Viability",
    host: "FuzionX",
    room: "Curry 346",
    format: FORMATS.workshop,
    rsvp: partiful("ToaofvVUOn2G8YDkXxaX"),
  },
  {
    time: "15:00",
    title: "How to Win a Hackathon",
    host: "Troy, Mouad and Ryan, moderated by Smyan",
    room: "Curry 344",
    format: FORMATS.workshop,
    rsvp: partiful("2NJ4Dgg2RyYg6GfGR1J1"),
  },
  {
    time: "15:00",
    title: "Privacy and Security in Data and AI",
    host: "Fidelity, moderated by Mehr",
    room: "Curry 346",
    format: FORMATS.fireside,
    rsvp: partiful("Nzd4LVCSg1LHisIYysK5"),
  },
  {
    time: "15:00",
    title: "Intro to Options and Mathematics",
    host: "NUSA with Netochi",
    room: "Curry 342",
    format: FORMATS.workshop,
    rsvp: partiful("3PoTvhAPTbSc3D14o0fU"),
  },
  {
    time: "16:00",
    title: "How to Become a Founder",
    host: "E-Club with Ryan and Eunsu",
    room: "Curry 344",
    format: FORMATS.fireside,
    rsvp: partiful("heebpAICKalSIr6LH9DI"),
  },
  {
    time: "16:00",
    title: "Teaching Technical Concepts to Nontechnical Audiences",
    host: "FirstByte with Nick and Hector",
    room: "Curry 342",
    format: FORMATS.workshop,
    rsvp: partiful("u89eXw09weyuSE9SdyDA"),
  },
  {
    time: "16:00",
    title: "Private and Local AI",
    host: "Shourya, Rush Sanghrajka and EX",
    room: "Curry 348",
    format: FORMATS.workshop,
    rsvp: partiful("TDi7BNV8XYH6pxh4AwBk"),
  },
  {
    time: "17:00",
    title: "GTFOL",
    host: "Shourya and Disruptors Maritime YC",
    room: "Curry 344",
    format: FORMATS.workshop,
    rsvp: partiful("lHdGl6FMDXdkGXwS2wgN"),
  },
  {
    time: "17:00",
    title: "Venture Capital",
    host: "Tufts Jumbo Ventures, Cybernetics and Rick Li",
    room: "Curry 344",
    format: FORMATS.workshop,
    rsvp: partiful("njtdcB2Rgi0LbkVfw1Hi"),
  },
  {
    time: "17:00",
    title: "AI Policy Simulation",
    host: "NU Nexus",
    room: "Curry 346",
    format: FORMATS.workshop,
    rsvp: partiful("2TRTzhaOlRmb3jCZKPGd"),
  },
];

/** The sessions by start time, in order: one slot per hour of the afternoon. */
export const WORKSHOP_SLOTS = [...new Set(WORKSHOPS.map((session) => session.time))].map((time) => ({
  time,
  sessions: WORKSHOPS.filter((session) => session.time === time),
}));

/** "13:00" becomes "1:00 PM", for visitors who are not reading a schedule. */
export function clockTime(time) {
  const [h, m] = time.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
