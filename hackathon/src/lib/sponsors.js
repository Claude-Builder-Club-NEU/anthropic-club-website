/**
 * Sponsors, in two tiers: the Sponsors section under the hero
 * (src/components/Sponsors.jsx), and Backed by on the sponsor page.
 *
 * Only confirmed sponsors are listed. Elisity and FuzionX are pending
 * approval, so neither is on the page: Elisity's logo stays in public/logos/
 * for the day it is approved, and its entry is the commented-out line in
 * With support from.
 *
 * The split is by what each sponsor gives, against the one-pager's tiers in
 * src/lib/sponsorship.js. Backed by is Platinum and up ($3,650 or more, in
 * cash or credits): Anthropic, Tavily, Exa, CodeCrafters, Within3 and Team
 * IMPACT, plus Gradium, whose 100k credits have no dollar figure yet but are
 * expected to clear the line. With support from is everyone else, largest
 * first, then the sponsors giving credits, merch or links with no figure on
 * them. Amounts are never printed.
 *
 * A sponsor is { name, logo, about, url }, and may add `role`. `logo` is
 * { src, height } or null; with null, the panel sets the name in the display
 * face where the logo would be. `height` is the logo's base height in px,
 * which evens out marks of different shapes; the panel draws it 1.5 times
 * that (src/index.css, .hk-member__logo--sized). `about` is one line from
 * the sponsor's own site, printed under the name; null where nothing could
 * be found. In Backed by, the red line under the name is the tier's `role`
 * unless the sponsor has its own: the two that run the Surge track, and
 * CodeCrafters, whose memberships are the tracks' prizes. With support from
 * is `compact`: a rectangle with the logo and the name, no line or role.
 *
 * The logos are each sponsor's own artwork, monochrome white. Anthropic's is
 * the club repo's official wordmark (src/assets/brand/) filled white.
 * Tavily's is the lockup Tavily supplied, its icon's arrows knocked out.
 * CodeCrafters' is its own white stacked lockup. Exa's is the wordmark from
 * exa.ai's header, filled white. Team IMPACT's is the teamimpact.org badge,
 * its navy and red made white and its lettering, stripes and handshake
 * knocked out. Gradium's and SSOJet's are their header SVGs, filled white.
 * Misneach's is the white lockup from misneach.ai. Northeastern SGA's is the
 * association's seal, cut from the lockup on its site, without the "SGA"
 * letters beside it. Kaleidoscope is Khoury College's club council, not the
 * scholarship company: its mark is the aperture from its Notion guide.
 * Adobe's lockup is from Wikimedia Commons, and Partiful's "p" from its site.
 * Within3's is the white wordmark from its own site header, flattened to
 * pure white; the sponsor list had it as "thin3".
 *
 * PLACEHOLDER: Orxion and Bravado have no logo, no site and no line yet, and
 * none could be found, so their cards are the name alone.
 */
export const SPONSOR_TIERS = [
  {
    id: "backed",
    label: "BACKED BY",
    role: "SPONSOR",
    sponsors: [
      {
        name: "Anthropic",
        logo: { src: "logos/anthropic.svg", height: 20 },
        about: "AI safety and research company, maker of Claude",
        url: "https://www.anthropic.com/",
      },
      {
        name: "Tavily",
        logo: { src: "logos/tavily.png", height: 32 },
        about: "Real-time search engine for AI agents, by Nebius",
        role: "SURGE TRACK",
        url: "https://www.tavily.com/",
      },
      {
        name: "Exa",
        logo: { src: "logos/exa.svg", height: 26 },
        about: "Search API for AI agents that need real-time web data",
        role: "SURGE TRACK",
        url: "https://exa.ai/",
      },
      {
        name: "CodeCrafters",
        logo: { src: "logos/codecrafters.svg", height: 40 },
        about: "Build your own Redis, Git, SQLite and more from scratch",
        role: "PRIZE SPONSOR",
        url: "https://codecrafters.io/",
      },
      {
        name: "Within3",
        logo: { src: "logos/within3.png", height: 28 },
        about: "Always-on launch intelligence platform for life sciences",
        url: "https://within3.com/",
      },
      {
        name: "Team IMPACT",
        logo: { src: "logos/team-impact.png", height: 52 },
        about: "Nonprofit pairing kids facing serious illness with college teams",
        url: "https://www.teamimpact.org/",
      },
      {
        name: "Gradium",
        logo: { src: "logos/gradium.svg", height: 20 },
        about: "Low-latency voice AI APIs: text-to-speech and speech-to-text",
        url: "https://gradium.ai/",
      },
    ],
  },
  {
    id: "support",
    label: "WITH SUPPORT FROM",
    compact: true,
    sponsors: [
      {
        name: "Misneach",
        logo: { src: "logos/misneach.png", height: 26 },
        about: "Backs early-stage founders with capital and AI infrastructure",
        url: "https://misneach.ai/",
      },
      {
        name: "Northeastern SGA",
        logo: { src: "logos/northeastern-sga.png", height: 44 },
        about: "Student Government Association, the voice of NU undergraduates",
        url: "https://www.northeasternsga.com/",
      },
      { name: "Orxion", logo: null, about: null, url: null },
      { name: "Bravado", logo: null, about: null, url: null },
      {
        name: "SSOJet",
        logo: { src: "logos/ssojet.svg", height: 28 },
        about: "Add enterprise SSO to B2B SaaS, with 100+ identity providers",
        url: "https://ssojet.com/",
      },
      {
        name: "Kaleidoscope",
        logo: { src: "logos/kaleidoscope.png", height: 28 },
        about: "Khoury College's official clubs council, run by students",
        url: "https://www.khoury.northeastern.edu/undergraduate-clubs-and-organizations/kaleidoscope/",
      },
      {
        name: "Adobe",
        logo: { src: "logos/adobe.svg", height: 24 },
        about: "Maker of Creative Cloud, Acrobat and Adobe Express",
        url: "https://www.adobe.com/",
      },
      {
        name: "Partiful",
        logo: { src: "logos/partiful.svg", height: 26 },
        about: "Free event pages with invites, RSVP tracking and text blasts",
        url: "https://partiful.com/",
      },
      // Pending approval:
      // { name: "Elisity", logo: { src: "logos/elisity.png", height: 26 }, about: null, url: "https://www.elisity.com/" },
    ],
  },
];

/** Every confirmed sponsor, both tiers, for counts and credits. */
export const SPONSORS = SPONSOR_TIERS.flatMap((tier) => tier.sponsors);
