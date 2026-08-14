import { Link } from "react-router-dom";
import { INTEREST_FORM } from "../lib/links";
import claudeCodeTypePng from "../assets/brand/claude-code-type.png";
import claudeCodeTypeAvif from "../assets/brand/claude-code-type.avif";
import claudeCodeTypeWebp from "../assets/brand/claude-code-type.webp";

/**
 * Interest-form banner, built from the "3b — Blocky arcade" handoff.
 *
 * A dark console panel: editorial headline, one primary CTA, one quiet mono
 * link, and the Claude Code blocky display type as the right-hand graphic.
 * Three stacked background layers (dot grid, coral glow, scanlines) give it the
 * terminal feel without any motion, which keeps the site's one-primitive
 * policy intact.
 *
 * Two deliberate departures from the handoff, both recorded in index.css where
 * the values live: the typefaces use this project's licensed faces rather than
 * loading three more webfonts, and the CTA hover brightens instead of
 * darkening because the specified hover failed contrast.
 *
 * The graphic is a pre-cropped, transparent-background copy of the press
 * asset, which the handoff names as the cleaner of its two options. It drops
 * the window chrome, the mix-blend-mode hack, and 650KB.
 */
const InterestBanner = () => (
  <div className="ib-wrap">
  <section className="ib" aria-labelledby="ib-heading">
    <span className="ib__dots" aria-hidden="true" />
    <span className="ib__glow" aria-hidden="true" />
    <span className="ib__scan" aria-hidden="true" />

    <div className="ib__copy">
      <h2 id="ib-heading" className="ib__heading">
        Build with us this semester.
      </h2>
      <p className="ib__body">
        We&apos;re putting the calendar together now. Tell us you&apos;re
        interested and you&apos;ll hear about workshops, showcase nights and
        hackathons before they fill up.
      </p>
      <div className="ib__actions">
        <a
          className="ib__cta"
          href={INTEREST_FORM}
          target="_blank"
          rel="noopener noreferrer"
        >
          Fill out interest form
        </a>
        {/* Always the site's own calendar, never the Google embed. This used
            to send people off-site once CALENDAR_URL was set, which is the
            same reason "Open the full calendar" came off the events page. The
            banner now sits directly above the homepage's event list, so the
            natural destination is /events. */}
        <Link className="ib__ghost" to="/events">
          See the full calendar →
        </Link>
      </div>
    </div>

    {/* Flat-colour artwork, so AVIF takes it from 82KB to 27KB.

        LAZY IS MEASURED HERE, NOT ASSUMED. An earlier version of this comment
        said the band sits below the fold on both pages it appears on and that
        the LCP element there is the copy rather than this graphic. That is
        still true on the homepage. It stopped being true on /events when
        the breadcrumb and the page lead came off: the band moved up, and on a
        mobile viewport this image is now that page's LCP element.

        Loading it eagerly there was the obvious fix and is worse. Measured on
        /events, mobile, twice per variant:

          lazy                  LCP 2050ms  (image fetched at 69ms)
          eager, fetchpriority  LCP 2104ms  (image fetched at 13ms)
          eager, default        LCP 2113ms  (image fetched at 16ms)

        Pulling 27KB into the first burst starves the two preloaded webfonts
        that every visible word on the page is waiting on, and that costs more
        than deferring a decorative graphic saves. Lighthouse's
        lcp-lazy-loaded audit flags this and is wrong about it. Do not act on
        that audit alone. */}
    <div className="ib__graphic">
      <picture>
        <source type="image/avif" srcSet={claudeCodeTypeAvif} />
        <source type="image/webp" srcSet={claudeCodeTypeWebp} />
        <img
          src={claudeCodeTypePng}
          alt="Claude Code"
          width="1290"
          height="686"
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
  </section>
  </div>
);

export default InterestBanner;
