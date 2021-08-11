import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { BASE_CID_MAX_AGE_MILLIS } from "../../../src/service/cid-impl";
import { ChunkPriority, chunk } from "../../../src/chunk";
import { Deferred } from "../../../src/core/data-structures/promise";
import { SameSite, setCookie } from "../../../src/cookies";
import { Services } from "../../../src/service";
import { hasOwn } from "../../../src/core/types/object";
import { isCookieAllowed } from "./cookie-reader";
import { isObject } from "../../../src/core/types";
import { user } from "../../../src/log";
import { variableServiceForDoc } from "./variables";

var TAG = 'amp-analytics/cookie-writer';

var RESERVED_KEYS = {
  'referrerDomains': true,
  'enabled': true,
  'cookiePath': true,
  'cookieMaxAge': true,
  'cookieSecure': true,
  'cookieDomain': true,
  'sameSite': true,
  'SameSite': true,
  'secure': true };


export var CookieWriter = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {!JsonObject} config
   */
  function CookieWriter(win, element, config) {_classCallCheck(this, CookieWriter);
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Element} */
    this.element_ = element;

    /** @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacementService_ = Services.urlReplacementsForDoc(element);

    /** @private {?Deferred} */
    this.writeDeferred_ = null;

    /** @private {!JsonObject} */
    this.config_ = config;

    /** @const @private {!JsonObject} */
    this.bindings_ = variableServiceForDoc(element).getMacros(element);
  }

  /**
   * @return {!Promise}
   */_createClass(CookieWriter, [{ key: "write", value:
    function write() {var _this = this;
      if (!this.writeDeferred_) {
        this.writeDeferred_ = new Deferred();
        var task = function task() {
          _this.writeDeferred_.resolve(_this.init_());
        };
        // CookieWriter is not supported in inabox ad. Always chunk
        chunk(this.element_, task, ChunkPriority.LOW);
      }
      return this.writeDeferred_.promise;
    }

    /**
     * Parse the config and write to cookie
     * Config looks like
     * cookies: {
     *   enabled: true/false, //Default to true
     *   cookieNameA: {
     *     value: cookieValueA (QUERY_PARAM/LINKER_PARAM)
     *   },
     *   cookieValueB: {
     *     value: cookieValueB
     *   }
     *   ...
     * }
     * @return {!Promise}
     */ }, { key: "init_", value:
    function init_() {
      // TODO: Need the consider the case for shadow doc.
      if (!isCookieAllowed(this.win_, this.element_)) {
        // Note: It's important to check origin here so that setCookie doesn't
        // throw error "should not attempt ot set cookie on proxy origin"
        return _resolvedPromise();
      }

      if (!hasOwn(this.config_, 'cookies')) {
        return _resolvedPromise2();
      }

      if (!isObject(this.config_['cookies'])) {
        user().error(TAG, 'cookies config must be an object');
        return _resolvedPromise3();
      }

      var inputConfig = this.config_['cookies'];

      if (inputConfig['enabled'] === false) {
        // Enabled by default
        // TODO: Allow individual cookie object to override the value
        return _resolvedPromise4();
      }

      var cookieExpireDateMs = this.getCookieMaxAgeMs_(inputConfig);

      var ids = Object.keys(inputConfig);
      var promises = [];
      for (var i = 0; i < ids.length; i++) {
        var cookieName = ids[i];
        var cookieObj = inputConfig[cookieName];
        var sameSite = this.getSameSiteType_(
        // individual cookie sameSite/SameSite overrides config sameSite/SameSite
        cookieObj['sameSite'] ||
        cookieObj['SameSite'] ||
        inputConfig['sameSite'] ||
        inputConfig['SameSite']);

        if (this.isValidCookieConfig_(cookieName, cookieObj)) {
          promises.push(
          this.expandAndWrite_(
          cookieName,
          cookieObj['value'],
          cookieExpireDateMs,
          sameSite));


        }
      }

      return Promise.all(promises);
    }

    /**
     * Retrieves cookieMaxAge from given config, provides default value if no
     * value is found or value is invalid
     * @param {JsonObject} inputConfig
     * @return {number}
     */ }, { key: "getCookieMaxAgeMs_", value:
    function getCookieMaxAgeMs_(inputConfig) {
      if (!hasOwn(inputConfig, 'cookieMaxAge')) {
        return BASE_CID_MAX_AGE_MILLIS;
      }

      var cookieMaxAgeNumber = Number(inputConfig['cookieMaxAge']);

      // 0 is a special case which we allow
      if (!cookieMaxAgeNumber && cookieMaxAgeNumber !== 0) {
        user().error(
        TAG,
        'invalid cookieMaxAge %s, falling back to default value (1 year)',
        inputConfig['cookieMaxAge']);

        return BASE_CID_MAX_AGE_MILLIS;
      }

      if (cookieMaxAgeNumber <= 0) {
        user().warn(
        TAG,
        'cookieMaxAge %s less than or equal to 0, cookie will immediately expire',
        inputConfig['cookieMaxAge']);

      }

      // convert cookieMaxAge (sec) to milliseconds
      return cookieMaxAgeNumber * 1000;
    }

    /**
     * Check whether the cookie value is supported. Currently only support
     * QUERY_PARAM(***) and LINKER_PARAM(***, ***)
     *
     * CookieObj should looks like
     * cookieName: {
     *  value: string (cookieValue),
     * }
     * @param {string} cookieName
     * @param {*} cookieConfig
     * @return {boolean}
     */ }, { key: "isValidCookieConfig_", value:
    function isValidCookieConfig_(cookieName, cookieConfig) {
      if (RESERVED_KEYS[cookieName]) {
        return false;
      }

      if (!isObject(cookieConfig)) {
        user().error(TAG, 'cookieValue must be configured in an object');
        return false;
      }

      if (!hasOwn(cookieConfig, 'value')) {
        user().error(TAG, 'value is required in the cookieValue object');
        return false;
      }

      return true;
    }

    /**
     * Expand the value and write to cookie if necessary
     * @param {string} cookieName
     * @param {string} cookieValue
     * @param {number} cookieExpireDateMs
     * @param {!SameSite=} sameSite
     * @return {!Promise}
     */ }, { key: "expandAndWrite_", value:
    function expandAndWrite_(cookieName, cookieValue, cookieExpireDateMs, sameSite) {var _this2 = this;
      // Note: Have to use `expandStringAsync` because QUERY_PARAM can wait for
      // trackImpressionPromise and resolve async
      return this.urlReplacementService_.
      expandStringAsync(cookieValue, this.bindings_).
      then(function (value) {
        // Note: We ignore empty cookieValue, that means currently we don't
        // provide a way to overwrite or erase existing cookie
        if (value) {
          var expireDate = Date.now() + cookieExpireDateMs;
          // SameSite=None must be secure as per
          // https://web.dev/samesite-cookies-explained/#samesitenone-must-be-secure
          var secure = sameSite === SameSite.NONE;
          setCookie(_this2.win_, cookieName, value, expireDate, {
            highestAvailableDomain: true,
            sameSite: sameSite,
            secure: secure });

        }
      }).
      catch(function (e) {
        user().error(TAG, 'Error expanding cookie string', e);
      });
    }

    /**
     * Converts SameSite string to SameSite type.
     * @param {string=} sameSite
     * @return {SameSite|undefined}
     */ }, { key: "getSameSiteType_", value:
    function getSameSiteType_(sameSite) {
      switch (sameSite) {
        case 'Strict':
          return SameSite.STRICT;
        case 'Lax':
          return SameSite.LAX;
        case 'None':
          return SameSite.NONE;
        default:
          return;}

    } }]);return CookieWriter;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/cookie-writer.js