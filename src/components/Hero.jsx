import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { INTEREST_FORM } from "../lib/links";

/**
 * Homepage hero.
 *
 * Carries the site's one motion moment: the coral highlighter sweeps once
 * beneath "what's next" on load. Under prefers-reduced-motion the sweep is
 * an instant fill (handled in index.css), so the phrase still reads as
 * marked — it just does not travel.
 *
 * No eyebrow, no chip, no icon. The headline carries its own weight.
 */
const Hero = () => {
  const [marked, setMarked] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    // Small delay so the sweep reads as a deliberate mark rather than part
    // of the page painting in.
    timer.current = window.setTimeout(() => setMarked(true), 260);
    return () => window.clearTimeout(timer.current);
  }, []);

  return (
    <section
      aria-labelledby="hero-heading"
      className="px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-24 lg:px-16 lg:pt-32 lg:pb-32"
    >
      <div className="mx-auto max-w-6xl">
        <h1
          id="hero-heading"
          className="font-display text-ink"
          style={{
            fontSize: "var(--step-display)",
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            maxWidth: "16ch",
          }}
        >
          Build{" "}
          <span className="sweep sweep--hero" data-marked={String(marked)}>
            what&apos;s next
          </span>{" "}
          with Claude.
        </h1>

        <p
          className="lead mt-7 sm:mt-8"
          style={{ maxWidth: "var(--measure-tight)" }}
        >
          The official Anthropic Claude Builder Club at Northeastern
          University, where students build real things with Claude.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <a
            className="btn btn--primary"
            href={INTEREST_FORM}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the club
          </a>
          <Link className="btn btn--secondary" to="/workshops">
            See upcoming events
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
