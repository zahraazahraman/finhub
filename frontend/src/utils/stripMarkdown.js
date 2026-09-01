// ── stripMarkdown ──
// The AI chat is displayed as plain text (no markdown renderer), and the model
// is instructed to reply in plain text. But gpt-oss has a strong markdown habit
// and occasionally slips symbols through (**bold**, # headers, | tables, etc.),
// and older messages saved before the plain-text instruction still contain them.
// This turns any markdown that reaches the UI back into clean, readable text so
// the user never sees raw symbols. Deterministic, dependency-free.
//
// Note: this intentionally *removes* formatting rather than rendering it. If the
// chat ever adopts a real markdown renderer, drop this and render instead.
export function stripMarkdown(input) {
  if (!input) return "";
  let text = String(input);

  // Fenced code blocks ```lang ... ``` → keep the inner code, drop the fences.
  text = text.replace(/```[a-zA-Z0-9]*\n?([\s\S]*?)```/g, "$1");

  // Inline code `x` → x
  text = text.replace(/`([^`]+)`/g, "$1");

  // Images ![alt](url) → alt   (before links, since syntax overlaps)
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  // Links [text](url) → text
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  // Bold **x** / __x__ → x   (before italic so the doubles are consumed first)
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  // Italic *x* / _x_ → x  (guarded so intra-word * and _ are left alone)
  text = text.replace(/(^|[^*\w])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![*\w])/g, "$1$2");
  text = text.replace(/(^|[^_\w])_(?!\s)([^_\n]+?)(?<!\s)_(?![_\w])/g, "$1$2");
  // Strikethrough ~~x~~ → x
  text = text.replace(/~~([^~]+)~~/g, "$1");

  // Line-level cleanups
  text = text
    .split("\n")
    .map((line) => {
      // Horizontal rules (---, ***, ___) → blank line
      if (/^\s*([-*_])\1{2,}\s*$/.test(line)) return "";
      // Table separator rows (|---|:--:|) → drop entirely
      if (/^\s*\|?[\s:|-]+\|\s*[\s:|-]*$/.test(line) && line.includes("-")) return null;
      // Headings  ## Title → Title
      line = line.replace(/^\s{0,3}#{1,6}\s+/, "");
      // Blockquotes  > text → text
      line = line.replace(/^\s{0,3}>\s?/, "");
      // Normalize bullet markers  "* " / "+ " → "- "
      line = line.replace(/^(\s*)[*+]\s+/, "$1- ");
      // Table data rows  | a | b |  → a — b
      if (line.includes("|")) {
        const cells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
        if (cells.length > 1) line = cells.join(" — ");
      }
      return line;
    })
    .filter((line) => line !== null)
    .join("\n");

  // Collapse 3+ blank lines into a single blank line
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}
