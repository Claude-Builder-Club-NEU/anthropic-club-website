import { FAQ } from "../lib/faq";

/**
 * Native <details>/<summary> accordion: keyboard accessible and expandable
 * without JavaScript, which matters because the page is prerendered.
 */
const Faq = () => (
  <section
    aria-labelledby="faq-heading"
    className="border-t border-rule bg-gray-light"
  >
    <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
      <h2 id="faq-heading">Questions</h2>

      <div className="mt-8 max-w-measure">
        {FAQ.map(({ q, a, draft }) => (
          <details
            key={q}
            className="group border-b border-rule first:border-t"
          >
            <summary className="cursor-pointer list-none py-5 font-display text-step-3 font-semibold text-ink marker:content-['']">
              <span className="flex items-start justify-between gap-6">
                <span>{q}</span>
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-coral-text transition-none"
                >
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
                    <line
                      x1="12"
                      y1="5"
                      x2="12"
                      y2="19"
                      className="group-open:hidden"
                    />
                  </svg>
                </span>
              </span>
            </summary>
            <div className="pb-6">
              {draft && import.meta.env.DEV && (
                <p className="meta mb-2 text-coral-text">
                  TODO: Jackson — draft answer
                </p>
              )}
              <p className="text-gray-text">{a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default Faq;
