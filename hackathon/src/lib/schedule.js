/**
 * The schedule (SPEC §3.6).
 *
 * PLACEHOLDER (SPEC §5): every time here is a draft until the week of the
 * event. Hacking 21:00 Fri to 09:00 Sun is the 36 hours the name promises.
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
 */
export const SCHEDULE = [
  { day: "FRI", time: "18:00", title: "Check-in and dinner", tag: "FOOD" },
  { day: "FRI", time: "20:00", title: "Opening ceremony", tag: "TALK" },
  {
    day: "FRI",
    time: "21:00",
    title: "Hacking starts",
    highlight: true,
    window: "start",
  },
  { day: "SAT", time: "08:00", title: "Breakfast", tag: "FOOD" },
  { day: "SAT", time: "12:00", title: "Sponsor workshops", tag: "TALK" },
  { day: "SAT", time: "18:00", title: "Dinner", tag: "FOOD" },
  {
    day: "SUN",
    time: "09:00",
    title: "Hacking ends",
    tag: "BUILD",
    window: "end",
  },
  { day: "SUN", time: "10:00", title: "Demos and judging", tag: "DEMO" },
  { day: "SUN", time: "13:00", title: "Closing and prizes", tag: "TALK" },
];

/**
 * "FRI · 18:00". The separator is a middle dot with a space either side, and
 * the chip is `white-space: pre` in the reference so the spacing survives.
 */
export const timeChip = (row) => `${row.day} · ${row.time}`;

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

/** The 36 hours, as a span on the rail. Null if either end is ever unmarked,
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
