import { useEffect, useMemo, useRef, useState } from "react";
import {
  KINDS,
  kindOf,
  formatEventTimeShort,
  formatEventTimeRange,
} from "../lib/events";
import { LUMA_URL } from "../lib/links";
import { ArrowRightIcon } from "./Icons";

/**
 * Month view, rendered with our own components rather than an iframed Google
 * embed, per the original brief's event system section. Board members edit the
 * calendar in Google Calendar itself; the site only ever reads.
 *
 * The month cursor is set after mount rather than during render. "Today" is a
 * different month at build time than it is for a visitor weeks later, and
 * rendering it on the server would produce a hydration mismatch that shows up
 * as a console error. The skeleton reserves the same height, so nothing shifts.
 *
 * EVENT DETAIL IS A POPOVER anchored to the chip, above it where there is room
 * and below it near the top of the grid. It is a sibling of the scroll shell
 * rather than a child, because the shell clips horizontally on narrow screens
 * and would cut the card in half; its position is measured against the wrapper
 * on open.
 *
 * It opens on hover, on focus, and on click. Hover is transient and closes on a
 * short delay, which is what lets the pointer travel the gap between chip and
 * card without it vanishing. Clicking pins it, which is what serves touch and
 * keyboard, and pinning is also the only case that moves focus: stealing focus
 * on hover would be hostile.
 *
 * The grid stays a <table>. The design uses CSS grid; a real table lets a
 * screen reader announce the weekday for a given cell and navigate by row and
 * column, which a grid of divs does not.
 */

/* Sunday-first, per the design. Full names so the header can offer three
   letters on a wide screen, one on a narrow one, and the whole word to a
   screen reader. */
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const sameMonth = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/* Enough room for the card plus its gap; below this the card flips under. */
const POP_CLEARANCE = 280;
const POP_WIDTH = 300;

const MonthGrid = ({ events = [] }) => {
  const [cursor, setCursor] = useState(null);
  const [pop, setPop] = useState(null); // { id, x, y, place, pinned }
  const wrapRef = useRef(null);
  const popRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    const anchor = events.length ? new Date(events[0].start) : new Date();
    setCursor(startOfMonth(anchor));
    // Events come from a build-time JSON import, so this runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Changing the filter closes the card. `events` is a stable identity per
  // filter (see the memo in Events.jsx), so this is a real filter change.
  useEffect(() => {
    setPop(null);
  }, [events]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setPop(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus the card only when it was pinned deliberately.
  useEffect(() => {
    if (pop?.pinned && popRef.current) popRef.current.focus();
  }, [pop?.pinned, pop?.id]);

  /** Chip position measured against the wrapper, which is the offset parent. */
  const posFor = (el) => {
    const wrap = wrapRef.current;
    if (!wrap) return null;
    const w = wrap.getBoundingClientRect();
    const c = el.getBoundingClientRect();
    const above = c.top - w.top > POP_CLEARANCE;
    // Keep the card inside the wrapper rather than letting it hang off an edge.
    // The card narrows on small screens, so clamp against whichever is smaller.
    const half = Math.min(POP_WIDTH, w.width) / 2;
    const rawX = c.left - w.left + c.width / 2;
    return {
      x: Math.min(Math.max(rawX, half), Math.max(w.width - half, half)),
      y: above ? c.top - w.top - 8 : c.bottom - w.top + 8,
      place: above ? "above" : "below",
    };
  };

  const openFor = (event, el, pinned) => {
    clearTimeout(closeTimer.current);
    const p = posFor(el);
    if (p) setPop({ ...p, id: event.id, pinned });
  };

  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    // Functional update so a pin made after this was scheduled still wins.
    closeTimer.current = setTimeout(
      () => setPop((p) => (p && p.pinned ? p : null)),
      140
    );
  };

  const { cells, label, count } = useMemo(() => {
    if (!cursor) return { cells: [], label: "", count: 0 };
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lead = firstOfMonth.getDay(); // Sunday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const byDay = new Map();
    let total = 0;
    for (const e of events) {
      const d = new Date(e.start);
      if (d.getFullYear() === year && d.getMonth() === month) {
        byDay.set(d.getDate(), [...(byDay.get(d.getDate()) || []), e]);
        total += 1;
      }
    }

    const out = [];
    for (let i = 0; i < lead; i += 1) out.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      out.push({ day: d, events: byDay.get(d) || [] });
    }
    while (out.length % 7 !== 0) out.push(null);

    return {
      cells: out,
      label: firstOfMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      count: total,
    };
  }, [cursor, events]);

  const step = (delta) => {
    setPop(null);
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  };

  const goToday = () => {
    setPop(null);
    setCursor(startOfMonth(new Date()));
  };

  if (!cursor) {
    return (
      <div
        className="mt-8 rounded-lg border border-rule"
        style={{ minHeight: "clamp(420px, 46vw, 520px)" }}
        aria-hidden="true"
      />
    );
  }

  const shown = pop ? events.find((e) => e.id === pop.id) : null;
  const isCurrentMonth = sameMonth(cursor, new Date());
  const countLabel =
    count === 0
      ? "Nothing scheduled"
      : count === 1
        ? "1 event"
        : `${count} events`;

  return (
    <div className="mt-8">
      <div className="cal-head">
        <p className="cal-head__label">
          <span className="cal-head__month">{label}</span>
          <span className="cal-head__count">{countLabel}</span>
        </p>

        <div className="cal-head__controls">
          <button
            type="button"
            className="cal-btn"
            onClick={goToday}
            disabled={isCurrentMonth}
          >
            Today
          </button>
          <button
            type="button"
            className="cal-btn cal-btn--square"
            onClick={() => step(-1)}
            aria-label="Previous month"
          >
            &#8592;
          </button>
          <button
            type="button"
            className="cal-btn cal-btn--square"
            onClick={() => step(1)}
            aria-label="Next month"
          >
            &#8594;
          </button>
        </div>
      </div>

      <div className="cal-wrap" ref={wrapRef}>
        <div className="cal-shell">
          <table className="cal-table">
            <caption className="sr-only">
              {label}. {countLabel}. Select an event for its detail.
            </caption>
            <thead>
              <tr>
                {DAYS.map((d) => (
                  <th key={d} scope="col" className="cal-th">
                    <span className="cal-th__long" aria-hidden="true">
                      {d.slice(0, 3)}
                    </span>
                    <span className="cal-th__short" aria-hidden="true">
                      {d.slice(0, 1)}
                    </span>
                    <span className="sr-only">{d}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil(cells.length / 7) }, (_, row) => (
                <tr key={row}>
                  {cells.slice(row * 7, row * 7 + 7).map((cell, i) => (
                    <td
                      key={i}
                      className="cal-td"
                      data-has-events={
                        cell && cell.events.length > 0 ? "true" : undefined
                      }
                    >
                      {cell && (
                        <>
                          <span className="cal-day">{cell.day}</span>
                          {cell.events.map((e) => {
                            const kind = kindOf(e);
                            return (
                              <button
                                key={e.id}
                                type="button"
                                className="cal-chip"
                                data-kind={kind}
                                aria-expanded={pop?.id === e.id}
                                aria-controls="cal-pop"
                                onMouseEnter={(ev) =>
                                  openFor(e, ev.currentTarget, false)
                                }
                                onMouseLeave={scheduleClose}
                                onFocus={(ev) =>
                                  openFor(e, ev.currentTarget, false)
                                }
                                onBlur={scheduleClose}
                                onClick={(ev) =>
                                  pop?.id === e.id && pop.pinned
                                    ? setPop(null)
                                    : openFor(e, ev.currentTarget, true)
                                }
                              >
                                <span className="cal-chip__title">
                                  {e.title}
                                </span>
                                <span className="cal-chip__time">
                                  {formatEventTimeShort(e)}
                                </span>
                                <span className="sr-only">
                                  , {KINDS[kind].label}
                                </span>
                              </button>
                            );
                          })}
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {shown && (
          <div
            id="cal-pop"
            className="cal-pop"
            data-kind={kindOf(shown)}
            data-place={pop.place}
            style={{ left: `${pop.x}px`, top: `${pop.y}px` }}
            ref={popRef}
            tabIndex={-1}
            role="group"
            aria-label={`${shown.title}, detail`}
            onMouseEnter={() => clearTimeout(closeTimer.current)}
            onMouseLeave={scheduleClose}
          >
            <p className="cal-pop__kind">
              <span className="kind-swatch" aria-hidden="true" />
              {KINDS[kindOf(shown)].label}
            </p>
            <h3 className="cal-pop__title">{shown.title}</h3>
            <p className="cal-pop__when">
              {new Date(shown.start).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
              {formatEventTimeRange(shown) !== "All day"
                ? ` · ${formatEventTimeRange(shown)}`
                : ""}
            </p>
            {shown.location && (
              <p className="cal-pop__where">{shown.location}</p>
            )}
            {shown.description && (
              <p className="cal-pop__blurb">{shown.description}</p>
            )}

            {(shown.rsvpUrl || LUMA_URL) && (
              <a
                className="cal-pop__rsvp"
                href={shown.rsvpUrl || LUMA_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                RSVP on Luma <ArrowRightIcon width={15} height={15} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthGrid;
