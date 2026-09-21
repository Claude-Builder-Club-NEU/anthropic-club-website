import { useEffect, useId, useRef, useState } from "react";
import { BracketButton } from "./BracketButton";
import { Wordmark } from "./Wordmark";
import { LINKS, NAV } from "../lib/event";

/**
 * 3.1 Header.
 *
 * 80px bar: the eye and wordmark on the left, the anchor nav in the middle,
 * [ SIGN UP ] on the right.
 *
 * THE MENU (SPEC §6).
 *
 * At 640px and below the nav collapses and the wordmark and Sign up stay put.
 * This is the one piece of UI the reference render does not contain, so it is
 * built to the same rules as everything else: a bracket control in Geist Mono,
 * square, no fill, and a panel that is the page's own black with the header's
 * dashed rule under it.
 *
 * It is a disclosure, not a dialog. Nothing is trapped, the page behind stays
 * readable, and the panel hangs off the bar rather than pushing the hero down
 * the screen. The CSS does the showing and hiding at the right width, so at
 * desktop widths `open` is inert and the nav is simply always there.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const navId = useId();

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
    <header className="hk-header">
      <a className="hk-header__brand" href="#" aria-label="HACK1984 home">
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
            href={item.href}
            // Following a link inside the panel has already done what the
            // panel is for.
            onClick={() => setOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="hk-header__actions">
        <BracketButton
          ref={toggleRef}
          small
          className="hk-menu-toggle"
          aria-expanded={open}
          aria-controls={navId}
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        >
          {open ? "Close" : "Menu"}
        </BracketButton>

        <BracketButton small href={LINKS.signUp}>
          Sign up
        </BracketButton>
      </div>
    </header>
  );
}
