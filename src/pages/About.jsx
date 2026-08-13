import { Link } from "react-router-dom";
import { BOARD } from "../lib/board";
import BoardCard from "../components/BoardCard";
import Breadcrumbs from "../components/Breadcrumbs";
import { INTEREST_FORM } from "../lib/links";
import { ArrowRightIcon } from "../components/Icons";

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
  const [president, ...rest] = BOARD;

  return (
    <>
      <Breadcrumbs current="About" />

      {/* Page header. Set at display scale with the standfirst carried in the
          second column, so it reads as a masthead rather than a heading
          crammed under the breadcrumb with dead space beside it. */}
      <section
        aria-labelledby="about-heading"
        className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10 sm:px-10 sm:pb-24 sm:pt-16 lg:px-16 lg:pt-20"
      >
        <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-16">
          <h1
            id="about-heading"
            className="lg:col-span-7"
            style={{
              fontSize: "var(--step-display)",
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              maxWidth: "14ch",
            }}
          >
            A club for building, not watching.
          </h1>
          <p
            className="lead lg:col-span-5 lg:pb-2"
            style={{ maxWidth: "var(--measure-tight)" }}
          >
            We are Northeastern&apos;s chapter of Anthropic&apos;s Claude
            Builder Club program.
          </p>
        </div>

        <div className="mt-20 grid gap-14 border-t border-rule pt-14 lg:grid-cols-2 lg:gap-20">
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
      </section>

      <section
        id="board"
        aria-labelledby="board-heading"
        className="border-t border-rule bg-gray-light"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
          <h2 id="board-heading">Executive board</h2>

          <ul className="mt-12 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
            <BoardCard member={president} eager />
            {rest.map((member, i) => (
              <BoardCard key={member.slug} member={member} eager={i < 3} />
            ))}
          </ul>

          <p className="mt-16 border-t border-rule pt-8 text-gray-text">
            Want to be on this page next year? Come to a{" "}
            <Link to="/workshops" className="sweep">
              workshop
            </Link>{" "}
            first, then{" "}
            <a
              href={INTEREST_FORM}
              target="_blank"
              rel="noopener noreferrer"
              className="sweep"
            >
              tell us you&apos;re interested
            </a>{" "}
            and we&apos;ll let you know when the next one is.
          </p>

          <p className="mt-6">
            <Link
              to="/workshops"
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
