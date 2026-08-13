/**
 * FAQ.
 *
 * Every answer below is a FIRST DRAFT awaiting Jackson's final wording — the
 * brief says so explicitly. `draft: true` renders a visible TODO marker in dev
 * and nothing in production, so an unreviewed answer is obvious while working
 * but never shouts at a visitor.
 *
 * Deliberately absent: any claim about free Claude Pro, API credits, prize
 * totals, or member counts. The previous site advertised those and they are
 * unverified for this semester (see PRODUCT.md → Evidence on Hand). Q4 is
 * written to be true without them; do not "helpfully" add them back.
 */

export const FAQ = [
  {
    q: "Who can join? Do I need to know how to code?",
    a: "Any Northeastern student can join, from any college or major. You do not need to know how to code — plenty of members arrive having never written a line, and a lot of what we build now is possible precisely because you can describe what you want in plain English.",
    draft: true,
  },
  {
    q: "Is there a fee or an application?",
    a: "No fee and no application. Fill out the interest form and you're on the list.",
    draft: true,
  },
  {
    q: "What actually happens at a workshop?",
    a: "Someone walks through building something real, start to finish, and then everyone builds their own version of it. They are hands-on rather than lecture-style — bring a laptop.",
    draft: true,
  },
  {
    q: "What do members get access to?",
    a: "Workshops, build nights, hackathons, and a Slack full of people working on similar things. TODO: Jackson — confirm what else is accurate for this semester before adding anything here.",
    draft: true,
  },
  {
    q: "When and where do you meet?",
    a: "TODO: Jackson — we need the real cadence and location here. Once the calendar is live this answer can point at it instead.",
    draft: true,
  },
  {
    q: "How do I get into the Slack?",
    a: "TODO: Jackson — the invite link needs regenerating before this answer can be true. Fill out the interest form for now and we'll send it over.",
    draft: true,
  },
  {
    q: "Do you run hackathons?",
    a: "Yes. They're the biggest thing we do — a weekend to build something with a team and show it off at the end.",
    draft: true,
  },
  {
    q: "How do I join the exec board?",
    a: "Show up, build things, and tell us you're interested. Board roles open up between semesters and we fill them from people already active in the club.",
    draft: true,
  },
  {
    q: "Are grad students and co-op students welcome?",
    a: "Yes to both. Co-op especially — a lot of members are on rotation and stay involved remotely between semesters.",
    draft: true,
  },
  {
    q: "How do I bring a project or partnership to the club?",
    a: "Get in touch through the interest form and say what you have in mind. We work with student groups, faculty, and companies on projects that give members something real to build.",
    draft: true,
  },
];

/** schema.org/FAQPage — Phase 5 structured data. */
export const faqJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});
