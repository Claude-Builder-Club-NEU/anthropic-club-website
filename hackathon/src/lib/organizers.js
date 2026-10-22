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
    url: "https://claudeneu.com/",
    logo: { src: "logos/claude-builders-club.png", alt: "Claude Builders Club" },
  },
  {
    name: "Rev",
    short: "REV",
    url: "https://www.rev.school/",
    logo: { src: "logos/rev.png", alt: "Rev" },
  },
  {
    name: "ACM",
    short: "ACM",
    url: "https://nuacm-website-euf7.vercel.app/",
    logo: { src: "logos/acm.png", alt: "ACM" },
  },
  {
    name: "AINU",
    short: "AINU",
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
 * Both logos carry their club's name as a wordmark, so `wordmark: true` drops
 * the caption under the mark (it would print the name twice) and the image's
 * alt text names the link instead. Same white-on-alpha treatment as the
 * organizer logos. NEU Blockchain's cube has its three face seams cut out, so
 * it still reads as a cube once its reds are flattened to one white.
 *
 * `url`: FirstByte's is the site its Khoury College club profile links to.
 * NEU Blockchain's profile links northeasternblockchain.xyz, which no longer
 * resolves, so the cell goes to the club's Instagram until it has a site.
 * Disrupt's two listed sites have both lapsed (neudisrupt.com is parked for
 * sale and disruptneu.com does not resolve), so it links the LinkedIn page
 * Khoury lists for it.
 *
 * Disrupt's mark is the plain "Disrupt" wordmark from the club's own logo
 * file, its dark-text version, cut out and flattened to white; the accent in
 * the D keeps the hairline gap the artwork gives it, so it still reads.
 *
 * NU Security's and the Investment Banking Club's marks are symbols with no
 * name in them, so they keep the caption, as the organizers do. Both are cut
 * from the supplied artwork to white on alpha with a seam wherever two inks
 * met: NU Security's purple shield against its black swords, and each
 * building's lit front against its shaded side. Without the seams both would
 * flatten to a single blob. NU Security has no site, and its Khoury profile
 * lists the Instagram, so the cell links there. The Investment Banking Club
 * has no `url` yet, so its cell is not a link.
 *
 * Disrupters is a different organisation from Disrupt. Its mark is the white
 * pixel D cut from the supplied blue square, the shape taken from how white
 * each pixel is, so the grid lines between its cells survive as hairlines.
 * It is a symbol with no name in it, so it keeps the caption. Jumbo Ventures
 * is the supplied lockup with only its blue kept: the elephant and the
 * wordmark go white, and the yellow bulb drops out, so the bulb is knocked
 * out of the head rather than flattened into it. Neither has a `url` yet.
 */
export const BACKERS = [
  {
    name: "NEU Blockchain",
    short: "NEU BLOCKCHAIN",
    url: "https://www.instagram.com/neublockchain/",
    logo: { src: "logos/neu-blockchain.png", alt: "NEU Blockchain" },
    wordmark: true,
  },
  {
    name: "FirstByte",
    short: "FIRSTBYTE",
    url: "https://www.teachfirstbyte.com/",
    logo: { src: "logos/firstbyte.png", alt: "FirstByte" },
    wordmark: true,
  },
  {
    name: "Disrupt",
    short: "DISRUPT",
    url: "https://www.linkedin.com/company/neudisrupt/",
    logo: { src: "logos/disrupt.png", alt: "Disrupt" },
    wordmark: true,
  },
  {
    name: "NU Security",
    short: "NU SECURITY",
    url: "https://www.instagram.com/nusecurity/",
    logo: { src: "logos/nu-security.png", alt: "NU Security" },
  },
  {
    name: "Investment Banking Club",
    short: "INVESTMENT BANKING CLUB",
    url: null,
    logo: { src: "logos/investment-banking.png", alt: "Investment Banking Club" },
  },
  {
    name: "Disrupters",
    short: "DISRUPTERS",
    url: null,
    logo: { src: "logos/disrupters.png", alt: "Disrupters" },
  },
  {
    name: "Jumbo Ventures",
    short: "JUMBO VENTURES",
    url: null,
    logo: { src: "logos/jumbo-ventures.png", alt: "Jumbo Ventures" },
    wordmark: true,
  },
];

/**
 * The people running the event: the "ORGANIZING TEAM" grid under the
 * organizer logos. Everyone is an organizer, so there is one list, four to a
 * row on a desktop.
 *
 * Headshots in public/team/ are square 320px crops of the supplied photos,
 * head and shoulders, in colour; the page shows them in greyscale so photos
 * from different shoots read as one row, the way the logos are all white.
 * Only people with a photo are listed.
 */
export const TEAM = [
  { name: "Shourya Yadav", photo: "team/shourya-yadav.jpg" },
  { name: "Smyan Sengupta", photo: "team/smyan-sengupta.jpg" },
  { name: "Sohum Balsara", photo: "team/sohum-balsara.jpg" },
  { name: "Mehr Anand", photo: "team/mehr-anand.jpg" },
  { name: "Jackson Lamoureux", photo: "team/jackson-lamoureux.jpg" },
  { name: "Ruby Robicheau", photo: "team/ruby-robicheau.jpg" },
  { name: "Krishan", photo: "team/krishan.jpg" },
];
