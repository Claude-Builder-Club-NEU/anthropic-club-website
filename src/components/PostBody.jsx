import { Link } from "react-router-dom";
import PostImage from "./PostImage";
import {
  FIGURE_SIZES,
  FIGURE_WIDTHS,
  INSET_FIGURE_SIZES,
  PORTRAIT_FIGURE_SIZES,
  imageBase,
} from "../lib/blog";

/**
 * Renders the block tree lib/markdown.js produces.
 *
 * ELEMENTS, never dangerouslySetInnerHTML. React escapes every text node, so a
 * post cannot inject markup and there is nothing to sanitise. If a post ever
 * renders something as literal text that should have been formatted, the fix
 * belongs in the parser's supported subset, never here.
 *
 * Positional keys are correct: the tree is parsed once from a static file and
 * is never reordered or filtered.
 */

/** Inline nodes: text, strong, em, code, link. */
const Inline = ({ nodes }) =>
  (nodes || []).map((node, i) => {
    switch (node.type) {
      case "strong":
        return (
          <strong key={i}>
            <Inline nodes={node.children} />
          </strong>
        );
      case "em":
        return (
          <em key={i}>
            <Inline nodes={node.children} />
          </em>
        );
      case "code":
        return <code key={i}>{node.value}</code>;
      case "link":
        return <PostLink key={i} href={node.href} nodes={node.children} />;
      default:
        return node.value;
    }
  });

/**
 * An in-site link has to be a <Link>, not an <a>. An anchor triggers a full
 * page load, which throws away the app and skips App.jsx's ScrollToTop, so the
 * reader lands part way down the new page. The internal/external split mirrors
 * the one lib/faq.js already makes.
 */
const PostLink = ({ href, nodes }) => {
  const children = <Inline nodes={nodes} />;

  if (href.startsWith("/")) {
    return (
      <Link to={href} className="sweep">
        {children}
      </Link>
    );
  }
  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a className="sweep" href={href}>
        {children}
      </a>
    );
  }
  return (
    <a className="sweep" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

/**
 * A figure fills the reading shell, breaking past the prose measure on both
 * sides while sharing its centre axis. `?inset` holds it to the prose measure
 * for something small, and `?ratio=4:5` gives a portrait plate the narrower
 * column, since a tall picture at full width pushes the next paragraph off the
 * screen.
 */
const Figure = ({ block, slug, priority }) => {
  const base = imageBase(slug, block.src);
  // Narrow the column only when the picture is genuinely taller than it is
  // wide. A 21:9 panorama is a ratio too, and it wants the full shell.
  const [w, h] = block.ratio ? block.ratio.split(" / ").map(Number) : [];
  const portrait = Boolean(block.ratio) && h > w;

  // Only a figure that is neither inset nor portrait steps out past the prose.
  const bleed = !block.inset && !portrait;

  return (
    <figure
      className="postfigure"
      data-bleed={bleed ? "true" : undefined}
      data-portrait={portrait ? "true" : undefined}
    >
      <div
        className="postfigure__box"
        style={block.ratio ? { "--figure-ratio": block.ratio } : undefined}
      >
        <PostImage
          base={base}
          widths={FIGURE_WIDTHS}
          /* An inset or portrait figure occupies a much smaller box, so it
             declares its own width rather than asking for the full column. */
          sizes={
            bleed
              ? FIGURE_SIZES
              : portrait
                ? PORTRAIT_FIGURE_SIZES
                : INSET_FIGURE_SIZES
          }
          alt={block.alt}
          priority={priority}
        />
      </div>
      {block.caption && (
        <figcaption className="postfigure__caption">
          <Inline nodes={block.caption} />
        </figcaption>
      )}
    </figure>
  );
};

const Block = ({ block, slug, priority }) => {
  switch (block.type) {
    case "heading":
      return block.level === 3 ? (
        <h3>
          <Inline nodes={block.children} />
        </h3>
      ) : (
        <h2>
          <Inline nodes={block.children} />
        </h2>
      );

    case "paragraph":
      return (
        <p>
          <Inline nodes={block.children} />
        </p>
      );

    case "list":
      return block.ordered ? (
        <ol start={block.start !== 1 ? block.start : undefined}>
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline nodes={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline nodes={item} />
            </li>
          ))}
        </ul>
      );

    case "quote":
      return (
        <blockquote className="postquote">
          {block.paragraphs.map((paragraph, i) => (
            <p key={i}>
              <Inline nodes={paragraph} />
            </p>
          ))}
          {block.cite && (
            <cite className="postquote__cite">
              <Inline nodes={block.cite} />
            </cite>
          )}
        </blockquote>
      );

    case "code":
      // No syntax highlighting. It needs colours outside the pinned palette and
      // a dependency this project does not take.
      return (
        <pre className="postcode" tabIndex={0}>
          <code>{block.value}</code>
        </pre>
      );

    case "figure":
      return <Figure block={block} slug={slug} priority={priority} />;

    default:
      return null;
  }
};

/**
 * `heroPriority` marks the post's FIRST figure as the LCP element, but only
 * when it opens the article. A figure four screens down is not the largest
 * contentful paint and loading it eagerly only delays the text.
 */
const PostBody = ({ blocks, slug }) => {
  const firstFigure = blocks.findIndex((block) => block.type === "figure");
  const heroPriority = firstFigure === 0;

  return (
    <div className="postprose">
      {blocks.map((block, i) => (
        <Block
          key={i}
          block={block}
          slug={slug}
          priority={heroPriority && i === firstFigure}
        />
      ))}
    </div>
  );
};

export default PostBody;
