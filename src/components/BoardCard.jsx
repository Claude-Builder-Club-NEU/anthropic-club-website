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
 * These are measured, not estimated. Above 1024px the container caps at
 * max-w-6xl, so the slot is a fixed width:
 *   grid 1024px, 4 columns, 20px gaps  ->  column 241px
 *   column minus the wrap's 2 x 16px padding  ->  209px slot
 * Between 640 and 1023 it is a 2-column grid at roughly 42vw, and below 640 a
 * single column filling the viewport less the 24px page padding and 16px wrap
 * padding on each side.
 */
const SIZES =
  "(min-width: 1024px) 210px, (min-width: 640px) 42vw, calc(100vw - 80px)";

const srcset = (slug, ext) =>
  WIDTHS.map((w) => `/board/${slug}-${w}.${ext} ${w}w`).join(", ");

/**
 * One board member: a light photo slot at the top of a dark card, with the
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
  const { slug, name, role, detail, photo, linkedin, email, github, tiktok } =
    member;

  const socials = [
    linkedin && { href: linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    email && { href: `mailto:${email}`, label: "Email", Icon: MailIcon },
    github && { href: github, label: "GitHub", Icon: GitHubIcon },
    tiktok && { href: tiktok, label: "TikTok", Icon: TikTokIcon },
  ].filter(Boolean);

  return (
    <li className="board-card list-none">
      <div className="board-card-inner">
        <div className="board-slot-wrap">
          {photo ? (
            <div className="board-slot board-slot--filled">
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

          {socials.length > 0 && (
            <ul className="mt-4 flex list-none flex-wrap items-center gap-x-4 gap-y-2 p-0">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    className="board-link inline-flex items-center gap-1.5 text-meta no-underline sweep"
                    href={href}
                    {...(href.startsWith("mailto:")
                      ? {}
                      : { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    <Icon width={15} height={15} />
                    <span>{label}</span>
                    <span className="sr-only">
                      {label === "Email" ? ` ${name}` : ` profile for ${name}`}
                    </span>
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
