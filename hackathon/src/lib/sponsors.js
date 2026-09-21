/**
 * Sponsor tiers (SPEC §3.3).
 *
 * PLACEHOLDER (SPEC §5): every logo. The cells hold "[SPONSOR LOGO]" until
 * real artwork lands, so the row widths are already correct when it does.
 *
 * To fill a cell, replace its `null` with { src, alt, height }. SPEC §3.3 asks
 * for monochrome white logos about 28–32px tall; Sponsors.jsx clamps to that
 * range so one oversized file cannot break the 68px row.
 */
export const SPONSOR_TIERS = [
  { label: "BACKED BY", logos: [null, null, null] },
  { label: "WITH SUPPORT FROM", logos: [null, null, null, null, null] },
];
