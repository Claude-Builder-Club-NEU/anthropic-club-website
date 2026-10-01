import { useEffect, useRef, useState } from "react";
import PostImage from "./PostImage";
import { ArrowLeftIcon, ArrowRightIcon } from "./Icons";
import { STRIP_DIR, STRIP_WIDTHS, imageBase, stripSizes } from "../lib/blog";

/**
 * A `:::photos` block: one short row of pictures that scrolls sideways.
 *
 * Built to cost as little as possible, in both directions. On the page it is a
 * single band 240px tall whatever the number of photos, rather than a grid
 * that pushes the article down by a screen per pair. Over the wire every
 * picture is lazy, so a reader fetches the three or four in view and the rest
 * only if they scroll to them, each one a few tens of kilobytes from the small
 * ladder scripts/build-blog-images.mjs makes for `blog-src/<slug>/photos/`.
 *
 * Every photo keeps its own shape at the strip's height, so portrait and
 * landscape sit side by side uncropped. The shape is declared in the post
 * (`?ratio=2:3`, 3:2 when absent) and set on the box, so the row is laid out
 * before a single byte of image arrives.
 *
 * The arrows match the slide deck's, one on each side, and each moves the row
 * by a screenful, starting from the first photo that was cut off. An arrow is
 * hidden at the end it cannot move past. Touch and trackpads simply scroll it.
 */
const PhotoStrip = ({ items, slug }) => {
  const track = useRef(null);
  const [ends, setEnds] = useState({ start: true, end: false });

  const update = () => {
    const el = track.current;
    if (!el) return;
    setEnds({
      start: el.scrollLeft <= 1,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    });
  };

  // Scrolled by hand, by the keyboard, or resized. The arrows also update
  // straight after their own move in step(), rather than waiting on the
  // scroll event the move fires.
  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // scrollLeft is set directly, never with smooth behaviour: DESIGN.md rules
  // out smooth scrolling. offsetLeft is measured against the track, which is
  // position: relative for exactly this.
  const step = (dir) => {
    const el = track.current;
    const photos = [...el.children];
    if (dir > 0) {
      const edge = el.scrollLeft + el.clientWidth;
      const cut = photos.find((p) => p.offsetLeft + p.offsetWidth > edge + 1);
      el.scrollLeft = cut ? cut.offsetLeft : el.scrollWidth;
    } else {
      const back = el.scrollLeft - el.clientWidth;
      const first = photos.find((p) => p.offsetLeft >= back - 1);
      el.scrollLeft = first ? first.offsetLeft : 0;
    }
    update();
  };

  return (
    <div
      className="postfigure poststrip"
      data-bleed="true"
      role="region"
      aria-label="Photos"
    >
      <ul className="poststrip__track" ref={track} tabIndex={0}>
        {items.map((item) => (
          <li
            key={item.src}
            className="poststrip__photo"
            style={{ "--photo-ratio": item.ratio || "3 / 2" }}
          >
            <PostImage
              base={imageBase(slug, `${STRIP_DIR}/${item.src}`)}
              widths={STRIP_WIDTHS}
              sizes={stripSizes(item.ratio)}
              alt={item.alt}
            />
          </li>
        ))}
      </ul>

      {/* aria-hidden and out of the tab order: the row is a list a screen
          reader reads straight through and a keyboard scrolls with the arrow
          keys, so these two only serve a pointer. */}
      <button
        type="button"
        className="postdeck__arrow"
        data-side="prev"
        aria-hidden="true"
        tabIndex={-1}
        hidden={ends.start}
        onClick={() => step(-1)}
      >
        <ArrowLeftIcon />
      </button>
      <button
        type="button"
        className="postdeck__arrow"
        data-side="next"
        aria-hidden="true"
        tabIndex={-1}
        hidden={ends.end}
        onClick={() => step(1)}
      >
        <ArrowRightIcon />
      </button>
    </div>
  );
};

export default PhotoStrip;
