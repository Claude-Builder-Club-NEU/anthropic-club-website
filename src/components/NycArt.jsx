import claudeSpark from "../assets/brand/claude-spark.svg";

/**
 * Small illustrations for the NYC hub (pages/Nyc.jsx), in the golden hour
 * palette of the NYC ribbon's skyline so the two read as one family.
 *
 * The pixel icons are drawn from strings, one character per pixel, and each
 * row is merged into runs so a 16x16 icon is a few dozen <rect>s rather than
 * 256. They are all decorative: the card or step beside each one already says
 * what it is in words, so every graphic here is aria-hidden.
 */

const PALETTE = {
  k: "#24192a", // night
  s: "#3b212c", // screen
  n: "#4d262b", // rooftop
  m: "#7a3a2a",
  d: "#a34a2a",
  c: "#d97757", // club coral
  o: "#e48d68",
  g: "#f2c79a",
  l: "#fbe3c4",
  p: "#fff6ea",
  b: "#6a9bcc",
};

const PIXEL_ICONS = {
  // A laptop with a prompt and a coral cursor: workshops.
  laptop: [
    "................",
    "..kkkkkkkkkkkk..",
    "..kssssssssssk..",
    "..kslssssssssk..",
    "..ksslsssssssk..",
    "..kslsscccsssk..",
    "..kssssssssssk..",
    "..kssssssssssk..",
    "..kkkkkkkkkkkk..",
    ".kggggggggggggk.",
    "kggggggddggggggk",
    "kkkkkkkkkkkkkkkk",
  ],
  // A rooftop water tower under a crescent moon: build nights.
  tower: [
    "...........lll..",
    "..........ll....",
    "..........ll....",
    "...........lll..",
    "....m...........",
    "...mmm..........",
    "..mmmmm.........",
    "..dcdcd.........",
    "..dcdcd.........",
    "..dcdcd.........",
    "..kkkkk.........",
    "..k...k.........",
    ".kk...kk........",
    "nnnnnnnnnnnnnnnn",
    "nlnnnnlnnnngnnln",
    "nnnnnnnnnnnnnnnn",
  ],
  // A trophy on a coral plinth: hackathons.
  trophy: [
    "..gggggggggggg..",
    "g.gllggggggggg.g",
    "g.glgggggggggg.g",
    ".gggggggggggggg.",
    "...gggggggggg...",
    "....gggggggg....",
    ".....gggggg.....",
    "......gggg......",
    ".......gg.......",
    ".......gg.......",
    ".....cccccc.....",
    "....cccccccc....",
    "....cddddddc....",
  ],
  // A page from a wall calendar with one day circled: the events empty state.
  calendar: [
    "...k.......k....",
    ".cckccccccckccc.",
    ".cccccccccccccc.",
    ".pppppppppppppp.",
    ".pggpggpggpggpp.",
    ".pppppppppppppp.",
    ".pggpggpccpggpp.",
    ".pppppppccppppp.",
    ".pggpggpggpggpp.",
    ".pppppppppppppp.",
    ".pggpggpggppppp.",
    ".pppppppppppppp.",
  ],
};

export const PixelIcon = ({ name, size = 64, className = "" }) => {
  const rows = PIXEL_ICONS[name];
  const w = rows[0].length;
  const h = rows.length;
  const rects = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      const ch = row[x];
      let run = 1;
      while (x + run < w && row[x + run] === ch) run += 1;
      if (ch !== ".") {
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={run}
            height={1}
            fill={PALETTE[ch]}
          />
        );
      }
      x += run;
    }
  });
  return (
    <svg
      className={`pixel-icon ${className}`}
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={(size * h) / w}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {rects}
    </svg>
  );
};

/**
 * Boston to New York as a dotted pixel route, with the Claude spark riding the
 * middle of it. Boston sits up and to the right of New York, as on a map.
 */
const routePoints = (() => {
  const p0 = [418, 46];
  const c = [330, 214];
  const p1 = [70, 168];
  const pts = [];
  for (let i = 0; i <= 30; i += 1) {
    const t = i / 30;
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0];
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1];
    pts.push([Math.round(x / 4) * 4, Math.round(y / 4) * 4]);
  }
  return pts;
})();

export const BosToNyc = ({ className = "" }) => (
  <div className={`nyc-route ${className}`} aria-hidden="true">
    <svg viewBox="0 0 480 240" shapeRendering="crispEdges" focusable="false">
      {/* a faint map grid */}
      <defs>
        <pattern id="nyc-route-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="#fbe3c4" strokeOpacity="0.09" />
        </pattern>
      </defs>
      <rect width="480" height="240" fill="url(#nyc-route-grid)" />

      {routePoints.map(([x, y], i) =>
        i === 0 || i === routePoints.length - 1 || i % 2 ? null : (
          <rect
            key={i}
            x={x - 3}
            y={y - 3}
            width="6"
            height="6"
            fill={i > 15 ? "#d97757" : "#f2c79a"}
          />
        )
      )}

      {/* Boston */}
      <rect x="406" y="34" width="24" height="24" fill="#fbe3c4" />
      <rect x="412" y="40" width="12" height="12" fill="#24192a" />
      <text x="418" y="86" className="nyc-route__label" textAnchor="middle">
        BOS
      </text>
      <text x="418" y="104" className="nyc-route__sub" textAnchor="middle">
        since 2025
      </text>

      {/* New York */}
      <rect x="54" y="152" width="32" height="32" fill="#d97757" />
      <rect x="62" y="160" width="16" height="16" fill="#fff6ea" />
      <text x="70" y="212" className="nyc-route__label" textAnchor="middle">
        NYC
      </text>
      <text x="70" y="230" className="nyc-route__sub" textAnchor="middle">
        opening now
      </text>

      <text x="250" y="96" className="nyc-route__sub" textAnchor="middle">
        ~190 mi
      </text>
    </svg>
    <img className="nyc-route__spark" src={claudeSpark} alt="" width="40" height="40" />
  </div>
);
