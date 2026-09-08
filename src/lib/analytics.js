/**
 * GA4.
 *
 * - Measurement ID comes from VITE_GA_ID. Never hardcoded; absent ID = no-op,
 *   so local and preview builds send nothing.
 * - The gtag script is injected after the page is interactive so it cannot
 *   compete with LCP, and it is never render-blocking.
 * - No PII in any event parameter. Outbound clicks are recorded by name only,
 *   not by any user identifier.
 *
 * Events: join_click, slack_click, instagram_click, linkedin_click,
 * email_signup, calendar_view.
 */

import {
  INTEREST_FORM,
  INSTAGRAM,
  LINKEDIN,
  SLACK_WORKSPACE,
} from "./links";

const GA_ID = import.meta.env.VITE_GA_ID || "";

export function track(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/**
 * Maps a tracked href to its event name.
 *
 * NOT PURELY OUTBOUND ANY MORE. Since the interest form came off Typeform,
 * INTEREST_FORM is "/join", an internal route. react-router renders a <Link> as
 * a real anchor, so the delegated listener below still sees the click and
 * join_click still fires; it is now an intent signal on this site rather than a
 * departure from it.
 *
 * The prefix test is safe only while no other route begins with "/join". If one
 * is ever added, this silently starts counting it, so match it exactly here
 * before adding "/joinus" or similar.
 */
function eventForHref(href) {
  if (!href) return null;
  if (href === INTEREST_FORM) return "join_click";
  if (href.startsWith(SLACK_WORKSPACE)) return "slack_click";
  if (href.startsWith(INSTAGRAM)) return "instagram_click";
  if (href.startsWith(LINKEDIN)) return "linkedin_click";
  return null;
}

function wireOutboundClicks() {
  document.addEventListener(
    "click",
    (e) => {
      const link = e.target.closest?.("a[href]");
      if (!link) return;
      const name = eventForHref(link.getAttribute("href"));
      if (!name) return;
      // `location` is the surface the click came from, not a user identifier.
      // email_signup deliberately does NOT fire here any more.
      //
      // It used to, because a join_click was a departure to Typeform and was
      // therefore the last thing this site could observe. Now the form is on
      // this domain and the signup either lands in the database or does not, so
      // the event is fired from components/JoinForm.jsx on a CONFIRMED write.
      // Counting the click as a signup would have overcounted every visitor who
      // opened the form and abandoned it, which is the number worth knowing.
      track(name, { location: window.location.pathname });
    },
    { capture: true }
  );
}

/** Fires once when the events surface is scrolled into view. */
export function wireCalendarView(node) {
  if (!node || typeof IntersectionObserver === "undefined") return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          track("calendar_view", { location: window.location.pathname });
          io.disconnect();
        }
      }
    },
    { threshold: 0.4 }
  );
  io.observe(node);
  return () => io.disconnect();
}

export function initAnalytics() {
  if (typeof window === "undefined" || !GA_ID) return;

  const start = () => {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });

    wireOutboundClicks();
  };

  // Wait for idle so analytics never delays first paint or LCP.
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(start, { timeout: 4000 });
  } else {
    window.addEventListener("load", () => window.setTimeout(start, 1200));
  }
}
