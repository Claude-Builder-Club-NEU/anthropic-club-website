/**
 * Three ways to win.
 *
 * The sponsor one-pager replaced four themed tracks with these three: a main
 * track on privacy by design, one prize for the most startup-able idea, and a
 * sponsor track from Tavily with three places. The sponsor page renders the
 * short form of the same list (`pitch`), so the two pages cannot describe
 * different contests.
 *
 * `art` is the key into src/lib/ascii.js. `kind` is the left-hand tag on the
 * panel, the same label the one-pager puts over each title. `index` renders as
 * "01 / 03" and is written out rather than derived, so the pair stays readable
 * at the call site.
 *
 * `facts` is the spec list under the body: what a team would build, what the
 * judges look at, and what it pays.
 *
 * More tracks are coming; add them here and the page, the sponsor page and
 * the "01 / 0N" counters all follow.
 *
 * PRIZES: every track pays First, Second and Third place in CodeCrafters VIP
 * memberships (2 years, 1 year, 6 months), confirmed by the club. A `value`
 * may be a list, which renders one line per entry. Anything not yet confirmed
 * is still not printed: the main track's headline prizes and the Most
 * Startup-able prize, meant to come from a venture fund sponsor, stay "to be
 * announced".
 */
export const TRACKS = [
  {
    index: "01",
    kind: "MAIN TRACK",
    art: "telescreen",
    title: "Privacy-First",
    description: "Software that protects its users by design.",
    body:
      "Build software that keeps people's data theirs: local AI that never phones home, tools that anonymize data before anyone else sees it, healthcare software that treats patient records like they matter. Make protecting the person using it the architecture, not a toggle in settings. More details on the track are coming closer to the event.",
    pitch: "Software that protects its users by design.",
    facts: [
      {
        key: "BUILD",
        value: "Local AI. Anonymization software. Healthcare software. Anything local-first, encrypted, or built to collect less.",
      },
      {
        key: "JUDGED ON",
        value: "What leaves the device, who can read it, and can you prove it? Then: would anyone use it?",
      },
      {
        key: "PRIZE",
        value: [
          "First Prize: 2-year VIP CodeCrafters membership",
          "Second Prize: 1-year VIP CodeCrafters membership",
          "Third Prize: 6-month VIP CodeCrafters membership",
          "Plus the main prizes of the weekend, announced soon",
        ],
      },
    ],
    sponsor: null,
  },
  {
    index: "02",
    kind: "ONE PRIZE",
    art: "sledgehammer",
    title: "Most Startup-able",
    description: "The idea most likely to become a company.",
    body:
      "A standalone prize for the most fundable idea in the room: a real problem, someone who would pay to have it solved, and a reason you are the team to solve it. The prize is meant to come from one of the venture funds sponsoring the weekend; details to come.",
    pitch: "The idea most likely to become a company.",
    facts: [
      {
        key: "BUILD",
        value: "Something with a first customer in mind. A working demo, a one-line pitch and a reason it has to exist now.",
      },
      {
        key: "JUDGED ON",
        value: "How fundable is it? Who is it for, would they pay, and why is this team the one to build it?",
      },
      {
        key: "PRIZE",
        value: [
          "First Prize: 2-year VIP CodeCrafters membership",
          "Second Prize: 1-year VIP CodeCrafters membership",
          "Third Prize: 6-month VIP CodeCrafters membership",
          "Plus one more prize, to be announced",
        ],
      },
    ],
    sponsor: null,
  },
  {
    index: "03",
    kind: "SPONSOR TRACK",
    art: "ministry-of-truth",
    title: "Best Use of Tavily",
    description: "Build with Tavily's search API. Three places.",
    body:
      "Tavily gives AI agents real-time access to the web: search, extract and crawl, built for language models rather than for people clicking links. Use it to build an agent that researches, verifies and cites its sources, without turning the person asking into the product.",
    pitch: "1st–3rd prizes. Your company can run a track like this one.",
    facts: [
      {
        key: "BUILD",
        value: "A research agent that shows its sources. A fact-checker for a feed. A tool that finds what the web knows about you.",
      },
      {
        key: "JUDGED ON",
        value: "How central Tavily is to what the project does, and how well it works.",
      },
      {
        key: "PRIZE",
        value: [
          "First Prize: 2-year VIP CodeCrafters membership",
          "Second Prize: 1-year VIP CodeCrafters membership",
          "Third Prize: 6-month VIP CodeCrafters membership",
        ],
      },
    ],
    sponsor: { name: "Tavily", logo: "logos/tavily.png" },
  },
];

/** Rendered into the right-hand tag of every panel: "01 / 03". */
export const TRACK_COUNT = String(TRACKS.length).padStart(2, "0");
