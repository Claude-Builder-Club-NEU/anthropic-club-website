/**
 * Small text helpers for copy built from data, so a count or a list in a
 * sentence follows the data instead of being typed next to it.
 */

const COUNT_WORDS = [
  "no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen", "twenty",
];

/** 14 → "fourteen". Past twenty, the digits. */
export const inWords = (n) => COUNT_WORDS[n] ?? String(n);

export const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);
