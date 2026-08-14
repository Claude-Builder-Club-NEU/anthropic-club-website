import { INTEREST_FORM, CALENDAR_URL } from "./links";

/**
 * FAQ. Six questions, in this order, per revision 2 §2.4. Four earlier
 * questions (what happens at a workshop, how to get into Slack, do you run
 * hackathons, are grad and co-op students welcome) were removed.
 *
 * Note on "What do members get access to": an earlier pass stripped API credit
 * claims as unverified. Revision 2 explicitly reinstates them, so they are
 * confirmed and back in.
 *
 * `a` is the plain-text answer and is what schema.org/FAQPage publishes.
 * `links` linkifies substrings of it, so the structured data and the rendered
 * copy can never disagree.
 */

export const FAQ = [
  {
    q: "Who can join?",
    a: "Any Northeastern undergraduate or graduate student, from any college and any major. You do not need to know how to code. That is the whole point of Claude Code: you describe what you want in plain English and build it from there.",
  },
  {
    q: "Is there a fee or an application?",
    a: "Neither. Fill out the interest form and we will send you an email.",
    links: [{ text: "interest form", href: INTEREST_FORM, external: true }],
  },
  {
    q: "What do members get access to?",
    a: "Claude merch, Claude API credits, and Claude news as soon as it breaks, along with how to actually use it.",
  },
  {
    q: "When and where do you meet?",
    a: "Check our calendar for a list of events!",
    // Points at the Google Calendar once §6.1 arrives. Until then it goes to
    // the events page, which is where the calendar lives on this site.
    links: [
      CALENDAR_URL
        ? { text: "calendar", href: CALENDAR_URL, external: true }
        : { text: "calendar", to: "/events" },
    ],
  },
  {
    q: "How do I join the Executive board?",
    a: "Show up, build things, and tell us you are interested. Board roles open up between semesters and we fill them from people already active in the club.",
  },
  {
    q: "How do I bring a project or partnership to the club?",
    a: "Get in touch with one of the board members through LinkedIn or email.",
    links: [{ text: "board members", to: "/about#board" }],
  },
];

/** schema.org/FAQPage structured data. */
export const faqJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});
