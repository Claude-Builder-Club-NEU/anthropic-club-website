/**
 * The detail icons.
 *
 * Geometry taken from Lucide (ISC licence), which is what "an icon library"
 * means here in practice: the paths are a maintained set drawn on one 24-unit
 * grid by people who do this full time, rather than five shapes hand-fitted
 * one at a time. Inlined rather than installed — the page loads no runtime and
 * the CSP admits no external SVG, and five icons do not justify a dependency.
 *
 * Two changes from stock Lucide, both so they belong to this page:
 *   - square caps and mitred joins, because the system is radius 0 everywhere
 *     and round caps would be the only rounded thing on it;
 *   - the corner radii on `banknote` and `laptop` flattened to 0, same reason.
 *
 * One colour throughout, via `currentColor`, so a row can brighten its own
 * icon without the icon knowing about it.
 */

const STROKE = 1.7;

function Icon({ children }) {
  return (
    <svg
      className="hk-detail__icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Lucide `utensils`. */
function Meal() {
  return (
    <Icon>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </Icon>
  );
}

/** Lucide `landmark`. A civic building reads as a venue at 24px; a generic
 *  block with windows does not. */
function Venue() {
  return (
    <Icon>
      <path d="M3 22h18" />
      <path d="M6 18v-7M10 18v-7M14 18v-7M18 18v-7" />
      <path d="M12 2 2 7h20Z" />
    </Icon>
  );
}

/** Lucide `users`. */
function Team() {
  return (
    <Icon>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

/** Lucide `laptop`, corners squared. */
function Bring() {
  return (
    <Icon>
      <path d="M20 16V5H4v11" />
      <path d="M2 16h20l-1.3 3.6H3.3Z" />
    </Icon>
  );
}

/** Lucide `banknote`, corners squared. */
function Cost() {
  return (
    <Icon>
      <path d="M2 6h20v12H2z" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </Icon>
  );
}

const ICONS = {
  meal: Meal,
  venue: Venue,
  team: Team,
  bring: Bring,
  cost: Cost,
};

/**
 * Always decorative: the row's own title says what it is, and "a line drawing
 * of a bowl" adds nothing to "Meals".
 */
export function DetailIcon({ name }) {
  const Glyph = ICONS[name];

  if (!Glyph) {
    throw new Error(
      `DetailIcon: no icon named "${name}". Known icons: ${Object.keys(ICONS).join(", ")}.`
    );
  }

  return <Glyph />;
}
