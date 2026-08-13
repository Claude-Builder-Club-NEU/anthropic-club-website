import { initials, headshotAlt } from "../lib/board";

/**
 * One board member.
 *
 * The photo slot is a fixed 1:1 box whether or not a photo exists, so adding
 * headshots later causes zero layout shift. Dropping a file at
 * public/board/<slug>.jpg and setting `photo: true` in board.js is the only
 * work required — the responsive derivatives are generated at build time by
 * scripts/build-headshots.mjs.
 *
 * Placeholders are decorative: the member's name sits in the adjacent text, so
 * repeating it as alt text would just be noise for a screen reader. Real
 * photos use the alt pattern the brief specifies.
 */
const BoardCard = ({ member, eager = false }) => {
  const { slug, name, role, detail, photo } = member;

  return (
    <li className="list-none">
      <div
        className="overflow-hidden rounded-lg border border-rule bg-gray-light"
        style={{ aspectRatio: "1 / 1" }}
      >
        {photo ? (
          <picture>
            <source
              type="image/avif"
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
              srcSet={[320, 480, 640, 960]
                .map((w) => `/board/${slug}-${w}.avif ${w}w`)
                .join(", ")}
            />
            <source
              type="image/webp"
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
              srcSet={[320, 480, 640, 960]
                .map((w) => `/board/${slug}-${w}.webp ${w}w`)
                .join(", ")}
            />
            <img
              src={`/board/${slug}-640.jpg`}
              srcSet={[320, 480, 640, 960]
                .map((w) => `/board/${slug}-${w}.jpg ${w}w`)
                .join(", ")}
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
              alt={headshotAlt(member)}
              width="640"
              height="640"
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              {...(eager ? { fetchpriority: "high" } : {})}
              className="h-full w-full object-cover"
            />
          </picture>
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center"
          >
            <span
              className="font-display font-semibold text-coral-text"
              style={{ fontSize: "var(--step-1)", letterSpacing: "0.01em" }}
            >
              {initials(name)}
            </span>
          </div>
        )}
      </div>

      <h3 className="mt-4 text-step-3">{name}</h3>
      {role ? (
        <p className="meta mt-1" style={{ maxWidth: "none" }}>
          {role}
        </p>
      ) : (
        import.meta.env.DEV && (
          <p className="meta mt-1 text-coral-text" style={{ maxWidth: "none" }}>
            TODO: Jackson — role needed
          </p>
        )
      )}
      <p className="mt-2 text-small text-gray-text">{detail}</p>
    </li>
  );
};

export default BoardCard;
