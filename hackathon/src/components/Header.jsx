import { useEffect, useId, useRef, useState } from "react";
import { Wordmark } from "./Wordmark";
import { LINKS, NAV } from "../lib/event";
import { homeAnchor, withBase } from "../lib/base";
import { useApplicationsOpen } from "../lib/apply";

/**
 * 3.1 Header.
 *
 * A bar the full width of the window, pinned to the top: the logo on the
 * left, a link to every section of the home page in the middle, and Apply on
 * the right. While applications are open Apply is the solid white block.
 * Once they close it stays, greyed out, and still goes to /hackathon/signup/,
 * which says applications have closed: the button is where someone looks
 * for it, and the page it opens is the answer.
 *
 * No bracket buttons here. The bracket is the page's call to action
 * everywhere else, and a bar of five of them read as five calls to action.
 * The nav is plain mono caps and the one action is a filled white block,
 * the way Raycast's and Zed's bars end in a single solid button.
 *
 * THE MENU (SPEC §6). Below 1024px the nav collapses into a panel under the
 * bar, opened by a Menu control. It is a disclosure, not a dialog: nothing is
 * trapped and the page behind stays readable. The CSS does the showing and
 * hiding at the right width, so on a desktop `open` is inert and the nav is
 * simply always there.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const navId = useId();
  const applying = useApplicationsOpen();

  // Escape closes the panel and puts focus back on the control that opened
  // it, which is where a keyboard user expects to land.
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="hk-header hk-bleed">
      <div className="hk-header__bar">
        <a className="hk-header__brand" href={homeAnchor("")} aria-label="HACK1984 home">
          <Wordmark />
        </a>

        <nav
          id={navId}
          aria-label="Site"
          className={open ? "hk-nav hk-nav--open" : "hk-nav"}
        >
          {NAV.map((item) => (
            <a
              key={item.href}
              href={homeAnchor(item.href)}
              // Following a link inside the panel has already done what the
              // panel is for.
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hk-header__actions">
          <button
            ref={toggleRef}
            type="button"
            className="hk-header__link hk-menu-toggle"
            aria-expanded={open}
            aria-controls={navId}
            onClick={() => setOpen((wasOpen) => !wasOpen)}
          >
            {open ? "Close" : "Menu"}
          </button>

          <a
            className={applying ? "hk-header__cta" : "hk-header__cta hk-header__cta--closed"}
            href={withBase(LINKS.signUp)}
            {...(applying ? {} : { "aria-label": "Apply (applications are closed)" })}
          >
            Apply
          </a>
        </div>
      </div>
    </header>
  );
}
