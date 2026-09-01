/**
 * A very small markdown parser, written for this site rather than installed.
 *
 * Two stages, deliberately: parse to a plain-object tree here, render that tree
 * to React elements in components/PostBody.jsx. The split is what lets
 * lib/blog.js derive an excerpt and lib/seo.js derive a description from the
 * same source the page renders, without either of them touching React. It is
 * also why this file carries no JSX: `vite build --ssr` refuses JSX in a .js
 * file, and seo.js pulls this module into the prerender bundle.
 *
 * The renderer emits ELEMENTS, never dangerouslySetInnerHTML, so a post cannot
 * inject markup. React escapes text nodes, which is the whole safety argument.
 * If something ever renders as literal text when it should not, the fix is in
 * the supported subset below, never in reaching for raw HTML.
 *
 * SUPPORTED SUBSET. This list is the contract with whoever writes a post.
 *
 *   Blocks
 *     `##` heading, `###` heading. `#` is also a heading and never an h1:
 *          the post title from the frontmatter is the page's only h1.
 *     blank-line separated paragraphs
 *     `- ` unordered list, `1. ` ordered list
 *     `> ` blockquote; a line inside it beginning `> :: ` is the attribution
 *     ``` fenced code, optional language word, contents never scanned
 *     a line that is exactly an image, `![alt](file.jpg "caption")`, is a figure
 *     `---` alone on a line is a paragraph break and renders nothing: the
 *          design system has no horizontal rule inside prose
 *
 *   Inline, inside paragraphs, headings, list items and quotes
 *     `**bold**`, `*italic*`, `` `code` ``, `[text](href)`
 *     backslash escapes for the punctuation those markers use
 *
 *   NOT supported, on purpose
 *     `_italic_`   a builders club pastes snake_case identifiers into prose and
 *                  underscore emphasis would italicise the middle of them
 *     raw HTML, tables, footnotes, reference links, nested lists, task lists,
 *     setext headings, autolinks, inline images
 */

/* ------------------------------------------------------------------------ *
 * Frontmatter
 *
 * A restricted key/value header, NOT YAML. One `key: value` per line, no
 * nesting, no lists, no multi-line values. Calling it YAML would invite a
 * nested block that this cannot read.
 * ------------------------------------------------------------------------ */

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** @returns {{data: Record<string, string|boolean>, body: string}} */
export function parseFrontmatter(raw) {
  const source = String(raw).replace(/^\uFEFF/, "");
  const match = FRONTMATTER.exec(source);
  if (!match) return { data: {}, body: source };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const at = line.indexOf(":");
    if (at < 1) continue;
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    // Quotes are stripped so a value containing a colon can still be written.
    const quoted =
      value.length > 1 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")));
    if (quoted) value = value.slice(1, -1);
    data[key] = value === "true" ? true : value === "false" ? false : value;
  }

  return { data, body: source.slice(match[0].length) };
}

/* ------------------------------------------------------------------------ *
 * Inline
 * ------------------------------------------------------------------------ */

const ESCAPABLE = "\\`*[]()!#>-";
const LINK = /^\[([^\]]*)\]\(([^)\s]+)\)/;

/**
 * Every other marker here closes with indexOf, which is linear over the whole
 * paragraph. A bracket cannot: it needs the regex. Without a guard, each `[`
 * that never closes makes `[^\]]*` scan to the end of the string and backtrack,
 * so a paragraph full of unmatched brackets is quadratic. Once there is no `]`
 * left after some position, no later `[` can match either, so the first failure
 * is remembered and every bracket past it skips the regex entirely.
 *
 * Measured on a 128KB paragraph of unmatched brackets: 3.4s before, 0.4ms
 * after. Nothing here is reachable from user input, so this is hygiene rather
 * than a live hazard, but it costs three lines.
 */

/**
 * A cursor loop rather than a chain of regex replacements, so a marker that
 * never closes falls through to literal text instead of eating the rest of the
 * paragraph. A malformed post should look wrong, not render blank.
 *
 * @returns {Array<object>}
 */
export function parseInline(text) {
  const out = [];
  let buf = "";
  let i = 0;
  // The first `[` position from which no closing `]` exists. See LINK above.
  let noCloserFrom = Infinity;

  const flush = () => {
    if (buf) {
      out.push({ type: "text", value: buf });
      buf = "";
    }
  };

  while (i < text.length) {
    const ch = text[i];

    if (ch === "\\" && ESCAPABLE.includes(text[i + 1])) {
      buf += text[i + 1];
      i += 2;
      continue;
    }

    // Code first, so a bold marker inside a code span is never emphasis.
    if (ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > i) {
        flush();
        out.push({ type: "code", value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (ch === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end > i + 1) {
        flush();
        out.push({
          type: "strong",
          children: parseInline(text.slice(i + 2, end)),
        });
        i = end + 2;
        continue;
      }
    }

    if (ch === "*") {
      const end = text.indexOf("*", i + 1);
      if (end > i + 1) {
        flush();
        out.push({ type: "em", children: parseInline(text.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    if (ch === "[" && i < noCloserFrom) {
      if (text.indexOf("]", i + 1) === -1) {
        noCloserFrom = i;
      } else {
        const match = LINK.exec(text.slice(i));
        if (match) {
          flush();
          out.push({
            type: "link",
            href: match[2],
            children: parseInline(match[1]),
          });
          i += match[0].length;
          continue;
        }
      }
    }

    buf += ch;
    i += 1;
  }

  flush();
  return out;
}

/* ------------------------------------------------------------------------ *
 * Figures
 *
 * A figure src is a bare filename that resolves against the post's own image
 * folder, so a post never hardcodes a derivative path. Options ride on a query
 * string because markdown has nowhere else to put them:
 *
 *   ![Alt text](whiteboard.jpg "A caption")
 *   ![Alt text](poster.jpg?ratio=4:5)        a portrait plate, narrower column
 *   ![Alt text](screenshot.png?inset)        held to the prose measure
 *
 * `ratio` is written with a colon and converted to the CSS aspect-ratio form.
 * Anything unrecognised is ignored rather than rendered.
 * ------------------------------------------------------------------------ */

const FIGURE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/;
const RATIO = /^\d+(\.\d+)?:\d+(\.\d+)?$/;

function figureFrom(match) {
  const [, alt, target, caption] = match;
  const [src, query = ""] = target.split("?");
  const params = new URLSearchParams(query);
  const ratio = params.get("ratio");

  return {
    type: "figure",
    src,
    alt,
    caption: caption ? parseInline(caption) : null,
    ratio: ratio && RATIO.test(ratio) ? ratio.replace(":", " / ") : null,
    inset: params.has("inset"),
  };
}

/* ------------------------------------------------------------------------ *
 * Blocks
 * ------------------------------------------------------------------------ */

const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^-\s+(.*)$/;
const NUMBER = /^(\d+)\.\s+(.*)$/;
/**
 * The opener matches ANY line beginning with a fence, and the language is
 * validated separately.
 *
 * It used to constrain the info string to a word, which meant a common fence
 * like the one Docusaurus writes, three backticks then `js title="app.js"`,
 * did not open a block. Because the closing fence DOES match on a bare prefix,
 * the closer then opened a block of its own that ran to the end of the file,
 * and every heading, list and paragraph after the snippet vanished into one
 * `pre` with a clean build and no warning. An unrecognised info word must cost
 * the `lang` attribute and nothing else.
 */
const FENCE = /^```(.*)$/;
const LANG = /^[A-Za-z0-9+#.-]+$/;
const QUOTE = /^>\s?(.*)$/;
const CITE = /^::\s+(.*)$/;
const BREAK = /^-{3,}$/;

/**
 * @param {string} src markdown with the frontmatter already stripped
 * @returns {Array<object>} blocks
 */
export function parseMarkdown(src) {
  const lines = String(src).replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  const blank = (line) => line.trim() === "";
  // BREAK is tested before BULLET, because a separator must never open a list.
  const opensBlock = (line) =>
    HEADING.test(line) ||
    FENCE.test(line) ||
    QUOTE.test(line) ||
    BREAK.test(line.trim()) ||
    BULLET.test(line) ||
    NUMBER.test(line) ||
    FIGURE.test(line.trim());

  while (i < lines.length) {
    const line = lines[i];

    if (blank(line)) {
      i += 1;
      continue;
    }

    // A separator renders nothing. The system has no rule inside prose, and
    // dropping one is better than inventing a component for it.
    if (BREAK.test(line.trim())) {
      i += 1;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const body = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // the closing fence, or the end of the file
      const word = fence[1].trim().split(/\s+/)[0] || "";
      blocks.push({
        type: "code",
        lang: LANG.test(word) ? word : null,
        value: body.join("\n"),
      });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      // One hash and two hashes both land on h2: the frontmatter title owns the
      // page's only h1.
      blocks.push({
        type: "heading",
        level: heading[1].length >= 3 ? 3 : 2,
        children: parseInline(heading[2].trim()),
      });
      i += 1;
      continue;
    }

    const figure = FIGURE.exec(line.trim());
    if (figure) {
      blocks.push(figureFrom(figure));
      i += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const paragraphs = [];
      let current = [];
      let cite = null;
      while (i < lines.length && QUOTE.test(lines[i])) {
        const inner = QUOTE.exec(lines[i])[1];
        const attribution = CITE.exec(inner.trim());
        if (attribution) {
          cite = parseInline(attribution[1].trim());
        } else if (blank(inner)) {
          if (current.length) paragraphs.push(current.join(" "));
          current = [];
        } else {
          current.push(inner.trim());
        }
        i += 1;
      }
      if (current.length) paragraphs.push(current.join(" "));
      blocks.push({
        type: "quote",
        paragraphs: paragraphs.map(parseInline),
        cite,
      });
      continue;
    }

    if (BULLET.test(line) || NUMBER.test(line)) {
      const ordered = NUMBER.test(line);
      const pattern = ordered ? NUMBER : BULLET;
      const start = ordered ? Number(NUMBER.exec(line)[1]) : 1;
      const items = [];
      while (i < lines.length && pattern.test(lines[i])) {
        const match = pattern.exec(lines[i]);
        const parts = [ordered ? match[2] : match[1]];
        i += 1;
        // A wrapped item continues on an indented line.
        while (
          i < lines.length &&
          /^\s+\S/.test(lines[i]) &&
          !pattern.test(lines[i])
        ) {
          parts.push(lines[i].trim());
          i += 1;
        }
        items.push(parseInline(parts.join(" ")));
      }
      blocks.push({ type: "list", ordered, start, items });
      continue;
    }

    // Everything else is a paragraph, running until a blank line or the start
    // of a block that is not one.
    const parts = [];
    while (i < lines.length && !blank(lines[i]) && !opensBlock(lines[i])) {
      parts.push(lines[i].trim());
      i += 1;
    }
    if (parts.length) {
      blocks.push({ type: "paragraph", children: parseInline(parts.join(" ")) });
    } else {
      // Defensive: a line that opens a block but was not consumed above would
      // otherwise spin here forever.
      i += 1;
    }
  }

  return blocks;
}

/* ------------------------------------------------------------------------ *
 * Plain text
 *
 * Needed by three consumers that must never see markup: the derived excerpt,
 * the route's meta description, and the JSON-LD. Digging the same text back
 * out of React elements is the thing the two-stage parse exists to avoid.
 * ------------------------------------------------------------------------ */

function inlineText(nodes) {
  return (nodes || [])
    .map((node) =>
      node.type === "text" || node.type === "code"
        ? node.value
        : inlineText(node.children)
    )
    .join("");
}

/**
 * @param {Array<object>} blocks
 * @param {{skipCode?: boolean}} [options]
 */
export function textOf(blocks, options = {}) {
  const { skipCode = true } = options;
  const pieces = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
      case "paragraph":
        pieces.push(inlineText(block.children));
        break;
      case "list":
        pieces.push(block.items.map(inlineText).join(" "));
        break;
      case "quote":
        pieces.push(block.paragraphs.map(inlineText).join(" "));
        break;
      case "code":
        if (!skipCode) pieces.push(block.value);
        break;
      default:
        break;
    }
  }

  return pieces.join(" ").replace(/\s+/g, " ").trim();
}

/** The first real paragraph, as plain text. The derived excerpt starts here. */
export function firstParagraphText(blocks) {
  const first = blocks.find((block) => block.type === "paragraph");
  return first ? inlineText(first.children).replace(/\s+/g, " ").trim() : "";
}
