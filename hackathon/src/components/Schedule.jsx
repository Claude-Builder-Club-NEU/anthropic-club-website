import { useId, useRef, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import {
  HACK_WINDOW,
  SCHEDULE,
  positionOf,
  timeChip,
} from "../lib/schedule";
import { LINKS } from "../lib/event";
import { withBase } from "../lib/base";

/**
 * 3.6 Schedule, as an interactive timeline.
 *
 * IT IS TO SCALE. Every marker sits at its real position between check-in on
 * Friday and prizes on Sunday, so the two hours before the opening ceremony
 * and the eleven overnight hours look like what they are. A list of nine rows
 * told you the order; this tells you the shape of the weekend, which is the
 * thing someone deciding whether to come is actually asking about.
 *
 * THE 36 HOURS ARE A SPAN, NOT A ROW. The hacking window is drawn as a lit
 * segment of the rail between its two ends, labelled with its own length. The
 * section is called "36 hours, start to finish" and now the graphic says so.
 *
 * INTERACTION: this is the tablist pattern, because that is exactly what it
 * is — a row of selectors over one panel. Click or arrow-key between markers;
 * Home and End jump to the ends; the panel carries the full detail so the rail
 * never has to fit nine titles across. It opens on the moment the clock
 * starts, which is the one everybody is looking for.
 *
 * The rail is horizontal and proportional from 900px up, and a plain vertical
 * timeline below that — same markup, different layout, so nothing about this
 * depends on measuring the viewport in JavaScript. 900 rather than the page's
 * usual 720 because nine stamps across the 498px a 720px window leaves still
 * collide at the ends, where the events bunch up.
 */

/** Open on "Hacking starts". Computed from the data, not a literal, so the
 *  server and the client cannot disagree about it. */
const DEFAULT_INDEX = Math.max(
  0,
  SCHEDULE.findIndex((row) => row.highlight),
);

/** True on the first event of a day. Nine day prefixes across one rail is
 *  noise; three is a calendar. The day sits on its own line above the time —
 *  side by side it made the stamp wide enough to collide with its neighbour
 *  at the two ends of the rail, where the events bunch up. */
function opensDay(i) {
  return i === 0 || SCHEDULE[i - 1].day !== SCHEDULE[i].day;
}

export function Schedule() {
  const [active, setActive] = useState(DEFAULT_INDEX);
  const railRef = useRef(null);
  const baseId = useId();
  const tabId = (i) => `${baseId}-tab-${i}`;
  const panelId = `${baseId}-panel`;

  /** Roving focus. The tab that moves focus is the one that gets selected,
   *  which is the expected behaviour for a tablist whose panels are cheap. */
  function onKeyDown(event) {
    const last = SCHEDULE.length - 1;
    let next = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = active === last ? 0 : active + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = active === 0 ? last : active - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    }
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    railRef.current?.querySelector(`#${CSS.escape(tabId(next))}`)?.focus();
  }

  const row = SCHEDULE[active];

  return (
    <section id="schedule" aria-labelledby="schedule-h" className="hk-section">
      <SectionHeading
        id="schedule-h"
        chip="SCHEDULE"
        title="36 hours, start to finish"
      >
        All times Eastern. Pick a moment on the timeline. The schedule is
        tentative until the week of the event.
      </SectionHeading>

      <div className="hk-time">
        <div
          className="hk-time__rail"
          role="tablist"
          aria-label="Schedule"
          ref={railRef}
          onKeyDown={onKeyDown}
        >
          <span className="hk-time__track" aria-hidden="true" />

          {HACK_WINDOW ? (
            <span
              className="hk-time__window"
              aria-hidden="true"
              style={{
                left: `${HACK_WINDOW.left}%`,
                width: `${HACK_WINDOW.width}%`,
              }}
            >
              <span className="hk-time__windowLabel">
                {HACK_WINDOW.hours} HOURS
              </span>
            </span>
          ) : null}

          {SCHEDULE.map((item, i) => (
            <button
              key={`${item.day}-${item.time}`}
              type="button"
              role="tab"
              id={tabId(i)}
              aria-selected={i === active}
              aria-controls={panelId}
              tabIndex={i === active ? 0 : -1}
              className={
                i === active ? "hk-time__mark is-active" : "hk-time__mark"
              }
              style={{ "--x": `${positionOf(item)}%` }}
              onClick={() => setActive(i)}
            >
              <span className="hk-time__stem" aria-hidden="true" />
              <span className="hk-time__dot" aria-hidden="true" />
              <span className="hk-time__stamp">
                {opensDay(i) ? (
                  <span className="hk-time__day">{item.day}</span>
                ) : null}
                {item.time}
              </span>
              <span className="hk-time__name">{item.title}</span>
            </button>
          ))}
        </div>

        <div
          className="hk-time__panel"
          role="tabpanel"
          id={panelId}
          aria-labelledby={tabId(active)}
          tabIndex={-1}
        >
          <span className="hk-time__chip">{timeChip(row)}</span>
          <h3 className="hk-time__title">{row.title}</h3>
          {row.highlight ? (
            <AddToCalendar />
          ) : (
            <span className="hk-time__tag">{row.tag}</span>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * The white button on the moment the clock starts.
 *
 * It links to a real .ics file, generated from the same event data by
 * scripts/build-ics.mjs, so the two can never disagree about when hacking
 * starts. `download` makes the browser save it rather than try to display a
 * text file it half-recognises.
 */
function AddToCalendar() {
  return (
    <a className="hk-cal" href={withBase(LINKS.calendar)} download>
      <span className="hk-cal__label">ADD TO CALENDAR</span>
      <span className="hk-cal__arrow" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path
            d="M3 11 L11 3 M4 3 H11 V10"
            fill="none"
            stroke="#000000"
            strokeWidth="1.6"
          />
        </svg>
      </span>
    </a>
  );
}
