export function cleanHtml(html) {
  // Simple logic to clean attributes from HTML:
  html = html.replace(/\s([-\w]+)(="[^"]*")/g, '');

  // Condense whitespace:
  html = html.trim().replace(/\s\s+/g, ' ');

  return html;
}
