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
    detail: "Founder @ Logicull | Business Admin, Entrepreneurial Startups",
    photo: true,
    linkedin: "https://www.linkedin.com/in/jacksonlamoureux/",
    email: "lamoureux.ja@northeastern.edu",
    github: "https://github.com/lamouro",
  },
  {
    slug: "lucas-salzgeber",
    name: "Lucas Salzgeber",
    role: "Vice President",
    detail: "Founder @ LSstacks | Business Admin, Finance + AI",
    photo: true,
    linkedin: "https://www.linkedin.com/in/lucas-salzgeber/",
    email: "salzgeber.l@northeastern.edu",
  },
  {
    slug: "oliver-ward",
    name: "Oliver Ward",
    role: "Vice President",
    detail: "Business Admin, Entrepreneurial Startups",
    photo: true,
    linkedin: "https://www.linkedin.com/in/oliver-ward-4929222bb/",
    email: "ward.ol@northeastern.edu",
  },
  {
    slug: "smyan-sengupta",
    name: "Smyan Sengupta",
    role: "Head of Partnerships",
    detail: "Prev. MSAT Modeling @ Pfizer | CS + AI",
    photo: true,
    linkedin: "https://www.linkedin.com/in/smyan-sengupta/",
    email: "sengupta.sm@northeastern.edu",
  },
  {
    slug: "anthony-jones",
    name: "Anthony Jones",
    role: "Head of Finance",
    detail: "D1 Track & Field | Business Admin, Finance + Pre-Law",
    photo: true,
    linkedin: "https://www.linkedin.com/in/anthonydavidjones/",
    email: "jones.anth@northeastern.edu",
  },
  {
    slug: "kristine-min",
    name: "Kristine Min",
    role: "Head of Social Media",
    detail: "UGC Creator, 20k on TikTok | International Business + Finance",
    photo: true,
    linkedin: "https://www.linkedin.com/in/kristine-min/",
    email: "min.kr@northeastern.edu",
    tiktok: "https://www.tiktok.com/@kristinemin_",
  },
  {
    slug: "alex-green",
    name: "Alex Green",
    role: "Head of Events",
    detail: "Prev. Analyst @ Gordon Brothers | Business Admin, Finance",
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
