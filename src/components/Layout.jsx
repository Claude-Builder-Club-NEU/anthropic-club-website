import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import claudeLogo from "../assets/claude-logo-png_seeklogo-554534.png";
import {
  INTEREST_FORM,
  INSTAGRAM,
  LINKEDIN,
  SLACK_WORKSPACE,
} from "../lib/links";
import { InstagramIcon, LinkedInIcon, SlackIcon } from "./Icons";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/workshops", label: "Workshops" },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the menu on navigation, and lock the page behind it while open.
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

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          <Link
            to="/"
            className="flex items-center gap-2.5 no-underline"
            aria-label="Claude Builders Club, home"
          >
            <img src={claudeLogo} alt="" width="26" height="26" />
            <span className="font-display text-small font-semibold tracking-tight text-ink">
              Claude Builders Club
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `nav-link sweep no-underline${isActive ? " is-current" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <a
              className="btn btn--primary"
              href={INTEREST_FORM}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the club
            </a>
          </nav>

          <button
            type="button"
            className="md:hidden"
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

        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Primary"
            className="border-t border-rule px-6 py-4 md:hidden"
          >
            <ul className="m-0 list-none space-y-1 p-0">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `block py-3 font-display text-base no-underline ${
                        isActive ? "text-coral-text" : "text-ink"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <a
              className="btn btn--primary mt-3 w-full"
              href={INTEREST_FORM}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the club
            </a>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-rule bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10 lg:px-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-display text-small font-semibold text-ink">
                Claude Builders Club
              </p>
              <p className="mt-2 text-small text-gray-text">
                Northeastern University
              </p>
            </div>

            <nav aria-label="Footer">
              <h2 className="meta m-0">Pages</h2>
              <ul className="mt-3 list-none space-y-2 p-0">
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
              <ul className="mt-3 list-none space-y-2 p-0">
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
              <p className="mt-3 text-small text-gray-text">
                Tell us you&apos;re interested and we&apos;ll be in touch about
                what&apos;s coming up.
              </p>
              <a
                className="btn btn--primary mt-4"
                href={INTEREST_FORM}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join the club
              </a>
            </div>
          </div>

          <div className="mt-12 border-t border-rule pt-6">
            <p className="text-meta text-gray-text" style={{ maxWidth: "none" }}>
              The Claude Builders Club is a recognized student organization at
              Northeastern University and an official chapter of Anthropic&apos;s
              Claude Builder Club program. Not an official communication of
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
