/**
 * Returns true if the element is in the array and false otherwise.
 *
 * @param {*} value
 * @param {number=} opt_fromIndex
 * @return {boolean}
 * @this {Array}
 */
function includes(value, opt_fromIndex) {
  const fromIndex = opt_fromIndex || 0;
  // eslint-disable-next-line local/no-invalid-this
  const len = this.length;
  let i = fromIndex >= 0 ? fromIndex : Math.max(len + fromIndex, 0);
  for (; i < len; i++) {
    // eslint-disable-next-line local/no-invalid-this
    const other = this[i];
    // If value has been found OR (value is NaN AND other is NaN)
    /*eslint "no-self-compare": 0*/
    if (other === value || (value !== value && other !== other)) {
      return true;
    }
  }
  return false;
}

/**
 * Sets the Array.contains polyfill if it does not exist.
 * @param {!Window} win
 */
export function install(win) {
  if (!win.Array.prototype.includes) {
    win.Object.defineProperty(win.Array.prototype, 'includes', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: includes,
    });
  }
}
