/**
 * Executive board. Order is intentional and matches the build brief.
 *
 * Two Vice Presidents is intentional, not a typo.
 *
 * SPEC CONFLICT (flagged, not silently resolved): revision 2 §3.3 says roster
 * copy "stays exactly as it is", while §0.1 says the punctuation cleanup runs
 * across "every board bio". §0.1 names board bios explicitly and §0 is ordered
 * first, so the em dashes in `detail` became commas. Everything else about the
 * roster, including order and wording, is untouched.
 *
 * `photo: null` drives the initials placeholder. Adding a headshot means
 * dropping the file at public/board/<slug>.jpg and setting `photo: true`.
 * Source spec: 1600x1600, square, subject centred, neutral background.
 *
 * BLOCKED (revision 2, §6.4 and §6.5): `linkedin` and `email` are null for
 * every member. BoardCard omits the link rather than rendering a dead one, so
 * filling these in here is the only change needed. Do not guess LinkedIn slugs
 * from names.
 */

export const BOARD = [
  {
    slug: "jackson-lamoureux",
    name: "Jackson Lamoureux",
    role: "President",
    detail: "Founder @ Logicull | Business Admin, Entrepreneurial Startups",
    photo: null,
    linkedin: null,
    email: null,
  },
  {
    slug: "lucas-salzgeber",
    name: "Lucas Salzgeber",
    role: "Vice President",
    detail: "Founder @ LSstacks | Business Admin, Finance + AI",
    photo: null,
    linkedin: null,
    email: null,
  },
  {
    slug: "oliver-ward",
    name: "Oliver Ward",
    role: "Vice President",
    detail: "Business Admin, Entrepreneurial Startups",
    photo: null,
    linkedin: null,
    email: null,
  },
  {
    slug: "smyan-sengupta",
    name: "Smyan Sengupta",
    role: "Head of Partnerships",
    detail: "Prev. MSAT Modeling @ Pfizer | CS + AI",
    photo: null,
    linkedin: null,
    email: null,
  },
  {
    slug: "anthony-jones",
    name: "Anthony Jones",
    role: "Head of Finance",
    detail: "D1 Track & Field | Business Admin, Finance + Pre-Law",
    photo: null,
    linkedin: null,
    email: null,
  },
  {
    slug: "kristine-min",
    name: "Kristine Min",
    role: "Head of Social Media",
    detail: "UGC Creator, 20k on TikTok | International Business + Finance",
    photo: null,
    linkedin: null,
    email: null,
  },
  {
    slug: "alex-green",
    name: "Alex Green",
    role: "Head of Events",
    detail: "Prev. Analyst @ Gordon Brothers | Business Admin, Finance",
    photo: null,
    linkedin: null,
    email: null,
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
 * Alt text pattern is fixed by the brief. Placeholders are decorative, since
 * the name sits in the adjacent text, so they carry alt="".
 */
export const headshotAlt = (member) =>
  `Headshot of ${member.name}, ${member.role} of the Claude Builders Club at Northeastern University.`;
