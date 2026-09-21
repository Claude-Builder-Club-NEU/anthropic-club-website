/**
 * "HACK" in ink and "1984" in accent, set in Workbench (SPEC §2).
 *
 * The two halves are separate spans rather than one styled string because the
 * colour split is the mark. `as` lets the hero render it inside its <h1> while
 * the header and footer render a plain span.
 */
export function Wordmark({ as: Tag = "span", className = "hk-wordmark", ...rest }) {
  return (
    <Tag className={className} {...rest}>
      HACK<span className="hk-wordmark__year">1984</span>
    </Tag>
  );
}
