# Brand assets

`claude-spark.svg` is the official **Claude Spark** mark, taken from Anthropic's
public press kit (anthropic.com/news, "Media assets"), file
`Anthropic logos/Claude logos/3 Claude Spark/SVG/Claude Spark - Clay.svg`.
Downloaded 2026-08-13, unmodified.

It is vector, so it stays sharp at any size. The 320x320 PNG it replaced was
soft when scaled up for the hero crop and cost the homepage four Lighthouse
best-practices points under `image-size-responsive`.

Its fill is `#D97757`, which is the same value as the `--coral` token. The
palette in DESIGN.md is Anthropic's real brand value, not an approximation.

## Usage

This club is an official Claude Builder Club chapter, so it may use the Claude
marks per the program's rules. Two things to hold to:

- Do not stretch, recolour, or rotate the mark. Scale it proportionally.
- Do not use it in a way that implies the site speaks for Anthropic. The footer
  affiliation line exists to keep that boundary explicit.

The press kit also contains the "Claude" wordmark, the Claude Code logo, and the
Claude app icon. They are deliberately not vendored here: the wordmark is
Anthropic's product lockup, and using it as this club's identity would overstate
the relationship. Pull them from the press kit if a specific need arises.

## anthropic-wordmark.svg

The official Anthropic wordmark, same press kit, file
`Anthropic logos/1 Anthropic logo/SVG/Anthropic logo - Slate.svg`, unmodified.
Used once, set inline in the hero's opening sentence in place of the word
"Anthropic". The image carries `alt="Anthropic"`, so the sentence still reads
correctly to a screen reader.

Its fill is `#141413`, identical to the `--ink` token, which is a second
confirmation that this palette holds Anthropic's real brand values.

Because it is a logo, its lettering is Anthropic's own typeface drawn as vector
paths. That is the only lawful way to show their type here: the live faces
(Styrene, Tiempos, Copernicus) are commercially licensed and must not be
sourced or self-hosted, per the original brief.

The press kit also carries the Anthropic symbol (the "A\" glyph), the Claude
wordmark, Claude Code logo, and the Claude app icon. None are vendored, because
nothing on the site currently needs them and unused trademarked assets should
not sit in the repository.
