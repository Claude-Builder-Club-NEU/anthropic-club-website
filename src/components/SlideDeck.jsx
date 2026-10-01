import { useRef, useState } from "react";
import PostImage from "./PostImage";
import { ArrowLeftIcon, ArrowRightIcon } from "./Icons";
import { FIGURE_SIZES, FIGURE_WIDTHS, imageBase } from "../lib/blog";

/**
 * A click-through slide deck: a `:::slides` block in a post.
 *
 * One slide at a time at the figure's full width, with a previous and a next
 * button on either side of it and nothing else around it. It wraps at both
 * ends, so the last slide clicks through to the first. Two quieter ways in sit
 * alongside the buttons and add nothing to the screen: the arrow keys while
 * either button has focus, and a sideways swipe on a phone.
 *
 * THE SWAP IS INSTANT. No slide or fade transition: DESIGN.md allows three
 * animations on the whole site and a carousel is not one of them. The neighbour
 * on each side is already in the DOM, invisible, so its image has loaded by the
 * time it is shown and the change does not flash the empty plate.
 */

/** Sideways travel, in px, before a drag counts as a swipe. */
const SWIPE = 40;

const SlideDeck = ({ items, slug, captions = [] }) => {
  const [at, setAt] = useState(0);
  const press = useRef(null);
  const count = items.length;

  const go = (i) => setAt(((i % count) + count) % count);

  const onKeyDown = (event) => {
    const moves = {
      ArrowRight: at + 1,
      ArrowLeft: at - 1,
      Home: 0,
      End: count - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    go(moves[event.key]);
  };

  // The stage sets touch-action: pan-y, so a vertical drag still scrolls the
  // page and the browser cancels the press, which is why a scroll is never
  // read as a swipe.
  const onPointerDown = (event) => {
    if (event.pointerType === "mouse") return;
    press.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event) => {
    const start = press.current;
    press.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? at + 1 : at - 1);
    }
  };

  const near = (i) => {
    const gap = Math.abs(i - at);
    return gap <= 1 || gap === count - 1;
  };

  return (
    <figure
      className="postfigure postdeck"
      data-bleed="true"
      role="region"
      aria-roledescription="carousel"
      aria-label="Slide deck"
      onKeyDown={onKeyDown}
    >
      <div
        className="postdeck__stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (press.current = null)}
      >
        {items.map((item, i) =>
          near(i) ? (
            <div
              key={item.src}
              className="postdeck__slide"
              data-active={i === at ? "true" : undefined}
              aria-hidden={i === at ? undefined : "true"}
            >
              <PostImage
                base={imageBase(slug, item.src)}
                widths={FIGURE_WIDTHS}
                sizes={FIGURE_SIZES}
                alt={item.alt}
              />
            </div>
          ) : null
        )}

        <button
          type="button"
          className="postdeck__arrow"
          data-side="prev"
          aria-label="Previous slide"
          onClick={() => go(at - 1)}
        >
          <ArrowLeftIcon />
        </button>
        <button
          type="button"
          className="postdeck__arrow"
          data-side="next"
          aria-label="Next slide"
          onClick={() => go(at + 1)}
        >
          <ArrowRightIcon />
        </button>
      </div>

      {/* There is no visible counter, so this is the only place the position
          is stated: read out on every move, with what the new slide shows,
          since the image changing under a screen reader says nothing. */}
      <p className="sr-only" aria-live="polite">
        Slide {at + 1} of {count}: {items[at].alt}
      </p>

      {captions[at] && (
        <figcaption className="postfigure__caption postdeck__caption">
          {captions[at]}
        </figcaption>
      )}
    </figure>
  );
};

export default SlideDeck;
