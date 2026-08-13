import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { INTEREST_FORM } from "../lib/links";

/**
 * Mobile-only sticky CTA.
 *
 * Appears once the hero has scrolled out of view, hidden at >=768px, dismissible,
 * and respects the home indicator via env(safe-area-inset-bottom).
 *
 * It also sets a bottom padding on <body> while visible, so it can never cover
 * footer links or the last line of content — the usual failure mode for this
 * pattern.
 */
const StickyCta = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // A new route means a new hero; re-arm.
  useEffect(() => setVisible(false), [pathname]);

  useEffect(() => {
    if (dismissed) return undefined;
    const onScroll = () => {
      // Roughly one viewport down: the hero is gone by now.
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed, pathname]);

  const shown = visible && !dismissed;

  useEffect(() => {
    const cls = "has-sticky-cta";
    document.body.classList.toggle(cls, shown);
    return () => document.body.classList.remove(cls);
  }, [shown]);

  if (!shown) return null;

  return (
    <div className="sticky-cta md:hidden" role="complementary" aria-label="Join the club">
      <a
        className="btn btn--primary flex-1"
        href={INTEREST_FORM}
        target="_blank"
        rel="noopener noreferrer"
      >
        Join the club
      </a>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 px-3 text-gray-text"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </button>
    </div>
  );
};

export default StickyCta;
