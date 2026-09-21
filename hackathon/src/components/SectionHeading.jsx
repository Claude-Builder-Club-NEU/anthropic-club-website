/**
 * The section heading block (SPEC §2): chip and H2 on the left, a paragraph
 * on the right, both sitting on the same baseline via `align-items: end`.
 *
 * `id` is required, not optional: every section is labelled by its own
 * heading with aria-labelledby, and a section that quietly lost its label
 * would still look right.
 */
export function SectionHeading({ id, chip, title, children }) {
  return (
    <div className="hk-heading">
      <div className="hk-heading__left">
        <span className="hk-chip">{chip}</span>
        <h2 id={id} className="hk-heading__title">
          {title}
        </h2>
      </div>
      <p className="hk-heading__lede">{children}</p>
    </div>
  );
}
