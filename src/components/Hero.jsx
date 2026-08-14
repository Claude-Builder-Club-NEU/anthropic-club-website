import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { INTEREST_FORM } from "../lib/links";
import claudeSpark from "../assets/brand/claude-spark.svg";
import anthropicWordmark from "../assets/brand/anthropic-wordmark.svg";

/**
 * Homepage hero.
 *
 * Carries the site's one motion moment: the coral highlighter sweeps once
 * beneath "what's next" on load. Under prefers-reduced-motion the sweep is an
 * instant fill (handled in index.css), so the phrase still reads as marked, it
 * just does not travel.
 *
 * The container class is shared with LinkHub and Layout so the headline, the
 * "Find us" row, and the wordmark all sit on the same left edge. They used to
 * differ by one padding step because the hero padded the section and then
 * centred an inner max-width inside it.
 *
 * The mark is the official Claude Spark from Anthropic's press kit, in vector,
 * so it stays sharp at the size it renders here. See src/assets/brand/README.md
 * for provenance and usage rules.
 */
const Hero = () => {
  const [marked, setMarked] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = window.setTimeout(() => setMarked(true), 260);
    return () => window.clearTimeout(timer.current);
  }, []);

  return (
    <section
      aria-labelledby="hero-heading"
      className="hero relative overflow-hidden pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-32 lg:pt-28"
    >
      {/* Cropped mark, bleeding off the bottom and right edges. Decorative, so
          it is hidden from assistive tech. Sized and offset per breakpoint so
          it never reaches the text column. */}
      <img
        src={claudeSpark}
        alt=""
        aria-hidden="true"
        className="hero-mark"
        width="94"
        height="94"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-16">
        <h1
          id="hero-heading"
          className="font-display text-ink"
          style={{
            fontSize: "var(--step-display)",
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            maxWidth: "15ch",
          }}
        >
          Build{" "}
          <span className="sweep sweep--hero" data-marked={String(marked)}>
            what&apos;s next
          </span>{" "}
          with Claude.
        </h1>

        {/* "Anthropic" is set as their wordmark rather than as text. The alt
            carries the word, so the sentence still reads correctly to a screen
            reader and in the page's accessible name. The mark keeps its own
            ink colour: the usage rules say do not recolour it, and it reads as
            deliberate emphasis against the lead's lighter grey. */}
        <p
          className="lead mt-7 sm:mt-8"
          style={{ maxWidth: "var(--measure-tight)" }}
        >
          The official{" "}
          <img
            src={anthropicWordmark}
            alt="Anthropic"
            className="inline-wordmark"
            width="590"
            height="68"
          />{" "}
          Claude Builder Club at Northeastern University, where students build
          real things with Claude.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <a
            className="btn btn--coral"
            href={INTEREST_FORM}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the club
          </a>
          <Link className="btn btn--secondary" to="/events">
            See upcoming events
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
