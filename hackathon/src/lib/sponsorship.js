/**
 * The sponsor one-pager, as data, for /hackathon/sponsor/.
 *
 * Tiers and benefits are copied from the one-pager exactly. A benefit's
 * `values` has one entry per tier, in TIERS order: `true` is a check, a string
 * is printed as written, and `null` means the tier does not include it.
 */

export const TIERS = [
  { id: "supporter", name: "Supporter", price: "$300+" },
  { id: "bronze", name: "Bronze", price: "$700" },
  { id: "silver", name: "Silver", price: "$950" },
  { id: "gold", name: "Gold", price: "$2,650" },
  { id: "platinum", name: "Platinum", price: "$3,650" },
];

export const BENEFITS = [
  {
    label: "Logo on website, share API credits or resources",
    values: [true, true, true, true, true],
  },
  {
    label: "Logo on event signage and posts",
    values: [null, "Small", "Medium", "Large", "Largest"],
  },
  {
    label: "Social media shoutout, swag handed out",
    values: [null, true, true, true, true],
  },
  {
    label: "Logo on shirts, thanks at opening and closing",
    values: [null, null, true, true, true],
  },
  {
    label: "Your own social post",
    values: [null, null, "1 Story", "Posts + Stories", "Joint Reel"],
  },
  {
    label: "Workshop, recruiting table, judge seat",
    values: [null, null, null, true, true],
  },
  {
    label: "Resumes",
    values: [null, null, null, "Winners", "Everyone"],
  },
  {
    label: "Your own prize track, dinner with winners",
    values: [null, null, null, null, true],
  },
];

export const OTHER_WAYS = [
  { strong: "Prize money", rest: "for a category you name." },
  { strong: "API credits", rest: "or inference tokens." },
  { strong: "Food, hardware or swag.", rest: "" },
  { strong: "Mentors", rest: "for the weekend." },
];

export const CONTACTS = [
  { name: "Mehr Singh Anand", email: "anand.me@northeastern.edu" },
  { name: "Shourya Yadav", email: "yadav.sho@northeastern.edu" },
];

/** One mailto that reaches both organizers, with the subject filled in. */
export const SPONSOR_MAILTO = `mailto:${CONTACTS.map((c) => c.email).join(",")}?subject=${encodeURIComponent(
  "HACK1984 sponsorship",
)}`;
