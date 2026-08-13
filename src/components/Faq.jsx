import { Link } from "react-router-dom";
import { FAQ } from "../lib/faq";

/**
 * Splits an answer around its linked substrings so the rendered copy and the
 * JSON-LD stay identical. Anything not matched renders as plain text.
 */
function renderAnswer(text, links = []) {
  let parts = [text];

  for (const link of links.filter(Boolean)) {
    parts = parts.flatMap((part) => {
      if (typeof part !== "string") return [part];
      const i = part.indexOf(link.text);
      if (i === -1) return [part];
      const node = link.to ? (
        <Link key={link.text} to={link.to} className="sweep">
          {link.text}
        </Link>
      ) : (
        <a
          key={link.text}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="sweep"
        >
          {link.text}
        </a>
      );
      return [part.slice(0, i), node, part.slice(i + link.text.length)];
    });
  }

  return parts.filter((p) => p !== "");
}

/**
 * Native <details>/<summary> accordion: keyboard accessible and expandable
 * without JavaScript, which matters because the page is prerendered.
 */
const Faq = () => (
  <section
    aria-labelledby="faq-heading"
    className="border-t border-rule bg-gray-light"
  >
    <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
      <h2 id="faq-heading">Questions</h2>

      <div className="mt-10 max-w-measure">
        {FAQ.map(({ q, a, links }) => (
          <details key={q} className="faq-item group border-b border-rule first:border-t">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 font-display text-step-3 font-semibold text-ink">
              <span>{q}</span>
              <span aria-hidden="true" className="faq-marker mt-1.5 shrink-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <line x1="12" y1="5" x2="12" y2="19" className="faq-plus" />
                </svg>
              </span>
            </summary>
            <div className="pb-6">
              <p className="text-gray-text">{renderAnswer(a, links)}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default Faq;
