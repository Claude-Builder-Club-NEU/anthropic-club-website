import { Link } from "react-router-dom";
import claudeSpark from "../assets/brand/claude-spark.svg";
import WorkshopForm from "../components/WorkshopForm";

/**
 * Pitch a workshop. Mode: Complete one task.
 *
 * A full-viewport, one-question-at-a-time flow in the manner of a Typeform,
 * which is what this page was asked for. It renders outside the site chrome
 * (see App.jsx): no header nav, no footer, no sticky CTA. The only ways out
 * are the club lockup and the close control, both in the bar.
 *
 * The heading level is deliberate. Each screen owns the page's single <h1>,
 * because on a surface showing exactly one question that question *is* the
 * page's subject. The prerendered HTML therefore ships the welcome screen's
 * "Want to run a workshop?" as its h1, which is also the right thing for a
 * crawler to read.
 */
const Pitch = () => (
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

      <Link to="/events" className="pf__exit no-underline">
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
        <WorkshopForm />
      </div>
    </main>
  </div>
);

export default Pitch;
