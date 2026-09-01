import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import claudeSpark from "../assets/brand/claude-spark.svg";
import {
  INTEREST_FORM,
  INSTAGRAM,
  LINKEDIN,
  SLACK_WORKSPACE,
} from "../lib/links";
import { InstagramIcon, LinkedInIcon, SlackIcon } from "./Icons";

/**
 * Primary nav. Four entries, and neither /polls nor /attendance is among them.
 *
 * Both are surfaces for a room that is already in a session with the URL on a
 * slide or a code on a projector. Neither is a reason for a stranger to visit
 * the site, which is what the nav is for. A permanent Attendance tab is also a
 * dead end for the overwhelming majority of visits, since there is no session
 * open on most days and the page can only say so.
 *
 * Both routes stay reachable, and /polls stays indexed, so a direct link, a QR
 * code and a search result all still work. Only the advertisement is gone.
 *
 * Blog stays marked on /blog/<slug> as well as on the index, and that marked
 * tab is the wayfinding on a post page, which is why no post needs a back link
 * above its heading. See inSection below for how, and for why it is not simply
 * a matter of dropping `end`.
 */
const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/blog", label: "Blog" },
];

/** Shared container inset. The header uses the same one as every page so the
 *  wordmark lines up with page headings rather than floating on its own grid. */
const CONTAINER = "mx-auto w-full max-w-6xl px-6 sm:px-10 lg:px-16";

const Layout = ({ children }) => {
  const location = useLocation();

  /**
   * Is the reader inside this nav item's section without being on the item's
   * own page? Today that means a blog post.
   *
   * This exists so the highlight and the ARIA state can be set separately.
   * Dropping `end` from the NavLink would mark the tab, but NavLink also emits
   * aria-current="page" for anything it considers active, so a screen reader on
   * /blog/september2026 would be told the Blog link IS the current page when it
   * is not. Every NavLink therefore keeps `end`, which confines aria-current to
   * an exact match, and the section highlight comes from `data-marked`, an
   * alternative .sweep trigger the stylesheet already ships.
   */
  const inSection = (to) =>
    to !== "/" &&
    location.pathname !== to &&
    location.pathname.startsWith(`${to}/`);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Publish the real header height so the full-height mobile menu starts
  // exactly below it instead of guessing an offset.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return undefined;
    const setH = () =>
      document.documentElement.style.setProperty(
        "--header-h",
        `${el.offsetHeight}px`
      );
    setH();
    window.addEventListener("resize", setH);
    return () => window.removeEventListener("resize", setH);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header
        ref={headerRef}
        className="site-header bg-gray-light"
        data-scrolled={String(scrolled)}
        data-open={String(menuOpen)}
      >
        <div className={`${CONTAINER} flex items-center justify-between py-4`}>
          <Link
            to="/"
            className="group flex items-center gap-2.5 no-underline"
            aria-label="Claude Builders Club, home"
          >
            <img src={claudeSpark} alt="" width="26" height="26" />
            <span className="font-display text-small font-semibold tracking-tight text-ink">
              Claude Builders Club
            </span>
          </Link>

          {/* gap-6 at md, not gap-8. A fourth nav entry plus the wordmark and
              the coral button leaves roughly 20 to 30px of slack inside the
              688px of content at 768px; the wider gap tips it into a wrap. */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 md:flex lg:gap-8"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                data-marked={inSection(item.to) ? "true" : undefined}
                className={({ isActive }) =>
                  `nav-link sweep no-underline${isActive ? " is-current" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <a
              className="btn btn--coral btn--sm"
              href={INTEREST_FORM}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the club
            </a>
          </nav>

          <button
            type="button"
            className="-mr-2 p-2 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuOpen ? (
                <>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </>
              ) : (
                <>
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Primary" className="mobile-menu md:hidden">
          <ul className="m-0 list-none space-y-1 p-0">
            {NAV.map((item) => (
              <li key={item.to} className="border-b border-rule">
                <NavLink
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `block py-5 font-display text-step-3 font-semibold no-underline ${
                      isActive || inSection(item.to)
                        ? "text-coral-text"
                        : "text-ink"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <a
            className="btn btn--coral mt-8 w-full"
            href={INTEREST_FORM}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the club
          </a>

          <ul className="mt-auto flex list-none gap-6 p-0 pt-10">
            <li>
              <a
                className="inline-flex items-center gap-2 text-small text-ink no-underline sweep"
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon /> Instagram
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-2 text-small text-ink no-underline sweep"
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon /> LinkedIn
              </a>
            </li>
          </ul>
        </nav>
      )}

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-rule bg-paper">
        <div className={`${CONTAINER} py-16`}>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              {/* Chapter lockup: the official Claude Spark beside the club
                  name. The affiliation line below the footer keeps the
                  relationship explicit rather than implied. */}
              <p className="flex items-center gap-2.5">
                <img src={claudeSpark} alt="" width="22" height="22" />
                <span className="font-display text-small font-semibold text-ink">
                  Claude Builders Club
                </span>
              </p>
              <p className="mt-2 text-small text-gray-text">
                Northeastern University
              </p>
              <p className="meta mt-4" style={{ maxWidth: "none" }}>
                Official chapter
              </p>
            </div>

            <nav aria-label="Footer">
              <h2 className="meta m-0">Pages</h2>
              <ul className="mt-4 list-none space-y-2.5 p-0">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-small text-ink no-underline sweep"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="meta m-0">Follow</h2>
              <ul className="mt-4 list-none space-y-2.5 p-0">
                <li>
                  <a
                    className="inline-flex items-center gap-2 text-small text-ink no-underline sweep"
                    href={INSTAGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <InstagramIcon /> Instagram
                  </a>
                </li>
                <li>
                  <a
                    className="inline-flex items-center gap-2 text-small text-ink no-underline sweep"
                    href={LINKEDIN}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkedInIcon /> LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    className="inline-flex items-center gap-2 text-small text-ink no-underline sweep"
                    href={SLACK_WORKSPACE}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SlackIcon /> Slack
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="meta m-0">Get involved</h2>
              <p className="mt-4 text-small text-gray-text">
                Tell us you&apos;re interested and we&apos;ll be in touch about
                what&apos;s coming up.
              </p>
              <a
                className="btn btn--coral mt-5"
                href={INTEREST_FORM}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join the club
              </a>
            </div>
          </div>

          <div className="mt-14 border-t border-rule pt-8">
            <p className="text-meta text-gray-text" style={{ maxWidth: "none" }}>
              The Claude Builders Club is a recognized student organization at
              Northeastern University and an official chapter of Anthropic&apos;s
              Claude Builder Club program. It is not an official communication of
              Anthropic or Northeastern University.
            </p>
            <p
              className="mt-2 text-meta text-gray-text"
              style={{ maxWidth: "none" }}
            >
              We use Google Analytics to see which pages people visit. No
              personal information is collected.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
