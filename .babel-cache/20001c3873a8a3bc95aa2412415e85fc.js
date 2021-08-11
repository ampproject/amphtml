function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
 * An interface to interact with browser window object.
 * Mainly used to mock out read only APIs in test.
 * See test-helper.js#mockWindowInterface
 */
export var WindowInterface = /*#__PURE__*/function () {function WindowInterface() {_classCallCheck(this, WindowInterface);}_createClass(WindowInterface, null, [{ key: "getTop", value:
    /**
     * @static
     * @param {!Window} win
     * @return {!Window}
     */
    function getTop(win) {
      return win.top;
    }

    /**
     * @static
     * @param {!Window} win
     * @return {!Location}
     */ }, { key: "getLocation", value:
    function getLocation(win) {
      return win.location;
    }

    /**
     * @static
     * @param {!Window} win
     * @return {string}
     */ }, { key: "getDocumentReferrer", value:
    function getDocumentReferrer(win) {
      return win.document.referrer;
    }

    /**
     * @static
     * @param {!Window} win
     * @return {string}
     */ }, { key: "getHostname", value:
    function getHostname(win) {
      return win.location.hostname;
    }

    /**
     * @static
     * @param {!Window} win
     * @return {string}
     */ }, { key: "getUserAgent", value:
    function getUserAgent(win) {
      return win.navigator.userAgent;
    }

    /**
     * @static
     * @param {!Window} win
     * @return {string}
     */ }, { key: "getUserLanguage", value:
    function getUserLanguage(win) {
      // The `navigator.userLanguage` is only supported by IE. The standard is
      // the `navigator.language`.
      return win.navigator['userLanguage'] || win.navigator.language;
    }

    /**
     * @static
     * @return {number}
     */ }, { key: "getDevicePixelRatio", value:
    function getDevicePixelRatio() {
      // No matter the window, the device-pixel-ratio is always one.
      return self.devicePixelRatio || 1;
    }

    /**
     * @static
     * @param {!Window} win
     * @return {function(string,(ArrayBufferView|Blob|FormData|null|string)=):boolean|undefined}
     */ }, { key: "getSendBeacon", value:
    function getSendBeacon(win) {
      if (!win.navigator.sendBeacon) {
        return undefined;
      }
      return win.navigator.sendBeacon.bind(win.navigator);
    }

    /**
     * @static
     * @param {!Window} win
     * @return {typeof XMLHttpRequest}
     */ }, { key: "getXMLHttpRequest", value:
    function getXMLHttpRequest(win) {
      return win.XMLHttpRequest;
    }

    /**
     * @static
     * @param {!Window} win
     * @return {typeof Image}
     */ }, { key: "getImage", value:
    function getImage(win) {
      return win.Image;
    } }]);return WindowInterface;}();
// /Users/mszylkowski/src/amphtml/src/core/window/interface.js