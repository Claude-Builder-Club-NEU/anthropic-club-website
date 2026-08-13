import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { INTEREST_FORM } from "../lib/links";
import claudeLogo from "../assets/claude-logo-png_seeklogo-554534.png";

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
 * ASSET NOTE: the cropped logo uses the only Claude mark in the repo, which is
 * 320x320. At the size it renders here it is soft. Swap in an SVG or a
 * high-resolution PNG and nothing else needs to change.
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
        src={claudeLogo}
        alt=""
        aria-hidden="true"
        className="hero-mark"
        width="320"
        height="320"
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

        <p
          className="lead mt-7 sm:mt-8"
          style={{ maxWidth: "var(--measure-tight)" }}
        >
          The official Anthropic Claude Builder Club at Northeastern
          University, where students build real things with Claude.
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
          <Link className="btn btn--secondary" to="/workshops">
            See upcoming events
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
