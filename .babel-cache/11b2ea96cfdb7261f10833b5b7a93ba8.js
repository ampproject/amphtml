function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { registerServiceBuilder } from "../service-helpers";

/**
 * A helper class that provides information about device/OS/browser currently
 * running.
 */
export var Platform = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function Platform(win) {
    _classCallCheck(this, Platform);

    /** @const @private {!Navigator} */
    this.navigator_ =
    /** @type {!Navigator} */
    win.navigator;

    /** @const @private */
    this.win_ = win;
  }

  /**
   * Whether the current platform an Android device.
   * @return {boolean}
   */
  _createClass(Platform, [{
    key: "isAndroid",
    value: function isAndroid() {
      return /Android/i.test(this.navigator_.userAgent);
    }
    /**
     * Whether the current platform an iOS device.
     * @return {boolean}
     */

  }, {
    key: "isIos",
    value: function isIos() {
      return /iPhone|iPad|iPod/i.test(this.navigator_.userAgent);
    }
    /**
     * Whether the current browser is Safari.
     * @return {boolean}
     */

  }, {
    key: "isSafari",
    value: function isSafari() {
      return /Safari/i.test(this.navigator_.userAgent) && !this.isChrome() && !this.isIe() && !this.isEdge() && !this.isFirefox() && !this.isOpera();
    }
    /**
     * Whether the current browser is a Chrome browser.
     * @return {boolean}
     */

  }, {
    key: "isChrome",
    value: function isChrome() {
      // Also true for MS Edge :)
      return /Chrome|CriOS/i.test(this.navigator_.userAgent) && !this.isEdge() && !this.isOpera();
    }
    /**
     * Whether the current browser is a Firefox browser.
     * @return {boolean}
     */

  }, {
    key: "isFirefox",
    value: function isFirefox() {
      return /Firefox|FxiOS/i.test(this.navigator_.userAgent) && !this.isEdge();
    }
    /**
     * Whether the current browser is an Opera browser.
     * @return {boolean}
     */

  }, {
    key: "isOpera",
    value: function isOpera() {
      // Chrome UA on Android may include OPR<v> (build code referring to Oreo),
      // however real Opera puts put a / after OPR and that's the only tell, so
      // we check for OPR/ instead of OPR
      return /OPR\/|Opera|OPiOS/i.test(this.navigator_.userAgent);
    }
    /**
     * Whether the current browser is a IE browser.
     * @return {boolean}
     */

  }, {
    key: "isIe",
    value: function isIe() {
      if (false) {
        return false;
      }

      return /Trident|MSIE|IEMobile/i.test(this.navigator_.userAgent);
    }
    /**
     * Whether the current browser is an Edge browser.
     * @return {boolean}
     */

  }, {
    key: "isEdge",
    value: function isEdge() {
      return /Edge/i.test(this.navigator_.userAgent);
    }
    /**
     * Whether the current browser is based on the WebKit engine.
     * @return {boolean}
     */

  }, {
    key: "isWebKit",
    value: function isWebKit() {
      return /WebKit/i.test(this.navigator_.userAgent) && !this.isEdge();
    }
    /**
     * Whether the current browser is running on Windows.
     * @return {boolean}
     */

  }, {
    key: "isWindows",
    value: function isWindows() {
      return /Windows/i.test(this.navigator_.userAgent);
    }
    /**
     * Whether the current browser is isStandalone.
     * @return {boolean}
     */

  }, {
    key: "isStandalone",
    value: function isStandalone() {
      return this.isIos() && this.navigator_.standalone || this.isChrome() && this.win_.matchMedia('(display-mode: standalone)').matches;
    }
    /**
     * Whether the current platform matches a bot user agent.
     * @return {boolean}
     */

  }, {
    key: "isBot",
    value: function isBot() {
      return /bot/i.test(this.navigator_.userAgent);
    }
    /**
     * Returns the major version of the browser.
     * @return {number}
     */

  }, {
    key: "getMajorVersion",
    value: function getMajorVersion() {
      if (this.isSafari()) {
        return this.isIos() ? this.getIosMajorVersion() || 0 : this.evalMajorVersion_(/\sVersion\/(\d+)/, 1);
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
     */

  }, {
    key: "evalMajorVersion_",
    value: function evalMajorVersion_(expr, index) {
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
     */

  }, {
    key: "getIosVersionString",
    value: function getIosVersionString() {
      if (!this.navigator_.userAgent) {
        return '';
      }

      if (!this.isIos()) {
        return '';
      }

      var version = this.navigator_.userAgent.match(/OS ([0-9]+[_.][0-9]+([_.][0-9]+)?)\b/);

      if (!version) {
        return '';
      }

      version = version[1].replace(/_/g, '.');
      return version;
    }
    /**
     * Returns the major ios version in number.
     * @return {?number}
     */

  }, {
    key: "getIosMajorVersion",
    value: function getIosMajorVersion() {
      var currentIosVersion = this.getIosVersionString();

      if (currentIosVersion == '') {
        return null;
      }

      return Number(currentIosVersion.split('.')[0]);
    }
  }]);

  return Platform;
}();

/**
 * @param {!Window} window
 */
export function installPlatformService(window) {
  registerServiceBuilder(window, 'platform', Platform);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYXRmb3JtLWltcGwuanMiXSwibmFtZXMiOlsicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlciIsIlBsYXRmb3JtIiwid2luIiwibmF2aWdhdG9yXyIsIm5hdmlnYXRvciIsIndpbl8iLCJ0ZXN0IiwidXNlckFnZW50IiwiaXNDaHJvbWUiLCJpc0llIiwiaXNFZGdlIiwiaXNGaXJlZm94IiwiaXNPcGVyYSIsImlzSW9zIiwic3RhbmRhbG9uZSIsIm1hdGNoTWVkaWEiLCJtYXRjaGVzIiwiaXNTYWZhcmkiLCJnZXRJb3NNYWpvclZlcnNpb24iLCJldmFsTWFqb3JWZXJzaW9uXyIsImV4cHIiLCJpbmRleCIsInJlcyIsIm1hdGNoIiwibGVuZ3RoIiwicGFyc2VJbnQiLCJ2ZXJzaW9uIiwicmVwbGFjZSIsImN1cnJlbnRJb3NWZXJzaW9uIiwiZ2V0SW9zVmVyc2lvblN0cmluZyIsIk51bWJlciIsInNwbGl0IiwiaW5zdGFsbFBsYXRmb3JtU2VydmljZSIsIndpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsc0JBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhQyxRQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0Usb0JBQVlDLEdBQVosRUFBaUI7QUFBQTs7QUFDZjtBQUNBLFNBQUtDLFVBQUw7QUFBa0I7QUFBMkJELElBQUFBLEdBQUcsQ0FBQ0UsU0FBakQ7O0FBRUE7QUFDQSxTQUFLQyxJQUFMLEdBQVlILEdBQVo7QUFDRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQWZBO0FBQUE7QUFBQSxXQWdCRSxxQkFBWTtBQUNWLGFBQU8sV0FBV0ksSUFBWCxDQUFnQixLQUFLSCxVQUFMLENBQWdCSSxTQUFoQyxDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUF2QkE7QUFBQTtBQUFBLFdBd0JFLGlCQUFRO0FBQ04sYUFBTyxvQkFBb0JELElBQXBCLENBQXlCLEtBQUtILFVBQUwsQ0FBZ0JJLFNBQXpDLENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQS9CQTtBQUFBO0FBQUEsV0FnQ0Usb0JBQVc7QUFDVCxhQUNFLFVBQVVELElBQVYsQ0FBZSxLQUFLSCxVQUFMLENBQWdCSSxTQUEvQixLQUNBLENBQUMsS0FBS0MsUUFBTCxFQURELElBRUEsQ0FBQyxLQUFLQyxJQUFMLEVBRkQsSUFHQSxDQUFDLEtBQUtDLE1BQUwsRUFIRCxJQUlBLENBQUMsS0FBS0MsU0FBTCxFQUpELElBS0EsQ0FBQyxLQUFLQyxPQUFMLEVBTkg7QUFRRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQTlDQTtBQUFBO0FBQUEsV0ErQ0Usb0JBQVc7QUFDVDtBQUNBLGFBQ0UsZ0JBQWdCTixJQUFoQixDQUFxQixLQUFLSCxVQUFMLENBQWdCSSxTQUFyQyxLQUNBLENBQUMsS0FBS0csTUFBTCxFQURELElBRUEsQ0FBQyxLQUFLRSxPQUFMLEVBSEg7QUFLRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQTNEQTtBQUFBO0FBQUEsV0E0REUscUJBQVk7QUFDVixhQUFPLGlCQUFpQk4sSUFBakIsQ0FBc0IsS0FBS0gsVUFBTCxDQUFnQkksU0FBdEMsS0FBb0QsQ0FBQyxLQUFLRyxNQUFMLEVBQTVEO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUFuRUE7QUFBQTtBQUFBLFdBb0VFLG1CQUFVO0FBQ1I7QUFDQTtBQUNBO0FBQ0EsYUFBTyxxQkFBcUJKLElBQXJCLENBQTBCLEtBQUtILFVBQUwsQ0FBZ0JJLFNBQTFDLENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQTlFQTtBQUFBO0FBQUEsV0ErRUUsZ0JBQU87QUFDTCxpQkFBWTtBQUNWLGVBQU8sS0FBUDtBQUNEOztBQUNELGFBQU8seUJBQXlCRCxJQUF6QixDQUE4QixLQUFLSCxVQUFMLENBQWdCSSxTQUE5QyxDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUF6RkE7QUFBQTtBQUFBLFdBMEZFLGtCQUFTO0FBQ1AsYUFBTyxRQUFRRCxJQUFSLENBQWEsS0FBS0gsVUFBTCxDQUFnQkksU0FBN0IsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBakdBO0FBQUE7QUFBQSxXQWtHRSxvQkFBVztBQUNULGFBQU8sVUFBVUQsSUFBVixDQUFlLEtBQUtILFVBQUwsQ0FBZ0JJLFNBQS9CLEtBQTZDLENBQUMsS0FBS0csTUFBTCxFQUFyRDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBekdBO0FBQUE7QUFBQSxXQTBHRSxxQkFBWTtBQUNWLGFBQU8sV0FBV0osSUFBWCxDQUFnQixLQUFLSCxVQUFMLENBQWdCSSxTQUFoQyxDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUFqSEE7QUFBQTtBQUFBLFdBa0hFLHdCQUFlO0FBQ2IsYUFDRyxLQUFLTSxLQUFMLE1BQWdCLEtBQUtWLFVBQUwsQ0FBZ0JXLFVBQWpDLElBQ0MsS0FBS04sUUFBTCxNQUNDLEtBQUtILElBQUwsQ0FBVVUsVUFBVixDQUFxQiw0QkFBckIsRUFBbURDLE9BSHZEO0FBS0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUE3SEE7QUFBQTtBQUFBLFdBOEhFLGlCQUFRO0FBQ04sYUFBTyxPQUFPVixJQUFQLENBQVksS0FBS0gsVUFBTCxDQUFnQkksU0FBNUIsQ0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBcklBO0FBQUE7QUFBQSxXQXNJRSwyQkFBa0I7QUFDaEIsVUFBSSxLQUFLVSxRQUFMLEVBQUosRUFBcUI7QUFDbkIsZUFBTyxLQUFLSixLQUFMLEtBQ0gsS0FBS0ssa0JBQUwsTUFBNkIsQ0FEMUIsR0FFSCxLQUFLQyxpQkFBTCxDQUF1QixrQkFBdkIsRUFBMkMsQ0FBM0MsQ0FGSjtBQUdEOztBQUNELFVBQUksS0FBS1gsUUFBTCxFQUFKLEVBQXFCO0FBQ25CLGVBQU8sS0FBS1csaUJBQUwsQ0FBdUIsdUJBQXZCLEVBQWdELENBQWhELENBQVA7QUFDRDs7QUFDRCxVQUFJLEtBQUtSLFNBQUwsRUFBSixFQUFzQjtBQUNwQixlQUFPLEtBQUtRLGlCQUFMLENBQXVCLHdCQUF2QixFQUFpRCxDQUFqRCxDQUFQO0FBQ0Q7O0FBQ0QsVUFBSSxLQUFLUCxPQUFMLEVBQUosRUFBb0I7QUFDbEIsZUFBTyxLQUFLTyxpQkFBTCxDQUF1QiwwQkFBdkIsRUFBbUQsQ0FBbkQsQ0FBUDtBQUNEOztBQUNELFVBQUksS0FBS1YsSUFBTCxFQUFKLEVBQWlCO0FBQ2YsZUFBTyxLQUFLVSxpQkFBTCxDQUF1QixhQUF2QixFQUFzQyxDQUF0QyxDQUFQO0FBQ0Q7O0FBQ0QsVUFBSSxLQUFLVCxNQUFMLEVBQUosRUFBbUI7QUFDakIsZUFBTyxLQUFLUyxpQkFBTCxDQUF1QixhQUF2QixFQUFzQyxDQUF0QyxDQUFQO0FBQ0Q7O0FBQ0QsYUFBTyxDQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBbktBO0FBQUE7QUFBQSxXQW9LRSwyQkFBa0JDLElBQWxCLEVBQXdCQyxLQUF4QixFQUErQjtBQUM3QixVQUFJLENBQUMsS0FBS2xCLFVBQUwsQ0FBZ0JJLFNBQXJCLEVBQWdDO0FBQzlCLGVBQU8sQ0FBUDtBQUNEOztBQUNELFVBQU1lLEdBQUcsR0FBRyxLQUFLbkIsVUFBTCxDQUFnQkksU0FBaEIsQ0FBMEJnQixLQUExQixDQUFnQ0gsSUFBaEMsQ0FBWjs7QUFDQSxVQUFJLENBQUNFLEdBQUQsSUFBUUQsS0FBSyxJQUFJQyxHQUFHLENBQUNFLE1BQXpCLEVBQWlDO0FBQy9CLGVBQU8sQ0FBUDtBQUNEOztBQUNELGFBQU9DLFFBQVEsQ0FBQ0gsR0FBRyxDQUFDRCxLQUFELENBQUosRUFBYSxFQUFiLENBQWY7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFwTEE7QUFBQTtBQUFBLFdBcUxFLCtCQUFzQjtBQUNwQixVQUFJLENBQUMsS0FBS2xCLFVBQUwsQ0FBZ0JJLFNBQXJCLEVBQWdDO0FBQzlCLGVBQU8sRUFBUDtBQUNEOztBQUNELFVBQUksQ0FBQyxLQUFLTSxLQUFMLEVBQUwsRUFBbUI7QUFDakIsZUFBTyxFQUFQO0FBQ0Q7O0FBQ0QsVUFBSWEsT0FBTyxHQUFHLEtBQUt2QixVQUFMLENBQWdCSSxTQUFoQixDQUEwQmdCLEtBQTFCLENBQ1osc0NBRFksQ0FBZDs7QUFHQSxVQUFJLENBQUNHLE9BQUwsRUFBYztBQUNaLGVBQU8sRUFBUDtBQUNEOztBQUNEQSxNQUFBQSxPQUFPLEdBQUdBLE9BQU8sQ0FBQyxDQUFELENBQVAsQ0FBV0MsT0FBWCxDQUFtQixJQUFuQixFQUF5QixHQUF6QixDQUFWO0FBQ0EsYUFBT0QsT0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBek1BO0FBQUE7QUFBQSxXQTBNRSw4QkFBcUI7QUFDbkIsVUFBTUUsaUJBQWlCLEdBQUcsS0FBS0MsbUJBQUwsRUFBMUI7O0FBQ0EsVUFBSUQsaUJBQWlCLElBQUksRUFBekIsRUFBNkI7QUFDM0IsZUFBTyxJQUFQO0FBQ0Q7O0FBQ0QsYUFBT0UsTUFBTSxDQUFDRixpQkFBaUIsQ0FBQ0csS0FBbEIsQ0FBd0IsR0FBeEIsRUFBNkIsQ0FBN0IsQ0FBRCxDQUFiO0FBQ0Q7QUFoTkg7O0FBQUE7QUFBQTs7QUFtTkE7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxzQkFBVCxDQUFnQ0MsTUFBaEMsRUFBd0M7QUFDN0NqQyxFQUFBQSxzQkFBc0IsQ0FBQ2lDLE1BQUQsRUFBUyxVQUFULEVBQXFCaEMsUUFBckIsQ0FBdEI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJ9IGZyb20gJy4uL3NlcnZpY2UtaGVscGVycyc7XG5cbi8qKlxuICogQSBoZWxwZXIgY2xhc3MgdGhhdCBwcm92aWRlcyBpbmZvcm1hdGlvbiBhYm91dCBkZXZpY2UvT1MvYnJvd3NlciBjdXJyZW50bHlcbiAqIHJ1bm5pbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBQbGF0Zm9ybSB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luKSB7XG4gICAgLyoqIEBjb25zdCBAcHJpdmF0ZSB7IU5hdmlnYXRvcn0gKi9cbiAgICB0aGlzLm5hdmlnYXRvcl8gPSAvKiogQHR5cGUgeyFOYXZpZ2F0b3J9ICovICh3aW4ubmF2aWdhdG9yKTtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgKi9cbiAgICB0aGlzLndpbl8gPSB3aW47XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY3VycmVudCBwbGF0Zm9ybSBhbiBBbmRyb2lkIGRldmljZS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzQW5kcm9pZCgpIHtcbiAgICByZXR1cm4gL0FuZHJvaWQvaS50ZXN0KHRoaXMubmF2aWdhdG9yXy51c2VyQWdlbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGN1cnJlbnQgcGxhdGZvcm0gYW4gaU9TIGRldmljZS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzSW9zKCkge1xuICAgIHJldHVybiAvaVBob25lfGlQYWR8aVBvZC9pLnRlc3QodGhpcy5uYXZpZ2F0b3JfLnVzZXJBZ2VudCk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY3VycmVudCBicm93c2VyIGlzIFNhZmFyaS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU2FmYXJpKCkge1xuICAgIHJldHVybiAoXG4gICAgICAvU2FmYXJpL2kudGVzdCh0aGlzLm5hdmlnYXRvcl8udXNlckFnZW50KSAmJlxuICAgICAgIXRoaXMuaXNDaHJvbWUoKSAmJlxuICAgICAgIXRoaXMuaXNJZSgpICYmXG4gICAgICAhdGhpcy5pc0VkZ2UoKSAmJlxuICAgICAgIXRoaXMuaXNGaXJlZm94KCkgJiZcbiAgICAgICF0aGlzLmlzT3BlcmEoKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY3VycmVudCBicm93c2VyIGlzIGEgQ2hyb21lIGJyb3dzZXIuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc0Nocm9tZSgpIHtcbiAgICAvLyBBbHNvIHRydWUgZm9yIE1TIEVkZ2UgOilcbiAgICByZXR1cm4gKFxuICAgICAgL0Nocm9tZXxDcmlPUy9pLnRlc3QodGhpcy5uYXZpZ2F0b3JfLnVzZXJBZ2VudCkgJiZcbiAgICAgICF0aGlzLmlzRWRnZSgpICYmXG4gICAgICAhdGhpcy5pc09wZXJhKClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGN1cnJlbnQgYnJvd3NlciBpcyBhIEZpcmVmb3ggYnJvd3Nlci5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRmlyZWZveCgpIHtcbiAgICByZXR1cm4gL0ZpcmVmb3h8RnhpT1MvaS50ZXN0KHRoaXMubmF2aWdhdG9yXy51c2VyQWdlbnQpICYmICF0aGlzLmlzRWRnZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGN1cnJlbnQgYnJvd3NlciBpcyBhbiBPcGVyYSBicm93c2VyLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNPcGVyYSgpIHtcbiAgICAvLyBDaHJvbWUgVUEgb24gQW5kcm9pZCBtYXkgaW5jbHVkZSBPUFI8dj4gKGJ1aWxkIGNvZGUgcmVmZXJyaW5nIHRvIE9yZW8pLFxuICAgIC8vIGhvd2V2ZXIgcmVhbCBPcGVyYSBwdXRzIHB1dCBhIC8gYWZ0ZXIgT1BSIGFuZCB0aGF0J3MgdGhlIG9ubHkgdGVsbCwgc29cbiAgICAvLyB3ZSBjaGVjayBmb3IgT1BSLyBpbnN0ZWFkIG9mIE9QUlxuICAgIHJldHVybiAvT1BSXFwvfE9wZXJhfE9QaU9TL2kudGVzdCh0aGlzLm5hdmlnYXRvcl8udXNlckFnZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjdXJyZW50IGJyb3dzZXIgaXMgYSBJRSBicm93c2VyLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNJZSgpIHtcbiAgICBpZiAoSVNfRVNNKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiAvVHJpZGVudHxNU0lFfElFTW9iaWxlL2kudGVzdCh0aGlzLm5hdmlnYXRvcl8udXNlckFnZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjdXJyZW50IGJyb3dzZXIgaXMgYW4gRWRnZSBicm93c2VyLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNFZGdlKCkge1xuICAgIHJldHVybiAvRWRnZS9pLnRlc3QodGhpcy5uYXZpZ2F0b3JfLnVzZXJBZ2VudCk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY3VycmVudCBicm93c2VyIGlzIGJhc2VkIG9uIHRoZSBXZWJLaXQgZW5naW5lLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNXZWJLaXQoKSB7XG4gICAgcmV0dXJuIC9XZWJLaXQvaS50ZXN0KHRoaXMubmF2aWdhdG9yXy51c2VyQWdlbnQpICYmICF0aGlzLmlzRWRnZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGN1cnJlbnQgYnJvd3NlciBpcyBydW5uaW5nIG9uIFdpbmRvd3MuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc1dpbmRvd3MoKSB7XG4gICAgcmV0dXJuIC9XaW5kb3dzL2kudGVzdCh0aGlzLm5hdmlnYXRvcl8udXNlckFnZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjdXJyZW50IGJyb3dzZXIgaXMgaXNTdGFuZGFsb25lLlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNTdGFuZGFsb25lKCkge1xuICAgIHJldHVybiAoXG4gICAgICAodGhpcy5pc0lvcygpICYmIHRoaXMubmF2aWdhdG9yXy5zdGFuZGFsb25lKSB8fFxuICAgICAgKHRoaXMuaXNDaHJvbWUoKSAmJlxuICAgICAgICB0aGlzLndpbl8ubWF0Y2hNZWRpYSgnKGRpc3BsYXktbW9kZTogc3RhbmRhbG9uZSknKS5tYXRjaGVzKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY3VycmVudCBwbGF0Zm9ybSBtYXRjaGVzIGEgYm90IHVzZXIgYWdlbnQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc0JvdCgpIHtcbiAgICByZXR1cm4gL2JvdC9pLnRlc3QodGhpcy5uYXZpZ2F0b3JfLnVzZXJBZ2VudCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbWFqb3IgdmVyc2lvbiBvZiB0aGUgYnJvd3Nlci5cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0TWFqb3JWZXJzaW9uKCkge1xuICAgIGlmICh0aGlzLmlzU2FmYXJpKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmlzSW9zKClcbiAgICAgICAgPyB0aGlzLmdldElvc01ham9yVmVyc2lvbigpIHx8IDBcbiAgICAgICAgOiB0aGlzLmV2YWxNYWpvclZlcnNpb25fKC9cXHNWZXJzaW9uXFwvKFxcZCspLywgMSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzQ2hyb21lKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmV2YWxNYWpvclZlcnNpb25fKC8oQ2hyb21lfENyaU9TKVxcLyhcXGQrKS8sIDIpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0ZpcmVmb3goKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZXZhbE1ham9yVmVyc2lvbl8oLyhGaXJlZm94fEZ4aU9TKVxcLyhcXGQrKS8sIDIpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc09wZXJhKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmV2YWxNYWpvclZlcnNpb25fKC8oT1BSfE9wZXJhfE9QaU9TKVxcLyhcXGQrKS8sIDIpO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0llKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmV2YWxNYWpvclZlcnNpb25fKC9NU0lFXFxzKFxcZCspLywgMSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzRWRnZSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5ldmFsTWFqb3JWZXJzaW9uXygvRWRnZVxcLyhcXGQrKS8sIDEpO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFSZWdFeHB9IGV4cHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSBpbmRleCBpbiB0aGUgcmVzdWx0IHRoYXQncyBpbnRlcnByZXRlZCBhcyB0aGVcbiAgICogICBtYWpvciB2ZXJzaW9uIChpbnRlZ2VyKS5cbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZXZhbE1ham9yVmVyc2lvbl8oZXhwciwgaW5kZXgpIHtcbiAgICBpZiAoIXRoaXMubmF2aWdhdG9yXy51c2VyQWdlbnQpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBjb25zdCByZXMgPSB0aGlzLm5hdmlnYXRvcl8udXNlckFnZW50Lm1hdGNoKGV4cHIpO1xuICAgIGlmICghcmVzIHx8IGluZGV4ID49IHJlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VJbnQocmVzW2luZGV4XSwgMTApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG1pbm9yIGlvcyB2ZXJzaW9uIGluIHN0cmluZy5cbiAgICogVGhlIGlvcyB2ZXJzaW9uIGNhbiBjb250YWluIHR3byBudW1iZXJzICgxMC4yKSBvciB0aHJlZSBudW1iZXJzICgxMC4yLjEpLlxuICAgKiBEaXJlY3Qgc3RyaW5nIGVxdWFsaXR5IGNoZWNrIGlzIG5vdCBzdWdnZXN0ZWQsIHVzZSBzdGFydFdpdGggaW5zdGVhZC5cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0SW9zVmVyc2lvblN0cmluZygpIHtcbiAgICBpZiAoIXRoaXMubmF2aWdhdG9yXy51c2VyQWdlbnQpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgaWYgKCF0aGlzLmlzSW9zKCkpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgbGV0IHZlcnNpb24gPSB0aGlzLm5hdmlnYXRvcl8udXNlckFnZW50Lm1hdGNoKFxuICAgICAgL09TIChbMC05XStbXy5dWzAtOV0rKFtfLl1bMC05XSspPylcXGIvXG4gICAgKTtcbiAgICBpZiAoIXZlcnNpb24pIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgdmVyc2lvbiA9IHZlcnNpb25bMV0ucmVwbGFjZSgvXy9nLCAnLicpO1xuICAgIHJldHVybiB2ZXJzaW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG1ham9yIGlvcyB2ZXJzaW9uIGluIG51bWJlci5cbiAgICogQHJldHVybiB7P251bWJlcn1cbiAgICovXG4gIGdldElvc01ham9yVmVyc2lvbigpIHtcbiAgICBjb25zdCBjdXJyZW50SW9zVmVyc2lvbiA9IHRoaXMuZ2V0SW9zVmVyc2lvblN0cmluZygpO1xuICAgIGlmIChjdXJyZW50SW9zVmVyc2lvbiA9PSAnJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBOdW1iZXIoY3VycmVudElvc1ZlcnNpb24uc3BsaXQoJy4nKVswXSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpbmRvd1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zdGFsbFBsYXRmb3JtU2VydmljZSh3aW5kb3cpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcih3aW5kb3csICdwbGF0Zm9ybScsIFBsYXRmb3JtKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/service/platform-impl.js