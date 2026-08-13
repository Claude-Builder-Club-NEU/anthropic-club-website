import { Link } from "react-router-dom";

/**
 * Visible breadcrumbs for interior pages. Deliberately not rendered on the
 * homepage — a single-item trail is noise.
 *
 * The matching BreadcrumbList JSON-LD is emitted by the prerenderer from
 * src/lib/seo.js, so the visible trail and the structured data cannot drift.
 */
const Breadcrumbs = ({ current }) => (
  <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-6 pt-8 sm:px-10 lg:px-16">
    <ol className="m-0 flex list-none items-center gap-2 p-0 text-meta text-gray-text">
      <li>
        <Link to="/" className="text-gray-text no-underline sweep">
          Home
        </Link>
      </li>
      <li aria-hidden="true">/</li>
      <li aria-current="page" className="text-ink">
        {current}
      </li>
    </ol>
  </nav>
);

export default Breadcrumbs;
