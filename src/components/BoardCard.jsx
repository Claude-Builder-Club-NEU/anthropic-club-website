import { initials, headshotAlt } from "../lib/board";
import { LinkedInIcon, MailIcon, ImagePlaceholderIcon } from "./Icons";

const WIDTHS = [320, 480, 640, 960];
const SIZES = "(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw";

/**
 * One board member, built to the supplied reference: a light photo slot at the
 * top of a dark card, with the role set above the name in the brand accent.
 *
 * The role is the anchor rather than a caption. Coral measures 5.90:1 against
 * ink, so on this dark card the accent can carry text and still clear AA,
 * which it cannot do on paper.
 *
 * The reference also shows an "or browse files" control. That is deliberately
 * not built: the site has no write path and no backend, so a browse affordance
 * would do nothing when clicked. The dashed slot and the initials communicate
 * "photo pending" without promising an action that does not exist.
 *
 * Adding a headshot stays a two-step change: drop the file at
 * public/board/<slug>.jpg and set `photo: true` in board.js.
 */
const BoardCard = ({ member, eager = false, lead = false }) => {
  const { slug, name, role, detail, photo, linkedin, email } = member;

  return (
    <li className={`board-card list-none ${lead ? "board-card--lead" : ""}`}>
      <div className="board-card-inner">
        <div className="board-slot-wrap">
        {photo ? (
          <div className="board-slot board-slot--filled">
            <picture>
              <source
                type="image/avif"
                sizes={SIZES}
                srcSet={WIDTHS.map((w) => `/board/${slug}-${w}.avif ${w}w`).join(", ")}
              />
              <source
                type="image/webp"
                sizes={SIZES}
                srcSet={WIDTHS.map((w) => `/board/${slug}-${w}.webp ${w}w`).join(", ")}
              />
              <img
                src={`/board/${slug}-640.jpg`}
                srcSet={WIDTHS.map((w) => `/board/${slug}-${w}.jpg ${w}w`).join(", ")}
                sizes={SIZES}
                alt={headshotAlt(member)}
                width="640"
                height="640"
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                {...(eager ? { fetchpriority: "high" } : {})}
                className="h-full w-full object-cover"
              />
            </picture>
          </div>
        ) : (
          <div className="board-slot board-slot--empty" aria-hidden="true">
            <ImagePlaceholderIcon width={26} height={26} />
            <span
              className="font-display font-semibold tracking-widest text-coral-text"
              style={{ fontSize: "var(--step-meta)" }}
            >
              {initials(name)}
            </span>
          </div>
        )}
        </div>

        <div className="board-body">
          <p className="board-role">{role}</p>
          <h3 className="board-name mt-1.5">{name}</h3>
          <p className="board-detail mt-3">{detail}</p>

          {(linkedin || email) && (
            <ul className="mt-4 flex list-none flex-wrap gap-4 p-0">
              {linkedin && (
                <li>
                  <a
                    className="board-link inline-flex items-center gap-1.5 text-meta no-underline sweep"
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkedInIcon width={15} height={15} />
                    <span>LinkedIn</span>
                    <span className="sr-only"> profile for {name}</span>
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a
                    className="board-link inline-flex items-center gap-1.5 text-meta no-underline sweep"
                    href={`mailto:${email}`}
                  >
                    <MailIcon width={15} height={15} />
                    <span>Email</span>
                    <span className="sr-only"> {name}</span>
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
};

export default BoardCard;
