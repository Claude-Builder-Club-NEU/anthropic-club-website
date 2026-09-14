import { Link } from "react-router-dom";
import claudeSpark from "../assets/brand/claude-spark.svg";
import FeatureForm from "../components/FeatureForm";

/**
 * Get featured on the blog. Mode: complete one task.
 *
 * CHROMELESS, and the argument took some settling, because the obvious reading
 * of App.jsx's rule points the other way. Chromeless is for a flow that fills
 * the viewport and asks one question at a time, and it exists partly so the
 * sticky "Join the club" CTA does not fight the task. This is not the join
 * flow, and a member arriving from a blog post might reasonably want the header
 * they were just using. Three things decided it anyway:
 *
 * 1. THE STICKY CTA STILL FIGHTS THE TASK, from the other side. /join is
 *    chromeless because its own last button IS "Join the club", so the sticky
 *    one would offer to do the thing in progress. Here the reader is not
 *    joining, they are volunteering, and the copy assumes they already know the
 *    club: this page is linked from the blog and handed out in Slack. A sticky
 *    invitation to join, over a form written for people who did, is noise.
 *
 *    The honest counter, so nobody has to rediscover it: is_member_email() is a
 *    domain check, not a membership check, so a Northeastern student who has
 *    never been to a meeting can submit this, and for them "Join the club" is
 *    the right offer. It is still the wrong moment. They are part way through
 *    writing a paragraph. The ending screen hands them /events, which is where
 *    somebody new should go next, and that is the place to make the offer.
 *
 * 2. THE FLOW'S FURNITURE IS FIXED TO THE VIEWPORT. .pf-nav is pinned bottom
 *    right and .pf-progress spans the bottom edge, both position:fixed. Inside
 *    Layout those land on top of the footer, and the nav chevrons land in the
 *    same corner the sticky CTA occupies. Making the two systems coexist is new
 *    CSS written to reconcile a decision, which is a worse outcome than making
 *    the decision. The stylesheet already says which surface these belong to.
 *
 * 3. THE READER FROM A BLOG POST IS SERVED BY THE EXIT, not by the header. The
 *    bar below carries the club lockup home and a Close control, and Close goes
 *    to /blog rather than to / as /join's does or /events as the pitch flow's
 *    does. Where you came from is where you are put back, and /blog is both the
 *    likeliest origin and the thing this page is about.
 *
 * If the club ever links this from the top nav, revisit item 3 first: a page
 * reached from the nav wants the nav.
 *
 * THE HEADING LEVEL is deliberate and matches /join and /events/pitch. Each
 * screen owns the page's single <h1>, because on a surface showing exactly one
 * question that question IS the page's subject. The prerendered HTML therefore
 * ships the welcome screen's "Want to be in the club blog?" as its h1, which is
 * what a member with JavaScript blocked reads and what a crawler indexes. The
 * six questions are not in that HTML, and should not be: a crawler has nothing
 * to gain from question four, and the route is indexed on the strength of the
 * invitation, not the form. See the note on this route in lib/seo.js.
 */
const FeatureMe = () => (
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

      <Link to="/blog" className="pf__exit no-underline">
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
        <FeatureForm />
      </div>
    </main>
  </div>
);

export default FeatureMe;
