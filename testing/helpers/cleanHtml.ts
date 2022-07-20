/**
 * Simple logic for cleaning attributes from html.
 * Useful for creating "snapshots" in tests.
 * @param html - A string of HTML
 * @param [keepAttrs] - An optional array of attributes to keep
 */
export function cleanHtml(html: string, keepAttrs?: string[]): string {
  html = html.replace(/\s([-\w]+)(="[^"]*")/g, ($0, $attr) => {
    return keepAttrs?.includes($attr) ? $0 : '';
  });

  // Condense whitespace:
  html = cleanWhitespace(html);

  return html;
}

export function cleanWhitespace(html: string): string {
  return html.trim().replace(/\s\s+/g, ' ');
}
