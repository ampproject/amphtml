function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  function CacheCidApi(ampdoc) {_classCallCheck(this, CacheCidApi);
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
   */_createClass(CacheCidApi, [{ key: "isSupported", value:
    function isSupported() {
      return this.viewer_.isCctEmbedded() && this.viewer_.isProxyOrigin();
    }

    /**
     * Returns scoped CID retrieved from the Viewer.
     * @param {string} scope
     * @return {!Promise<?string>}
     */ }, { key: "getScopedCid", value:
    function getScopedCid(scope) {var _this = this;
      if (!this.viewer_.isCctEmbedded()) {
        return (/** @type {!Promise<?string>} */(Promise.resolve(null)));
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
     */ }, { key: "fetchCid_", value:
    function fetchCid_(url) {var _this2 = this;var useAlternate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var payload = dict({
        'publisherOrigin': getSourceOrigin(this.ampdoc_.win.location) });


      // Make the XHR request to the cache endpoint.
      var timeoutMessage = 'fetchCidTimeout';
      return this.timer_.
      timeoutPromise(
      TIMEOUT_,
      Services.xhrFor(this.ampdoc_.win).fetchJson(url, {
        method: 'POST',
        ampCors: false,
        credentials: 'include',
        mode: 'cors',
        body: payload }),

      timeoutMessage).

      then(function (res) {
        return res.json().then(function (response) {
          if (response['optOut']) {
            return null;
          }
          var cid = response['publisherClientId'];
          if (!cid && useAlternate && response['alternateUrl']) {
            // If an alternate url is provided, try again with the alternate url
            // The client is still responsible for appending API keys to the URL.
            var alt = "".concat(response['alternateUrl'], "?key=").concat(SERVICE_KEY_);
            return _this2.fetchCid_( /** @type {string} */(alt), false);
          }
          return cid;
        });
      }).
      catch(function (e) {
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
     */ }, { key: "scopeCid_", value:
    function scopeCid_(publisherCid, scope) {
      var text = publisherCid + ';' + scope;
      return Services.cryptoFor(this.ampdoc_.win).
      sha384Base64(text).
      then(function (enc) {
        return 'amp-' + enc;
      });
    } }]);return CacheCidApi;}();
// /Users/mszylkowski/src/amphtml/src/service/cache-cid-api.js