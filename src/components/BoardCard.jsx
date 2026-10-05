import { initials, headshotAlt, AMBASSADOR_TITLE } from "../lib/board";
import claudeSpark from "../assets/brand/claude-spark.svg";
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
 * real bytes.
 *
 * Four across from 768px, two across below, with 24px column gaps inside the
 * content column: 1024px from 1152px up, so (1024 - 72) / 4 = 238px. Below
 * that the column tracks the 64 / 40 / 24px insets in force.
 */
const SIZES =
  "(min-width: 1152px) 238px, (min-width: 1024px) calc((100vw - 200px) / 4), (min-width: 768px) calc((100vw - 152px) / 4), (min-width: 640px) calc((100vw - 104px) / 2), calc((100vw - 72px) / 2)";

const srcset = (slug, ext) =>
  WIDTHS.map((w) => `/board/${slug}-${w}.${ext} ${w}w`).join(", ");
/**
 * One board member: a square headshot on the oat ground, then the name, the
 * role in Burnt Terracotta, the detail lines and the social marks. No card
 * surface: the photo is the object, and the type hangs under it.
 *
 * A Claude Ambassador carries a paper tag, the Claude Spark and "Ambassador",
 * pinned in the headshot's top left corner. The visible tag is aria-hidden,
 * and the full title follows the heading as visually hidden text, so a
 * screen reader meets it after the name rather than before it.
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
    secondAffiliation,
    major,
    photo,
    ambassador,
    linkedin,
    email,
    github,
    tiktok,
  } = member;

  /**
   * The detail block, one entry per line: affiliation, an optional second
   * affiliation, then the major. Filtering a list here rather than testing
   * each line in the JSX keeps the third line data instead of a special case
   * for one person; the card renders exactly as many rows as a member has.
   * The degree closes every card in the set, so an extra credential goes
   * above it, never after it.
   */
  const detailLines = [affiliation, secondAffiliation, major].filter(Boolean);

  const socials = [
    linkedin && { href: linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    email && { href: `mailto:${email}`, label: "Email", Icon: MailIcon },
    github && { href: github, label: "GitHub", Icon: GitHubIcon },
    tiktok && { href: tiktok, label: "TikTok", Icon: TikTokIcon },
  ].filter(Boolean);

  return (
    <li className="board-card list-none">
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
            <ImagePlaceholderIcon width={22} height={22} />
            <span
              className="font-display font-semibold tracking-widest text-coral-text"
              style={{ fontSize: "var(--step-meta)" }}
            >
              {initials(name)}
            </span>
          </div>
        )}
        {ambassador && (
          <span className="board-badge" aria-hidden="true">
            <img src={claudeSpark} alt="" width="13" height="13" />
            Ambassador
          </span>
        )}
      </div>

      <h3 className="board-name">{name}</h3>
      {ambassador && <p className="sr-only">{AMBASSADOR_TITLE}</p>}
      <p className="board-role">{role}</p>

      {detailLines.length > 0 && (
        <p className="board-detail">
          {detailLines.map((line) => (
            <span key={line} className="board-detail__line">
              {line}
            </span>
          ))}
        </p>
      )}

      {socials.length > 0 && (
        <ul className="board-socials list-none p-0">
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
                <Icon width={16} height={16} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default BoardCard;
