import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import LinkHub from "../components/LinkHub";
import EventsPanel from "../components/EventsPanel";
import Faq from "../components/Faq";
import { ArrowRightIcon } from "../components/Icons";

/**
 * Homepage. Mode: Persuade. This surface exists to convert an interested
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
      className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16"
    >
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 id="program-heading">What a Claude Builder Club is</h2>
          <p className="mt-6 text-gray-text">
            Claude Builder Clubs are Anthropic&apos;s student-led campus
            communities. They exist so students can learn to build with AI
            directly rather than reading about it, with support, materials, and
            a line back to the people making the tools.
          </p>
          <p className="mt-4 text-gray-text">
            Chapters run at universities worldwide. Each one is shaped by its
            own campus, which is why ours looks the way it does.
          </p>
        </div>

        <div>
          {/* "at Northeastern" breaks onto its own line at every width. The
              accessible name is still the whole phrase. */}
          <h2 id="chapter-heading">
            What we do <span className="block">at Northeastern</span>
          </h2>
          <p className="mt-6 text-gray-text">
            Founded in 2025, we run hands-on workshops and community showcase
            nights where members demo what they have built.
          </p>
          <p className="mt-4 text-gray-text">
            We also run the biggest hackathons at Northeastern, together with
            our partner clubs ACM, AINU and REV.
          </p>
          <p className="mt-7">
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
            >
              Read more and meet the board{" "}
              <ArrowRightIcon width={16} height={16} />
            </Link>
          </p>
        </div>
      </div>
    </section>

    <div className="border-t border-rule">
      <EventsPanel limit={3} />
    </div>

    <Faq />
  </>
);

export default Home;
