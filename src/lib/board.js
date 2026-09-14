/**
 * Executive board. Order is intentional and matches the build brief.
 *
 * Two Vice Presidents is intentional, not a typo.
 *
 * Each card reads down to three lines: `affiliation` (where they work,
 * founded, or compete), then an optional `secondAffiliation` for a member
 * whose credentials do not fit on one, then `major`. Degrees are abbreviated,
 * Business Admin to BA and International Business to IB, so the closing line
 * stays to one line at the card's width.
 *
 * All three lines are optional. The card renders the ones that carry text and
 * skips the rest rather than leaving an empty row, so a member the club has
 * only half described can go in today and be filled out later. Nobody is
 * missing a line right now: Oliver was, until the club sent his RUSH Focus
 * Energy founding, which is why the skip path is worth keeping even though
 * nothing currently exercises it.
 *
 * `secondAffiliation` was added for Mehr, whose four credentials do not fit on
 * two lines, but it is plain data and any member may carry one. It sits
 * between the affiliation and the major because the degree closes every card
 * in the set, and an extra credential after it would break that rhythm.
 *
 * NORMALISED: the club supplied Oliver as "Founder of RUSH Focus Energy" and
 * Mehr as "Founder of BitsDime". Every other affiliation here uses the house
 * "@" shorthand, "Founder @ Logicull", "Prev. MSAT Modeling @ Pfizer", so both
 * are stored with "@" and the eight cards read as one set. Worth confirming
 * with the club, the same way Lucas's address below is.
 *
 * SPEC NOTE: revision 2 §0.1 removed dashes used as prose punctuation, which
 * is why the majors read "BA, Finance" rather than "BA - Finance". Hyphenated
 * compounds like Pre-Law are untouched, as that rule requires.
 *
 * Headshots: masters live in `board-src/<slug>.jpg` and are never deployed.
 * scripts/build-headshots.mjs turns them into AVIF/WebP/JPEG derivatives in
 * `public/board/`. `photo: true` switches a member from the initials
 * placeholder to the real image. Mehr has no master yet, so he is the one
 * member on `photo: false` and the only card showing an initials tile.
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
    affiliation: "Founder @ RUSH Focus Energy",
    major: "BA, Entrepreneurial Startups + AI",
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
  {
    slug: "mehr-anand",
    name: "Mehr Anand",
    role: "Founder and Advisor",
    affiliation: "Data Engineer @ General Atlantic",
    // Four credentials, three lines, so this line carries two of them. The
    // founding leads and the "Prev." trails: read the other way round, the
    // leading "Prev." scopes over the comma and the card implies he has left
    // BitsDime too. Balanced wrapping breaks this at the comma, so at card
    // width it reads as two short rows rather than one long one.
    secondAffiliation: "Founder @ BitsDime, Prev. ML @ Brewster",
    major: "BS, Computer Science",
    // No master in board-src/, so the card falls back to the "MA" initials
    // tile. Do not flip this to true before board-src/mehr-anand.jpg exists:
    // build-headshots.mjs only converts the files it finds and BoardCard
    // trusts `photo` rather than probing, so the card would render an <img>
    // against a 404.
    photo: false,
    // linkedin, email and github are absent rather than empty, because the
    // club has not sent them. BoardCard filters falsy socials, so an absent
    // key costs a row of icons and nothing else, where a placeholder would
    // ship a dead link with his name on it.
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
