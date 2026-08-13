/**
 * Executive board. Order is intentional and matches the build brief.
 * Copy is verbatim from the brief — do not "tidy" the punctuation.
 *
 * Two Vice Presidents is intentional, not a typo.
 *
 * BRIEF CONFLICT (flagged, not silently resolved): §Notes states "Alex Green's
 * role is missing — render a visible TODO in dev and omit the role line in
 * production until I supply it." The roster array in the same section gives
 * Alex Green the role "Head of Events". The array is marked "Copy verbatim",
 * so the role is used as given. The missing-role mechanism the note describes
 * is implemented anyway (set `role: null` on any member and it behaves as
 * specified), so flipping this back is a one-word change.
 *
 * `photo: null` drives the initials placeholder. Adding a headshot means
 * dropping the file at public/board/<slug>.jpg and setting `photo: true`.
 * Source spec: 1600x1600, square, subject centred, neutral background.
 */

export const BOARD = [
  {
    slug: "jackson-lamoureux",
    name: "Jackson Lamoureux",
    role: "President",
    detail: "Founder @ Logicull | Business Admin — Entrepreneurial Startups",
    photo: null,
  },
  {
    slug: "lucas-salzgeber",
    name: "Lucas Salzgeber",
    role: "Vice President",
    detail: "Founder @ LSstacks | Business Admin — Finance + AI",
    photo: null,
  },
  {
    slug: "oliver-ward",
    name: "Oliver Ward",
    role: "Vice President",
    detail: "Business Admin — Entrepreneurial Startups",
    photo: null,
  },
  {
    slug: "smyan-sengupta",
    name: "Smyan Sengupta",
    role: "Head of Partnerships",
    detail: "Prev. MSAT Modeling @ Pfizer | CS + AI",
    photo: null,
  },
  {
    slug: "anthony-jones",
    name: "Anthony Jones",
    role: "Head of Finance",
    detail: "D1 Track & Field | Business Admin — Finance + Pre-Law",
    photo: null,
  },
  {
    slug: "kristine-min",
    name: "Kristine Min",
    role: "Head of Social Media",
    detail: "UGC Creator, 20k on TikTok | International Business + Finance",
    photo: null,
  },
  {
    slug: "alex-green",
    name: "Alex Green",
    role: "Head of Events",
    detail: "Prev. Analyst @ Gordon Brothers | Business Admin - Finance",
    photo: null,
  },
];

/** "Jackson Lamoureux" -> "JL". Drives the placeholder tile. */
export const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

/**
 * Alt text pattern is fixed by the brief. Placeholders are decorative — the
 * name is already in the adjacent text — so they carry alt="".
 */
export const headshotAlt = (member) =>
  `Headshot of ${member.name}, ${member.role} of the Claude Builders Club at Northeastern University.`;
