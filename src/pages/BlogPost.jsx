import { Link, useParams } from "react-router-dom";
import PostBody from "../components/PostBody";
import NotFound from "./NotFound";
import { authorFor, findPost, formatPostDate, olderThan } from "../lib/blog";

/**
 * One post.
 *
 * Every published post is prerendered to its own HTML file, so in production an
 * unknown slug is a genuine Netlify 404 and never reaches this component. The
 * NotFound branch is for the dev server, where there is no such file, and for a
 * draft that is visible locally and gone in the build.
 *
 * There is NO back link above the h1 and no category kicker. "Blog" stays
 * sweep-marked in the header on every post page, because the nav entry is not
 * `end`, and that is the wayfinding. A link above a heading is an eyebrow.
 *
 * The reading column is centred rather than pinned left. A 68ch measure pinned
 * to the left of a 1024px container leaves a third of the page empty on any
 * post without pictures. Prose still clamps itself to the measure and figures
 * still fill the shell, so an image breaks past the text on both sides while
 * sharing its centre axis. `.checkin` is the shipped precedent for a centred
 * narrow column.
 */
const BlogPost = () => {
  const { slug } = useParams();
  const post = findPost(slug);

  if (!post) return <NotFound />;

  const author = authorFor(post);
  const older = olderThan(post.slug);

  return (
    <article className="mx-auto w-full max-w-6xl px-6 pb-16 pt-14 sm:px-10 sm:pb-24 sm:pt-20 lg:px-16 lg:pt-24">
      <div className="postarticle">
        <h1 style={{ maxWidth: "20ch" }}>{post.title}</h1>

        {post.lead && (
          <p className="lead mt-8" style={{ maxWidth: "var(--measure-tight)" }}>
            {post.lead}
          </p>
        )}

        {/* The dateline opens the article on a hairline, which is where a
            byline block sits in print. maxWidth "none" is required, not
            cosmetic: the global p rule would otherwise draw the rule at the
            prose measure instead of the shell's full width. */}
        <p className="meta mt-8 border-t border-rule pt-4" style={{ maxWidth: "none" }}>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          {author && ` · By ${author.name}`}
        </p>

        <PostBody blocks={post.blocks} slug={post.slug} />

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
              className="inline-flex items-center gap-1.5 font-display text-small no-underline sweep"
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
