'use strict';

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
 * @param {string} html HTML as string to escape.
 * @return {string}
 */
function escapeHtml(html) {
  return html.replace(HTML_ESCAPE_REGEX, (c) => HTML_ESCAPE_CHARS[c]);
}

/**
 * Returns a Promise that resolves after the specified number of milliseconds.
 * @param {number} ms
 * @return {Promise<void>}
 */
async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

module.exports = {
  escapeHtml,
  sleep,
};
