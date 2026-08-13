import claudeSpark from "../assets/brand/claude-spark.svg";

/**
 * Signage adapted from Anthropic's own pages.
 *
 * Their layouts lean on a small tracked label, a hairline rule running across
 * the gap, and a value on the far side. It reads as a specification sheet
 * rather than marketing, which is exactly the register this site wants.
 *
 * These are patterns, not copied assets. The only borrowed artwork is the
 * Claude Spark, which is the club's own mark as an official chapter.
 */

/** The Claude Spark as a small opener above a section heading. */
export const SectionMark = () => (
  <img src={claudeSpark} alt="" aria-hidden="true" className="section-mark" />
);

/**
 * LABEL ————————————— value
 *
 * Use it for facts that are genuinely fixed. It looks authoritative, so it
 * should never carry anything unconfirmed.
 */
export const SpecRow = ({ label, value }) => (
  <div className="spec-row">
    <span className="meta spec-row__label">{label}</span>
    <span className="spec-row__fill" aria-hidden="true" />
    <span className="spec-row__value">{value}</span>
  </div>
);

/** A group of SpecRows, closed off with a final rule. */
export const SpecList = ({ children, className = "" }) => (
  <div className={`border-b border-rule ${className}`}>{children}</div>
);
