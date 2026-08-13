import { useMemo, useState } from "react";
import { upcoming } from "../lib/events";

/**
 * Month view, rendered with our own components rather than an iframed Google
 * embed — the embed cannot be styled and drags in third-party script weight.
 *
 * Only rendered when events exist. An empty month grid communicates nothing
 * that the empty state does not say better.
 */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MonthGrid = () => {
  const events = upcoming();
  const first = events.length ? new Date(events[0].start) : new Date();
  const [cursor, setCursor] = useState(
    new Date(first.getFullYear(), first.getMonth(), 1)
  );

  const { cells, label } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    // Monday-first offset.
    const lead = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const byDay = new Map();
    for (const e of events) {
      const d = new Date(e.start);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        byDay.set(key, [...(byDay.get(key) || []), e]);
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

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <h3 className="text-step-3">{label}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => step(-1)}
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => step(1)}
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <table className="mt-5 w-full border-collapse text-left">
        <caption className="sr-only">
          Events for {label}. The list below repeats this information.
        </caption>
        <thead>
          <tr>
            {DAYS.map((d) => (
              <th key={d} scope="col" className="meta pb-2" style={{ maxWidth: "none" }}>
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
