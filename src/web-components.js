/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
 * @type {boolean|undefined}
 * @visibleForTesting
 */
let shadowDomSupported;

/**
 * @type {Function|undefined}
 * @visibleForTesting
 */
let shadowDomMethod;

let win = window;

/**
 * @param {boolean|undefined} val
 * @visibleForTesting
 */
export function setWindowForTesting(val) {
  win = val;
}

/**
 * @param {boolean|undefined} val
 * @visibleForTesting
 */
export function setShadowDomSupportedForTesting(val) {
  shadowDomSupported = val;
}

/**
 * @param {function|undefined} val
 * @visibleForTesting
 */
export function setShadowDomMethodForTesting(val) {
  shadowDomMethod = val;
}

/**
 * Returns `true` if the Shadow DOM is supported.
 * @return {boolean}
 */
export function isShadowDomSupported() {
  if (shadowDomSupported === undefined) {
    shadowDomSupported = !!getShadowDomMethod();// && areNativeCustomElementsSupported();
  }

  return shadowDomSupported;
}

/**
 * Shadow DOM version method
 * @return {function}
 */
export function getShadowDomMethod() {
  if (shadowDomMethod === undefined) {
    shadowDomMethod = win.Element.prototype.createShadowRoot || win.Element.prototype.attachShadow;
  }

  return shadowDomMethod;
}

function areNativeCustomElementsSupported() {
  return isNative(win.document.registerElement) || isNative(win.customElements && win.customElements.define);
}

export function isNative(method) {
  return !!method && method.toString().indexOf('[native code]') !== -1;
}