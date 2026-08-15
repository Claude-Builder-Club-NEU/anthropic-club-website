/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Pinned Anthropic brand values. This palette is the client's real
        // brand and must not be substituted.
        paper: "var(--paper)",
        ink: "var(--ink)",
        coral: "var(--coral)",
        "coral-text": "var(--coral-text)",
        "gray-text": "var(--gray-text)",
        "gray-mid": "var(--gray-mid)",
        "gray-light": "var(--gray-light)",
        rule: "var(--rule)",
        blue: "var(--blue)",
        green: "var(--green)",

        // Legacy aliases, remapped onto the new palette so pages awaiting
        // their Phase 2 rebuild render in-brand instead of breaking.
        // Remove these once every page is rebuilt.
        charcoal: "var(--ink)",
        "neutral-light": "var(--gray-light)",
        "neutral-dark": "var(--gray-text)",
      },
      fontFamily: {
        display: ["Poppins", "Arial", "system-ui", "sans-serif"],
        body: ["Lora", "Georgia", "Times New Roman", "serif"],
        // Legacy alias — old markup asks for `font-primary`.
        primary: ["Poppins", "Arial", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: "var(--step-display)",
        "step-1": "var(--step-1)",
        "step-2": "var(--step-2)",
        "step-3": "var(--step-3)",
        lead: "var(--step-lead)",
        body: "var(--step-body)",
        small: "var(--step-small)",
        meta: "var(--step-meta)",
      },
      maxWidth: {
        measure: "var(--measure)",
        "measure-tight": "var(--measure-tight)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
      },
      transitionTimingFunction: {
        sweep: "var(--sweep-ease)",
      },
      transitionDuration: {
        sweep: "150ms",
      },
      // No keyframes and no animation extensions. The site has exactly one
      // motion primitive (the highlighter sweep) and it lives in index.css.
    },
  },
  plugins: [],
};
