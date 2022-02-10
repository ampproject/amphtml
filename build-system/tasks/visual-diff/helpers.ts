const HTML_ESCAPE_CHARS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
};
const HTML_ESCAPE_REGEX = /(&|<|>|"|'|`)/g;

/**
 * Escapes a string of HTML elements to HTML entities.
 *
 * @param html HTML as string to escape.
 */
export function escapeHtml(html: string): string {
  return html.replace(HTML_ESCAPE_REGEX, (c) => HTML_ESCAPE_CHARS[c]);
}

/**
 * Returns a Promise that resolves after the specified number of milliseconds.
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
