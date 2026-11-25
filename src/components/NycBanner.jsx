import { Link } from "react-router-dom";
import { NYC_HUB_PATH, NYC_JOIN_PATH } from "../lib/links";
import NycSkyline from "./NycSkyline";

/**
 * NYC campus ribbon. Sits directly above the "Build with us this semester"
 * banner on the homepage and is deliberately unlike it: a full-bleed golden
 * hour scene instead of a dark console panel, centred copy instead of a
 * left column, and a monospace face (JetBrains Mono, self-hosted) instead
 * of the main banner's Lora. The artwork is NycSkyline.jsx.
 *
 * Links to the NYC interest form, and quietly to the NYC hub at /nyc. The
 * form is a separate form and list from the one every other "Join the club"
 * button opens.
 */
const NycBanner = () => (
  <section className="nyc-band" aria-labelledby="nyc-heading">
    <NycSkyline className="nyc-band__art" />
    <span className="nyc-band__shade" aria-hidden="true" />

    <div className="nyc-band__copy">
      <h2 id="nyc-heading" className="nyc-band__heading">
        Now building in New York City.
      </h2>
      <p className="nyc-band__body">
        Claude Builders Club is opening a branch at Northeastern&apos;s NYC
        campus. Tell us you&apos;re in and we&apos;ll invite you to the first
        interest meeting.
      </p>
      <div className="nyc-band__actions">
        <Link className="nyc-pill nyc-pill--cream" to={NYC_JOIN_PATH}>
          Fill out the interest form
        </Link>
        <Link className="nyc-pill nyc-pill--ghost" to={NYC_HUB_PATH}>
          Explore NYC
        </Link>
      </div>
    </div>
  </section>
);

export default NycBanner;
