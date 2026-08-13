import { initials, headshotAlt } from "../lib/board";
import {
  LinkedInIcon,
  MailIcon,
  GitHubIcon,
  TikTokIcon,
  ImagePlaceholderIcon,
} from "./Icons";

const WIDTHS = [320, 480, 640];

/**
 * `sizes` tells the browser how wide the image will actually be, so it can
 * pick the smallest adequate file before layout runs. Getting it wrong costs
 * real bytes: an earlier value declared 300px and made the browser fetch the
 * 640 derivative where the 320 would do.
 *
 * Measured, not estimated. Above 1024px the container caps at max-w-6xl, so
 * the card is a fixed width: grid 1024px, 3 columns, 24px gaps -> 325px. The
 * photo is full bleed, so that column width is the image width.
 */
const SIZES =
  "(min-width: 1024px) 330px, (min-width: 640px) 46vw, calc(100vw - 48px)";

const srcset = (slug, ext) =>
  WIDTHS.map((w) => `/board/${slug}-${w}.${ext} ${w}w`).join(", ");

/** "Jackson Lamoureux" -> ["Jackson", "Lamoureux"]. Anything beyond the first
 *  word counts as the surname, so double-barrelled names stay together. */
const splitName = (name) => {
  const parts = name.trim().split(/\s+/);
  return [parts[0], parts.slice(1).join(" ")];
};

/**
 * One board member: a full-bleed headshot fading into a dark card, with the
 * role set above the name in the brand accent.
 *
 * The role is the anchor rather than a caption. Coral measures 5.90:1 against
 * ink, so on this dark card the accent can carry text and still clear AA,
 * which it cannot do on paper.
 *
 * Every headshot is lazy-loaded. The board sits well below the fold on /about
 * and does not exist at all on the other pages, so none of these images are
 * fetched on a normal first visit.
 */
const BoardCard = ({ member }) => {
  const {
    slug,
    name,
    role,
    affiliation,
    major,
    photo,
    linkedin,
    email,
    github,
    tiktok,
  } = member;

  const [firstName, surname] = splitName(name);

  const socials = [
    linkedin && { href: linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    email && { href: `mailto:${email}`, label: "Email", Icon: MailIcon },
    github && { href: github, label: "GitHub", Icon: GitHubIcon },
    tiktok && { href: tiktok, label: "TikTok", Icon: TikTokIcon },
  ].filter(Boolean);

  return (
    <li className="board-card list-none">
      <div className="board-card-inner">
        <div className="board-media">
          {photo ? (
            <picture>
              <source type="image/avif" sizes={SIZES} srcSet={srcset(slug, "avif")} />
              <source type="image/webp" sizes={SIZES} srcSet={srcset(slug, "webp")} />
              <img
                src={`/board/${slug}-480.jpg`}
                srcSet={srcset(slug, "jpg")}
                sizes={SIZES}
                alt={headshotAlt(member)}
                width="640"
                height="640"
                loading="lazy"
                decoding="async"
              />
            </picture>
          ) : (
            <div className="board-media__empty" aria-hidden="true">
              <ImagePlaceholderIcon width={26} height={26} />
              <span
                className="font-display font-semibold tracking-widest text-coral-text"
                style={{ fontSize: "var(--step-meta)" }}
              >
                {initials(name)}
              </span>
            </div>
          )}
          <span className="board-media__fade" aria-hidden="true" />
        </div>

        <div className="board-body">
          <p className="board-role">{role}</p>
          <h3 className="board-name mt-1.5">
            {firstName}
            {surname && <span className="board-name__surname">{surname}</span>}
          </h3>
          {/* Affiliation then major, one per line. Members without an
              affiliation simply omit the line rather than leaving a gap. */}
          <p className="board-detail mt-3">
            {affiliation && (
              <span className="board-detail__line">{affiliation}</span>
            )}
            <span className="board-detail__line">{major}</span>
          </p>

          {socials.length > 0 && (
            <ul className="board-socials mt-5 list-none p-0">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    className="board-social"
                    href={href}
                    aria-label={`${name} on ${label}`}
                    {...(href.startsWith("mailto:")
                      ? { "aria-label": `Email ${name}` }
                      : { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    <Icon width={17} height={17} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
};

export default BoardCard;
