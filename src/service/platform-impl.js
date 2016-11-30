/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {fromClass} from '../service';


/**
 * A helper class that provides information about device/OS/browser currently
 * running.
 */
export class Platform {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const @private {!Navigator} */
    this.navigator_ = /** @type {!Navigator} */ (win.navigator);
  }

  /**
   * Whether the current platform an Android device.
   * @return {boolean}
   */
  isAndroid() {
    return /Android/i.test(this.navigator_.userAgent);
  }

  /**
   * Whether the current platform an iOS device.
   * @return {boolean}
   */
  isIos() {
    return /iPhone|iPad|iPod/i.test(this.navigator_.userAgent);
  }

  /**
   * Whether the current browser is Safari.
   * @return {boolean}
   */
  isSafari() {
    return /Safari/i.test(this.navigator_.userAgent) && !this.isChrome() &&
        !this.isEdge();
  }

  /**
   * Whether the current browser is a Chrome browser.
   * @return {boolean}
   */
  isChrome() {
    // Also true for MS Edge :)
    return /Chrome|CriOS/i.test(this.navigator_.userAgent) && !this.isEdge();
  }

  /**
   * Whether the current browser is a Firefox browser.
   * @return {boolean}
   */
  isFirefox() {
    return /Firefox/i.test(this.navigator_.userAgent) && !this.isEdge();
  }

  /**
   * Whether the current browser is a IE browser.
   * @return {boolean}
   */
  isIe() {
    return /Trident|MSIE|IEMobile/i.test(this.navigator_.userAgent);
  }

  /**
   * Whether the current browser is an Edge browser.
   * @return {boolean}
   */
  isEdge() {
    return /Edge/i.test(this.navigator_.userAgent);
  }

  /**
   * Whether the current browser is based on the WebKit engine.
   * @return {boolean}
   */
  isWebKit() {
    return /WebKit/i.test(this.navigator_.userAgent) && !this.isEdge();
  }

  /**
   * Returns the major version of the browser.
   * @return {number}
   */
  getMajorVersion() {
    if (this.isSafari()) {
      return this.evalMajorVersion_(/\sVersion\/(\d+)/, 1);
    }
    if (this.isChrome()) {
      return this.evalMajorVersion_(/\Chrome\/(\d+)/, 1);
    }
    if (this.isFirefox()) {
      return this.evalMajorVersion_(/\Firefox\/(\d+)/, 1);
    }
    if (this.isIe()) {
      return this.evalMajorVersion_(/\MSIE\s(\d+)/, 1);
    }
    if (this.isEdge()) {
      return this.evalMajorVersion_(/\Edge\/(\d+)/, 1);
    }
    return 0;
  }

  /**
   * @param {!RegExp} expr
   * @param {number} index The index in the result that's interpreted as the
   *   major version (integer).
   * @return {number}
   */
  evalMajorVersion_(expr, index) {
    if (!this.navigator_.userAgent) {
      return 0;
    }
    const res = this.navigator_.userAgent.match(expr);
    if (!res || index >= res.length) {
      return 0;
    }
    return parseInt(res[index], 10);
  }
};


/**
 * @param {!Window} window
 * @return {!Platform}
 */
export function installPlatformService(window) {
  return fromClass(window, 'platform', Platform);
};
