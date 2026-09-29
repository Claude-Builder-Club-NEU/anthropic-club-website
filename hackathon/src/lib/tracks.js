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
 * PLACEHOLDER: the prize amounts. None is confirmed, so none is printed.
 */
export const TRACKS = [
  {
    index: "01",
    kind: "MAIN TRACK",
    art: "telescreen",
    title: "Privacy-First",
    description: "Software that protects its users by design.",
    body:
      "Build something people would actually use: a messenger, a study tool, a health tracker, a browser extension, a device. Then make protecting the person using it the architecture, not a toggle in settings. Collect less, keep it on the device, encrypt whatever has to leave, and be able to show exactly where the data goes.",
    pitch: "Software that protects its users by design.",
    facts: [
      {
        key: "BUILD",
        value: "Local-first apps. On-device AI. End-to-end encryption. Analytics that forget. A client that leaks nothing.",
      },
      {
        key: "JUDGED ON",
        value: "What leaves the device, who can read it, and can you prove it? Then: would anyone use it?",
      },
      { key: "PRIZE", value: "The main prizes of the weekend" },
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
      "One prize for the team with the clearest path from a Sunday demo to a real company: a real problem, someone who would pay to have it solved, and a reason you are the team to solve it. Privacy counts here too. A company that never holds its users' data has one less thing to lose.",
    pitch: "The idea most likely to become a company.",
    facts: [
      {
        key: "BUILD",
        value: "Something with a first customer in mind. A working demo, a one-line pitch and a reason it has to exist now.",
      },
      {
        key: "JUDGED ON",
        value: "Who is it for, would they pay, and why is this team the one to build it?",
      },
      { key: "PRIZE", value: "One prize" },
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
      { key: "PRIZE", value: "1st, 2nd and 3rd place" },
    ],
    sponsor: "TAVILY",
  },
];

/** Rendered into the right-hand tag of every panel: "01 / 03". */
export const TRACK_COUNT = String(TRACKS.length).padStart(2, "0");
