/**
 * The section heading block (SPEC §2): the chip, the H2 and a paragraph,
 * centred in one column, then the section's buttons if it passes `actions`.
 *
 * `id` is required, not optional: every section is labelled by its own
 * heading with aria-labelledby, and a section that quietly lost its label
 * would still look right.
 */
export function SectionHeading({ id, chip, title, actions, children }) {
  return (
    <div className="hk-heading">
      <div className="hk-heading__left">
        <span className="hk-chip">{chip}</span>
        <h2 id={id} className="hk-heading__title">
          {title}
        </h2>
      </div>
      {children ? <p className="hk-heading__lede">{children}</p> : null}
      {actions ? <div className="hk-heading__actions">{actions}</div> : null}
    </div>
  );
}
