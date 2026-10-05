import { Link } from "react-router-dom";
import { BOARD } from "../lib/board";
import BoardCard from "../components/BoardCard";
import { INTEREST_FORM } from "../lib/links";
import { ArrowRightIcon } from "../components/Icons";
import PostImage from "../components/PostImage";
import {
  CANDIDS,
  CANDID_SIZES,
  GROUP_PHOTO,
  GROUP_SIZES,
  TEAM_WIDTHS,
  teamImageBase,
} from "../lib/team";

/**
 * About. Mode: Read, for a prospective member who wants depth before
 * committing.
 *
 * Revision 2 §3.1 removed "How we got here" and "What we actually build". The
 * two remaining sections carry the page, so they are set at a wider measure
 * with more air between them rather than left sitting in the old four-section
 * grid.
 */
const About = () => {
  return (
    <>
      {/* Page header. The title, then straight into the group photo. The
          standfirst under the title ("We are Northeastern's chapter...") was
          removed on 2026-10-05 at the club's request; the footer's
          affiliation line still says the same thing on every page.

          The top padding absorbs the removed breadcrumb: with the trail gone
          the masthead would otherwise start 40px under the site header, which
          reads as cramped at display scale. */}
      <section
        aria-labelledby="about-heading"
        className="mx-auto w-full max-w-6xl px-6 pb-16 pt-14 sm:px-10 sm:pb-24 sm:pt-20 lg:px-16 lg:pt-24"
      >
        <h1
          id="about-heading"
          style={{
            fontSize: "var(--step-display)",
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            maxWidth: "22ch",
          }}
        >
          A club for building, not watching.
        </h1>

        {/* The group photo is the page's main picture and its LCP element, so
            it is the one eager, high-priority image here. */}
        <figure className="about-photo mt-12 sm:mt-16">
          <PostImage
            base={teamImageBase(GROUP_PHOTO.src)}
            widths={TEAM_WIDTHS}
            sizes={GROUP_SIZES}
            alt={GROUP_PHOTO.alt}
            priority
          />
        </figure>

        <div className="mt-16 grid gap-14 border-t border-rule pt-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2>What a semester looks like</h2>
            <p className="mt-6 text-gray-text">
              Every semester we run multiple hackathons alongside our partner
              clubs ACM, AINU and REV. They are the biggest at Northeastern and
              they are the centre of what we do.
            </p>
            <p className="mt-4 text-gray-text">
              Around them we run hands-on workshops that each teach one specific
              skill, and community showcase nights where members demo what they
              have built. There is a clear entry point for people who have never
              built anything, so the first session is never a wall.
            </p>
          </div>

          <div>
            <h2>How we work with Anthropic</h2>
            <p className="mt-6 text-gray-text">
              As an official chapter we get program materials, workshop content,
              and a direct line to the campus team.
            </p>
            <p className="mt-4 text-gray-text">
              What we run and what we build is decided here, by members. We are
              affiliated with Anthropic. We do not speak for them.
            </p>
          </div>
        </div>

        {/* Kept apart from the group photo on purpose: four small pictures
            directly under a large one read as a gallery's thumbnails, and
            these do not swap anything. Here they lead into the board. */}
        <ul className="mt-16 grid list-none grid-cols-2 gap-4 p-0 lg:grid-cols-4">
          {CANDIDS.map((photo) => (
            <li key={photo.src} className="about-photo">
              <PostImage
                base={teamImageBase(photo.src)}
                widths={TEAM_WIDTHS}
                sizes={CANDID_SIZES}
                alt={photo.alt}
              />
            </li>
          ))}
        </ul>
      </section>

      <section
        id="board"
        aria-labelledby="board-heading"
        className="border-t border-rule bg-gray-light"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <h2 id="board-heading">Executive board</h2>

          {/* Every card lazy-loads its headshot: the grid sits far below the
              fold, so nothing here is fetched on a normal first visit. */}
          <ul className="board-grid mt-12 grid list-none grid-cols-2 gap-x-6 gap-y-8 p-0 md:grid-cols-4">
            {BOARD.map((member) => (
              <BoardCard key={member.slug} member={member} />
            ))}
          </ul>

          <p className="mt-16 border-t border-rule pt-8 text-gray-text">
            Want to be on this page next year? Come to a{" "}
            <Link to="/events" className="sweep">
              workshop
            </Link>{" "}
            first, then{" "}
            <Link to={INTEREST_FORM} className="sweep">
              tell us you&apos;re interested
            </Link>{" "}
            and we&apos;ll let you know when the next one is.
          </p>

          <p className="mt-6">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
            >
              See what we&apos;re running{" "}
              <ArrowRightIcon width={16} height={16} />
            </Link>
          </p>
        </div>
      </section>
    </>
  );
};

export default About;
