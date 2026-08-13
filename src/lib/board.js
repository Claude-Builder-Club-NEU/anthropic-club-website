/**
 * Executive board. Order is intentional and matches the build brief.
 *
 * Two Vice Presidents is intentional, not a typo.
 *
 * Each card reads on two lines: `affiliation` (where they work, founded, or
 * compete) then `major`. Degrees are abbreviated, Business Admin to BA and
 * International Business to IB, so the second line stays to one line at the
 * card's width. Oliver has no affiliation line and the card simply omits it
 * rather than rendering an empty row.
 *
 * SPEC NOTE: revision 2 §0.1 removed dashes used as prose punctuation, which
 * is why the majors read "BA, Finance" rather than "BA - Finance". Hyphenated
 * compounds like Pre-Law are untouched, as that rule requires.
 *
 * Headshots: masters live in `board-src/<slug>.jpg` and are never deployed.
 * scripts/build-headshots.mjs turns them into AVIF/WebP/JPEG derivatives in
 * `public/board/`. `photo: true` switches a member from the initials
 * placeholder to the real image.
 *
 * TYPO CORRECTED: Lucas's address was supplied as "salzgeber.l@northesatern.edu".
 * The domain is misspelt ("northesatern"), which would bounce, so it is stored
 * here as northeastern.edu. Worth confirming.
 */

export const BOARD = [
  {
    slug: "jackson-lamoureux",
    name: "Jackson Lamoureux",
    role: "President",
    affiliation: "Founder @ Logicull",
    major: "BA, Entrepreneurial Startups",
    photo: true,
    linkedin: "https://www.linkedin.com/in/jacksonlamoureux/",
    email: "lamoureux.ja@northeastern.edu",
    github: "https://github.com/lamouro",
  },
  {
    slug: "lucas-salzgeber",
    name: "Lucas Salzgeber",
    role: "Vice President",
    affiliation: "Founder @ LSstacks",
    major: "BA, Finance + AI",
    photo: true,
    linkedin: "https://www.linkedin.com/in/lucas-salzgeber/",
    email: "salzgeber.l@northeastern.edu",
  },
  {
    slug: "oliver-ward",
    name: "Oliver Ward",
    role: "Vice President",
    affiliation: null,
    major: "BA, Entrepreneurial Startups",
    photo: true,
    linkedin: "https://www.linkedin.com/in/oliver-ward-4929222bb/",
    email: "ward.ol@northeastern.edu",
  },
  {
    slug: "smyan-sengupta",
    name: "Smyan Sengupta",
    role: "Head of Partnerships",
    affiliation: "Prev. MSAT Modeling @ Pfizer",
    major: "CS + AI",
    photo: true,
    linkedin: "https://www.linkedin.com/in/smyan-sengupta/",
    email: "sengupta.sm@northeastern.edu",
  },
  {
    slug: "anthony-jones",
    name: "Anthony Jones",
    role: "Head of Finance",
    affiliation: "D1 Track & Field",
    major: "BA, Finance + Pre-Law",
    photo: true,
    linkedin: "https://www.linkedin.com/in/anthonydavidjones/",
    email: "jones.anth@northeastern.edu",
  },
  {
    slug: "kristine-min",
    name: "Kristine Min",
    role: "Head of Social Media",
    affiliation: "UGC Creator, 20k on TikTok",
    major: "IB + Finance",
    photo: true,
    linkedin: "https://www.linkedin.com/in/kristine-min/",
    email: "min.kr@northeastern.edu",
    tiktok: "https://www.tiktok.com/@kristinemin_",
  },
  {
    slug: "alex-green",
    name: "Alex Green",
    role: "Head of Events",
    affiliation: "Prev. Analyst @ Gordon Brothers",
    major: "BA, Finance",
    photo: true,
    linkedin: "https://www.linkedin.com/in/greena1/",
    email: "green.a1@northeastern.edu",
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
