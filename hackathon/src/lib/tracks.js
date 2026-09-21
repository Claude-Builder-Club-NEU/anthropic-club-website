/**
 * The four tracks.
 *
 * `art` is the key into src/lib/ascii.js, which is also the ascii/ filename.
 * `index` is rendered as "01 / 04" and is written out rather than derived from
 * the array position so the pair stays readable at the call site.
 *
 * `facts` is the spec list under each description: what a team would actually
 * build, what the judges are looking at, and what it pays. A track used to be
 * a title and one sentence, which is enough to sort teams by vibe and not
 * enough for anyone to decide whether they can enter it.
 *
 * PLACEHOLDER: every PRIZE figure. Confirm with sponsors before launch.
 */
export const TRACKS = [
  {
    index: "01",
    art: "ministry-of-truth",
    title: "Ministry of Truth",
    description: "Tools that show where something actually came from.",
    facts: [
      {
        key: "BUILD",
        value: "Provenance for a feed. A C2PA viewer. A diff that survives a screenshot.",
      },
      {
        key: "JUDGED ON",
        value: "Can a stranger verify the claim without having to trust you?",
      },
      { key: "PRIZE", value: "[$1,000] and a sponsor interview" },
    ],
  },
  {
    index: "02",
    art: "telescreen",
    title: "Telescreen",
    description: "Tools that don't spy on the person using them.",
    facts: [
      {
        key: "BUILD",
        value: "Local-first anything. A client that leaks nothing. Analytics that forget.",
      },
      { key: "JUDGED ON", value: "What leaves the device, and who can prove it?" },
      { key: "PRIZE", value: "[$1,000] and a sponsor interview" },
    ],
  },
  {
    index: "03",
    art: "sledgehammer",
    title: "Sledgehammer",
    description: "Leave the internet better than you found it.",
    facts: [
      {
        key: "BUILD",
        value: "A patch to something you depend on. A dark-pattern remover. An a11y fix that ships.",
      },
      {
        key: "JUDGED ON",
        value: "Is it merged, deployed, or in someone else's hands by Sunday?",
      },
      { key: "PRIZE", value: "[$1,000] and a sponsor interview" },
    ],
  },
  {
    index: "04",
    art: "room-101",
    title: "Room 101",
    description: "Hardware. Bring a soldering iron.",
    facts: [
      {
        key: "BUILD",
        value: "A device that works offline. A sensor that stays in the room. A real off switch.",
      },
      { key: "JUDGED ON", value: "Does it exist as an object, and does it power on?" },
      { key: "PRIZE", value: "[$1,000] and a sponsor interview" },
    ],
  },
];

/** Rendered into the right-hand tag of every panel: "01 / 04". */
export const TRACK_COUNT = String(TRACKS.length).padStart(2, "0");
