export function cleanHtml(html, keepAttrs) {
  // Simple logic to clean attributes from HTML:
  html = html.replace(/\s([-\w]+)(="[^"]*")/g, ($0, $attr) => {
    return keepAttrs?.includes($attr) ? $0 : '';
  });

  // Condense whitespace:
  html = html.trim().replace(/\s\s+/g, ' ');

  return html;
}
