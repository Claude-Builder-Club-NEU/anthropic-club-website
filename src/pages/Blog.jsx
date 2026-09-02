import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PostImage from "../components/PostImage";
import { ArrowRightIcon } from "../components/Icons";
import claudeSpark from "../assets/brand/claude-spark.svg";
import { INTEREST_FORM } from "../lib/links";
import {
  POSTS,
  TAGS,
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
 * ONE CARD OBJECT, in two sizes. Each post is a picture panel and a block of
 * copy inside a hairline card on paper. The newest post takes the full width
 * with its panel down the right; everything after it sits two-up with the panel
 * across the top.
 *
 * THE CARD IS THE HOMEPAGE CARD. `.link-card` in the link hub is a paper
 * surface inside a hairline that turns its border coral and its ground oat on
 * hover, and `.postcard` is that same object at a larger size. It is why the
 * hover state animates the WHOLE card rather than marking the title: two
 * objects doing the same job should not have two different hover behaviours.
 *
 * THE PICTURE PANEL IS SIZED FOR PICTURES, not for a placeholder. It is a 16:9
 * band on a small card and a full-height 320px column on the feature, so a real
 * photograph has somewhere to go the day one exists. Until then it is a coral
 * plate carrying the Claude spark, which is honest about being a placeholder in
 * the way a stretched or invented image would not be.
 *
 * The masthead is the /events masthead, character for character, so a fourth
 * list surface on this site does not read as a fourth product.
 */
const Blog = () => {
  const [tag, setTag] = useState("ALL");

  // A filter only exists once there is something to filter. One post, or five
  // that share a tag, get no chips. Same call Events.jsx makes for event kinds.
  const filterable = TAGS.length > 1;

  const shown = useMemo(
    () => (tag === "ALL" ? POSTS : POSTS.filter((p) => p.tag === tag)),
    [tag]
  );

  const [feature, ...rest] = shown;

  return (
    <>
      <section
        aria-labelledby="blog-heading"
        className="mx-auto w-full max-w-6xl px-6 pb-4 pt-14 sm:px-10 sm:pt-16 lg:px-16"
      >
        {/* The shipped /events and /polls head: same wrapper, same heading size,
            same one-line subhead, same chip row. */}
        <div className="upcoming-head">
          <div>
            <h1 id="blog-heading" className="page-title--section">
              Blog
            </h1>
            <p className="mt-2 text-small text-gray-text">
              Write-ups from the sessions we run, and notes on what we build.
            </p>
          </div>

          {filterable && (
            <div
              className="filter-row"
              role="group"
              aria-label="Filter posts by kind"
            >
              <button
                type="button"
                className="filter-chip"
                aria-pressed={tag === "ALL"}
                onClick={() => setTag("ALL")}
              >
                All posts
              </button>
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="filter-chip"
                  aria-pressed={tag === t}
                  onClick={() => setTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {!feature ? (
          <div className="postindex__empty">
            <p className="event-fill__text">
              {POSTS.length === 0
                ? "No posts yet."
                : "Nothing filed under that yet."}
            </p>
            {POSTS.length > 0 && (
              <p className="mt-3">
                <button
                  type="button"
                  className="link-button sweep"
                  onClick={() => setTag("ALL")}
                >
                  Show all posts
                </button>
              </p>
            )}
          </div>
        ) : (
          <>
            <PostCard post={feature} feature />
            {rest.length > 0 && (
              <ul className="postcard-row">
                {rest.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12 sm:px-10 sm:pb-24 lg:px-16">
        <aside className="blog-signup">
          <div>
            <p className="blog-signup__title">Get every issue by email</p>
            <p className="blog-signup__sub">One a month. Nothing else.</p>
          </div>
          <a
            className="blog-signup__cta"
            href={INTEREST_FORM}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the list <ArrowRightIcon width={16} height={16} />
          </a>
        </aside>
      </section>
    </>
  );
};

/**
 * One post.
 *
 * The same component at both sizes, because they are the same object: a picture
 * panel, an eyebrow, a title, an excerpt. The feature adds the reading time and
 * an optional `from` line, and turns the panel into a column. Everything that
 * differs is a `data-feature` attribute in CSS rather than a second component.
 *
 * `<article>` inside an `<li>` for the row, and a bare `<article>` for the
 * feature, so the list markup is only there when there is a list.
 */
const PostCard = ({ post, feature = false }) => {
  const card = (
    <article className="postcard" data-feature={feature ? "true" : undefined}>
      <div className="postcard__art">
        {post.thumb ? (
          <PostImage
            base={imageBase(post.slug, post.thumb)}
            widths={CARD_WIDTHS}
            suffix={CARD_SUFFIX}
            sizes={feature ? LEAD_CARD_SIZES : CARD_SIZES}
            alt={post.thumbAlt}
            /* The feature's panel is the LCP element on this page. Every card
               below it is lazy, so forty posts still fetch one image. */
            priority={feature}
          />
        ) : (
          /* The placeholder, and it says so by being the club's own mark on a
             flat plate rather than a stock photograph or a grey box pretending
             a picture failed to load.

             The mark sits on a paper tile rather than straight on the coral,
             for a brand reason and not a visual one: the Claude Spark is
             Anthropic's mark and assets/brand/README.md records the program
             rule not to recolour it. Its fill IS --coral, so on a coral plate
             it would be invisible, and tinting it to cream would break that
             rule. A light tile under it keeps the mark exactly as shipped. */
          <span className="postcard__plate" aria-hidden="true">
            <img src={claudeSpark} alt="" width="94" height="94" />
          </span>
        )}
      </div>

      <div className="postcard__body">
        <p className="postcard__eyebrow">
          {[feature ? "Latest" : null, post.tag].filter(Boolean).join(" · ")}
        </p>

        <h2 className="postcard__title">
          <Link className="postcard__link" to={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </h2>

        <p className="postcard__excerpt">{post.excerpt}</p>

        <p className="postcard__meta">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span className="postcard__dot" aria-hidden="true">
            ·
          </span>
          {post.minutes} min read
          {post.from && (
            <>
              <span className="postcard__dot" aria-hidden="true">
                ·
              </span>
              {post.from}
            </>
          )}
        </p>
      </div>
    </article>
  );

  return feature ? card : <li className="postcard-item">{card}</li>;
};

export default Blog;
