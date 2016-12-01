/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * Polyfill for `DOMTokenList.prototype.toggle(token, opt_force)` method.
 * This is specially important because IE does not support `opt_force` attribute.
 * See https://goo.gl/hgKNYY for details.
 * @param {string} token
 * @param {boolean=} opt_force
 * @this {DOMTokenList}
 * @return {boolean}
 */
function domTokenListTogglePolyfill(token, opt_force) {
  if (opt_force !== undefined) {
    if (opt_force) {
      this.add(token);
      return true;
    } else {
      this.remove(token);
      return false;
    }
  } else if (this.contains(token)) {
    this.remove(token);
    return false;
  } else {
    this.add(token);
    return true;
  }
}


/**
 * Polyfills `DOMTokenList.prototype.toggle` API in IE.
 * @param {!Window} win
 */
export function install(win) {
  if (isIe(win) && win.DOMTokenList && win.DOMTokenList.prototype.toggle) {
    win.DOMTokenList.prototype.toggle = domTokenListTogglePolyfill;
  }
}

/**
 * Returns true if browser is IE.
 * @param {!Window} win
 * @return {boolean}
 */
function isIe(win) {
  const ua = win.navigator.userAgent;
  return /MSIE/i.test(ua) || /IEMobile/i.test(ua) || /Trident/i.test(ua);
}
