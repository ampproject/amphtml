function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import { getService, registerServiceBuilder } from "../../../src/service-helpers";
import { hasOwn } from "../../../src/core/types/object";
import { parseLinker } from "./linker";
import { parseQueryString } from "../../../src/core/types/string/url";
import { removeParamsFromSearch } from "../../../src/url";
import { user } from "../../../src/log";
var TAG = 'amp-analytics/linker-reader';
export var LinkerReader = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function LinkerReader(win) {
    _classCallCheck(this, LinkerReader);

    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Object<string, ?Object<string, string>>} */
    this.linkerParams_ = {};
  }

  /**
   * Get the LINKER_PARAM(name, id) value from url and clean the value
   * @param {string} name
   * @param {string} id
   * @return {?string}
   */
  _createClass(LinkerReader, [{
    key: "get",
    value: function get(name, id) {
      if (!name || !id) {
        user().error(TAG, 'LINKER_PARAM requires two params, name and id');
        return null;
      }

      if (!hasOwn(this.linkerParams_, name)) {
        this.linkerParams_[name] = this.parseAndCleanQueryString_(name);
      }

      if (this.linkerParams_[name] && this.linkerParams_[name][id]) {
        return this.linkerParams_[name][id];
      }

      return null;
    }
    /**
     * Parse the url get the key value pair for the linker name
     * and remove the LINKER_PARAM from window location
     * @param {string} name
     * @return {?Object<string, string>}
     */

  }, {
    key: "parseAndCleanQueryString_",
    value: function parseAndCleanQueryString_(name) {
      var params = parseQueryString(this.win_.location.search);

      if (!hasOwn(params, name)) {
        // Linker param not found.
        return null;
      }

      var value = params[name];
      this.removeLinkerParam_(this.win_.location, name);
      return parseLinker(value);
    }
    /**
     * Remove the linker param from the current url
     * @param {!Location} url
     * @param {string} name
     */

  }, {
    key: "removeLinkerParam_",
    value: function removeLinkerParam_(url, name) {
      if (!this.win_.history.replaceState) {
        // Can't replace state. Ignore
        return;
      }

      var searchUrl = url.search;
      var removedLinkerParamSearchUrl = removeParamsFromSearch(searchUrl, name);
      var newHref = url.origin + url.pathname + removedLinkerParamSearchUrl + (url.hash || '');
      this.win_.history.replaceState(null, '', newHref);
    }
  }]);

  return LinkerReader;
}();

/**
 * @param {!Window} win
 */
export function installLinkerReaderService(win) {
  registerServiceBuilder(win, 'amp-analytics-linker-reader', LinkerReader);
}

/**
 * @param {!Window} win
 * @return {!LinkerReader}
 */
export function linkerReaderServiceFor(win) {
  return getService(win, 'amp-analytics-linker-reader');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpbmtlci1yZWFkZXIuanMiXSwibmFtZXMiOlsiZ2V0U2VydmljZSIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXIiLCJoYXNPd24iLCJwYXJzZUxpbmtlciIsInBhcnNlUXVlcnlTdHJpbmciLCJyZW1vdmVQYXJhbXNGcm9tU2VhcmNoIiwidXNlciIsIlRBRyIsIkxpbmtlclJlYWRlciIsIndpbiIsIndpbl8iLCJsaW5rZXJQYXJhbXNfIiwibmFtZSIsImlkIiwiZXJyb3IiLCJwYXJzZUFuZENsZWFuUXVlcnlTdHJpbmdfIiwicGFyYW1zIiwibG9jYXRpb24iLCJzZWFyY2giLCJ2YWx1ZSIsInJlbW92ZUxpbmtlclBhcmFtXyIsInVybCIsImhpc3RvcnkiLCJyZXBsYWNlU3RhdGUiLCJzZWFyY2hVcmwiLCJyZW1vdmVkTGlua2VyUGFyYW1TZWFyY2hVcmwiLCJuZXdIcmVmIiwib3JpZ2luIiwicGF0aG5hbWUiLCJoYXNoIiwiaW5zdGFsbExpbmtlclJlYWRlclNlcnZpY2UiLCJsaW5rZXJSZWFkZXJTZXJ2aWNlRm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxVQUFSLEVBQW9CQyxzQkFBcEI7QUFDQSxTQUFRQyxNQUFSO0FBQ0EsU0FBUUMsV0FBUjtBQUNBLFNBQVFDLGdCQUFSO0FBQ0EsU0FBUUMsc0JBQVI7QUFFQSxTQUFRQyxJQUFSO0FBRUEsSUFBTUMsR0FBRyxHQUFHLDZCQUFaO0FBRUEsV0FBYUMsWUFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNFLHdCQUFZQyxHQUFaLEVBQWlCO0FBQUE7O0FBQ2Y7QUFDQSxTQUFLQyxJQUFMLEdBQVlELEdBQVo7O0FBRUE7QUFDQSxTQUFLRSxhQUFMLEdBQXFCLEVBQXJCO0FBQ0Q7O0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBakJBO0FBQUE7QUFBQSxXQWtCRSxhQUFJQyxJQUFKLEVBQVVDLEVBQVYsRUFBYztBQUNaLFVBQUksQ0FBQ0QsSUFBRCxJQUFTLENBQUNDLEVBQWQsRUFBa0I7QUFDaEJQLFFBQUFBLElBQUksR0FBR1EsS0FBUCxDQUFhUCxHQUFiLEVBQWtCLCtDQUFsQjtBQUNBLGVBQU8sSUFBUDtBQUNEOztBQUVELFVBQUksQ0FBQ0wsTUFBTSxDQUFDLEtBQUtTLGFBQU4sRUFBcUJDLElBQXJCLENBQVgsRUFBdUM7QUFDckMsYUFBS0QsYUFBTCxDQUFtQkMsSUFBbkIsSUFBMkIsS0FBS0cseUJBQUwsQ0FBK0JILElBQS9CLENBQTNCO0FBQ0Q7O0FBRUQsVUFBSSxLQUFLRCxhQUFMLENBQW1CQyxJQUFuQixLQUE0QixLQUFLRCxhQUFMLENBQW1CQyxJQUFuQixFQUF5QkMsRUFBekIsQ0FBaEMsRUFBOEQ7QUFDNUQsZUFBTyxLQUFLRixhQUFMLENBQW1CQyxJQUFuQixFQUF5QkMsRUFBekIsQ0FBUDtBQUNEOztBQUVELGFBQU8sSUFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXhDQTtBQUFBO0FBQUEsV0F5Q0UsbUNBQTBCRCxJQUExQixFQUFnQztBQUM5QixVQUFNSSxNQUFNLEdBQUdaLGdCQUFnQixDQUFDLEtBQUtNLElBQUwsQ0FBVU8sUUFBVixDQUFtQkMsTUFBcEIsQ0FBL0I7O0FBQ0EsVUFBSSxDQUFDaEIsTUFBTSxDQUFDYyxNQUFELEVBQVNKLElBQVQsQ0FBWCxFQUEyQjtBQUN6QjtBQUNBLGVBQU8sSUFBUDtBQUNEOztBQUNELFVBQU1PLEtBQUssR0FBR0gsTUFBTSxDQUFDSixJQUFELENBQXBCO0FBQ0EsV0FBS1Esa0JBQUwsQ0FBd0IsS0FBS1YsSUFBTCxDQUFVTyxRQUFsQyxFQUE0Q0wsSUFBNUM7QUFDQSxhQUFPVCxXQUFXLENBQUNnQixLQUFELENBQWxCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXhEQTtBQUFBO0FBQUEsV0F5REUsNEJBQW1CRSxHQUFuQixFQUF3QlQsSUFBeEIsRUFBOEI7QUFDNUIsVUFBSSxDQUFDLEtBQUtGLElBQUwsQ0FBVVksT0FBVixDQUFrQkMsWUFBdkIsRUFBcUM7QUFDbkM7QUFDQTtBQUNEOztBQUNELFVBQU1DLFNBQVMsR0FBR0gsR0FBRyxDQUFDSCxNQUF0QjtBQUNBLFVBQU1PLDJCQUEyQixHQUFHcEIsc0JBQXNCLENBQUNtQixTQUFELEVBQVlaLElBQVosQ0FBMUQ7QUFDQSxVQUFNYyxPQUFPLEdBQ1hMLEdBQUcsQ0FBQ00sTUFBSixHQUNBTixHQUFHLENBQUNPLFFBREosR0FFQUgsMkJBRkEsSUFHQ0osR0FBRyxDQUFDUSxJQUFKLElBQVksRUFIYixDQURGO0FBS0EsV0FBS25CLElBQUwsQ0FBVVksT0FBVixDQUFrQkMsWUFBbEIsQ0FBK0IsSUFBL0IsRUFBcUMsRUFBckMsRUFBeUNHLE9BQXpDO0FBQ0Q7QUF0RUg7O0FBQUE7QUFBQTs7QUF5RUE7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTSSwwQkFBVCxDQUFvQ3JCLEdBQXBDLEVBQXlDO0FBQzlDUixFQUFBQSxzQkFBc0IsQ0FBQ1EsR0FBRCxFQUFNLDZCQUFOLEVBQXFDRCxZQUFyQyxDQUF0QjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTdUIsc0JBQVQsQ0FBZ0N0QixHQUFoQyxFQUFxQztBQUMxQyxTQUFPVCxVQUFVLENBQUNTLEdBQUQsRUFBTSw2QkFBTixDQUFqQjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7Z2V0U2VydmljZSwgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL3NlcnZpY2UtaGVscGVycyc7XG5pbXBvcnQge2hhc093bn0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7cGFyc2VMaW5rZXJ9IGZyb20gJy4vbGlua2VyJztcbmltcG9ydCB7cGFyc2VRdWVyeVN0cmluZ30gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nL3VybCc7XG5pbXBvcnQge3JlbW92ZVBhcmFtc0Zyb21TZWFyY2h9IGZyb20gJy4uLy4uLy4uL3NyYy91cmwnO1xuXG5pbXBvcnQge3VzZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuXG5jb25zdCBUQUcgPSAnYW1wLWFuYWx5dGljcy9saW5rZXItcmVhZGVyJztcblxuZXhwb3J0IGNsYXNzIExpbmtlclJlYWRlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKi9cbiAgY29uc3RydWN0b3Iod2luKSB7XG4gICAgLyoqIEBwcml2YXRlIHshV2luZG93fSAqL1xuICAgIHRoaXMud2luXyA9IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IU9iamVjdDxzdHJpbmcsID9PYmplY3Q8c3RyaW5nLCBzdHJpbmc+Pn0gKi9cbiAgICB0aGlzLmxpbmtlclBhcmFtc18gPSB7fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIExJTktFUl9QQVJBTShuYW1lLCBpZCkgdmFsdWUgZnJvbSB1cmwgYW5kIGNsZWFuIHRoZSB2YWx1ZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAgICogQHJldHVybiB7P3N0cmluZ31cbiAgICovXG4gIGdldChuYW1lLCBpZCkge1xuICAgIGlmICghbmFtZSB8fCAhaWQpIHtcbiAgICAgIHVzZXIoKS5lcnJvcihUQUcsICdMSU5LRVJfUEFSQU0gcmVxdWlyZXMgdHdvIHBhcmFtcywgbmFtZSBhbmQgaWQnKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghaGFzT3duKHRoaXMubGlua2VyUGFyYW1zXywgbmFtZSkpIHtcbiAgICAgIHRoaXMubGlua2VyUGFyYW1zX1tuYW1lXSA9IHRoaXMucGFyc2VBbmRDbGVhblF1ZXJ5U3RyaW5nXyhuYW1lKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5saW5rZXJQYXJhbXNfW25hbWVdICYmIHRoaXMubGlua2VyUGFyYW1zX1tuYW1lXVtpZF0pIHtcbiAgICAgIHJldHVybiB0aGlzLmxpbmtlclBhcmFtc19bbmFtZV1baWRdO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIHRoZSB1cmwgZ2V0IHRoZSBrZXkgdmFsdWUgcGFpciBmb3IgdGhlIGxpbmtlciBuYW1lXG4gICAqIGFuZCByZW1vdmUgdGhlIExJTktFUl9QQVJBTSBmcm9tIHdpbmRvdyBsb2NhdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHs/T2JqZWN0PHN0cmluZywgc3RyaW5nPn1cbiAgICovXG4gIHBhcnNlQW5kQ2xlYW5RdWVyeVN0cmluZ18obmFtZSkge1xuICAgIGNvbnN0IHBhcmFtcyA9IHBhcnNlUXVlcnlTdHJpbmcodGhpcy53aW5fLmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgaWYgKCFoYXNPd24ocGFyYW1zLCBuYW1lKSkge1xuICAgICAgLy8gTGlua2VyIHBhcmFtIG5vdCBmb3VuZC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHBhcmFtc1tuYW1lXTtcbiAgICB0aGlzLnJlbW92ZUxpbmtlclBhcmFtXyh0aGlzLndpbl8ubG9jYXRpb24sIG5hbWUpO1xuICAgIHJldHVybiBwYXJzZUxpbmtlcih2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBsaW5rZXIgcGFyYW0gZnJvbSB0aGUgY3VycmVudCB1cmxcbiAgICogQHBhcmFtIHshTG9jYXRpb259IHVybFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKi9cbiAgcmVtb3ZlTGlua2VyUGFyYW1fKHVybCwgbmFtZSkge1xuICAgIGlmICghdGhpcy53aW5fLmhpc3RvcnkucmVwbGFjZVN0YXRlKSB7XG4gICAgICAvLyBDYW4ndCByZXBsYWNlIHN0YXRlLiBJZ25vcmVcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc2VhcmNoVXJsID0gdXJsLnNlYXJjaDtcbiAgICBjb25zdCByZW1vdmVkTGlua2VyUGFyYW1TZWFyY2hVcmwgPSByZW1vdmVQYXJhbXNGcm9tU2VhcmNoKHNlYXJjaFVybCwgbmFtZSk7XG4gICAgY29uc3QgbmV3SHJlZiA9XG4gICAgICB1cmwub3JpZ2luICtcbiAgICAgIHVybC5wYXRobmFtZSArXG4gICAgICByZW1vdmVkTGlua2VyUGFyYW1TZWFyY2hVcmwgK1xuICAgICAgKHVybC5oYXNoIHx8ICcnKTtcbiAgICB0aGlzLndpbl8uaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgJycsIG5ld0hyZWYpO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxMaW5rZXJSZWFkZXJTZXJ2aWNlKHdpbikge1xuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyKHdpbiwgJ2FtcC1hbmFseXRpY3MtbGlua2VyLXJlYWRlcicsIExpbmtlclJlYWRlcik7XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4geyFMaW5rZXJSZWFkZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaW5rZXJSZWFkZXJTZXJ2aWNlRm9yKHdpbikge1xuICByZXR1cm4gZ2V0U2VydmljZSh3aW4sICdhbXAtYW5hbHl0aWNzLWxpbmtlci1yZWFkZXInKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/linker-reader.js