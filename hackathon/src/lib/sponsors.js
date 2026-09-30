/**
 * Sponsor tiers (SPEC §3.3).
 *
 * PLACEHOLDER (SPEC §5): every logo. The cells hold "[SPONSOR LOGO]" until
 * real artwork lands, so the row widths are already correct when it does.
 *
 * To fill a cell, replace its `null` with { src, alt, height }. SPEC §3.3 asks
 * for monochrome white logos about 28–32px tall; Sponsors.jsx clamps to that
 * range so one oversized file cannot break the 68px row.
 *
 * Anthropic is the club repo's own wordmark (src/assets/brand/, the official
 * artwork) with its fill switched to white, like the organizer logos. It is
 * 20px and not 28–32 because it is all capitals at 8.7:1 — every pixel of its
 * height is cap height, so 20 sits level with a 30px mark that has a symbol.
 *
 * Tavily is the artwork Tavily supplied (the "tavily by NEBIUS" lockup),
 * converted to white with the shape in the alpha channel, so the icon's arrows
 * are knocked out to the page behind them. 32px, because it is two lines and
 * carries a symbol.
 */
export const SPONSOR_TIERS = [
  {
    label: "BACKED BY",
    logos: [
      { src: "logos/anthropic.svg", alt: "Anthropic", height: 20 },
      { src: "logos/tavily.png", alt: "Tavily by Nebius", height: 32 },
      null,
    ],
  },
  { label: "WITH SUPPORT FROM", logos: [null, null, null, null, null] },
];
