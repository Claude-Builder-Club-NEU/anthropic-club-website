import { Link } from "react-router-dom";
import { INTEREST_FORM } from "../lib/links";

/**
 * 404.
 *
 * Returns a real HTTP 404, not a soft 200. There is no catch-all rewrite in
 * netlify.toml, so Netlify serves the prerendered 404.html with a genuine 404
 * status for any unmatched path. The previous catch-all rewrote every unknown
 * path to index.html with a 200, which told crawlers that every typo was a real
 * page.
 *
 * (An earlier version of this comment pointed at public/_redirects. No such
 * file exists or is needed; the behaviour comes from Netlify's default.)
 */
const NotFound = () => (
  <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
    <p className="meta" style={{ maxWidth: "none" }}>
      404
    </p>
    <h1 className="mt-4" style={{ maxWidth: "16ch" }}>
      That page isn&apos;t here.
    </h1>
    <p className="lead mt-6" style={{ maxWidth: "var(--measure-tight)" }}>
      The link may be out of date, or we may have moved something. Here is
      everything else.
    </p>

    <ul className="mt-10 list-none space-y-3 p-0">
      <li>
        <Link to="/" className="font-display no-underline sweep">
          Home
        </Link>
      </li>
      <li>
        <Link to="/about" className="font-display no-underline sweep">
          About and exec board
        </Link>
      </li>
      <li>
        <Link to="/events" className="font-display no-underline sweep">
          Events and calendar
        </Link>
      </li>
      <li>
        <a
          className="font-display no-underline sweep"
          href={INTEREST_FORM}
          target="_blank"
          rel="noopener noreferrer"
        >
          Join the club
        </a>
      </li>
    </ul>
  </section>
);

export default NotFound;
