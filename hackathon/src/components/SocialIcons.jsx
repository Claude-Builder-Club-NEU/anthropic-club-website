/**
 * The Find us icons.
 *
 * Same rules as DetailIcons.jsx: Lucide geometry (ISC), inlined rather than
 * installed, with square caps and mitred joins because the radius on this page
 * is 0 everywhere. Lucide's rounded rects are flattened to square for the same
 * reason — the Instagram frame, the Slack bars and the LinkedIn dot all lose
 * their radii.
 *
 * One colour throughout, via `currentColor`, so a card can brighten its own
 * icon without the icon knowing about it.
 */

const STROKE = 1.7;

function Icon({ children }) {
  return (
    <svg
      className="hk-find__icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Lucide `mail`, radii flattened. claudeneu uses this one on its form card
 *  and it is the right mark for ours too. */
function Mail() {
  return (
    <Icon>
      <rect x="3" y="5" width="18" height="14" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </Icon>
  );
}

/** Lucide `instagram`, radii flattened: frame, lens, corner light. The light
 *  is a zero-length path, which square caps render as a square dot. */
function Instagram() {
  return (
    <Icon>
      <rect x="3" y="3" width="18" height="18" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </Icon>
  );
}

/** Lucide `linkedin`: the arm, the stem, and the dot over the i as a square. */
function LinkedIn() {
  return (
    <Icon>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v1.5" />
      <rect x="2" y="9" width="4" height="12" />
      <rect x="2" y="2" width="4" height="4" />
    </Icon>
  );
}

/** Lucide `slack`, reduced to its four bars and squared off. */
function Slack() {
  return (
    <Icon>
      <rect x="13" y="2" width="3" height="8" />
      <rect x="8" y="14" width="3" height="8" />
      <rect x="14" y="13" width="8" height="3" />
      <rect x="2" y="8" width="8" height="3" />
    </Icon>
  );
}

const ICONS = {
  mail: Mail,
  instagram: Instagram,
  linkedin: LinkedIn,
  slack: Slack,
};

export function SocialIcon({ name }) {
  const Glyph = ICONS[name];

  if (!Glyph) {
    throw new Error(
      `SocialIcon: no icon named "${name}". Known icons: ${Object.keys(ICONS).join(", ")}.`,
    );
  }

  return <Glyph />;
}
