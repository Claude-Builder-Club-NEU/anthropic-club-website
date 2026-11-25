import { Link } from "react-router-dom";
import { NYC_JOIN_PATH } from "../lib/links";
import NycSkyline from "./NycSkyline";

/**
 * NYC campus ribbon. Sits directly above the "Build with us this semester"
 * banner on the homepage and is deliberately unlike it: a full-bleed golden
 * hour scene instead of a dark console panel, centred copy instead of a
 * left column, and a monospace face (JetBrains Mono, self-hosted) instead
 * of the main banner's Lora. The artwork is NycSkyline.jsx.
 *
 * Links to the NYC interest form, which is a separate form and list from the
 * one every other "Join the club" button opens.
 */
const NycBanner = () => (
  <section className="nyc-band" aria-labelledby="nyc-heading">
    <NycSkyline className="nyc-band__art" />
    <span className="nyc-band__shade" aria-hidden="true" />

    <div className="nyc-band__copy">
      <h2 id="nyc-heading" className="nyc-band__heading">
        Now building in New York City
        <span className="nyc-band__cursor" aria-hidden="true" />
      </h2>
      <p className="nyc-band__body">
        Claude Builders Club is opening a branch at Northeastern&apos;s NYC
        campus. Tell us you&apos;re in and we&apos;ll invite you to the first
        interest meeting.
      </p>
      <Link className="nyc-band__cta" to={NYC_JOIN_PATH}>
        Fill out the interest form
      </Link>
    </div>
  </section>
);

export default NycBanner;
