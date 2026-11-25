import { Link } from "react-router-dom";
import { NYC_JOIN_PATH } from "../lib/links";
import NycSkyline from "./NycSkyline";

/**
 * NYC campus ribbon. Sits directly above the "Build with us this semester"
 * banner on the homepage and borrows its whole visual language (the .ib
 * console panel: dot grid, coral glow, scanlines, Lora headline, coral CTA),
 * so the two read as a pair. The only new piece is the graphic: an original
 * NYC skyline drawn in the panel's own ink, cream and coral (NycSkyline.jsx).
 *
 * Links to the NYC interest form, which is a separate form and list from the
 * one every other "Join the club" button opens.
 */
const NycBanner = () => (
  <div className="ib-wrap ib-wrap--nyc">
    <section className="ib ib--nyc" aria-labelledby="nyc-heading">
      <span className="ib__dots" aria-hidden="true" />
      <span className="ib__glow" aria-hidden="true" />
      <NycSkyline className="ib__skyline" />
      <span className="ib__scan" aria-hidden="true" />

      <div className="ib__copy">
        <p className="ib__tag">
          <span className="ib__tag-dot" aria-hidden="true" />
          NYC campus
        </p>
        <h2 id="nyc-heading" className="ib__heading">
          Now building in New York.
        </h2>
        <p className="ib__body">
          Claude Builders Club is opening a branch at Northeastern&apos;s NYC
          campus. Tell us you&apos;re in and we&apos;ll invite you to the first
          interest meeting.
        </p>
        <div className="ib__actions">
          <Link className="ib__cta" to={NYC_JOIN_PATH}>
            Fill out the interest form
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default NycBanner;
