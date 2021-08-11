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

import { dict } from "../core/types/object";
import { WindowInterface } from "../core/window/interface";

import { Services } from "./";

import { getCookie, setCookie } from "../cookies";
import { dev } from "../log";
import { isProxyOrigin, parseUrlDeprecated } from "../url";

var GOOGLE_API_URL =
'https://ampcid.google.com/v1/publisher:getClientId?key=';

var TAG = 'GoogleCidApi';
var AMP_TOKEN = 'AMP_TOKEN';

/** @enum {string} */
export var TokenStatus = {
  RETRIEVING: '$RETRIEVING',
  OPT_OUT: '$OPT_OUT',
  NOT_FOUND: '$NOT_FOUND',
  ERROR: '$ERROR' };


var TIMEOUT = 30000;
var HOUR = 60 * 60 * 1000;
var DAY = 24 * HOUR;
var YEAR = 365 * DAY;

/**
 * Client impl for Google CID API
 */
export var GoogleCidApi = /*#__PURE__*/function () {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  function GoogleCidApi(ampdoc) {_classCallCheck(this, GoogleCidApi);
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

    var _Services$documentInf = Services.documentInfoForDoc(ampdoc),canonicalUrl = _Services$documentInf.canonicalUrl;

    /** @private {?string} */
    this.canonicalOrigin_ = canonicalUrl ?
    parseUrlDeprecated(canonicalUrl).origin :
    null;
  }

  /**
   * @param {string} apiKey
   * @param {string} scope
   * @return {!Promise<?string>}
   */_createClass(GoogleCidApi, [{ key: "getScopedCid", value:
    function getScopedCid(apiKey, scope) {var _this = this;
      if (this.cidPromise_[scope]) {
        return this.cidPromise_[scope];
      }
      var token;
      // Block the request if a previous request is on flight
      // Poll every 200ms. Longer interval means longer latency for the 2nd CID.
      return (this.cidPromise_[scope] = this.timer_.
      poll(200, function () {
        token = getCookie(_this.win_, AMP_TOKEN);
        return token !== TokenStatus.RETRIEVING;
      }).
      then(function () {
        if (token === TokenStatus.OPT_OUT) {
          return TokenStatus.OPT_OUT;
        }
        // If the page referrer is proxy origin, we force to use API even the
        // token indicates a previous fetch returned nothing
        var forceFetch =
        token === TokenStatus.NOT_FOUND && _this.isReferrerProxyOrigin_();

        // Token is in a special state, fallback to existing cookie
        if (!forceFetch && _this.isStatusToken_(token)) {
          return null;
        }

        if (!token || _this.isStatusToken_(token)) {
          _this.persistToken_(TokenStatus.RETRIEVING, TIMEOUT);
        }

        var url = GOOGLE_API_URL + apiKey;
        return _this.fetchCid_( /** @type {string} */(url), scope, token).
        then(function (response) {
          var cid = _this.handleResponse_(response);
          if (!cid && response['alternateUrl']) {
            // If an alternate url is provided, try again with the alternate
            // url The client is still responsible for appending API keys to
            // the URL.
            var altUrl = "".concat(response['alternateUrl'], "?key=").concat(apiKey);
            return _this.fetchCid_( /** @type {string} */(
            altUrl),
            scope,
            token).
            then(_this.handleResponse_.bind(_this));
          }
          return cid;
        }).
        catch(function (e) {
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
      }));
    }

    /**
     * @param {string} url
     * @param {string} scope
     * @param {?string} token
     * @return {!Promise<!JsonObject>}
     */ }, { key: "fetchCid_", value:
    function fetchCid_(url, scope, token) {
      var payload = dict({
        'originScope': scope,
        'canonicalOrigin': this.canonicalOrigin_ });

      if (token) {
        payload['securityToken'] = token;
      }
      return this.timer_.timeoutPromise(
      TIMEOUT,
      Services.xhrFor(this.win_).
      fetchJson(url, {
        method: 'POST',
        ampCors: false,
        credentials: 'include',
        mode: 'cors',
        body: payload }).

      then(function (res) {return res.json();}));

    }

    /**
     * @param {!JsonObject} res
     * @return {?string}
     */ }, { key: "handleResponse_", value:
    function handleResponse_(res) {
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
     */ }, { key: "persistToken_", value:
    function persistToken_(tokenValue, expires) {
      if (tokenValue) {
        setCookie(this.win_, AMP_TOKEN, tokenValue, this.expiresIn_(expires), {
          highestAvailableDomain: true });

      }
    }

    /**
     * @param {number} time
     * @return {number}
     */ }, { key: "expiresIn_", value:
    function expiresIn_(time) {
      return this.win_.Date.now() + time;
    }

    /**
     * @return {boolean}
     */ }, { key: "isReferrerProxyOrigin_", value:
    function isReferrerProxyOrigin_() {
      return isProxyOrigin(WindowInterface.getDocumentReferrer(this.win_));
    }

    /**
     * @param {?string} token
     * @return {boolean}
     */ }, { key: "isStatusToken_", value:
    function isStatusToken_(token) {
      return (/** @type {boolean} */(token && token[0] === '$'));
    } }]);return GoogleCidApi;}();
// /Users/mszylkowski/src/amphtml/src/service/cid-api.js