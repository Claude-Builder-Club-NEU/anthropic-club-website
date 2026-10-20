/**
 * The six detail cards (SPEC §3.7).
 *
 * PLACEHOLDER: meals, the team size of four and the student ID at check-in
 * are still drafts. The cost and the absence of an overnight room are not: the
 * event is free (the old $5 fee is gone), and there is no quiet room, so that
 * card is gone rather than softened.
 *
 * `icon` is the key into ICONS in src/components/DetailIcons.jsx.
 */
export const DETAILS = [
  {
    icon: "meal",
    title: "Meals",
    body: "Dinner, breakfast, lunch and late-night snacks all weekend. Tell us about dietary needs on the application.",
  },
  {
    icon: "venue",
    title: "Venue",
    body: "300 Massachusetts Ave, Boston. Check in at the front desk with your student ID.",
  },
  {
    icon: "team",
    title: "Teams",
    body: "Up to four people per team. Come solo and find a team at the kickoff.",
  },
  {
    icon: "bring",
    title: "What to bring",
    body: "Laptop, charger and student ID. Building hardware? Bring your own parts.",
  },
  {
    icon: "cost",
    title: "Cost",
    body: "Completely free. No fee to apply or to attend, and food, Wi-Fi and swag are covered.",
  },
];
