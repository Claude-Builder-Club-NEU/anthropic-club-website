import { Link } from "react-router-dom";
import { ArrowRightIcon } from "../components/Icons";

/**
 * /hackathon. A SCAFFOLD. This page is deliberately thin, and it is thin on
 * purpose rather than because somebody ran out of time.
 *
 * The brief was "create a blank page at claudeneu.com/hackathon". What the club
 * actually needed was for the URL to exist and resolve TODAY, so it can be
 * printed on a slide, dropped in a QR code, said out loud at an info session
 * and written on a table sign, weeks before anyone has agreed a date, a theme,
 * a venue or a sign-up link. The URL is the deliverable. The content is not
 * written yet and must not be invented here.
 *
 * BLANK, NOT EMPTY, and the distinction is the whole design. A component that
 * returned null would render an empty <main>, and this site is prerendered:
 * the empty document would be what ships to disk, what a crawler reads, and
 * what the first student who scans the code early actually sees. An empty page
 * is indistinguishable from a broken build, and the one moment this URL is
 * guaranteed to be visited is exactly the moment there is nothing on it. So it
 * says, in one line, that there is nothing on it yet, which is a true and
 * useful thing to tell someone who arrived deliberately.
 *
 * WHAT IS DELIBERATELY NOT ON THIS PAGE:
 *   - Any date, time, venue, prize, sponsor, schedule or registration link.
 *     None of those are decided. A placeholder date on a page students reach by
 *     scanning a printed code is worse than no page at all, because it is the
 *     kind of wrong that people act on.
 *   - The four mini hackathon themes from the ballot. They are CANDIDATES on a
 *     poll that has not closed. Repeating them here would read as the answer
 *     and would quietly campaign for whichever one is listed first. That page
 *     is /polls. This is not that page.
 *   - Lorem, greeked blocks, or a fake section skeleton. There is nothing to
 *     preview, and a shell full of grey boxes reads as unfinished rather than
 *     as reserved.
 *
 * IT WEARS THE SITE CHROME, unlike /fallfest and /join. Those two are
 * chromeless because they are single-purpose surfaces read in five seconds on a
 * phone, where 65px of sticky header is a measurable cost against the one
 * button that matters. Nothing here competes for the fold: this is an ordinary
 * content page that happens to be short today and will be a long one later.
 * Stripping the chrome now would mean putting it back, and re-deciding the
 * question, on the day the real copy lands.
 *
 * WHAT TO REPLACE THIS WITH. When the details are settled, the h1 and the
 * standfirst below become the real hero, everything under them is new, and two
 * other things have to move with it or the page ships half done:
 *   1. src/lib/seo.js: this route is `noindex: true` today, which also keeps it
 *      out of sitemap.xml. Delete that flag and write a real description. The
 *      reasoning for the flag is recorded on the route entry itself.
 *   2. The link back to /events at the bottom stops being the page's only exit
 *      and becomes a footnote, or goes. It is here so a scaffold is not a dead
 *      end for someone who scanned a code and found nothing.
 * Keep the h1 id and the aria-labelledby wired together whatever else changes.
 */
const Hackathon = () => (
  /* The same page-header shell as About.jsx: same container, same responsive
     padding steps, same labelled section. Two ordinary content pages should
     start on the same left edge and at the same height under the header, and
     when this page grows it should grow into that shell rather than have the
     shell retrofitted around it. */
  <section
    aria-labelledby="hackathon-heading"
    className="mx-auto w-full max-w-6xl px-6 pb-16 pt-14 sm:px-10 sm:pb-24 sm:pt-20 lg:px-16 lg:pt-24"
  >
    {/* 16ch rather than the 22ch About sets. Same treatment, different line:
        About's title is 33 characters and needs the wider cap to break where
        its own comma falls. This one is short enough that 22ch would leave it
        as a single thin stripe across a desktop viewport, which is the exact
        failure DESIGN.md caps the display measure to avoid. At 16ch it wraps
        into a block. */}
    <h1
      id="hackathon-heading"
      style={{
        fontSize: "var(--step-display)",
        lineHeight: 1.04,
        letterSpacing: "-0.03em",
        maxWidth: "16ch",
      }}
    >
      The next hackathon.
    </h1>

    {/* The only claim this page makes, and it is a claim about itself. "Not up
        yet" rather than "coming soon": one of those is a fact about the page
        the reader is looking at, the other is a promise about a date nobody has
        set. Naming the three things that are missing is what tells a reader
        whether it is worth coming back, and it is also the checklist for
        whoever fills this in. */}
    <p className="lead mt-8" style={{ maxWidth: "var(--measure-tight)" }}>
      The details are not up yet. Date, theme and sign-ups land here once they
      are settled.
    </p>

    {/* The exit. Same construction as the link at the foot of About, down to
        the wording, because it goes to the same place and the site should call
        that destination one thing. Someone who arrived early still leaves with
        somewhere to go, which is the difference between a page that is waiting
        and a page that is broken. */}
    <p className="mt-10">
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
      >
        See what we&apos;re running <ArrowRightIcon width={16} height={16} />
      </Link>
    </p>
  </section>
);

export default Hackathon;
