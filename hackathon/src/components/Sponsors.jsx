import { AsciiPanel } from "./AsciiPanel";
import { withBase } from "../lib/base";
import { SPONSOR_TIERS } from "../lib/sponsors";

/**
 * 3.3 Sponsors.
 *
 * A banner, then two tiers, each a chip over a row of cells divided by
 * dashed hairlines.
 *
 * The banner replaced a drawn mark. Three of those came and went — a pixel
 * eye, a vector eye, a bracketed aperture — and the honest read is that this
 * page does not want a logo standing on its own in the middle of a section.
 * It wants what the track panels have: a wide abstract field of characters.
 * The wordmark carries the brand in the header and the footer; here the
 * artwork does.
 *
 * The section is labelled rather than headed. Its two <h2>s are the tier
 * names, which is how the reference render marks them up and is the honest
 * structure: "BACKED BY" and "WITH SUPPORT FROM" are the headings a reader
 * actually navigates by here.
 */
export function Sponsors() {
  return (
    <section id="sponsors" aria-label="Sponsors" className="hk-sponsors">
      <div className="hk-sponsors__banner hk-bleed">
        <AsciiPanel art="masthead" bare />
      </div>

      {SPONSOR_TIERS.map((tier, tierIndex) => (
        <Tier key={tier.label} tier={tier} first={tierIndex === 0} />
      ))}
    </section>
  );
}

function Tier({ tier, first }) {
  const labelClass = [
    "hk-chip",
    "hk-sponsors__label",
    !first && "hk-sponsors__label--second",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <h2 className={labelClass}>{tier.label}</h2>
      <div className="hk-sponsors__tier">
        {tier.logos.map((logo, i) => (
          // The cells are placeholders with nothing to key on yet. The array
          // is fixed-length and never reordered, so the index is stable.
          <div className="hk-sponsors__cell" key={logo?.src ?? i}>
            {logo ? (
              <img
                className="hk-sponsors__logo"
                src={withBase(logo.src)}
                alt={logo.alt}
                height={logo.height}
              />
            ) : (
              <span className="hk-sponsors__placeholder">[SPONSOR LOGO]</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
