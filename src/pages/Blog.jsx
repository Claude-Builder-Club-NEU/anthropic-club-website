import { Link } from "react-router-dom";
import PostImage, { ReservedImage } from "../components/PostImage";
import { ArrowRightIcon } from "../components/Icons";
import {
  POSTS,
  CARD_SIZES,
  CARD_SUFFIX,
  CARD_WIDTHS,
  LEAD_CARD_SIZES,
  formatPostDate,
  imageBase,
} from "../lib/blog";

/**
 * The blog index. Mode: Operate, like /events and /polls.
 *
 * A RULED TABLE, not a card grid. This site already owns that object twice
 * over, in `.home-event` and `.pollresult`, and a table is the one shape that
 * survives both states this page has to hold: exactly one post on launch day,
 * and forty of them later. A grid of cards looks broken at one item and needs a
 * second card shape to promote anything.
 *
 * The newest post is the lead. It takes a larger headline and a larger plate,
 * and above 1024px that headline sets LARGER than the page title above it. The
 * inversion is deliberate: on a page of writing, the newest piece should be the
 * loudest thing, not the word "Blog".
 *
 * The masthead is the /events masthead, character for character, so a fourth
 * list surface cannot read as a fourth product.
 *
 * NO eyebrow. The date sits in its own column beside the title above 52rem, and
 * below the excerpt on a phone, so it is never a kicker above a heading.
 *
 * NO filters, no search, no post count, no "load more". /events only renders a
 * filter chip for a kind that is actually on the calendar; a blog with one post
 * gets no filter UI either. Every row renders, so nothing is behind JavaScript.
 */
const Blog = () => (
  <>
    <section
      aria-labelledby="blog-heading"
      className="mx-auto w-full max-w-6xl px-6 pb-4 pt-14 sm:px-10 sm:pt-16 lg:px-16"
    >
      <h1 id="blog-heading" className="page-title--section">
        Blog
      </h1>
      <p className="mt-2 text-small text-gray-text">
        Write-ups from the sessions we run, and notes on what we build.
      </p>

      {POSTS.length === 0 ? (
        <div className="postindex__empty">
          <p className="event-fill__text">No posts yet.</p>
        </div>
      ) : (
        <ul className="postindex">
          {POSTS.map((post, i) => (
            <PostRow key={post.slug} post={post} lead={i === 0} />
          ))}
        </ul>
      )}
    </section>

    {/* A floor under a page that may hold a single row, and a pointer at where
        these posts come from. It points at /events rather than the interest
        form: the footer and the sticky CTA already carry that ask twice. */}
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
      <div className="rounded-lg border border-rule bg-gray-light p-8 sm:p-12">
        <p
          className="font-display text-step-2 font-semibold text-ink"
          style={{ maxWidth: "20ch" }}
        >
          Everything here comes out of a session.
        </p>
        <p className="mt-4 text-gray-text" style={{ maxWidth: "46ch" }}>
          Workshops, hackathons and build nights are where these posts start.
        </p>
        <p className="mt-8">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
          >
            See what we&apos;re running <ArrowRightIcon width={16} height={16} />
          </Link>
        </p>
      </div>
    </section>
  </>
);

/**
 * One row.
 *
 * The link's `::after` stretches over the whole row, so the thumbnail and the
 * excerpt are part of the target while the accessible name stays the title
 * alone. The tradeoff, accepted: excerpt text on this page cannot be selected.
 * The alternative leaves the picture dead to a click.
 *
 * The lead row drops its thumbnail column entirely when there is no picture
 * rather than showing a 256px dashed rectangle, which reads as a hole. At the
 * 88 to 160px a standard row uses, the same frame reads as reserved, so
 * standard rows keep it.
 */
const PostRow = ({ post, lead }) => (
  <li
    className="postrow"
    data-lead={lead ? "true" : undefined}
    data-nomedia={lead && !post.thumb ? "true" : undefined}
  >
    <p className="meta postrow__when">
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
    </p>

    <h2 className="postrow__title">
      <Link className="postrow__link sweep" to={`/blog/${post.slug}`}>
        {post.title}
      </Link>
    </h2>

    <p className="postrow__excerpt">{post.excerpt}</p>

    {!(lead && !post.thumb) && (
      <div className="postrow__thumb">
        {post.thumb ? (
          <PostImage
            base={imageBase(post.slug, post.thumb)}
            widths={CARD_WIDTHS}
            suffix={CARD_SUFFIX}
            sizes={lead ? LEAD_CARD_SIZES : CARD_SIZES}
            alt={post.thumbAlt}
            /* The lead plate is the LCP element on this page. Every row below
               it is lazy, so forty posts still fetch one image on load. */
            priority={lead}
          />
        ) : (
          <ReservedImage />
        )}
      </div>
    )}
  </li>
);

export default Blog;
