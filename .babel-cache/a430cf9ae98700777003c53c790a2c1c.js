function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { dict } from "../core/types/object";
import { WindowInterface } from "../core/window/interface";
import { Services } from "./";
import { getCookie, setCookie } from "../cookies";
import { dev } from "../log";
import { isProxyOrigin, parseUrlDeprecated } from "../url";
var GOOGLE_API_URL = 'https://ampcid.google.com/v1/publisher:getClientId?key=';
var TAG = 'GoogleCidApi';
var AMP_TOKEN = 'AMP_TOKEN';

/** @enum {string} */
export var TokenStatus = {
  RETRIEVING: '$RETRIEVING',
  OPT_OUT: '$OPT_OUT',
  NOT_FOUND: '$NOT_FOUND',
  ERROR: '$ERROR'
};
var TIMEOUT = 30000;
var HOUR = 60 * 60 * 1000;
var DAY = 24 * HOUR;
var YEAR = 365 * DAY;

/**
 * Client impl for Google CID API
 */
export var GoogleCidApi = /*#__PURE__*/function () {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  function GoogleCidApi(ampdoc) {
    _classCallCheck(this, GoogleCidApi);

    /**
     * @private {!Window}
     */
    this.win_ = ampdoc.win;

    /**
     * @private {!./timer-impl.Timer}
     */
    this.timer_ = Services.timerFor(this.win_);

    /**
     * @private {!Object<string, !Promise<?string>>}
     */
    this.cidPromise_ = {};

    var _Services$documentInf = Services.documentInfoForDoc(ampdoc),
        canonicalUrl = _Services$documentInf.canonicalUrl;

    /** @private {?string} */
    this.canonicalOrigin_ = canonicalUrl ? parseUrlDeprecated(canonicalUrl).origin : null;
  }

  /**
   * @param {string} apiKey
   * @param {string} scope
   * @return {!Promise<?string>}
   */
  _createClass(GoogleCidApi, [{
    key: "getScopedCid",
    value: function getScopedCid(apiKey, scope) {
      var _this = this;

      if (this.cidPromise_[scope]) {
        return this.cidPromise_[scope];
      }

      var token;
      // Block the request if a previous request is on flight
      // Poll every 200ms. Longer interval means longer latency for the 2nd CID.
      return this.cidPromise_[scope] = this.timer_.poll(200, function () {
        token = getCookie(_this.win_, AMP_TOKEN);
        return token !== TokenStatus.RETRIEVING;
      }).then(function () {
        if (token === TokenStatus.OPT_OUT) {
          return TokenStatus.OPT_OUT;
        }

        // If the page referrer is proxy origin, we force to use API even the
        // token indicates a previous fetch returned nothing
        var forceFetch = token === TokenStatus.NOT_FOUND && _this.isReferrerProxyOrigin_();

        // Token is in a special state, fallback to existing cookie
        if (!forceFetch && _this.isStatusToken_(token)) {
          return null;
        }

        if (!token || _this.isStatusToken_(token)) {
          _this.persistToken_(TokenStatus.RETRIEVING, TIMEOUT);
        }

        var url = GOOGLE_API_URL + apiKey;
        return _this.fetchCid_(dev().assertString(url), scope, token).then(function (response) {
          var cid = _this.handleResponse_(response);

          if (!cid && response['alternateUrl']) {
            // If an alternate url is provided, try again with the alternate
            // url The client is still responsible for appending API keys to
            // the URL.
            var altUrl = response['alternateUrl'] + "?key=" + apiKey;
            return _this.fetchCid_(dev().assertString(altUrl), scope, token).then(_this.handleResponse_.bind(_this));
          }

          return cid;
        }).catch(function (e) {
          _this.persistToken_(TokenStatus.ERROR, TIMEOUT);

          if (e && e.response) {
            e.response.json().then(function (res) {
              dev().error(TAG, JSON.stringify(res));
            });
          } else {
            dev().error(TAG, e);
          }

          return null;
        });
      });
    }
    /**
     * @param {string} url
     * @param {string} scope
     * @param {?string} token
     * @return {!Promise<!JsonObject>}
     */

  }, {
    key: "fetchCid_",
    value: function fetchCid_(url, scope, token) {
      var payload = dict({
        'originScope': scope,
        'canonicalOrigin': this.canonicalOrigin_
      });

      if (token) {
        payload['securityToken'] = token;
      }

      return this.timer_.timeoutPromise(TIMEOUT, Services.xhrFor(this.win_).fetchJson(url, {
        method: 'POST',
        ampCors: false,
        credentials: 'include',
        mode: 'cors',
        body: payload
      }).then(function (res) {
        return res.json();
      }));
    }
    /**
     * @param {!JsonObject} res
     * @return {?string}
     */

  }, {
    key: "handleResponse_",
    value: function handleResponse_(res) {
      if (res['optOut']) {
        this.persistToken_(TokenStatus.OPT_OUT, YEAR);
        return TokenStatus.OPT_OUT;
      }

      if (res['clientId']) {
        this.persistToken_(res['securityToken'], YEAR);
        return res['clientId'];
      }

      if (res['alternateUrl']) {
        return null;
      }

      this.persistToken_(TokenStatus.NOT_FOUND, HOUR);
      return null;
    }
    /**
     * @param {string|undefined} tokenValue
     * @param {number} expires
     */

  }, {
    key: "persistToken_",
    value: function persistToken_(tokenValue, expires) {
      if (tokenValue) {
        setCookie(this.win_, AMP_TOKEN, tokenValue, this.expiresIn_(expires), {
          highestAvailableDomain: true
        });
      }
    }
    /**
     * @param {number} time
     * @return {number}
     */

  }, {
    key: "expiresIn_",
    value: function expiresIn_(time) {
      return this.win_.Date.now() + time;
    }
    /**
     * @return {boolean}
     */

  }, {
    key: "isReferrerProxyOrigin_",
    value: function isReferrerProxyOrigin_() {
      return isProxyOrigin(WindowInterface.getDocumentReferrer(this.win_));
    }
    /**
     * @param {?string} token
     * @return {boolean}
     */

  }, {
    key: "isStatusToken_",
    value: function isStatusToken_(token) {
      return (
        /** @type {boolean} */
        token && token[0] === '$'
      );
    }
  }]);

  return GoogleCidApi;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNpZC1hcGkuanMiXSwibmFtZXMiOlsiZGljdCIsIldpbmRvd0ludGVyZmFjZSIsIlNlcnZpY2VzIiwiZ2V0Q29va2llIiwic2V0Q29va2llIiwiZGV2IiwiaXNQcm94eU9yaWdpbiIsInBhcnNlVXJsRGVwcmVjYXRlZCIsIkdPT0dMRV9BUElfVVJMIiwiVEFHIiwiQU1QX1RPS0VOIiwiVG9rZW5TdGF0dXMiLCJSRVRSSUVWSU5HIiwiT1BUX09VVCIsIk5PVF9GT1VORCIsIkVSUk9SIiwiVElNRU9VVCIsIkhPVVIiLCJEQVkiLCJZRUFSIiwiR29vZ2xlQ2lkQXBpIiwiYW1wZG9jIiwid2luXyIsIndpbiIsInRpbWVyXyIsInRpbWVyRm9yIiwiY2lkUHJvbWlzZV8iLCJkb2N1bWVudEluZm9Gb3JEb2MiLCJjYW5vbmljYWxVcmwiLCJjYW5vbmljYWxPcmlnaW5fIiwib3JpZ2luIiwiYXBpS2V5Iiwic2NvcGUiLCJ0b2tlbiIsInBvbGwiLCJ0aGVuIiwiZm9yY2VGZXRjaCIsImlzUmVmZXJyZXJQcm94eU9yaWdpbl8iLCJpc1N0YXR1c1Rva2VuXyIsInBlcnNpc3RUb2tlbl8iLCJ1cmwiLCJmZXRjaENpZF8iLCJhc3NlcnRTdHJpbmciLCJyZXNwb25zZSIsImNpZCIsImhhbmRsZVJlc3BvbnNlXyIsImFsdFVybCIsImJpbmQiLCJjYXRjaCIsImUiLCJqc29uIiwicmVzIiwiZXJyb3IiLCJKU09OIiwic3RyaW5naWZ5IiwicGF5bG9hZCIsInRpbWVvdXRQcm9taXNlIiwieGhyRm9yIiwiZmV0Y2hKc29uIiwibWV0aG9kIiwiYW1wQ29ycyIsImNyZWRlbnRpYWxzIiwibW9kZSIsImJvZHkiLCJ0b2tlblZhbHVlIiwiZXhwaXJlcyIsImV4cGlyZXNJbl8iLCJoaWdoZXN0QXZhaWxhYmxlRG9tYWluIiwidGltZSIsIkRhdGUiLCJub3ciLCJnZXREb2N1bWVudFJlZmVycmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE3IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtXaW5kb3dJbnRlcmZhY2V9IGZyb20gJyNjb3JlL3dpbmRvdy9pbnRlcmZhY2UnO1xuXG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5cbmltcG9ydCB7Z2V0Q29va2llLCBzZXRDb29raWV9IGZyb20gJy4uL2Nvb2tpZXMnO1xuaW1wb3J0IHtkZXZ9IGZyb20gJy4uL2xvZyc7XG5pbXBvcnQge2lzUHJveHlPcmlnaW4sIHBhcnNlVXJsRGVwcmVjYXRlZH0gZnJvbSAnLi4vdXJsJztcblxuY29uc3QgR09PR0xFX0FQSV9VUkwgPVxuICAnaHR0cHM6Ly9hbXBjaWQuZ29vZ2xlLmNvbS92MS9wdWJsaXNoZXI6Z2V0Q2xpZW50SWQ/a2V5PSc7XG5cbmNvbnN0IFRBRyA9ICdHb29nbGVDaWRBcGknO1xuY29uc3QgQU1QX1RPS0VOID0gJ0FNUF9UT0tFTic7XG5cbi8qKiBAZW51bSB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IFRva2VuU3RhdHVzID0ge1xuICBSRVRSSUVWSU5HOiAnJFJFVFJJRVZJTkcnLFxuICBPUFRfT1VUOiAnJE9QVF9PVVQnLFxuICBOT1RfRk9VTkQ6ICckTk9UX0ZPVU5EJyxcbiAgRVJST1I6ICckRVJST1InLFxufTtcblxuY29uc3QgVElNRU9VVCA9IDMwMDAwO1xuY29uc3QgSE9VUiA9IDYwICogNjAgKiAxMDAwO1xuY29uc3QgREFZID0gMjQgKiBIT1VSO1xuY29uc3QgWUVBUiA9IDM2NSAqIERBWTtcblxuLyoqXG4gKiBDbGllbnQgaW1wbCBmb3IgR29vZ2xlIENJRCBBUElcbiAqL1xuZXhwb3J0IGNsYXNzIEdvb2dsZUNpZEFwaSB7XG4gIC8qKiBAcGFyYW0geyEuL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jICovXG4gIGNvbnN0cnVjdG9yKGFtcGRvYykge1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlIHshV2luZG93fVxuICAgICAqL1xuICAgIHRoaXMud2luXyA9IGFtcGRvYy53aW47XG4gICAgLyoqXG4gICAgICogQHByaXZhdGUgeyEuL3RpbWVyLWltcGwuVGltZXJ9XG4gICAgICovXG4gICAgdGhpcy50aW1lcl8gPSBTZXJ2aWNlcy50aW1lckZvcih0aGlzLndpbl8pO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGUgeyFPYmplY3Q8c3RyaW5nLCAhUHJvbWlzZTw/c3RyaW5nPj59XG4gICAgICovXG4gICAgdGhpcy5jaWRQcm9taXNlXyA9IHt9O1xuXG4gICAgY29uc3Qge2Nhbm9uaWNhbFVybH0gPSBTZXJ2aWNlcy5kb2N1bWVudEluZm9Gb3JEb2MoYW1wZG9jKTtcblxuICAgIC8qKiBAcHJpdmF0ZSB7P3N0cmluZ30gKi9cbiAgICB0aGlzLmNhbm9uaWNhbE9yaWdpbl8gPSBjYW5vbmljYWxVcmxcbiAgICAgID8gcGFyc2VVcmxEZXByZWNhdGVkKGNhbm9uaWNhbFVybCkub3JpZ2luXG4gICAgICA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGFwaUtleVxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2NvcGVcbiAgICogQHJldHVybiB7IVByb21pc2U8P3N0cmluZz59XG4gICAqL1xuICBnZXRTY29wZWRDaWQoYXBpS2V5LCBzY29wZSkge1xuICAgIGlmICh0aGlzLmNpZFByb21pc2VfW3Njb3BlXSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2lkUHJvbWlzZV9bc2NvcGVdO1xuICAgIH1cbiAgICBsZXQgdG9rZW47XG4gICAgLy8gQmxvY2sgdGhlIHJlcXVlc3QgaWYgYSBwcmV2aW91cyByZXF1ZXN0IGlzIG9uIGZsaWdodFxuICAgIC8vIFBvbGwgZXZlcnkgMjAwbXMuIExvbmdlciBpbnRlcnZhbCBtZWFucyBsb25nZXIgbGF0ZW5jeSBmb3IgdGhlIDJuZCBDSUQuXG4gICAgcmV0dXJuICh0aGlzLmNpZFByb21pc2VfW3Njb3BlXSA9IHRoaXMudGltZXJfXG4gICAgICAucG9sbCgyMDAsICgpID0+IHtcbiAgICAgICAgdG9rZW4gPSBnZXRDb29raWUodGhpcy53aW5fLCBBTVBfVE9LRU4pO1xuICAgICAgICByZXR1cm4gdG9rZW4gIT09IFRva2VuU3RhdHVzLlJFVFJJRVZJTkc7XG4gICAgICB9KVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAodG9rZW4gPT09IFRva2VuU3RhdHVzLk9QVF9PVVQpIHtcbiAgICAgICAgICByZXR1cm4gVG9rZW5TdGF0dXMuT1BUX09VVDtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB0aGUgcGFnZSByZWZlcnJlciBpcyBwcm94eSBvcmlnaW4sIHdlIGZvcmNlIHRvIHVzZSBBUEkgZXZlbiB0aGVcbiAgICAgICAgLy8gdG9rZW4gaW5kaWNhdGVzIGEgcHJldmlvdXMgZmV0Y2ggcmV0dXJuZWQgbm90aGluZ1xuICAgICAgICBjb25zdCBmb3JjZUZldGNoID1cbiAgICAgICAgICB0b2tlbiA9PT0gVG9rZW5TdGF0dXMuTk9UX0ZPVU5EICYmIHRoaXMuaXNSZWZlcnJlclByb3h5T3JpZ2luXygpO1xuXG4gICAgICAgIC8vIFRva2VuIGlzIGluIGEgc3BlY2lhbCBzdGF0ZSwgZmFsbGJhY2sgdG8gZXhpc3RpbmcgY29va2llXG4gICAgICAgIGlmICghZm9yY2VGZXRjaCAmJiB0aGlzLmlzU3RhdHVzVG9rZW5fKHRva2VuKSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0b2tlbiB8fCB0aGlzLmlzU3RhdHVzVG9rZW5fKHRva2VuKSkge1xuICAgICAgICAgIHRoaXMucGVyc2lzdFRva2VuXyhUb2tlblN0YXR1cy5SRVRSSUVWSU5HLCBUSU1FT1VUKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVybCA9IEdPT0dMRV9BUElfVVJMICsgYXBpS2V5O1xuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaENpZF8oZGV2KCkuYXNzZXJ0U3RyaW5nKHVybCksIHNjb3BlLCB0b2tlbilcbiAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNpZCA9IHRoaXMuaGFuZGxlUmVzcG9uc2VfKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIGlmICghY2lkICYmIHJlc3BvbnNlWydhbHRlcm5hdGVVcmwnXSkge1xuICAgICAgICAgICAgICAvLyBJZiBhbiBhbHRlcm5hdGUgdXJsIGlzIHByb3ZpZGVkLCB0cnkgYWdhaW4gd2l0aCB0aGUgYWx0ZXJuYXRlXG4gICAgICAgICAgICAgIC8vIHVybCBUaGUgY2xpZW50IGlzIHN0aWxsIHJlc3BvbnNpYmxlIGZvciBhcHBlbmRpbmcgQVBJIGtleXMgdG9cbiAgICAgICAgICAgICAgLy8gdGhlIFVSTC5cbiAgICAgICAgICAgICAgY29uc3QgYWx0VXJsID0gYCR7cmVzcG9uc2VbJ2FsdGVybmF0ZVVybCddfT9rZXk9JHthcGlLZXl9YDtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hDaWRfKFxuICAgICAgICAgICAgICAgIGRldigpLmFzc2VydFN0cmluZyhhbHRVcmwpLFxuICAgICAgICAgICAgICAgIHNjb3BlLFxuICAgICAgICAgICAgICAgIHRva2VuXG4gICAgICAgICAgICAgICkudGhlbih0aGlzLmhhbmRsZVJlc3BvbnNlXy5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjaWQ7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGVyc2lzdFRva2VuXyhUb2tlblN0YXR1cy5FUlJPUiwgVElNRU9VVCk7XG4gICAgICAgICAgICBpZiAoZSAmJiBlLnJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgIGUucmVzcG9uc2UuanNvbigpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIGRldigpLmVycm9yKFRBRywgSlNPTi5zdHJpbmdpZnkocmVzKSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGV2KCkuZXJyb3IoVEFHLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH0pO1xuICAgICAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNjb3BlXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gdG9rZW5cbiAgICogQHJldHVybiB7IVByb21pc2U8IUpzb25PYmplY3Q+fVxuICAgKi9cbiAgZmV0Y2hDaWRfKHVybCwgc2NvcGUsIHRva2VuKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IGRpY3Qoe1xuICAgICAgJ29yaWdpblNjb3BlJzogc2NvcGUsXG4gICAgICAnY2Fub25pY2FsT3JpZ2luJzogdGhpcy5jYW5vbmljYWxPcmlnaW5fLFxuICAgIH0pO1xuICAgIGlmICh0b2tlbikge1xuICAgICAgcGF5bG9hZFsnc2VjdXJpdHlUb2tlbiddID0gdG9rZW47XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRpbWVyXy50aW1lb3V0UHJvbWlzZShcbiAgICAgIFRJTUVPVVQsXG4gICAgICBTZXJ2aWNlcy54aHJGb3IodGhpcy53aW5fKVxuICAgICAgICAuZmV0Y2hKc29uKHVybCwge1xuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgIGFtcENvcnM6IGZhbHNlLFxuICAgICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG4gICAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICAgIGJvZHk6IHBheWxvYWQsXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChyZXMpID0+IHJlcy5qc29uKCkpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFKc29uT2JqZWN0fSByZXNcbiAgICogQHJldHVybiB7P3N0cmluZ31cbiAgICovXG4gIGhhbmRsZVJlc3BvbnNlXyhyZXMpIHtcbiAgICBpZiAocmVzWydvcHRPdXQnXSkge1xuICAgICAgdGhpcy5wZXJzaXN0VG9rZW5fKFRva2VuU3RhdHVzLk9QVF9PVVQsIFlFQVIpO1xuICAgICAgcmV0dXJuIFRva2VuU3RhdHVzLk9QVF9PVVQ7XG4gICAgfVxuICAgIGlmIChyZXNbJ2NsaWVudElkJ10pIHtcbiAgICAgIHRoaXMucGVyc2lzdFRva2VuXyhyZXNbJ3NlY3VyaXR5VG9rZW4nXSwgWUVBUik7XG4gICAgICByZXR1cm4gcmVzWydjbGllbnRJZCddO1xuICAgIH1cbiAgICBpZiAocmVzWydhbHRlcm5hdGVVcmwnXSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRoaXMucGVyc2lzdFRva2VuXyhUb2tlblN0YXR1cy5OT1RfRk9VTkQsIEhPVVIpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfHVuZGVmaW5lZH0gdG9rZW5WYWx1ZVxuICAgKiBAcGFyYW0ge251bWJlcn0gZXhwaXJlc1xuICAgKi9cbiAgcGVyc2lzdFRva2VuXyh0b2tlblZhbHVlLCBleHBpcmVzKSB7XG4gICAgaWYgKHRva2VuVmFsdWUpIHtcbiAgICAgIHNldENvb2tpZSh0aGlzLndpbl8sIEFNUF9UT0tFTiwgdG9rZW5WYWx1ZSwgdGhpcy5leHBpcmVzSW5fKGV4cGlyZXMpLCB7XG4gICAgICAgIGhpZ2hlc3RBdmFpbGFibGVEb21haW46IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVcbiAgICogQHJldHVybiB7bnVtYmVyfVxuICAgKi9cbiAgZXhwaXJlc0luXyh0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMud2luXy5EYXRlLm5vdygpICsgdGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNSZWZlcnJlclByb3h5T3JpZ2luXygpIHtcbiAgICByZXR1cm4gaXNQcm94eU9yaWdpbihXaW5kb3dJbnRlcmZhY2UuZ2V0RG9jdW1lbnRSZWZlcnJlcih0aGlzLndpbl8pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IHRva2VuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBpc1N0YXR1c1Rva2VuXyh0b2tlbikge1xuICAgIHJldHVybiAvKiogQHR5cGUge2Jvb2xlYW59ICovICh0b2tlbiAmJiB0b2tlblswXSA9PT0gJyQnKTtcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/cid-api.js