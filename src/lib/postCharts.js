/**
 * Charts a blog post can embed, by id: `::chart workshops` on a line of its own.
 *
 * The numbers are a SNAPSHOT, written down here rather than fetched. A post is
 * a record of what was true when it went out, and a chart that re-counted the
 * live ballots table would quietly change an article that has already been
 * read. It would also put a Supabase request on a blog page, which nothing else
 * on the blog makes.
 *
 * Counts are stored and PERCENTAGES are shown. The counts are the source, so
 * the shares can be checked against the export; the page prints shares only,
 * as a whole percent of `base`.
 *
 * NO JSX IN THIS FILE, for the reason lib/blog.js gives: blog.js imports it to
 * fail the build on an unknown id, and `vite build --ssr` refuses JSX in a .js
 * file. Rendering lives in components/PostChart.jsx.
 *
 * KINDS
 *   bars   one bar per row, its share of `base` printed at the tip.
 *   split  ordered series as shares of each row, every row the full width.
 *          Segments wide enough to hold a number carry one.
 *
 * Series are ORDERED (definitely, maybe, not for me), so they take one hue
 * light to dark rather than categorical colours. The ramp is --chart-1..3 in
 * index.css and passes the dataviz validator's ordinal checks against paper.
 * Rows are listed in the order they should draw.
 *
 * TO ADD A CHART: add an entry below, then `::chart <id>` in the post. An id
 * the post names that is not here fails the build with the post's slug in the
 * message.
 */

/* ------------------------------------------------------------------------ *
 * Info session poll, September 17 2026
 *
 * Source: the Supabase `ballots` export of Sep 18, slug info-session-2026-09,
 * ballots cast during the session only (6 to 8 PM ET): 91 of them. The table
 * also holds four test ballots cast Sep 14 to 16 under the same slug, which
 * the public results page counted for a while. They are left out here, and
 * they are why Money Moves leads Fix Northeastern 27% to 25% rather than the
 * tie the public page showed. Every count was re-derived from the export.
 * ------------------------------------------------------------------------ */

const INFO_SESSION_BALLOTS = 91;

export const CHARTS = {
  workshops: {
    kind: "bars",
    title: "The workshops you picked",
    note: "Share of you who put each one in your top three",
    base: INFO_SESSION_BALLOTS,
    tip: "of you picked it",
    // The three that won. Drawn bold, never in another colour: a highlight
    // colour on three rows would read as a second series with no legend.
    emphasis: 3,
    rows: [
      { label: "Student agents", full: "Student agents: schedule, job tracker, co-op search", value: 49 },
      { label: "Financial modeling", full: "Financial modeling with Claude", value: 47 },
      { label: "Building a business", full: "Building a business with Claude Code", value: 41 },
      { label: "Your first app", full: "Building your first app with Claude Code", value: 35 },
      { label: "Building tools", full: "Building tools with Claude", value: 27 },
      { label: "Guest speaker", full: "Guest speaker: how professionals use Claude", value: 21 },
      { label: "Claude Code for your major", value: 20 },
      { label: "Claude for school", full: "Claude for school: assignments, notes, studying", value: 18 },
      { label: "Portfolio websites", full: "Portfolio websites with Claude Code", value: 9 },
      { label: "Marketing and content", full: "Marketing and content creation", value: 6 },
    ],
  },

  hackathon: {
    kind: "bars",
    title: "Mini hackathon theme",
    note: "Share of the vote",
    base: INFO_SESSION_BALLOTS,
    tip: "of the vote",
    emphasis: 1,
    rows: [
      { label: "Money Moves", sub: "Budgeting, split-the-check, subscription audits", value: 25 },
      { label: "Fix Northeastern", sub: "One thing on campus that drives you insane, rebuilt", value: 23 },
      { label: "Beat the Spread", sub: "Sports analytics, prediction, fantasy tools", value: 22 },
      { label: "Steal This Site", sub: "Rebuild a site you use, cleaner or faster", value: 21 },
    ],
  },

  events: {
    kind: "split",
    title: "Would you come to these?",
    base: INFO_SESSION_BALLOTS,
    series: ["Definitely", "Might come", "Not for me"],
    rows: [
      { label: "Socials with partner clubs", values: [56, 35, 0] },
      { label: "Demo night", values: [46, 35, 10] },
      { label: "Coworking sessions", values: [39, 49, 3] },
    ],
  },
};

export function findChart(id) {
  return Object.prototype.hasOwnProperty.call(CHARTS, id) ? CHARTS[id] : null;
}
