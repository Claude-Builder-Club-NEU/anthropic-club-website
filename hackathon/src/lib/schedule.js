import { EVENT } from "./event.js";
import { WORKSHOP_SLOTS } from "./workshops.js";
import { capitalize, inWords } from "./words.js";

/**
 * The schedule (SPEC §3.6), as the organizers set it for the week of the
 * event: doors Saturday at 9, hacking from 11 AM Saturday to 11 AM Sunday,
 * then lunch, judging, keynotes and the closing ceremony, done by 4.
 *
 * A row is { day, time, title, tag }, and may add `end`, shown beside `time`
 * in the panel, and `place`, the line under the title.
 *
 * The highlighted row carries `highlight: true` instead of a hard-coded index,
 * so re-ordering the list cannot move the emphasis to the wrong item. It also
 * has no `tag`: SPEC §3.6 replaces the category tag on that row with the
 * white "ADD TO CALENDAR" button.
 *
 * `window` marks the two ends of the hacking window for the timeline. Both
 * ends are named in the data rather than inferred from titles or cross-checked
 * against EVENT's ISO timestamps, because a timeline that disagreed with the
 * row it is drawn from would be worse than no timeline.
 *
 * Hacking ending and Sunday's lunch are one row: both start at 11, and two
 * markers on one spot of the rail could not both be clicked.
 *
 * The workshops are a marker for each hour, and a row carries its `sessions`
 * for the panel to list, straight from src/lib/workshops.js, so the timeline
 * and the Workshops section cannot disagree.
 */
const HQ = "300 Mass Ave";
const AMPHITHEATRE = "Raytheon Amphitheatre";
const CURRY = "Curry Rooms";

const sessionsAt = (time) => WORKSHOP_SLOTS.find((slot) => slot.time === time).sessions;

const workshopHour = (time, end) => ({
  day: "SAT",
  time,
  end,
  title: `${capitalize(inWords(sessionsAt(time).length))} workshops`,
  tag: "PUBLIC",
  place: CURRY,
  sessions: sessionsAt(time),
});

export const SCHEDULE = [
  { day: "SAT", time: "09:00", end: "10:00", title: "Check-in", tag: "ARRIVE", place: HQ },
  { day: "SAT", time: "10:00", end: "11:00", title: "Opening ceremony", tag: "TALK", place: HQ },
  {
    day: "SAT",
    time: "11:00",
    title: "Hacking begins",
    place: "All over campus",
    highlight: true,
    window: "start",
  },
  { day: "SAT", time: "12:00", end: "13:00", title: "Lunch", tag: "FOOD", place: HQ },
  {
    day: "SAT",
    time: "13:00",
    end: "14:00",
    title: "Sponsorship and club fair",
    tag: "FAIR",
  },
  workshopHour("14:00", "15:00"),
  workshopHour("15:00", "16:00"),
  workshopHour("16:00", "17:00"),
  workshopHour("17:00", "18:00"),
  { day: "SAT", time: "19:00", end: "20:00", title: "Dinner", tag: "FOOD", place: HQ },
  { day: "SUN", time: "00:00", title: "Midnight snack", tag: "FOOD", place: HQ },
  { day: "SUN", time: "09:00", end: "10:00", title: "Breakfast", tag: "FOOD", place: HQ },
  { day: "SUN", time: "10:30", end: "11:00", title: "Judge check-in and briefing", tag: "JUDGES", place: HQ },
  {
    day: "SUN",
    time: "11:00",
    title: "Hacking ends, then lunch",
    tag: "BUILD",
    place: `Hacking ends all over campus. Lunch until 12:00 at ${HQ}.`,
    window: "end",
  },
  { day: "SUN", time: "12:00", end: "14:00", title: "Judging", tag: "DEMO", place: AMPHITHEATRE },
  { day: "SUN", time: "14:00", end: "15:00", title: "Keynote speakers", tag: "TALK", place: AMPHITHEATRE },
  { day: "SUN", time: "15:00", end: "16:00", title: "Closing ceremony", tag: "TALK", place: HQ },
];

/** "SAT 09:00–10:00", or "SAT 11:00" for a moment rather than a slot. The
 *  chip is `white-space: pre`, so the spacing survives. */
export const timeChip = (row) => `${row.day} ${row.time}${row.end ? `–${row.end}` : ""}`;

/** Hours from midnight Friday. The weekend does not cross a month or a DST
 *  boundary, so three day offsets and a clock time are the whole calendar. */
const DAY_OFFSET = { FRI: 0, SAT: 24, SUN: 48 };

export function hourOf(row) {
  return (
    DAY_OFFSET[row.day] +
    Number(row.time.slice(0, 2)) +
    Number(row.time.slice(3, 5)) / 60
  );
}

const FIRST = hourOf(SCHEDULE[0]);
const LAST = hourOf(SCHEDULE[SCHEDULE.length - 1]);

/** Where a row sits along the rail, 0 to 100. The timeline is to scale — the
 *  gap between check-in and the opening ceremony is two hours and it looks
 *  like two hours, which is the only reason to draw a timeline at all. */
export function positionOf(row) {
  return ((hourOf(row) - FIRST) / (LAST - FIRST)) * 100;
}

/** The hacking window, as a span on the rail. Null if either end is ever unmarked,
 *  so the timeline degrades to a plain rail rather than drawing a wrong one. */
export const HACK_WINDOW = (() => {
  const start = SCHEDULE.find((row) => row.window === "start");
  const end = SCHEDULE.find((row) => row.window === "end");
  if (!start || !end) return null;
  const left = positionOf(start);
  return {
    left,
    width: positionOf(end) - left,
    hours: Math.round(hourOf(end) - hourOf(start)),
  };
})();

/**
 * When check-in opens, from the first row of the schedule, so the ticket and
 * the timeline cannot disagree. "09:00" on SAT becomes "9:00 AM", and with
 * `long`, "Saturday, Nov 7 at 9:00 AM" (the date is the first day of
 * EVENT.dateLong's range).
 */
const DAY_NAMES = { Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };

/** "Sat": the first schedule row's day, as it is written on the ticket. */
export const checkInDay = () => SCHEDULE[0].day.charAt(0) + SCHEDULE[0].day.slice(1).toLowerCase();

export function checkInTime({ long = true } = {}) {
  const [h, m] = SCHEDULE[0].time.split(":").map(Number);
  const clock = `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  if (!long) return clock;
  const date = EVENT.dateLong
    .split("–")[0]
    .trim()
    .replace(/^(Fri|Sat|Sun) /, (_, d) => `${DAY_NAMES[d]}, `);
  return `${date} at ${clock}`;
}
