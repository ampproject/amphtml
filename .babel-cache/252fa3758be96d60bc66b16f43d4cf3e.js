function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { registerServiceBuilder } from "../service-helpers";

/**
 * A helper class that provides information about device/OS/browser currently
 * running.
 */
export var Platform = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function Platform(win) {_classCallCheck(this, Platform);
    /** @const @private {!Navigator} */
    this.navigator_ = /** @type {!Navigator} */(win.navigator);

    /** @const @private */
    this.win_ = win;
  }

  /**
   * Whether the current platform an Android device.
   * @return {boolean}
   */_createClass(Platform, [{ key: "isAndroid", value:
    function isAndroid() {
      return /Android/i.test(this.navigator_.userAgent);
    }

    /**
     * Whether the current platform an iOS device.
     * @return {boolean}
     */ }, { key: "isIos", value:
    function isIos() {
      return /iPhone|iPad|iPod/i.test(this.navigator_.userAgent);
    }

    /**
     * Whether the current browser is Safari.
     * @return {boolean}
     */ }, { key: "isSafari", value:
    function isSafari() {
      return (
      /Safari/i.test(this.navigator_.userAgent) &&
      !this.isChrome() &&
      !this.isIe() &&
      !this.isEdge() &&
      !this.isFirefox() &&
      !this.isOpera());

    }

    /**
     * Whether the current browser is a Chrome browser.
     * @return {boolean}
     */ }, { key: "isChrome", value:
    function isChrome() {
      // Also true for MS Edge :)
      return (
      /Chrome|CriOS/i.test(this.navigator_.userAgent) &&
      !this.isEdge() &&
      !this.isOpera());

    }

    /**
     * Whether the current browser is a Firefox browser.
     * @return {boolean}
     */ }, { key: "isFirefox", value:
    function isFirefox() {
      return /Firefox|FxiOS/i.test(this.navigator_.userAgent) && !this.isEdge();
    }

    /**
     * Whether the current browser is an Opera browser.
     * @return {boolean}
     */ }, { key: "isOpera", value:
    function isOpera() {
      // Chrome UA on Android may include OPR<v> (build code referring to Oreo),
      // however real Opera puts put a / after OPR and that's the only tell, so
      // we check for OPR/ instead of OPR
      return /OPR\/|Opera|OPiOS/i.test(this.navigator_.userAgent);
    }

    /**
     * Whether the current browser is a IE browser.
     * @return {boolean}
     */ }, { key: "isIe", value:
    function isIe() {
      if (false) {
        return false;
      }
      return /Trident|MSIE|IEMobile/i.test(this.navigator_.userAgent);
    }

    /**
     * Whether the current browser is an Edge browser.
     * @return {boolean}
     */ }, { key: "isEdge", value:
    function isEdge() {
      return /Edge/i.test(this.navigator_.userAgent);
    }

    /**
     * Whether the current browser is based on the WebKit engine.
     * @return {boolean}
     */ }, { key: "isWebKit", value:
    function isWebKit() {
      return /WebKit/i.test(this.navigator_.userAgent) && !this.isEdge();
    }

    /**
     * Whether the current browser is running on Windows.
     * @return {boolean}
     */ }, { key: "isWindows", value:
    function isWindows() {
      return /Windows/i.test(this.navigator_.userAgent);
    }

    /**
     * Whether the current browser is isStandalone.
     * @return {boolean}
     */ }, { key: "isStandalone", value:
    function isStandalone() {
      return (
      (this.isIos() && this.navigator_.standalone) || (
      this.isChrome() &&
      this.win_.matchMedia('(display-mode: standalone)').matches));

    }

    /**
     * Whether the current platform matches a bot user agent.
     * @return {boolean}
     */ }, { key: "isBot", value:
    function isBot() {
      return /bot/i.test(this.navigator_.userAgent);
    }

    /**
     * Returns the major version of the browser.
     * @return {number}
     */ }, { key: "getMajorVersion", value:
    function getMajorVersion() {
      if (this.isSafari()) {
        return this.isIos() ?
        this.getIosMajorVersion() || 0 :
        this.evalMajorVersion_(/\sVersion\/(\d+)/, 1);
      }
      if (this.isChrome()) {
        return this.evalMajorVersion_(/(Chrome|CriOS)\/(\d+)/, 2);
      }
      if (this.isFirefox()) {
        return this.evalMajorVersion_(/(Firefox|FxiOS)\/(\d+)/, 2);
      }
      if (this.isOpera()) {
        return this.evalMajorVersion_(/(OPR|Opera|OPiOS)\/(\d+)/, 2);
      }
      if (this.isIe()) {
        return this.evalMajorVersion_(/MSIE\s(\d+)/, 1);
      }
      if (this.isEdge()) {
        return this.evalMajorVersion_(/Edge\/(\d+)/, 1);
      }
      return 0;
    }

    /**
     * @param {!RegExp} expr
     * @param {number} index The index in the result that's interpreted as the
     *   major version (integer).
     * @return {number}
     */ }, { key: "evalMajorVersion_", value:
    function evalMajorVersion_(expr, index) {
      if (!this.navigator_.userAgent) {
        return 0;
      }
      var res = this.navigator_.userAgent.match(expr);
      if (!res || index >= res.length) {
        return 0;
      }
      return parseInt(res[index], 10);
    }

    /**
     * Returns the minor ios version in string.
     * The ios version can contain two numbers (10.2) or three numbers (10.2.1).
     * Direct string equality check is not suggested, use startWith instead.
     * @return {string}
     */ }, { key: "getIosVersionString", value:
    function getIosVersionString() {
      if (!this.navigator_.userAgent) {
        return '';
      }
      if (!this.isIos()) {
        return '';
      }
      var version = this.navigator_.userAgent.match(
      /OS ([0-9]+[_.][0-9]+([_.][0-9]+)?)\b/);

      if (!version) {
        return '';
      }
      version = version[1].replace(/_/g, '.');
      return version;
    }

    /**
     * Returns the major ios version in number.
     * @return {?number}
     */ }, { key: "getIosMajorVersion", value:
    function getIosMajorVersion() {
      var currentIosVersion = this.getIosVersionString();
      if (currentIosVersion == '') {
        return null;
      }
      return Number(currentIosVersion.split('.')[0]);
    } }]);return Platform;}();


/**
 * @param {!Window} window
 */
export function installPlatformService(window) {
  registerServiceBuilder(window, 'platform', Platform);
}
// /Users/mszylkowski/src/amphtml/src/service/platform-impl.js