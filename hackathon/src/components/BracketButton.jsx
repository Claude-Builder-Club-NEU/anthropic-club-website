/**
 * The bracket button (SPEC §2).
 *
 * The brackets are CSS pseudo-elements, not characters in the label, so the
 * label reads as "Sign up" to a screen reader rather than "left bracket sign
 * up right bracket", and so the hover animation has something to move.
 *
 * Renders an <a> when given an href and a <button> otherwise. SPEC §4 asks
 * for real controls, and a <div> with a click handler is neither.
 */
export function BracketButton({ href, small = false, className = "", children, ...rest }) {
  const classes = ["hk-btn", small && "hk-sm", className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a className={classes} href={href} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} type="button" {...rest}>
      {children}
    </button>
  );
}
