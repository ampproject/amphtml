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
import { dict } from "../core/types/object";
import { Services } from "./";
import { dev } from "../log";
import { getSourceOrigin } from "../url";

/**
 * The Client ID service key.
 * @const @private {string}
 */
var SERVICE_KEY_ = 'AIzaSyDKtqGxnoeIqVM33Uf7hRSa3GJxuzR7mLc';

/**
 * Tag for debug logging.
 * @const @private {string}
 */
var TAG_ = 'CacheCidApi';

/**
 * The URL for the cache-served CID API.
 * @const @private {string}
 */
var CACHE_API_URL = 'https://ampcid.google.com/v1/cache:getClientId?key=';

/**
 * The XHR timeout in milliseconds for requests to the CID API.
 * @const @private {number}
 */
var TIMEOUT_ = 30000;

/**
 * Exposes CID API for cache-served pages without a viewer.
 */
export var CacheCidApi = /*#__PURE__*/function () {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  function CacheCidApi(ampdoc) {
    _classCallCheck(this, CacheCidApi);

    /** @private {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!./viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);

    /** @private {?Promise<?string>} */
    this.publisherCidPromise_ = null;

    /** @private {!./timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.ampdoc_.win);
  }

  /**
   * Returns true if the page is embedded in CCT and is served by a proxy.
   * @return {boolean}
   */
  _createClass(CacheCidApi, [{
    key: "isSupported",
    value: function isSupported() {
      return this.viewer_.isCctEmbedded() && this.viewer_.isProxyOrigin();
    }
    /**
     * Returns scoped CID retrieved from the Viewer.
     * @param {string} scope
     * @return {!Promise<?string>}
     */

  }, {
    key: "getScopedCid",
    value: function getScopedCid(scope) {
      var _this = this;

      if (!this.viewer_.isCctEmbedded()) {
        return (
          /** @type {!Promise<?string>} */
          Promise.resolve(null)
        );
      }

      if (!this.publisherCidPromise_) {
        var url = CACHE_API_URL + SERVICE_KEY_;
        this.publisherCidPromise_ = this.fetchCid_(url);
      }

      return this.publisherCidPromise_.then(function (publisherCid) {
        return publisherCid ? _this.scopeCid_(publisherCid, scope) : null;
      });
    }
    /**
     * Returns scoped CID retrieved from the Viewer.
     * @param {string} url
     * @param {boolean=} useAlternate
     * @return {!Promise<?string>}
     */

  }, {
    key: "fetchCid_",
    value: function fetchCid_(url, useAlternate) {
      var _this2 = this;

      if (useAlternate === void 0) {
        useAlternate = true;
      }

      var payload = dict({
        'publisherOrigin': getSourceOrigin(this.ampdoc_.win.location)
      });
      // Make the XHR request to the cache endpoint.
      var timeoutMessage = 'fetchCidTimeout';
      return this.timer_.timeoutPromise(TIMEOUT_, Services.xhrFor(this.ampdoc_.win).fetchJson(url, {
        method: 'POST',
        ampCors: false,
        credentials: 'include',
        mode: 'cors',
        body: payload
      }), timeoutMessage).then(function (res) {
        return res.json().then(function (response) {
          if (response['optOut']) {
            return null;
          }

          var cid = response['publisherClientId'];

          if (!cid && useAlternate && response['alternateUrl']) {
            // If an alternate url is provided, try again with the alternate url
            // The client is still responsible for appending API keys to the URL.
            var alt = response['alternateUrl'] + "?key=" + SERVICE_KEY_;
            return _this2.fetchCid_(dev().assertString(alt), false);
          }

          return cid;
        });
      }).catch(function (e) {
        if (e && e.response) {
          e.response.json().then(function (res) {
            dev().error(TAG_, JSON.stringify(res));
          });
        } else {
          var isTimeout = e && e.message == timeoutMessage;

          if (isTimeout) {
            dev().expectedError(TAG_, e);
          } else {
            dev().error(TAG_, e);
          }
        }

        return null;
      });
    }
    /**
     * Returns scoped CID extracted from the fetched publisherCid.
     * @param {string} publisherCid
     * @param {string} scope
     * @return {!Promise<string>}
     */

  }, {
    key: "scopeCid_",
    value: function scopeCid_(publisherCid, scope) {
      var text = publisherCid + ';' + scope;
      return Services.cryptoFor(this.ampdoc_.win).sha384Base64(text).then(function (enc) {
        return 'amp-' + enc;
      });
    }
  }]);

  return CacheCidApi;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhY2hlLWNpZC1hcGkuanMiXSwibmFtZXMiOlsiZGljdCIsIlNlcnZpY2VzIiwiZGV2IiwiZ2V0U291cmNlT3JpZ2luIiwiU0VSVklDRV9LRVlfIiwiVEFHXyIsIkNBQ0hFX0FQSV9VUkwiLCJUSU1FT1VUXyIsIkNhY2hlQ2lkQXBpIiwiYW1wZG9jIiwiYW1wZG9jXyIsInZpZXdlcl8iLCJ2aWV3ZXJGb3JEb2MiLCJwdWJsaXNoZXJDaWRQcm9taXNlXyIsInRpbWVyXyIsInRpbWVyRm9yIiwid2luIiwiaXNDY3RFbWJlZGRlZCIsImlzUHJveHlPcmlnaW4iLCJzY29wZSIsIlByb21pc2UiLCJyZXNvbHZlIiwidXJsIiwiZmV0Y2hDaWRfIiwidGhlbiIsInB1Ymxpc2hlckNpZCIsInNjb3BlQ2lkXyIsInVzZUFsdGVybmF0ZSIsInBheWxvYWQiLCJsb2NhdGlvbiIsInRpbWVvdXRNZXNzYWdlIiwidGltZW91dFByb21pc2UiLCJ4aHJGb3IiLCJmZXRjaEpzb24iLCJtZXRob2QiLCJhbXBDb3JzIiwiY3JlZGVudGlhbHMiLCJtb2RlIiwiYm9keSIsInJlcyIsImpzb24iLCJyZXNwb25zZSIsImNpZCIsImFsdCIsImFzc2VydFN0cmluZyIsImNhdGNoIiwiZSIsImVycm9yIiwiSlNPTiIsInN0cmluZ2lmeSIsImlzVGltZW91dCIsIm1lc3NhZ2UiLCJleHBlY3RlZEVycm9yIiwidGV4dCIsImNyeXB0b0ZvciIsInNoYTM4NEJhc2U2NCIsImVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsSUFBUjtBQUVBLFNBQVFDLFFBQVI7QUFFQSxTQUFRQyxHQUFSO0FBQ0EsU0FBUUMsZUFBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLFlBQVksR0FBRyx5Q0FBckI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFD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LEdBQXFCTixLQUFsQztBQUNBLGFBQU9sQixRQUFRLENBQUNxRCxTQUFULENBQW1CLEtBQUs1QyxPQUFMLENBQWFNLEdBQWhDLEVBQ0p1QyxZQURJLENBQ1NGLElBRFQsRUFFSjdCLElBRkksQ0FFQyxVQUFDZ0MsR0FBRCxFQUFTO0FBQ2IsZUFBTyxTQUFTQSxHQUFoQjtBQUNELE9BSkksQ0FBUDtBQUtEO0FBbEhIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7ZGV2fSBmcm9tICcuLi9sb2cnO1xuaW1wb3J0IHtnZXRTb3VyY2VPcmlnaW59IGZyb20gJy4uL3VybCc7XG5cbi8qKlxuICogVGhlIENsaWVudCBJRCBzZXJ2aWNlIGtleS5cbiAqIEBjb25zdCBAcHJpdmF0ZSB7c3RyaW5nfVxuICovXG5jb25zdCBTRVJWSUNFX0tFWV8gPSAnQUl6YVN5REt0cUd4bm9lSXFWTTMzVWY3aFJTYTNHSnh1elI3bUxjJztcblxuLyoqXG4gKiBUYWcgZm9yIGRlYnVnIGxvZ2dpbmcuXG4gKiBAY29uc3QgQHByaXZhdGUge3N0cmluZ31cbiAqL1xuY29uc3QgVEFHXyA9ICdDYWNoZUNpZEFwaSc7XG5cbi8qKlxuICogVGhlIFVSTCBmb3IgdGhlIGNhY2hlLXNlcnZlZCBDSUQgQVBJLlxuICogQGNvbnN0IEBwcml2YXRlIHtzdHJpbmd9XG4gKi9cbmNvbnN0IENBQ0hFX0FQSV9VUkwgPSAnaHR0cHM6Ly9hbXBjaWQuZ29vZ2xlLmNvbS92MS9jYWNoZTpnZXRDbGllbnRJZD9rZXk9JztcblxuLyoqXG4gKiBUaGUgWEhSIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIGZvciByZXF1ZXN0cyB0byB0aGUgQ0lEIEFQSS5cbiAqIEBjb25zdCBAcHJpdmF0ZSB7bnVtYmVyfVxuICovXG5jb25zdCBUSU1FT1VUXyA9IDMwMDAwO1xuXG4vKipcbiAqIEV4cG9zZXMgQ0lEIEFQSSBmb3IgY2FjaGUtc2VydmVkIHBhZ2VzIHdpdGhvdXQgYSB2aWV3ZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBDYWNoZUNpZEFwaSB7XG4gIC8qKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYykge1xuICAgIC8qKiBAcHJpdmF0ZSB7IS4vYW1wZG9jLWltcGwuQW1wRG9jfSAqL1xuICAgIHRoaXMuYW1wZG9jXyA9IGFtcGRvYztcblxuICAgIC8qKiBAcHJpdmF0ZSB7IS4vdmlld2VyLWludGVyZmFjZS5WaWV3ZXJJbnRlcmZhY2V9ICovXG4gICAgdGhpcy52aWV3ZXJfID0gU2VydmljZXMudmlld2VyRm9yRG9jKHRoaXMuYW1wZG9jXyk7XG5cbiAgICAvKiogQHByaXZhdGUgez9Qcm9taXNlPD9zdHJpbmc+fSAqL1xuICAgIHRoaXMucHVibGlzaGVyQ2lkUHJvbWlzZV8gPSBudWxsO1xuXG4gICAgLyoqIEBwcml2YXRlIHshLi90aW1lci1pbXBsLlRpbWVyfSAqL1xuICAgIHRoaXMudGltZXJfID0gU2VydmljZXMudGltZXJGb3IodGhpcy5hbXBkb2NfLndpbik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBwYWdlIGlzIGVtYmVkZGVkIGluIENDVCBhbmQgaXMgc2VydmVkIGJ5IGEgcHJveHkuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc1N1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy52aWV3ZXJfLmlzQ2N0RW1iZWRkZWQoKSAmJiB0aGlzLnZpZXdlcl8uaXNQcm94eU9yaWdpbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgc2NvcGVkIENJRCByZXRyaWV2ZWQgZnJvbSB0aGUgVmlld2VyLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2NvcGVcbiAgICogQHJldHVybiB7IVByb21pc2U8P3N0cmluZz59XG4gICAqL1xuICBnZXRTY29wZWRDaWQoc2NvcGUpIHtcbiAgICBpZiAoIXRoaXMudmlld2VyXy5pc0NjdEVtYmVkZGVkKCkpIHtcbiAgICAgIHJldHVybiAvKiogQHR5cGUgeyFQcm9taXNlPD9zdHJpbmc+fSAqLyAoUHJvbWlzZS5yZXNvbHZlKG51bGwpKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucHVibGlzaGVyQ2lkUHJvbWlzZV8pIHtcbiAgICAgIGNvbnN0IHVybCA9IENBQ0hFX0FQSV9VUkwgKyBTRVJWSUNFX0tFWV87XG4gICAgICB0aGlzLnB1Ymxpc2hlckNpZFByb21pc2VfID0gdGhpcy5mZXRjaENpZF8odXJsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wdWJsaXNoZXJDaWRQcm9taXNlXy50aGVuKChwdWJsaXNoZXJDaWQpID0+IHtcbiAgICAgIHJldHVybiBwdWJsaXNoZXJDaWQgPyB0aGlzLnNjb3BlQ2lkXyhwdWJsaXNoZXJDaWQsIHNjb3BlKSA6IG51bGw7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBzY29wZWQgQ0lEIHJldHJpZXZlZCBmcm9tIHRoZSBWaWV3ZXIuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdXNlQWx0ZXJuYXRlXG4gICAqIEByZXR1cm4geyFQcm9taXNlPD9zdHJpbmc+fVxuICAgKi9cbiAgZmV0Y2hDaWRfKHVybCwgdXNlQWx0ZXJuYXRlID0gdHJ1ZSkge1xuICAgIGNvbnN0IHBheWxvYWQgPSBkaWN0KHtcbiAgICAgICdwdWJsaXNoZXJPcmlnaW4nOiBnZXRTb3VyY2VPcmlnaW4odGhpcy5hbXBkb2NfLndpbi5sb2NhdGlvbiksXG4gICAgfSk7XG5cbiAgICAvLyBNYWtlIHRoZSBYSFIgcmVxdWVzdCB0byB0aGUgY2FjaGUgZW5kcG9pbnQuXG4gICAgY29uc3QgdGltZW91dE1lc3NhZ2UgPSAnZmV0Y2hDaWRUaW1lb3V0JztcbiAgICByZXR1cm4gdGhpcy50aW1lcl9cbiAgICAgIC50aW1lb3V0UHJvbWlzZShcbiAgICAgICAgVElNRU9VVF8sXG4gICAgICAgIFNlcnZpY2VzLnhockZvcih0aGlzLmFtcGRvY18ud2luKS5mZXRjaEpzb24odXJsLCB7XG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgYW1wQ29yczogZmFsc2UsXG4gICAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcbiAgICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgICAgYm9keTogcGF5bG9hZCxcbiAgICAgICAgfSksXG4gICAgICAgIHRpbWVvdXRNZXNzYWdlXG4gICAgICApXG4gICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgIHJldHVybiByZXMuanNvbigpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3BvbnNlWydvcHRPdXQnXSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGNpZCA9IHJlc3BvbnNlWydwdWJsaXNoZXJDbGllbnRJZCddO1xuICAgICAgICAgIGlmICghY2lkICYmIHVzZUFsdGVybmF0ZSAmJiByZXNwb25zZVsnYWx0ZXJuYXRlVXJsJ10pIHtcbiAgICAgICAgICAgIC8vIElmIGFuIGFsdGVybmF0ZSB1cmwgaXMgcHJvdmlkZWQsIHRyeSBhZ2FpbiB3aXRoIHRoZSBhbHRlcm5hdGUgdXJsXG4gICAgICAgICAgICAvLyBUaGUgY2xpZW50IGlzIHN0aWxsIHJlc3BvbnNpYmxlIGZvciBhcHBlbmRpbmcgQVBJIGtleXMgdG8gdGhlIFVSTC5cbiAgICAgICAgICAgIGNvbnN0IGFsdCA9IGAke3Jlc3BvbnNlWydhbHRlcm5hdGVVcmwnXX0/a2V5PSR7U0VSVklDRV9LRVlffWA7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mZXRjaENpZF8oZGV2KCkuYXNzZXJ0U3RyaW5nKGFsdCksIGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNpZDtcbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgIGlmIChlICYmIGUucmVzcG9uc2UpIHtcbiAgICAgICAgICBlLnJlc3BvbnNlLmpzb24oKS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgIGRldigpLmVycm9yKFRBR18sIEpTT04uc3RyaW5naWZ5KHJlcykpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGlzVGltZW91dCA9IGUgJiYgZS5tZXNzYWdlID09IHRpbWVvdXRNZXNzYWdlO1xuICAgICAgICAgIGlmIChpc1RpbWVvdXQpIHtcbiAgICAgICAgICAgIGRldigpLmV4cGVjdGVkRXJyb3IoVEFHXywgZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRldigpLmVycm9yKFRBR18sIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgc2NvcGVkIENJRCBleHRyYWN0ZWQgZnJvbSB0aGUgZmV0Y2hlZCBwdWJsaXNoZXJDaWQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwdWJsaXNoZXJDaWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNjb3BlXG4gICAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZz59XG4gICAqL1xuICBzY29wZUNpZF8ocHVibGlzaGVyQ2lkLCBzY29wZSkge1xuICAgIGNvbnN0IHRleHQgPSBwdWJsaXNoZXJDaWQgKyAnOycgKyBzY29wZTtcbiAgICByZXR1cm4gU2VydmljZXMuY3J5cHRvRm9yKHRoaXMuYW1wZG9jXy53aW4pXG4gICAgICAuc2hhMzg0QmFzZTY0KHRleHQpXG4gICAgICAudGhlbigoZW5jKSA9PiB7XG4gICAgICAgIHJldHVybiAnYW1wLScgKyBlbmM7XG4gICAgICB9KTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/cache-cid-api.js