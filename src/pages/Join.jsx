import { Link } from "react-router-dom";
import claudeSpark from "../assets/brand/claude-spark.svg";
import JoinForm from "../components/JoinForm";

/**
 * Join the club. Mode: complete one task.
 *
 * The site's primary conversion action, and until now the one surface it did
 * not own: this replaces Typeform RH9sxEqE, which every "Join the club" button
 * on the site used to point at.
 *
 * Chromeless, for the same reason /events/pitch is (see App.jsx): the flow
 * fills the viewport and asks one question at a time, and a header, a footer
 * and a sticky "Join the club" CTA would all pull against the question on
 * screen. The sticky CTA in particular would be a button offering to do the
 * thing the reader is already doing.
 *
 * The heading level is deliberate and matches the pitch flow. Each screen owns
 * the page's single <h1>, because on a surface showing exactly one question
 * that question IS the page's subject. The prerendered HTML therefore ships the
 * welcome screen's "Let's get you on the list." as its h1, which is also the
 * right thing for a crawler to read on the page every other page links to.
 */
const Join = () => (
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
        <JoinForm />
      </div>
    </main>
  </div>
);

export default Join;
