import { useEffect, useMemo, useState } from "react";
import { upcoming } from "../lib/events";

/**
 * Month view, rendered with our own components rather than an iframed Google
 * embed, per the original brief's event system section. Board members edit the
 * calendar in Google Calendar itself; the site only ever reads.
 *
 * The grid now renders whether or not there are events, so the page always has
 * a visible calendar. With no calendar ID wired up yet it simply shows the
 * current month with no entries.
 *
 * The month cursor is set after mount rather than during render. "Today" is a
 * different month at build time than it is for a visitor weeks later, and
 * rendering it on the server would produce a hydration mismatch that shows up
 * as a console error. The skeleton reserves the same height, so nothing shifts.
 */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

const MonthGrid = () => {
  const events = upcoming();
  const [cursor, setCursor] = useState(null);

  useEffect(() => {
    const anchor = events.length ? new Date(events[0].start) : new Date();
    setCursor(startOfMonth(anchor));
    // Events come from a build-time JSON import, so this runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { cells, label } = useMemo(() => {
    if (!cursor) return { cells: [], label: "" };
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lead = (firstOfMonth.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const byDay = new Map();
    for (const e of events) {
      const d = new Date(e.start);
      if (d.getFullYear() === year && d.getMonth() === month) {
        byDay.set(d.getDate(), [...(byDay.get(d.getDate()) || []), e]);
      }
    }

    const out = [];
    for (let i = 0; i < lead; i += 1) out.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      out.push({ day: d, events: byDay.get(d) || [] });
    }
    return {
      cells: out,
      label: firstOfMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  }, [cursor, events]);

  const step = (delta) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  if (!cursor) {
    return (
      <div
        className="mt-10 rounded-lg border border-rule"
        style={{ minHeight: "clamp(420px, 46vw, 520px)" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <h3 className="text-step-3">{label}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => step(-1)}
            aria-label="Previous month"
          >
            &#8592;
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => step(1)}
            aria-label="Next month"
          >
            &#8594;
          </button>
        </div>
      </div>

      <table className="mt-5 w-full border-collapse text-left">
        <caption className="sr-only">
          Events for {label}. Any events are also listed above this calendar.
        </caption>
        <thead>
          <tr>
            {DAYS.map((d) => (
              <th
                key={d}
                scope="col"
                className="meta pb-2"
                style={{ maxWidth: "none" }}
              >
                {d}
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
                  className="h-20 border border-rule align-top p-1.5 sm:h-24"
                >
                  {cell && (
                    <>
                      <span className="text-meta text-gray-text">
                        {cell.day}
                      </span>
                      {cell.events.map((e) => (
                        <span
                          key={e.id}
                          className="mt-1 block rounded bg-coral px-1.5 py-1 text-meta text-ink"
                        >
                          {e.title}
                        </span>
                      ))}
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthGrid;
