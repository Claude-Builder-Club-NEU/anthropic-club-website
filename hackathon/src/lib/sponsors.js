/**
 * Sponsors, by tier: the Sponsors section under the hero
 * (src/components/Sponsors.jsx), and the sponsor page's credits.
 *
 * Only confirmed sponsors are listed, plus Gradium, which the organizers
 * placed while its status is pending.
 *
 * Tiers follow the organizers' sponsor tracker, in its order. Where it gives a
 * level, that is the tier: Anthropic, Gradium, Elisity and SSOJet are Silver.
 * Where it gives a figure, the tier is the highest of the sponsorship packet's
 * levels the figure reaches: Platinum $3,650, Gold $2,650, Silver $950, Bronze
 * $700, Supporter $500. No one is at Gold, so it has no entry. Misneach gives
 * $2,500, under Gold. TechCXO ($300, from the finance sheet, and not on the
 * tracker) and Bravado ($200, which the tracker marks as unclear) are under
 * Supporter, the lowest level there is, and Adobe and Partiful give goods with
 * no figure, so all four are Supporters. Amounts are never printed.
 *
 * Team IMPACT and JC&A sponsor together, so they share one card: an entry
 * with `members`, each a sponsor of its own with a `share` on its logo, the
 * percent of the panel's width it takes. They still count as two.
 *
 * A sponsor is { name, logo, about, url }, and may add `role`. `logo` is
 * { src, height } or null; with null, the panel sets the name in the display
 * face where the logo would be. `height` is the logo's base height in px,
 * which evens out marks of different shapes; the panel draws it 1.5 times
 * that (src/index.css, .hk-member__logo--sized). `about` is one line from
 * the sponsor's own site, printed under the name; null where nothing could
 * be found. In Platinum, the red line under the name is the tier's `role`
 * unless the sponsor has its own: the two that run the Surge track, and
 * CodeCrafters, whose memberships are the tracks' prizes. The lower tiers
 * are `compact`: a rectangle with the logo and the name, no line or role.
 * `columns: 3` sets a tier three across. `small` tiers share one line of
 * smaller boxes, each under its own label.
 *
 * The logos are each sponsor's own artwork, monochrome white. Anthropic's is
 * the club repo's official wordmark (src/assets/brand/) filled white.
 * Tavily's is the lockup Tavily supplied, its icon's arrows knocked out.
 * CodeCrafters' is its own white stacked lockup. Exa's is the wordmark from
 * exa.ai's header, filled white. Team IMPACT's is the teamimpact.org badge,
 * its navy and red made white and its lettering, stripes and handshake
 * knocked out. SSOJet's is its header SVG, filled white.
 * Misneach's is the white lockup from misneach.ai. Northeastern SGA's is the
 * association's seal, cut from the lockup on its site, without the "SGA"
 * letters beside it. Kaleidoscope is Khoury College's club council, not the
 * scholarship company: its mark is the aperture from its Notion guide.
 * Adobe's lockup is from Wikimedia Commons, and Partiful's "p" from its site.
 * Within3's is the white wordmark from its own site header, flattened to
 * pure white; the sponsor list had it as "thin3". JC&A's, TechCXO's and
 * Bravado's are the supplied artwork on black, taken to white on alpha from
 * how bright each pixel is and trimmed to the mark, so the panel centres the
 * mark itself and not a margin around it. FuzionX's is its supplied lockup
 * filled white, its green chevron with the rest, and Elisity's is its
 * wordmark, also white. Gradium's is the monogram from gradium.ai, filled white.
 */
export const SPONSOR_TIERS = [
  {
    id: "platinum",
    label: "PLATINUM",
    role: "SPONSOR",
    columns: 3,
    sponsors: [
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
        role: "SIGNAL-TO-DOSE TRACK",
        about: "Always-on launch intelligence platform for life sciences",
        url: "https://within3.com/",
      },
      {
        name: "Team IMPACT + JC&A",
        about: "Nonprofit and Northeast construction manager, sponsoring together",
        members: [
          {
            name: "Team IMPACT",
            logo: { src: "logos/team-impact.png", height: 52, share: 30 },
            url: "https://www.teamimpact.org/",
          },
          {
            name: "JC&A",
            logo: { src: "logos/jca.png", height: 44, share: 63 },
            url: "https://jcalnan.com/",
          },
        ],
      },
      {
        name: "FuzionX",
        logo: { src: "logos/fuzionx.png", height: 20 },
        about: "Boston venture firm co-building AI-native software companies",
        url: "https://www.fuzionx.com/",
      },
    ],
  },
  {
    id: "silver",
    label: "SILVER",
    compact: true,
    columns: 3,
    sponsors: [
      {
        name: "Anthropic",
        logo: { src: "logos/anthropic.svg", height: 20 },
        about: "AI safety and research company, maker of Claude",
        url: "https://www.anthropic.com/",
      },
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
      {
        name: "Gradium",
        logo: { src: "logos/gradium.svg", height: 34 },
        about: "Low-latency voice AI API for speech, transcription and cloning",
        url: "https://gradium.ai/",
      },
      {
        name: "Elisity",
        logo: { src: "logos/elisity.png", height: 26 },
        about: "Identity-based microsegmentation for enterprise networks",
        url: "https://www.elisity.com/",
      },
      {
        name: "SSOJet",
        logo: { src: "logos/ssojet.svg", height: 28 },
        about: "Add enterprise SSO to B2B SaaS, with 100+ identity providers",
        url: "https://ssojet.com/",
      },
    ],
  },
  {
    id: "bronze",
    label: "BRONZE",
    compact: true,
    small: true,
    sponsors: [
      {
        name: "Kaleidoscope",
        logo: { src: "logos/kaleidoscope.png", height: 28 },
        about: "Khoury College's official clubs council, run by students",
        url: "https://www.khoury.northeastern.edu/undergraduate-clubs-and-organizations/kaleidoscope/",
      },
    ],
  },
  {
    id: "supporter",
    label: "SUPPORTER",
    compact: true,
    small: true,
    sponsors: [
      {
        name: "TechCXO",
        logo: { src: "logos/techcxo.png", height: 32 },
        about: "Fractional executives for growing companies",
        url: "https://www.techcxo.com/",
      },
      {
        name: "Bravado",
        logo: { src: "logos/bravado.png", height: 40 },
        about: "Infrastructure for prediction markets: data and trading in one API",
        url: "https://www.bravadotrade.com/",
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
    ],
  },
];

/** A tier's sponsors one by one, a shared card opened into its members. */
export const eachSponsor = (tier) => tier.sponsors.flatMap((sponsor) => sponsor.members ?? [sponsor]);

/** Every confirmed sponsor, all tiers, for counts and credits. */
export const SPONSORS = SPONSOR_TIERS.flatMap(eachSponsor);
