/** @type {import('tailwindcss').Config} */

/**
 * HACK1984 is a spec-exact design: 12.6px ASCII rows, -0.035em headline
 * tracking, 104px schedule rows. Writing those as Tailwind arbitrary values
 * (`text-[12.6px] leading-[13px] tracking-[-0.035em]`) would put the design
 * system in the markup, where a value can drift in one of eight places and
 * nowhere else. So the system lives in src/index.css as named classes over the
 * generated variables in src/styles/tokens.css, and Tailwind is here for the
 * ordinary layout utilities on top of it.
 *
 * The theme below maps Tailwind's scales onto those same variables, so a
 * utility and a component class can never disagree about what `ink` is.
 */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Night theme. tokens.json also carries a Day value for each of these,
        // but SPEC §1 is explicit that the site is dark only, so only Night is
        // emitted. See scripts/build-tokens.mjs.
        ground: "var(--ground)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--line)",
        "line-soft": "var(--line-soft)",
        ink: "var(--ink)",
        "ink-body": "var(--ink-body)",
        "ink-faint": "var(--ink-faint)",
        accent: "var(--accent)",
        "on-accent": "var(--on-accent)",
        "accent-soft": "var(--accent-soft)",

        // Page-level extras from SPEC §1 ("not in tokens").
        "chip-bg": "var(--chip-bg)",
        dash: "var(--dash)",
        "ascii-bg": "var(--ascii-bg)",
        "red-900": "var(--red-900)",
        "red-chip-text": "var(--red-chip-text)",
      },
      fontFamily: {
        retro: "var(--font-retro)",
        display: "var(--font-display)",
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      // SPEC §1: radius 0 everywhere. `rounded` is redefined rather than
      // removed so that typing it by reflex cannot round a corner.
      borderRadius: {
        none: "0",
        DEFAULT: "0",
      },
      // SPEC §1: no shadows and no glows.
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};
