import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { findChart } from "../lib/postCharts";

/**
 * A chart in a post: `::chart <id>`, data in lib/postCharts.js.
 *
 * Plain elements and percentage widths, no chart library and no SVG. The
 * prerender writes the finished bars into the HTML, so a chart is there on
 * first paint with scripting off, and nothing measures the page to draw it.
 * That is also why segment labels are decided by a share threshold rather than
 * by measuring text: see INLINE_MIN.
 *
 * Shares only, never counts. Every number on the chart is a whole percent of
 * the ballots cast.
 *
 * The bars are aria-hidden and each row carries its numbers as visually hidden
 * text beside its label, so a screen reader hears "Demo night: definitely 51%,
 * might come 38%, not for me 11%" instead of a run of unlabelled segments.
 *
 * Nothing animates. The bars do not grow in, and the tooltip appears and
 * leaves without a fade; DESIGN.md caps the site at three animations and none
 * of them is this.
 */

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const sum = (values) => values.reduce((a, b) => a + b, 0);

/**
 * The scale for `bars`: the largest share rounded up to the next ten, so the
 * longest bar stops short of the edge and leaves its tip label room. Bars
 * always start at zero; the hackathon chart is four nearly equal bars because
 * the vote was nearly equal, and that is the point.
 */
const scaleTop = (max) => Math.max(10, Math.ceil(max / 10) * 10);

/**
 * A `split` segment carries its number only when it is at least this share of
 * the row. The plot is never narrower than about 260px, at a 320px phone, so
 * 14% is 36px: room for "38%" at 12px. Below that the tooltip carries it and
 * the label is left off rather than clipped.
 */
const INLINE_MIN = 0.14;

const PostChart = ({ id }) => {
  const chart = findChart(id);
  const tip = useTooltip();

  // lib/blog.js fails the build on an unknown id, so this is only reachable
  // from a draft on the dev server.
  if (!chart) return null;

  const { kind, rows, series = [], base } = chart;
  const top =
    kind === "bars"
      ? scaleTop(Math.max(...rows.map((row) => (row.value / base) * 100)))
      : 100;

  return (
    <figure className="postfigure postchart" data-bleed="true">
      <figcaption className="postchart__head">
        <span className="postchart__title">{chart.title}</span>
        {chart.note && <span className="postchart__note">{chart.note}</span>}
      </figcaption>

      {series.length > 1 && (
        <ul className="postchart__legend" aria-hidden="true">
          {series.map((name, s) => (
            <li key={name}>
              <i data-step={s + 1} />
              {name}
            </li>
          ))}
        </ul>
      )}

      <div className="postchart__rows" {...tip.handlers}>
        {rows.map((row, r) =>
          kind === "bars" ? (
            <BarRow
              key={row.label}
              chart={chart}
              row={row}
              top={top}
              strong={r < (chart.emphasis || 0)}
            />
          ) : (
            <SplitRow key={row.label} series={series} row={row} />
          )
        )}
      </div>

      {/* aria-hidden: the tooltip repeats what each row already says to a
          screen reader, and it only ever appears under a mouse. */}
      <div
        ref={tip.ref}
        className="postchart__tip"
        aria-hidden="true"
        hidden={!tip.text}
      >
        {tip.text}
      </div>
    </figure>
  );
};

const RowLabel = ({ row, strong, spoken }) => (
  <div className="postchart__label">
    <span
      className="postchart__name"
      data-strong={strong ? "true" : undefined}
    >
      {row.label}
    </span>
    {row.sub && <span className="postchart__sub">{row.sub}</span>}
    <span className="sr-only">: {spoken}</span>
  </div>
);

const BarRow = ({ chart, row, top, strong }) => {
  const share = pct(row.value, chart.base);
  const width = ((row.value / chart.base) * 100 * 100) / top;
  const tipText = `${row.full || row.label}\n${share}% ${chart.tip}`;

  return (
    <div className="postchart__row" data-tip={tipText}>
      <RowLabel row={row} strong={strong} spoken={`${share}%`} />
      <div className="postchart__plot" aria-hidden="true">
        <div className="postchart__bar" style={{ width: `${width}%` }}>
          <span className="postchart__seg" data-step="2" />
        </div>
        <span
          className="postchart__val"
          data-strong={strong ? "true" : undefined}
          style={{ left: `calc(${width}% + 8px)` }}
        >
          {share}%
        </span>
      </div>
    </div>
  );
};

const SplitRow = ({ series, row }) => {
  const total = sum(row.values);
  const shares = row.values.map((n) => pct(n, total));

  return (
    <div className="postchart__row">
      <RowLabel
        row={row}
        spoken={series
          .map((name, s) => `${name.toLowerCase()} ${shares[s]}%`)
          .join(", ")}
      />
      <div className="postchart__plot" data-kind="split" aria-hidden="true">
        <div className="postchart__bar">
          {row.values.map((n, s) =>
            n ? (
              <span
                key={series[s]}
                className="postchart__seg"
                data-step={s + 1}
                style={{ flexGrow: n }}
                data-tip={`${row.label}\n${series[s]}: ${shares[s]}%`}
              >
                {n / total >= INLINE_MIN ? `${shares[s]}%` : null}
              </span>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Hover tooltip, for a mouse or a pen. Touch is left alone: a tap on a phone is
 * the start of a scroll as often as it is a question, and every share is
 * printed on the chart already except a split's smallest slivers.
 *
 * The text is state, because it changes what renders. The POSITION is written
 * straight onto the element, because it changes on every pointer move and a
 * re-render per pixel of mouse travel would redraw every bar in the chart.
 */
function useTooltip() {
  const ref = useRef(null);
  const at = useRef({ x: 0, y: 0 });
  const [text, setText] = useState(null);

  const place = () => {
    const el = ref.current;
    if (!el || el.hidden) return;
    const { x, y } = at.current;
    const box = el.getBoundingClientRect();
    let left = x + 14;
    let top = y + 18;
    if (left + box.width > window.innerWidth - 8) left = Math.max(8, x - box.width - 14);
    if (top + box.height > window.innerHeight - 8) top = Math.max(8, y - box.height - 12);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  };

  // After React has unhidden it, so the box being measured is the real one.
  useLayoutEffect(place, [text]);

  // A fixed tooltip left behind by a scroll would float over the wrong bar.
  useEffect(() => {
    if (!text) return undefined;
    const hide = () => setText(null);
    window.addEventListener("scroll", hide, { passive: true });
    return () => window.removeEventListener("scroll", hide);
  }, [text]);

  const handlers = {
    onPointerMove(event) {
      if (event.pointerType === "touch") return;
      const target = event.target.closest?.("[data-tip]");
      at.current = { x: event.clientX, y: event.clientY };
      const next = target ? target.getAttribute("data-tip") : null;
      if (next !== text) setText(next);
      else place();
    },
    onPointerLeave() {
      setText(null);
    },
  };

  return { ref, text, handlers };
}

export default PostChart;
