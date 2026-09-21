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
