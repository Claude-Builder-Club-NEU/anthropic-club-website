import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import LinkHub from "../components/LinkHub";
import EventsPanel from "../components/EventsPanel";
import Faq from "../components/Faq";
import DraftNote from "../components/DraftNote";

/**
 * Homepage. Mode: Persuade — this surface exists to convert an interested
 * student, so every section earns its place against that one job.
 *
 * Section order is fixed by the brief: hero, link hub, what the program is,
 * what our chapter does, upcoming events, FAQ, footer.
 */
const Home = () => (
  <>
    <Hero />
    <LinkHub />

    <section
      aria-labelledby="program-heading"
      className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 id="program-heading">What a Claude Builder Club is</h2>
          <DraftNote>
            Confirm this matches how Anthropic describes the program.
          </DraftNote>
          <p className="mt-5 text-gray-text">
            Claude Builder Clubs are Anthropic&apos;s student-led campus
            communities. They exist so students can learn to build with AI
            directly rather than reading about it — with support, materials, and
            a line back to the people making the tools.
          </p>
          <p className="mt-4 text-gray-text">
            Chapters run at universities worldwide. Each one is shaped by its own
            campus, which is why ours looks the way it does.
          </p>
        </div>

        <div>
          <h2 id="chapter-heading">What we do at Northeastern</h2>
          <DraftNote>
            Needs your real detail — founding date, membership, what you have
            actually run so far.
          </DraftNote>
          <p className="mt-5 text-gray-text">
            We run hands-on workshops where you build something real and leave
            with it working. We run build nights for people mid-project who want
            company. And we run hackathons, which are the best weekend of the
            semester.
          </p>
          <p className="mt-4 text-gray-text">
            Our members come from business, computer science, design, and
            engineering. The most useful thing you can bring is a problem you
            actually want solved.
          </p>
          <p className="mt-6">
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
            >
              Read more about the club and meet the board
            </Link>
          </p>
        </div>
      </div>
    </section>

    <div className="border-t border-rule">
      <EventsPanel limit={3} showViewAll />
    </div>

    <Faq />
  </>
);

export default Home;
