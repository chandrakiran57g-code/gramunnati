/**
 * Strip HTML tags and decode common entities for plain-text previews.
 * Admin rich-text (Quill) stores values like `<p>Hello</p>` — use this in cards/excerpts.
 */
export function stripHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/li>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function plainTextExcerpt(value, maxLength = 0) {
  const text = stripHtml(value);
  if (!maxLength || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}
