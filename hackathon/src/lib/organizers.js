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
 * Northeastern clubs backing the event without running it: the "ALSO BACKED
 * BY" row under the organizers. Neither a sponsor nor an organiser, so it is
 * its own list and its own row rather than more cells in either.
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
];
