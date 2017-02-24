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
 * Possible versions of Shadow DOM spec
 * @const
 * @enum {string}
 */
export const ShadowDomVersion = {
  NONE: 'none',
  V0: 'v0',
  V1: 'v1',
};

/**
 * @type {ShadowDomVersion|undefined}
 * @visibleForTesting
 */
let shadowDomSupportedVersion;

/**
 * @param {ShadowDomVersion|undefined} val
 * @visibleForTesting
 */
export function setShadowDomSupportedVersionForTesting(val) {
  shadowDomSupportedVersion = val;
}

/**
 * Returns `true` if the Shadow DOM is supported.
 * @return {boolean}
 */
export function isShadowDomSupported() {
  return getShadowDomSupportedVersion() != ShadowDomVersion.NONE;
}

/**
 * Returns the supported version of Shadow DOM spec.
 * @param {Function=} opt_elementClass optional for testing
 * @return {ShadowDomVersion}
 */
export function getShadowDomSupportedVersion(opt_elementClass) {
  if (shadowDomSupportedVersion === undefined) {

    //TODO: Remove native CE check once WebReflection/document-register-element#96 is fixed.
    if (!areNativeCustomElementsSupported()) {
      shadowDomSupportedVersion = ShadowDomVersion.NONE;
    } else {
      shadowDomSupportedVersion =
          getShadowDomVersion(opt_elementClass || Element);
    }
  }

  return shadowDomSupportedVersion;
}

function getShadowDomVersion(element) {
  if (!!element.prototype.attachShadow) {
    return ShadowDomVersion.V1;
  } else if (!!element.prototype.createShadowRoot) {
    return ShadowDomVersion.V0;
  }

  return ShadowDomVersion.NONE;
}

function areNativeCustomElementsSupported() {
  return isNative(self.document.registerElement) ||
         isNative(self
             .Object
             .getOwnPropertyDescriptor(self, 'customElements')
             .get);
}

/**
 * Returns `true` if the method is natively implemented by the browser
 * @visibleForTesting
 * @param {Function=} method
 * @return {boolean}
 */
export function isNative(method) {
  return !!method && method.toString().indexOf('[native code]') !== -1;
}
