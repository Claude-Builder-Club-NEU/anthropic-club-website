import { ImagePlaceholderIcon } from "./Icons";
import { srcSet } from "../lib/blog";

/**
 * One picture for a blog image, in the same three formats BoardCard uses.
 *
 * AVIF, then WebP, then a JPEG fallback. A browser takes the first type it
 * understands and never fetches the others. `sizes` is supplied by the caller
 * because a card and a full-width figure occupy very different boxes, and
 * getting it wrong costs real bytes rather than looking wrong.
 *
 * There are no width and height attributes and none are needed: every one of
 * these sits inside a box with a fixed `aspect-ratio` and takes `object-fit:
 * cover`, so the space is reserved by CSS before any bytes arrive and nothing
 * reflows on decode. That is what DESIGN.md asks for and it is why this
 * pipeline needs no build-time dimension manifest.
 *
 * `priority` is for exactly ONE image per page: the lead thumbnail on /blog, or
 * a post's opening figure. That image is the LCP element. Two eager
 * high-priority images compete for the same connection and both land later than
 * one would, so everything else is lazy.
 */
const PostImage = ({ base, widths, sizes, alt, suffix = "", priority = false }) => (
  <picture>
    <source type="image/avif" sizes={sizes} srcSet={srcSet(base, widths, "avif", suffix)} />
    <source type="image/webp" sizes={sizes} srcSet={srcSet(base, widths, "webp", suffix)} />
    <img
      src={`${base}${suffix}-${widths[widths.length - 1]}.jpg`}
      srcSet={srcSet(base, widths, "jpg", suffix)}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  </picture>
);

/**
 * The reserved frame for a post whose picture is not made yet.
 *
 * Dashed rather than empty, the same reading `.event-fill` gives a slot that is
 * waiting rather than broken, and inset by 4px so the dashes do not sit on the
 * box boundary where they look like a rendering fault. `--gray-mid` because the
 * hairline is invisible against the oat ground underneath.
 *
 * It is a gap filler, not a policy. A post ships imageless only while its
 * picture is being made; an index where a third of the frames are dashed reads
 * as an unfinished site however correct the CSS is.
 */
export const ReservedImage = ({ size = 20 }) => (
  <span className="postreserved" aria-hidden="true">
    <ImagePlaceholderIcon width={size} height={size} />
  </span>
);

export default PostImage;
