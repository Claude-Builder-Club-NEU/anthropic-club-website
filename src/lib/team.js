/**
 * Team photos on /about: the group photo that opens the page and the row of
 * candids under the two text columns.
 *
 * Masters live in `team-src/<src>.jpg` and are never deployed;
 * scripts/build-team-photos.mjs writes the ladder below into `public/team/`.
 * Adding a candid is dropping its master in and adding an entry here. Every
 * master is 3:2, which is the box ratio About sets, so nothing is cropped.
 *
 * Alt text describes the picture and names nobody. A photo of several people
 * cannot say who stands where without someone checking it, and a wrong name
 * in alt text is worse than none.
 */

/** Kept in step with WIDTHS in scripts/build-team-photos.mjs. */
export const TEAM_WIDTHS = [480, 960, 1440, 2000];

export const GROUP_PHOTO = {
  src: "group",
  alt: "The Claude Builders Club team, eight people in suits, standing together on the stone steps of a building with tall columns.",
};

export const CANDIDS = [
  {
    src: "candid-1",
    alt: "Three team members laughing together on the stone steps.",
  },
  {
    src: "candid-2",
    alt: "Two team members with their arms crossed in front of lit stone columns.",
  },
  {
    src: "candid-3",
    alt: "Two team members in suits talking on the front steps.",
  },
  {
    src: "candid-4",
    alt: "Two team members standing beside the columns at dusk.",
  },
];

export const teamImageBase = (src) => `/team/${src}`;

/**
 * The group photo fills the content column. Container insets step 24 / 40 /
 * 64px at Tailwind's sm and lg breakpoints, and max-w-6xl caps the column at
 * 1024px from 1152px up.
 */
export const GROUP_SIZES =
  "(min-width: 1152px) 1024px, (min-width: 1024px) calc(100vw - 128px), (min-width: 640px) calc(100vw - 80px), calc(100vw - 48px)";

/** Four across with 16px gaps from lg, two across below it. */
export const CANDID_SIZES =
  "(min-width: 1152px) 244px, (min-width: 1024px) calc((100vw - 176px) / 4), (min-width: 640px) calc((100vw - 96px) / 2), calc((100vw - 64px) / 2)";
