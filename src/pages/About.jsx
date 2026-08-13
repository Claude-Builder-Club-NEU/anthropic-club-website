import { Link } from "react-router-dom";
import { BOARD } from "../lib/board";
import BoardCard from "../components/BoardCard";
import Breadcrumbs from "../components/Breadcrumbs";
import DraftNote from "../components/DraftNote";
import { INTEREST_FORM } from "../lib/links";

/**
 * About. Mode: Read — a prospective member who wants depth before committing.
 *
 * Copy here is deliberately different from the homepage blurbs; the homepage
 * says what the club is in two paragraphs, this page says how it actually
 * works. Every DraftNote marks copy awaiting Jackson's real detail.
 */
const About = () => (
  <>
    <Breadcrumbs current="About" />

    <section
      aria-labelledby="about-heading"
      className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:px-10 sm:pb-20 lg:px-16"
    >
      <h1 id="about-heading" style={{ maxWidth: "18ch" }}>
        A club for building, not watching.
      </h1>
      <p className="lead mt-6" style={{ maxWidth: "var(--measure-tight)" }}>
        We are Northeastern&apos;s chapter of Anthropic&apos;s Claude Builder
        Club program.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2>How we got here</h2>
          <DraftNote>
            Founding term, who started it, and how membership has grown. I have
            no record of any of this and will not invent it.
          </DraftNote>
          <p className="mt-5 text-gray-text">
            The club started because a group of students wanted a reason to
            build with these tools every week rather than reading about them. It
            has grown from that into workshops, build nights, and hackathons
            open to every college at Northeastern.
          </p>

          <h2 className="mt-12">What we actually build</h2>
          <p className="mt-5 text-gray-text">
            Real, small, finished things. Members have built tools that automate
            the boring part of a co-op job, agents that do research, and
            weekend projects that started as a complaint about something on
            campus. The bar is that it works and you can show it to someone.
          </p>
          <DraftNote>
            Swap these examples for real member projects once you have a few you
            are happy to name.
          </DraftNote>
        </div>

        <div>
          <h2>What a semester looks like</h2>
          <DraftNote>Confirm the real cadence before this goes live.</DraftNote>
          <p className="mt-5 text-gray-text">
            We open with a session for people who have never built anything, so
            there is a clear entry point rather than a wall. From there the
            semester alternates between workshops that teach a specific skill and
            build nights where people work on their own projects with company.
            It closes with a hackathon.
          </p>

          <h2 className="mt-12">How we work with Anthropic</h2>
          <p className="mt-5 text-gray-text">
            As an official chapter we get program materials, workshop content,
            and a direct line to the campus team. What we run and what we build
            is decided here, by members. We are affiliated with Anthropic; we do
            not speak for them.
          </p>
          <DraftNote>
            Confirm this describes the program accurately, and check it against
            any brand or usage rules the program supplied.
          </DraftNote>
        </div>
      </div>
    </section>

    <section
      aria-labelledby="board-heading"
      className="border-t border-rule bg-gray-light"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        <h2 id="board-heading">Executive board</h2>
        <p className="mt-4 text-gray-text">
          Seven people run the club. Any of us is a reasonable person to ask
          about getting involved.
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 p-0 sm:gap-x-8 lg:grid-cols-4">
          {BOARD.map((member, i) => (
            <BoardCard key={member.slug} member={member} eager={i < 4} />
          ))}
        </ul>

        <p className="mt-12 text-gray-text">
          Want to be on this page next year? Come to a{" "}
          <Link to="/workshops" className="sweep">
            workshop
          </Link>{" "}
          first —{" "}
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
      </div>
    </section>
  </>
);

export default About;
