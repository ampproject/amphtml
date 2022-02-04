/**
 * Implements `Object.values` API.
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values.
 *
 * @param {!Object} target
 * @return {!Array<*>}
 */
export function values(target) {
  return Object.keys(target).map((k) => target[k]);
}

/**
 * Sets the Object.values polyfill if it does not exist.
 * @param {!Window} win
 */
export function install(win) {
  if (!win.Object.values) {
    win.Object.defineProperty(win.Object, 'values', {
      configurable: true,
      writable: true,
      value: values,
    });
  }
}
