import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Ballot from "../components/Ballot";
import { STATUS, findPoll, statusOf } from "../lib/polls";

/**
 * One poll's ballot, at /polls/:slug.
 *
 * The route is dynamic, so it is NOT in the prerendered route table: a poll is
 * added by dropping a JSON file into lib/polls/, and per-slug static HTML would
 * outlive the polls it described. netlify.toml rewrites /polls/* to the hub's
 * HTML so the client router can resolve the slug. An unknown slug is handled
 * here rather than by a 404, because "that poll is not here" reads better next
 * to a link to the ones that are.
 *
 * THE BALLOT IS GATED ON THE CLOCK. Without this, opening the URL a month early
 * or a week late would render a working ballot and take the vote, which would
 * quietly corrupt the count with answers given outside the room the poll was
 * run in.
 *
 * That gate is client-side, and honestly so: the poll definition lives in the
 * repository, so cast_ballot() in SQL has no idea when this poll opens and
 * cannot refuse a late POST. Somebody determined could still post directly.
 * That is proportionate here, where a ballot allocates nothing scarce and
 * anonymity is the higher priority, and it is the first thing to revisit if a
 * poll ever decides something that matters. Moving the window into the database
 * is the fix, not more client code.
 */

/** Status is a function of now, so it is computed after mount, never at build. */
function useStatus(poll) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    if (poll) setStatus(statusOf(poll, new Date()));
  }, [poll]);
  return status;
}

const Shell = ({ children }) => (
  <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
    {children}
  </section>
);

const Poll = () => {
  const { slug } = useParams();
  const poll = findPoll(slug);
  const status = useStatus(poll);

  if (!poll) {
    return (
      <Shell>
        <div className="ballot__notice">
          <h1 className="ballot__title">That poll is not here.</h1>
          <p className="ballot__lead">
            It may have closed, or the link may be wrong.
          </p>
          <Link className="btn btn--secondary" to="/polls">
            Back to polls
          </Link>
        </div>
      </Shell>
    );
  }

  // Before the clock is known, render the frame and nothing that depends on it.
  // This is also what the prerendered HTML ships.
  if (!status) {
    return (
      <Shell>
        <div className="ballot__notice">
          <h1 className="ballot__title">{poll.title}</h1>
        </div>
      </Shell>
    );
  }

  if (status === STATUS.soon) {
    const opens = new Date(poll.opensAt).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    return (
      <Shell>
        <div className="ballot__notice">
          <p className="ballot__eyebrow">Not open yet</p>
          <h1 className="ballot__title">{poll.title}</h1>
          <p className="ballot__lead">
            This ballot opens {opens}. It runs during the session, so the room
            votes together.
          </p>
          <Link className="btn btn--secondary" to="/polls">
            Back to polls
          </Link>
        </div>
      </Shell>
    );
  }

  if (status === STATUS.closed) {
    return (
      <Shell>
        <div className="ballot__notice">
          <p className="ballot__eyebrow">Closed</p>
          <h1 className="ballot__title">{poll.title}</h1>
          <p className="ballot__lead">
            This poll has closed. The result is on the polls page.
          </p>
          <Link className="btn btn--coral" to="/polls">
            See the result
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Ballot poll={poll} />
    </Shell>
  );
};

export default Poll;
