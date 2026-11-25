import { Link } from "react-router-dom";
import claudeSpark from "../assets/brand/claude-spark.svg";
import NycJoinForm from "../components/NycJoinForm";

/**
 * NYC campus interest form. Chromeless, like /join, for the same reasons; see
 * pages/Join.jsx. A separate page and a separate list from the Boston form.
 */
const NycJoin = () => (
  <div className="pf">
    <div className="pf__bar">
      <Link
        to="/"
        className="pf__brand no-underline"
        aria-label="Claude Builders Club, home"
      >
        <img src={claudeSpark} alt="" width="24" height="24" />
        <span>Claude Builders Club</span>
      </Link>

      <Link to="/" className="pf__exit no-underline">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
        Close
      </Link>
    </div>

    <main id="main" className="pf__main">
      <div className="pf__inner">
        <NycJoinForm />
      </div>
    </main>
  </div>
);

export default NycJoin;
