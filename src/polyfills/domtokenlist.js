/**
 * Polyfill for `DOMTokenList.prototype.toggle(token, opt_force)` method. This
 * is specially important because IE does not support `opt_force` attribute. See
 * https://goo.gl/hgKNYY for details.
 * @param {string} token
 * @param {boolean=} opt_force
 * @this {DOMTokenList}
 * @return {boolean}
 */
function domTokenListTogglePolyfill(token, opt_force) {
  // eslint-disable-next-line local/no-invalid-this
  const remove = opt_force === undefined ? this.contains(token) : !opt_force;
  if (remove) {
    // eslint-disable-next-line local/no-invalid-this
    this.remove(token);
    return false;
  } else {
    // eslint-disable-next-line local/no-invalid-this
    this.add(token);
    return true;
  }
}

/**
 * Polyfills `DOMTokenList.prototype.toggle` API and makes `.add` accepts N
 * classes in IE.
 * @param {!Window} win
 */
export function install(win) {
  if (isIe(win) && win.DOMTokenList) {
    win.Object.defineProperty(win.DOMTokenList.prototype, 'toggle', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: domTokenListTogglePolyfill,
    });

    const {add} = win.DOMTokenList.prototype;
    win.DOMTokenList.prototype.add = function () {
      for (let i = 0; i < arguments.length; i++) {
        add.call(this, arguments[i]);
      }
    };
  }
}

/**
 * Whether the current browser is a IE browser.
 * @param {!Window} win
 * @return {boolean}
 */
function isIe(win) {
  return /Trident|MSIE|IEMobile/i.test(win.navigator.userAgent);
}
