import { Link, useParams } from "react-router-dom";
import PostBody from "../components/PostBody";
import PostImage from "../components/PostImage";
import NotFound from "./NotFound";
import claudeSpark from "../assets/brand/claude-spark.svg";
import {
  FIGURE_SIZES,
  FIGURE_WIDTHS,
  authorFor,
  findPost,
  formatPostDate,
  imageBase,
  olderThan,
} from "../lib/blog";

/**
 * One post.
 *
 * Every post opens on a BANNER PLATE at the article's own width: the
 * photograph when there is one, and the club's mark on ink when there is not.
 *
 * NOTHING IS WRITTEN ON THE PLATE, and that is the whole design. The title, the
 * standfirst and the colophon sit on paper beneath it, so the plate carries no
 * legibility debt: there is no scrim to tune, no photograph that is too bright
 * to use, and no title length that can damage it. Measured, a ten-line title
 * leaves the plate at exactly the size a one-line title does.
 *
 * The plate is a sibling of the prose rather than a full-bleed band. It
 * therefore inherits the shell width with no breakout arithmetic and can never
 * drift from the width a figure takes, which is what stops the masthead and the
 * first illustration reading as two different objects.
 *
 * There is NO back link and NO kicker above the h1. "Blog" stays marked in the
 * header on every post page, and that is the wayfinding; a link above a heading
 * is an eyebrow.
 *
 * Every published post is prerendered to its own HTML file, so in production an
 * unknown slug is a genuine Netlify 404 and never reaches this component. The
 * NotFound branch is for the dev server and for a draft that is visible locally.
 */
const BlogPost = () => {
  const { slug } = useParams();
  const post = findPost(slug);

  if (!post) return <NotFound />;

  const author = authorFor(post);
  const older = olderThan(post.slug);

  // The colophon. Every part is a real value or it is not printed: nothing here
  // is filled in with a placeholder when a post does not declare it.
  const colophon = [
    formatPostDate(post.date),
    `${post.minutes} min read`,
    author ? `By ${author.name}` : null,
    post.updated ? `Updated ${formatPostDate(post.updated)}` : null,
  ].filter(Boolean);

  return (
    <article className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12 sm:px-10 sm:pb-24 sm:pt-16 lg:px-16">
      <div className="postarticle">
        <header className="posthead">
          <div className="postbanner">
            {post.thumb ? (
              /* The uncropped derivatives, not the card's 16:9 crop: the plate
                 is wider than 16:9 above 706px and object-fit does the framing,
                 so cropping at build time as well would crop twice. */
              <PostImage
                base={imageBase(post.slug, post.thumb)}
                widths={FIGURE_WIDTHS}
                sizes={FIGURE_SIZES}
                alt={post.thumbAlt}
                priority
              />
            ) : (
              /* The Claude Spark, cropped by the plate's bottom-right corner,
                 at the mark's own colour. This is .hero-mark's device at
                 masthead scale.

                 The INK ground is what lets the mark ship unmodified: coral on
                 ink measures 5.90:1, where coral on the index card's coral
                 plate is 1.00:1 and needs the paper tile that card carries.
                 assets/brand/README.md forbids recolouring it, so the ground
                 has to do the work. Never add a `color` here. */
              <img
                className="postbanner__mark"
                src={claudeSpark}
                alt=""
                width="94"
                height="94"
              />
            )}
          </div>

          <h1 className="posthead__title">{post.title}</h1>

          {post.lead && <p className="lead posthead__lead">{post.lead}</p>}

          <p className="meta posthead__meta">{colophon.join(" · ")}</p>
        </header>

        {/* The banner takes the page's one priority slot, but only when it
            actually carries a photograph. */}
        <PostBody
          blocks={post.blocks}
          slug={post.slug}
          hasBannerImage={Boolean(post.thumb)}
        />

        <footer className="postfoot">
          {older && (
            <div className="postnext">
              <h2 className="postnext__title">
                <Link className="postnext__link sweep" to={`/blog/${older.slug}`}>
                  {older.title}
                </Link>
              </h2>
              {/* Beside the title on a wide screen and BELOW it on a phone, so
                  the label is never a kicker above a heading. */}
              <span className="meta whitespace-nowrap">Older post</span>
            </div>
          )}

          <p>
            <Link
              to="/blog"
              className="font-display text-small no-underline sweep"
            >
              All posts
            </Link>
          </p>
        </footer>
      </div>
    </article>
  );
};

export default BlogPost;
