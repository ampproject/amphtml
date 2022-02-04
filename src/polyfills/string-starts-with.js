/**
 * Return true if string begins with the characters of the specified string.
 * Polyfill copied from MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/string/startsWith
 *
 * @param {string} search
 * @param {number=} rawPos
 * @return {boolean}
 * @this {string}
 */
function startsWith(search, rawPos) {
  const pos = rawPos > 0 ? rawPos | 0 : 0;
  // eslint-disable-next-line local/no-invalid-this
  return this.substr(pos, search.length) === search;
}

/**
 * Sets the String.startsWith polyfill if it does not exist.
 * @param {!Window} win
 */
export function install(win) {
  if (!win.String.prototype.startsWith) {
    win.Object.defineProperty(win.String.prototype, 'startsWith', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: startsWith,
    });
  }
}
