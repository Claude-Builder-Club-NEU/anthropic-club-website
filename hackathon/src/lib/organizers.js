/**
 * The four student organisations running the event.
 *
 * This is what the footer's "BUILT BY FOUR NORTHEASTERN ORGS" refers to, said
 * out loud. It is deliberately separate from src/lib/sponsors.js: a sponsor
 * pays for the event and an organiser runs it, and conflating the two on the
 * page would be a real misrepresentation rather than a layout shortcut.
 *
 * The logos in public/logos/ are monochrome white PNGs cut from the artwork
 * each club supplied. They are flattened to pure white with the alpha channel
 * carrying the shape, so they sit on the black ground without a box and match
 * each other in weight — which four logos in four different palettes never
 * would. ACM's is keyed from the red diamond with its letters knocked out,
 * because the supplied file is a filled navy disc and a white disc is not a
 * logo. Regenerate by re-running the snippet recorded in the README.
 *
 * `url` is each club's own site. A logo on its own is a decoration; a logo
 * that goes somewhere is a credit, which is what this section is for. The
 * name under it does the work the alt text cannot do for a sighted reader:
 * four monochrome marks with no wordmark are not four identifiable clubs.
 */
export const ORGANIZERS = [
  {
    name: "Claude Builders Club",
    short: "CLAUDE BUILDERS CLUB",
    tag: "ORGANIZER",
    about: "Northeastern's official Anthropic Claude Builder Club",
    url: "https://claudeneu.com/",
    logo: { src: "logos/claude-builders-club.png", alt: "Claude Builders Club" },
  },
  {
    name: "Rev",
    short: "REV",
    tag: "ORGANIZER",
    about: "A small community of hackers in Boston",
    url: "https://www.rev.school/",
    logo: { src: "logos/rev.png", alt: "Rev" },
  },
  {
    name: "ACM",
    short: "ACM",
    tag: "ORGANIZER",
    about: "Northeastern's chapter of the Association for Computing Machinery",
    url: "https://nuacm-website-euf7.vercel.app/",
    logo: { src: "logos/acm.png", alt: "ACM" },
  },
  {
    name: "AINU",
    short: "AINU",
    tag: "ORGANIZER",
    about: "The student-led Artificial Intelligence Club at Northeastern",
    url: "https://ainortheastern.com/",
    logo: { src: "logos/ainu.png", alt: "AINU" },
  },
];

/**
 * Organisations partnering on the event without running it: the "PARTNER
 * ORGANIZATIONS" row under the organizers (it was "ALSO BACKED BY"). Neither
 * a sponsor nor an organiser, so it is its own list and its own row rather
 * than more cells in either.
 *
 * Only partners the club lists as partnering or confirmed are here. DHC,
 * Sandbox, the Sikh Student Association and the Sri Lankan Association are
 * still to be confirmed, so none of them is on the page yet.
 *
 * `tag` is the kind of partner, printed under the name: a Northeastern club,
 * a club from another school, or a social media partner. The list is grouped
 * by it, in that order, so the tags read as sections of the row.
 *
 * Each club is a cell in the PARTNER ORGANIZATIONS row (src/components/
 * Organizers.jsx) and a logo in the strip under the hero (LogoStrip.jsx).
 * `about` is one line from the club's own site, Instagram bio or Khoury
 * profile, null where nothing reliable could be found; the page does not
 * print it yet. `wordmark: true` marks a logo with the club's name in it,
 * which drops the name under the mark in a cell (it would print the name
 * twice) and beside it in the strip. Same white-on-alpha treatment as the
 * organizer logos. NEU Blockchain's cube has
 * its three face seams cut out, so it still reads as a cube once its reds are
 * flattened to one white.
 *
 * `url`: FirstByte's is the site its Khoury College club profile links to.
 * NEU Blockchain's profile links northeasternblockchain.xyz, which no longer
 * resolves, so the cell goes to the club's Instagram until it has a site.
 * Disrupt's two listed sites have both lapsed (neudisrupt.com is parked for
 * sale and disruptneu.com does not resolve); it links disruptnu.com, the site
 * its Instagram points to.
 *
 * Disrupt's mark is the plain "Disrupt" wordmark from the club's own logo
 * file, its dark-text version, cut out and flattened to white; the accent in
 * the D keeps the hairline gap the artwork gives it, so it still reads.
 *
 * NU Security's and NIBG's marks are symbols with no name in them, so they
 * keep the caption, as the organizers do. Both are cut from the supplied
 * artwork to white on alpha with a seam wherever two inks met: NU Security's
 * purple shield against its black swords, and each building's lit front
 * against its shaded side. Without the seams both would flatten to a single
 * blob. NU Security has no site, and its Khoury profile lists the Instagram,
 * so the cell links there. NIBG (the Northeastern Investment Banking Group,
 * which was captioned "Investment Banking Club" until its name was confirmed)
 * lists nuibg.com, which does not resolve, so it links its Instagram.
 *
 * BU Disrupters is a different organisation from Disrupt. Its mark is the
 * white pixel D cut from the supplied blue square, the shape taken from how
 * white each pixel is, so the grid lines between its cells survive as
 * hairlines. It is a symbol with no name in it, so it keeps the caption.
 * Jumbo Ventures is the supplied lockup with only its blue kept: the elephant
 * and the wordmark go white, and the yellow bulb drops out, so the bulb is
 * knocked out of the head rather than flattened into it. Jumbo Ventures
 * links its Instagram; BU Disrupters has no `url` or `about` yet.
 *
 * The rest are each club's own artwork, made white. NU Nexus and Oasis are
 * the supplied lockups, already cut out, with their colour dropped. NEU
 * E-Club's "e" (the club's Instagram mark) and the Math Club's bars are
 * flattened with seams: between the "e" and the gradient ring around it, and
 * between bars of different colours, so the four bars still stand apart. BU
 * E-Club's "e" is the logo from eclub.bu.edu, and ISIB's globe is the one on
 * its LinkedIn page, a 200px original, so it is the softest mark in the row.
 * The globe has the club's initials across it, but at 44px they are about
 * 10px tall, so ISIB keeps its caption rather than counting as a wordmark.
 * NUIB has no logo and no link yet: its cell is the name and the tag.
 */
const TAGS = {
  neu: "NEU PARTNER",
  external: "EXTERNAL PARTNER",
  social: "SOCIAL MEDIA PARTNER",
};


export const BACKERS = [
  {
    name: "NU Nexus",
    short: "NU NEXUS",
    tag: TAGS.neu,
    about: "Northeastern student publication on technology, policy and society",
    url: "https://nunexus.org/",
    logo: { src: "logos/nu-nexus.png", alt: "NU Nexus" },
    wordmark: true,
  },
  {
    // The Northeastern Investment Banking Group, which goes by NIBG.
    name: "NIBG",
    short: "NIBG",
    tag: TAGS.neu,
    about: "M&A simulations for Northeastern students",
    url: "https://www.instagram.com/northeasternibg/",
    logo: { src: "logos/nibg.png", alt: "NIBG" },
  },
  {
    name: "NEU Blockchain",
    short: "NEU BLOCKCHAIN",
    tag: TAGS.neu,
    about: "Student group for blockchain education, research and development",
    url: "https://www.instagram.com/neublockchain/",
    logo: { src: "logos/neu-blockchain.png", alt: "NEU Blockchain" },
    wordmark: true,
  },
  {
    name: "FirstByte",
    short: "FIRSTBYTE",
    tag: TAGS.neu,
    about: "CS curriculum and technology kits for Boston youth organizations",
    url: "https://www.teachfirstbyte.com/",
    logo: { src: "logos/firstbyte.png", alt: "FirstByte" },
    wordmark: true,
  },
  {
    name: "Disrupt",
    short: "DISRUPT",
    tag: TAGS.neu,
    about: "Northeastern's largest undergraduate fintech club",
    url: "https://www.disruptnu.com/",
    logo: { src: "logos/disrupt.png", alt: "Disrupt" },
    wordmark: true,
  },
  {
    name: "NU Security",
    short: "NU SECURITY",
    tag: TAGS.neu,
    about: "Cybersecurity club hosting labs and guest speaker events",
    url: "https://www.instagram.com/nusecurity/",
    logo: { src: "logos/nu-security.png", alt: "NU Security" },
  },
  {
    name: "NEU E-Club",
    short: "NEU E-CLUB",
    tag: TAGS.neu,
    about: "Northeastern entrepreneurship club with 2,000+ active members",
    url: "https://www.nuentrepreneursclub.com/",
    logo: { src: "logos/neu-eclub.png", alt: "NEU E-Club" },
  },
  {
    name: "NEU Math Club",
    short: "NEU MATH CLUB",
    tag: TAGS.neu,
    about: "Connecting Northeastern students with the math department",
    url: "https://www.instagram.com/mathclubnu/",
    logo: { src: "logos/math-club.png", alt: "NEU Math Club" },
  },
  {
    name: "BU Disrupters",
    short: "BU DISRUPTERS",
    tag: TAGS.external,
    about: null,
    url: null,
    logo: { src: "logos/disrupters.png", alt: "BU Disrupters" },
  },
  {
    name: "BU E-Club",
    short: "BU E-CLUB",
    tag: TAGS.external,
    about: "Selective community of BU student entrepreneurs and innovators",
    url: "https://eclub.bu.edu/",
    logo: { src: "logos/bu-eclub.png", alt: "BU E-Club" },
  },
  {
    name: "Tufts Jumbo Ventures",
    short: "TUFTS JUMBO VENTURES",
    // The name in its red band on the home page, the logo's own: the full
    // name is six characters longer than any other club's and would shrink
    // every band to fit it.
    band: "Jumbo Ventures",
    tag: TAGS.external,
    about: "Tufts' entrepreneurial student club",
    url: "https://www.instagram.com/jumboventures/",
    logo: { src: "logos/jumbo-ventures.png", alt: "Tufts Jumbo Ventures" },
    wordmark: true,
  },
  {
    name: "Oasis",
    short: "OASIS",
    tag: TAGS.social,
    about: "Eight-week program to build your first website or app",
    url: "https://www.oasisneu.com/",
    logo: { src: "logos/oasis.png", alt: "Oasis" },
    wordmark: true,
  },
  {
    name: "NUIB",
    short: "NUIB",
    tag: TAGS.social,
    about: null,
    url: null,
    logo: null,
  },
  {
    name: "ISIB",
    short: "ISIB",
    tag: TAGS.social,
    about: "Career development for international students at Northeastern",
    url: "https://www.instagram.com/isib_neu/",
    logo: { src: "logos/isib.png", alt: "ISIB" },
  },
];

/**
 * The people running the event: the "ORGANIZING TEAM" list on the home page,
 * one row each (Organizers.jsx), in the order the club gave.
 *
 * `title` is each person's job on the event, as the club set them, the red
 * chip in their row. `role` only sorts them for the count in the section's
 * lede: the five organizers, and the two partner organizations' presidents.
 * `linkedin` is the one link a row carries. A row without one keeps the
 * box's column empty, so the chips still line up.
 *
 * Headshots in public/team/ are square 320px crops of the supplied photos,
 * head and shoulders, in colour; the page shows them in greyscale so photos
 * from different shoots read as one set, the way the logos are all white.
 * Only people with a photo are listed.
 */
export const ROLES = { organizer: "ORGANIZER", partner: "PARTNER PRESIDENT" };

export const TEAM = [
  {
    name: "Shourya Yadav",
    role: ROLES.organizer,
    title: "Head of Sponsorship Outreach",
    photo: "team/shourya-yadav.jpg",
    linkedin: "https://www.linkedin.com/in/shouryadav/",
  },
  {
    name: "Smyan Sengupta",
    role: ROLES.organizer,
    title: "Head of Operations",
    photo: "team/smyan-sengupta.jpg",
    linkedin: "https://www.linkedin.com/in/smyan-sengupta/",
  },
  {
    name: "Sohum Balsara",
    role: ROLES.organizer,
    title: "Head of Operations",
    photo: "team/sohum-balsara.jpg",
    linkedin: "https://www.linkedin.com/in/sohum-balsara/",
  },
  {
    name: "Mehr Anand",
    role: ROLES.organizer,
    title: "Head of Partnerships",
    photo: "team/mehr-anand.jpg",
    linkedin: "https://www.linkedin.com/in/mehr-anand/",
  },
  {
    name: "Jackson Lamoureux",
    role: ROLES.organizer,
    title: "Head of Marketing",
    photo: "team/jackson-lamoureux.jpg",
    linkedin: "https://www.linkedin.com/in/jacksonlamoureux/",
  },
  {
    name: "Ruby Robicheau",
    role: ROLES.partner,
    title: "Partner Organization President",
    photo: "team/ruby-robicheau.jpg",
    linkedin: "https://www.linkedin.com/in/ruby-robicheau/",
  },
  {
    name: "Krishan Gauri",
    role: ROLES.partner,
    title: "Partner Organization President",
    photo: "team/krishan.jpg",
    linkedin: "https://www.linkedin.com/in/krishangauri/",
  },
];
