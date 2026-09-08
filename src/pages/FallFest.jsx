import { Link } from "react-router-dom";
import claudeSpark from "../assets/brand/claude-spark.svg";
import EventTile from "../components/EventTile";
import { upcoming, kindOf } from "../lib/events";
import { JOIN_PATH } from "../lib/links";

/**
 * Fall Fest. Mode: two choices, on a phone, in five seconds.
 *
 * This page exists to sit behind a QR code on a table sign at Northeastern's
 * club fair. That is the whole design brief, and every decision below is an
 * argument from it: the reader is standing up, outdoors, on campus wifi, being
 * talked to by a board member, and they will give this screen one glance and
 * one thumb.
 *
 * CHROMELESS, like /events/pitch, and for a sharper version of the same reason
 * App.jsx already records there. The site header is `position: sticky`, so it
 * is not 65px at the top of the document, it is 65px of every phone viewport
 * for as long as the page is open. On a page whose entire content is two tiles,
 * that is a tenth of the fold spent on navigation, and the footer beneath it is
 * four columns and two legal paragraphs. The measured cost of keeping the
 * chrome is that the RSVP button on the second tile falls below the fold, which
 * is the one thing this page must not do.
 *
 * The masthead is what the chrome is replaced by. It does the only job the
 * header was doing here, which is telling somebody who scanned a code cold who
 * they just scanned, and it does it in about 90px rather than 65px plus a
 * footer.
 *
 * WHAT IS DELIBERATELY NOT ON SCREEN: the words "Fall Fest". The reader is
 * standing at Fall Fest. Telling them where they are is the redundant page
 * title mistake, and the line is better spent on the club's own name. The URL
 * carries it for whoever is printing the sign, and the title tag carries it for
 * search.
 */

/**
 * The card to show, chosen by kind rather than by position.
 *
 * The info session is what the board asked for, and kindOf() already classifies
 * it, so scheduling the next one on the Google Calendar is this page's only
 * maintenance.
 *
 * IT FALLS FORWARD ON PURPOSE. A printed QR code outlives the day it was
 * printed for. On 18 September the info session has passed, `upcoming()` has
 * dropped it, and this returns the next real event instead of a dead card. That
 * is only safe because the card names its own kind and date in its own eyebrow,
 * which is exactly why no copy on this page says "info session" or names a
 * date: the card would contradict it. With nothing on the calendar at all it
 * returns null and the join tile takes the whole row.
 */
function featuredEvent() {
  const events = upcoming();
  return events.find((e) => kindOf(e) === "info") || events[0] || null;
}

const FallFest = () => {
  const event = featuredEvent();

  return (
    <div className="ff">
      <main id="main" className="ff__main">
        <header className="ff__head">
          <p className="ff__brand">
            <img src={claudeSpark} alt="" width="28" height="28" />
            <span>Claude Builders Club</span>
          </p>
          <h1 className="ff__title">Build with Claude at Northeastern.</h1>
          <p className="ff__lead">
            Workshops, hackathons and showcase nights, open to every student.
          </p>
        </header>

        {/* A real list, because EventTile is an <li> and the two tiles are one
            grid. Tile one reuses .event-tile__box itself rather than restating
            its ten shell values under a new name: same hairline, same radius,
            same padding, same ground, same hover. Two cards that must match
            cannot be two lists of numbers. */}
        <ul className="event-tiles event-tiles--pair">
          <li className="event-tile">
            {/* The whole card is the tap target, because a thumb at a table
                should not have to find a button inside a card. It is NOT a
                card-sized <a>, though, and the difference is what a screen
                reader hears: wrapping the card in one link makes the link's
                accessible name the entire card, so a links list reads "Sign up
                Join the club Six questions, about thirty seconds, we build the
                semester around the answers and email you before the first
                meeting".

                So the real link is on the title alone, and .ff-join__link::after
                stretches it over the whole card. The name is "Join the club",
                the target is 428 by 286 pixels, and this is the same shape as
                the event card beside it, which is also a div with its own
                overlay rather than a giant anchor. */}
            <div className="event-tile__box ff-join">
              <span className="event-tile__eyebrow">
                <span className="kind-swatch" aria-hidden="true" />
                Sign up
              </span>
              <span className="event-tile__title">
                <Link to={JOIN_PATH} className="ff-join__link no-underline">
                  Join the club
                </Link>
              </span>
              <p className="event-tile__blurb">
                Six questions, about thirty seconds. We build the semester
                around the answers and email you before the first meeting.
              </p>
              <span className="ff-join__cta btn btn--coral">
                Fill out the interest form
              </span>
            </div>
          </li>

          {/* lead gives the inverted ink treatment, which is the card the board
              asked for. detailOnly renders the detail face only: there is no
              hover on a phone, so the default two-face card would land on the
              rest face and hide the RSVP button behind a tap. */}
          {event && <EventTile event={event} lead detailOnly />}
        </ul>

        <p className="ff__more">
          <Link to="/" className="ff__morelink no-underline">
            More about the club →
          </Link>
        </p>

        <p className="ff__fine">
          A recognized student organization at Northeastern University and an
          official chapter of Anthropic&apos;s Claude Builder Club program. Not
          an official communication of Anthropic or Northeastern University.
        </p>
      </main>
    </div>
  );
};

export default FallFest;
