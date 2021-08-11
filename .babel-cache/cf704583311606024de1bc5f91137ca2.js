import { resolvedPromise as _resolvedPromise4 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise3 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";
import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";

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
  'secure': true
};
export var CookieWriter = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {!JsonObject} config
   */
  function CookieWriter(win, element, config) {
    _classCallCheck(this, CookieWriter);

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
   */
  _createClass(CookieWriter, [{
    key: "write",
    value: function write() {
      var _this = this;

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
     */

  }, {
    key: "init_",
    value: function init_() {
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
        var sameSite = this.getSameSiteType_( // individual cookie sameSite/SameSite overrides config sameSite/SameSite
        cookieObj['sameSite'] || cookieObj['SameSite'] || inputConfig['sameSite'] || inputConfig['SameSite']);

        if (this.isValidCookieConfig_(cookieName, cookieObj)) {
          promises.push(this.expandAndWrite_(cookieName, cookieObj['value'], cookieExpireDateMs, sameSite));
        }
      }

      return Promise.all(promises);
    }
    /**
     * Retrieves cookieMaxAge from given config, provides default value if no
     * value is found or value is invalid
     * @param {JsonObject} inputConfig
     * @return {number}
     */

  }, {
    key: "getCookieMaxAgeMs_",
    value: function getCookieMaxAgeMs_(inputConfig) {
      if (!hasOwn(inputConfig, 'cookieMaxAge')) {
        return BASE_CID_MAX_AGE_MILLIS;
      }

      var cookieMaxAgeNumber = Number(inputConfig['cookieMaxAge']);

      // 0 is a special case which we allow
      if (!cookieMaxAgeNumber && cookieMaxAgeNumber !== 0) {
        user().error(TAG, 'invalid cookieMaxAge %s, falling back to default value (1 year)', inputConfig['cookieMaxAge']);
        return BASE_CID_MAX_AGE_MILLIS;
      }

      if (cookieMaxAgeNumber <= 0) {
        user().warn(TAG, 'cookieMaxAge %s less than or equal to 0, cookie will immediately expire', inputConfig['cookieMaxAge']);
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
     */

  }, {
    key: "isValidCookieConfig_",
    value: function isValidCookieConfig_(cookieName, cookieConfig) {
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
     */

  }, {
    key: "expandAndWrite_",
    value: function expandAndWrite_(cookieName, cookieValue, cookieExpireDateMs, sameSite) {
      var _this2 = this;

      // Note: Have to use `expandStringAsync` because QUERY_PARAM can wait for
      // trackImpressionPromise and resolve async
      return this.urlReplacementService_.expandStringAsync(cookieValue, this.bindings_).then(function (value) {
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
            secure: secure
          });
        }
      }).catch(function (e) {
        user().error(TAG, 'Error expanding cookie string', e);
      });
    }
    /**
     * Converts SameSite string to SameSite type.
     * @param {string=} sameSite
     * @return {SameSite|undefined}
     */

  }, {
    key: "getSameSiteType_",
    value: function getSameSiteType_(sameSite) {
      switch (sameSite) {
        case 'Strict':
          return SameSite.STRICT;

        case 'Lax':
          return SameSite.LAX;

        case 'None':
          return SameSite.NONE;

        default:
          return;
      }
    }
  }]);

  return CookieWriter;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvb2tpZS13cml0ZXIuanMiXSwibmFtZXMiOlsiQkFTRV9DSURfTUFYX0FHRV9NSUxMSVMiLCJDaHVua1ByaW9yaXR5IiwiY2h1bmsiLCJEZWZlcnJlZCIsIlNhbWVTaXRlIiwic2V0Q29va2llIiwiU2VydmljZXMiLCJoYXNPd24iLCJpc0Nvb2tpZUFsbG93ZWQiLCJpc09iamVjdCIsInVzZXIiLCJ2YXJpYWJsZVNlcnZpY2VGb3JEb2MiLCJUQUciLCJSRVNFUlZFRF9LRVlTIiwiQ29va2llV3JpdGVyIiwid2luIiwiZWxlbWVudCIsImNvbmZpZyIsIndpbl8iLCJlbGVtZW50XyIsInVybFJlcGxhY2VtZW50U2VydmljZV8iLCJ1cmxSZXBsYWNlbWVudHNGb3JEb2MiLCJ3cml0ZURlZmVycmVkXyIsImNvbmZpZ18iLCJiaW5kaW5nc18iLCJnZXRNYWNyb3MiLCJ0YXNrIiwicmVzb2x2ZSIsImluaXRfIiwiTE9XIiwicHJvbWlzZSIsImVycm9yIiwiaW5wdXRDb25maWciLCJjb29raWVFeHBpcmVEYXRlTXMiLCJnZXRDb29raWVNYXhBZ2VNc18iLCJpZHMiLCJPYmplY3QiLCJrZXlzIiwicHJvbWlzZXMiLCJpIiwibGVuZ3RoIiwiY29va2llTmFtZSIsImNvb2tpZU9iaiIsInNhbWVTaXRlIiwiZ2V0U2FtZVNpdGVUeXBlXyIsImlzVmFsaWRDb29raWVDb25maWdfIiwicHVzaCIsImV4cGFuZEFuZFdyaXRlXyIsIlByb21pc2UiLCJhbGwiLCJjb29raWVNYXhBZ2VOdW1iZXIiLCJOdW1iZXIiLCJ3YXJuIiwiY29va2llQ29uZmlnIiwiY29va2llVmFsdWUiLCJleHBhbmRTdHJpbmdBc3luYyIsInRoZW4iLCJ2YWx1ZSIsImV4cGlyZURhdGUiLCJEYXRlIiwibm93Iiwic2VjdXJlIiwiTk9ORSIsImhpZ2hlc3RBdmFpbGFibGVEb21haW4iLCJjYXRjaCIsImUiLCJTVFJJQ1QiLCJMQVgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNB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IEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge0JBU0VfQ0lEX01BWF9BR0VfTUlMTElTfSBmcm9tICcjc2VydmljZS9jaWQtaW1wbCc7XG5pbXBvcnQge0NodW5rUHJpb3JpdHksIGNodW5rfSBmcm9tICcuLi8uLi8uLi9zcmMvY2h1bmsnO1xuaW1wb3J0IHtEZWZlcnJlZH0gZnJvbSAnI2NvcmUvZGF0YS1zdHJ1Y3R1cmVzL3Byb21pc2UnO1xuaW1wb3J0IHtTYW1lU2l0ZSwgc2V0Q29va2llfSBmcm9tICcuLi8uLi8uLi9zcmMvY29va2llcyc7XG5pbXBvcnQge1NlcnZpY2VzfSBmcm9tICcjc2VydmljZSc7XG5pbXBvcnQge2hhc093bn0gZnJvbSAnI2NvcmUvdHlwZXMvb2JqZWN0JztcbmltcG9ydCB7aXNDb29raWVBbGxvd2VkfSBmcm9tICcuL2Nvb2tpZS1yZWFkZXInO1xuaW1wb3J0IHtpc09iamVjdH0gZnJvbSAnI2NvcmUvdHlwZXMnO1xuaW1wb3J0IHt1c2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcbmltcG9ydCB7dmFyaWFibGVTZXJ2aWNlRm9yRG9jfSBmcm9tICcuL3ZhcmlhYmxlcyc7XG5cbmNvbnN0IFRBRyA9ICdhbXAtYW5hbHl0aWNzL2Nvb2tpZS13cml0ZXInO1xuXG5jb25zdCBSRVNFUlZFRF9LRVlTID0ge1xuICAncmVmZXJyZXJEb21haW5zJzogdHJ1ZSxcbiAgJ2VuYWJsZWQnOiB0cnVlLFxuICAnY29va2llUGF0aCc6IHRydWUsXG4gICdjb29raWVNYXhBZ2UnOiB0cnVlLFxuICAnY29va2llU2VjdXJlJzogdHJ1ZSxcbiAgJ2Nvb2tpZURvbWFpbic6IHRydWUsXG4gICdzYW1lU2l0ZSc6IHRydWUsXG4gICdTYW1lU2l0ZSc6IHRydWUsXG4gICdzZWN1cmUnOiB0cnVlLFxufTtcblxuZXhwb3J0IGNsYXNzIENvb2tpZVdyaXRlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3R9IGNvbmZpZ1xuICAgKi9cbiAgY29uc3RydWN0b3Iod2luLCBlbGVtZW50LCBjb25maWcpIHtcbiAgICAvKiogQHByaXZhdGUgeyFXaW5kb3d9ICovXG4gICAgdGhpcy53aW5fID0gd2luO1xuXG4gICAgLyoqIEBwcml2YXRlIHshRWxlbWVudH0gKi9cbiAgICB0aGlzLmVsZW1lbnRfID0gZWxlbWVudDtcblxuICAgIC8qKiBAcHJpdmF0ZSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL3VybC1yZXBsYWNlbWVudHMtaW1wbC5VcmxSZXBsYWNlbWVudHN9ICovXG4gICAgdGhpcy51cmxSZXBsYWNlbWVudFNlcnZpY2VfID0gU2VydmljZXMudXJsUmVwbGFjZW1lbnRzRm9yRG9jKGVsZW1lbnQpO1xuXG4gICAgLyoqIEBwcml2YXRlIHs/RGVmZXJyZWR9ICovXG4gICAgdGhpcy53cml0ZURlZmVycmVkXyA9IG51bGw7XG5cbiAgICAvKiogQHByaXZhdGUgeyFKc29uT2JqZWN0fSAqL1xuICAgIHRoaXMuY29uZmlnXyA9IGNvbmZpZztcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyFKc29uT2JqZWN0fSAqL1xuICAgIHRoaXMuYmluZGluZ3NfID0gdmFyaWFibGVTZXJ2aWNlRm9yRG9jKGVsZW1lbnQpLmdldE1hY3JvcyhlbGVtZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIHdyaXRlKCkge1xuICAgIGlmICghdGhpcy53cml0ZURlZmVycmVkXykge1xuICAgICAgdGhpcy53cml0ZURlZmVycmVkXyA9IG5ldyBEZWZlcnJlZCgpO1xuICAgICAgY29uc3QgdGFzayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy53cml0ZURlZmVycmVkXy5yZXNvbHZlKHRoaXMuaW5pdF8oKSk7XG4gICAgICB9O1xuICAgICAgLy8gQ29va2llV3JpdGVyIGlzIG5vdCBzdXBwb3J0ZWQgaW4gaW5hYm94IGFkLiBBbHdheXMgY2h1bmtcbiAgICAgIGNodW5rKHRoaXMuZWxlbWVudF8sIHRhc2ssIENodW5rUHJpb3JpdHkuTE9XKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMud3JpdGVEZWZlcnJlZF8ucHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSB0aGUgY29uZmlnIGFuZCB3cml0ZSB0byBjb29raWVcbiAgICogQ29uZmlnIGxvb2tzIGxpa2VcbiAgICogY29va2llczoge1xuICAgKiAgIGVuYWJsZWQ6IHRydWUvZmFsc2UsIC8vRGVmYXVsdCB0byB0cnVlXG4gICAqICAgY29va2llTmFtZUE6IHtcbiAgICogICAgIHZhbHVlOiBjb29raWVWYWx1ZUEgKFFVRVJZX1BBUkFNL0xJTktFUl9QQVJBTSlcbiAgICogICB9LFxuICAgKiAgIGNvb2tpZVZhbHVlQjoge1xuICAgKiAgICAgdmFsdWU6IGNvb2tpZVZhbHVlQlxuICAgKiAgIH1cbiAgICogICAuLi5cbiAgICogfVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZX1cbiAgICovXG4gIGluaXRfKCkge1xuICAgIC8vIFRPRE86IE5lZWQgdGhlIGNvbnNpZGVyIHRoZSBjYXNlIGZvciBzaGFkb3cgZG9jLlxuICAgIGlmICghaXNDb29raWVBbGxvd2VkKHRoaXMud2luXywgdGhpcy5lbGVtZW50XykpIHtcbiAgICAgIC8vIE5vdGU6IEl0J3MgaW1wb3J0YW50IHRvIGNoZWNrIG9yaWdpbiBoZXJlIHNvIHRoYXQgc2V0Q29va2llIGRvZXNuJ3RcbiAgICAgIC8vIHRocm93IGVycm9yIFwic2hvdWxkIG5vdCBhdHRlbXB0IG90IHNldCBjb29raWUgb24gcHJveHkgb3JpZ2luXCJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBpZiAoIWhhc093bih0aGlzLmNvbmZpZ18sICdjb29raWVzJykpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzT2JqZWN0KHRoaXMuY29uZmlnX1snY29va2llcyddKSkge1xuICAgICAgdXNlcigpLmVycm9yKFRBRywgJ2Nvb2tpZXMgY29uZmlnIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXRDb25maWcgPSB0aGlzLmNvbmZpZ19bJ2Nvb2tpZXMnXTtcblxuICAgIGlmIChpbnB1dENvbmZpZ1snZW5hYmxlZCddID09PSBmYWxzZSkge1xuICAgICAgLy8gRW5hYmxlZCBieSBkZWZhdWx0XG4gICAgICAvLyBUT0RPOiBBbGxvdyBpbmRpdmlkdWFsIGNvb2tpZSBvYmplY3QgdG8gb3ZlcnJpZGUgdGhlIHZhbHVlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29va2llRXhwaXJlRGF0ZU1zID0gdGhpcy5nZXRDb29raWVNYXhBZ2VNc18oaW5wdXRDb25maWcpO1xuXG4gICAgY29uc3QgaWRzID0gT2JqZWN0LmtleXMoaW5wdXRDb25maWcpO1xuICAgIGNvbnN0IHByb21pc2VzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNvb2tpZU5hbWUgPSBpZHNbaV07XG4gICAgICBjb25zdCBjb29raWVPYmogPSBpbnB1dENvbmZpZ1tjb29raWVOYW1lXTtcbiAgICAgIGNvbnN0IHNhbWVTaXRlID0gdGhpcy5nZXRTYW1lU2l0ZVR5cGVfKFxuICAgICAgICAvLyBpbmRpdmlkdWFsIGNvb2tpZSBzYW1lU2l0ZS9TYW1lU2l0ZSBvdmVycmlkZXMgY29uZmlnIHNhbWVTaXRlL1NhbWVTaXRlXG4gICAgICAgIGNvb2tpZU9ialsnc2FtZVNpdGUnXSB8fFxuICAgICAgICAgIGNvb2tpZU9ialsnU2FtZVNpdGUnXSB8fFxuICAgICAgICAgIGlucHV0Q29uZmlnWydzYW1lU2l0ZSddIHx8XG4gICAgICAgICAgaW5wdXRDb25maWdbJ1NhbWVTaXRlJ11cbiAgICAgICk7XG4gICAgICBpZiAodGhpcy5pc1ZhbGlkQ29va2llQ29uZmlnXyhjb29raWVOYW1lLCBjb29raWVPYmopKSB7XG4gICAgICAgIHByb21pc2VzLnB1c2goXG4gICAgICAgICAgdGhpcy5leHBhbmRBbmRXcml0ZV8oXG4gICAgICAgICAgICBjb29raWVOYW1lLFxuICAgICAgICAgICAgY29va2llT2JqWyd2YWx1ZSddLFxuICAgICAgICAgICAgY29va2llRXhwaXJlRGF0ZU1zLFxuICAgICAgICAgICAgc2FtZVNpdGVcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgY29va2llTWF4QWdlIGZyb20gZ2l2ZW4gY29uZmlnLCBwcm92aWRlcyBkZWZhdWx0IHZhbHVlIGlmIG5vXG4gICAqIHZhbHVlIGlzIGZvdW5kIG9yIHZhbHVlIGlzIGludmFsaWRcbiAgICogQHBhcmFtIHtKc29uT2JqZWN0fSBpbnB1dENvbmZpZ1xuICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAqL1xuICBnZXRDb29raWVNYXhBZ2VNc18oaW5wdXRDb25maWcpIHtcbiAgICBpZiAoIWhhc093bihpbnB1dENvbmZpZywgJ2Nvb2tpZU1heEFnZScpKSB7XG4gICAgICByZXR1cm4gQkFTRV9DSURfTUFYX0FHRV9NSUxMSVM7XG4gICAgfVxuXG4gICAgY29uc3QgY29va2llTWF4QWdlTnVtYmVyID0gTnVtYmVyKGlucHV0Q29uZmlnWydjb29raWVNYXhBZ2UnXSk7XG5cbiAgICAvLyAwIGlzIGEgc3BlY2lhbCBjYXNlIHdoaWNoIHdlIGFsbG93XG4gICAgaWYgKCFjb29raWVNYXhBZ2VOdW1iZXIgJiYgY29va2llTWF4QWdlTnVtYmVyICE9PSAwKSB7XG4gICAgICB1c2VyKCkuZXJyb3IoXG4gICAgICAgIFRBRyxcbiAgICAgICAgJ2ludmFsaWQgY29va2llTWF4QWdlICVzLCBmYWxsaW5nIGJhY2sgdG8gZGVmYXVsdCB2YWx1ZSAoMSB5ZWFyKScsXG4gICAgICAgIGlucHV0Q29uZmlnWydjb29raWVNYXhBZ2UnXVxuICAgICAgKTtcbiAgICAgIHJldHVybiBCQVNFX0NJRF9NQVhfQUdFX01JTExJUztcbiAgICB9XG5cbiAgICBpZiAoY29va2llTWF4QWdlTnVtYmVyIDw9IDApIHtcbiAgICAgIHVzZXIoKS53YXJuKFxuICAgICAgICBUQUcsXG4gICAgICAgICdjb29raWVNYXhBZ2UgJXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIDAsIGNvb2tpZSB3aWxsIGltbWVkaWF0ZWx5IGV4cGlyZScsXG4gICAgICAgIGlucHV0Q29uZmlnWydjb29raWVNYXhBZ2UnXVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBjb252ZXJ0IGNvb2tpZU1heEFnZSAoc2VjKSB0byBtaWxsaXNlY29uZHNcbiAgICByZXR1cm4gY29va2llTWF4QWdlTnVtYmVyICogMTAwMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBjb29raWUgdmFsdWUgaXMgc3VwcG9ydGVkLiBDdXJyZW50bHkgb25seSBzdXBwb3J0XG4gICAqIFFVRVJZX1BBUkFNKCoqKikgYW5kIExJTktFUl9QQVJBTSgqKiosICoqKilcbiAgICpcbiAgICogQ29va2llT2JqIHNob3VsZCBsb29rcyBsaWtlXG4gICAqIGNvb2tpZU5hbWU6IHtcbiAgICogIHZhbHVlOiBzdHJpbmcgKGNvb2tpZVZhbHVlKSxcbiAgICogfVxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29va2llTmFtZVxuICAgKiBAcGFyYW0geyp9IGNvb2tpZUNvbmZpZ1xuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaXNWYWxpZENvb2tpZUNvbmZpZ18oY29va2llTmFtZSwgY29va2llQ29uZmlnKSB7XG4gICAgaWYgKFJFU0VSVkVEX0tFWVNbY29va2llTmFtZV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIWlzT2JqZWN0KGNvb2tpZUNvbmZpZykpIHtcbiAgICAgIHVzZXIoKS5lcnJvcihUQUcsICdjb29raWVWYWx1ZSBtdXN0IGJlIGNvbmZpZ3VyZWQgaW4gYW4gb2JqZWN0Jyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFoYXNPd24oY29va2llQ29uZmlnLCAndmFsdWUnKSkge1xuICAgICAgdXNlcigpLmVycm9yKFRBRywgJ3ZhbHVlIGlzIHJlcXVpcmVkIGluIHRoZSBjb29raWVWYWx1ZSBvYmplY3QnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmQgdGhlIHZhbHVlIGFuZCB3cml0ZSB0byBjb29raWUgaWYgbmVjZXNzYXJ5XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb29raWVOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb29raWVWYWx1ZVxuICAgKiBAcGFyYW0ge251bWJlcn0gY29va2llRXhwaXJlRGF0ZU1zXG4gICAqIEBwYXJhbSB7IVNhbWVTaXRlPX0gc2FtZVNpdGVcbiAgICogQHJldHVybiB7IVByb21pc2V9XG4gICAqL1xuICBleHBhbmRBbmRXcml0ZV8oY29va2llTmFtZSwgY29va2llVmFsdWUsIGNvb2tpZUV4cGlyZURhdGVNcywgc2FtZVNpdGUpIHtcbiAgICAvLyBOb3RlOiBIYXZlIHRvIHVzZSBgZXhwYW5kU3RyaW5nQXN5bmNgIGJlY2F1c2UgUVVFUllfUEFSQU0gY2FuIHdhaXQgZm9yXG4gICAgLy8gdHJhY2tJbXByZXNzaW9uUHJvbWlzZSBhbmQgcmVzb2x2ZSBhc3luY1xuICAgIHJldHVybiB0aGlzLnVybFJlcGxhY2VtZW50U2VydmljZV9cbiAgICAgIC5leHBhbmRTdHJpbmdBc3luYyhjb29raWVWYWx1ZSwgdGhpcy5iaW5kaW5nc18pXG4gICAgICAudGhlbigodmFsdWUpID0+IHtcbiAgICAgICAgLy8gTm90ZTogV2UgaWdub3JlIGVtcHR5IGNvb2tpZVZhbHVlLCB0aGF0IG1lYW5zIGN1cnJlbnRseSB3ZSBkb24ndFxuICAgICAgICAvLyBwcm92aWRlIGEgd2F5IHRvIG92ZXJ3cml0ZSBvciBlcmFzZSBleGlzdGluZyBjb29raWVcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgY29uc3QgZXhwaXJlRGF0ZSA9IERhdGUubm93KCkgKyBjb29raWVFeHBpcmVEYXRlTXM7XG4gICAgICAgICAgLy8gU2FtZVNpdGU9Tm9uZSBtdXN0IGJlIHNlY3VyZSBhcyBwZXJcbiAgICAgICAgICAvLyBodHRwczovL3dlYi5kZXYvc2FtZXNpdGUtY29va2llcy1leHBsYWluZWQvI3NhbWVzaXRlbm9uZS1tdXN0LWJlLXNlY3VyZVxuICAgICAgICAgIGNvbnN0IHNlY3VyZSA9IHNhbWVTaXRlID09PSBTYW1lU2l0ZS5OT05FO1xuICAgICAgICAgIHNldENvb2tpZSh0aGlzLndpbl8sIGNvb2tpZU5hbWUsIHZhbHVlLCBleHBpcmVEYXRlLCB7XG4gICAgICAgICAgICBoaWdoZXN0QXZhaWxhYmxlRG9tYWluOiB0cnVlLFxuICAgICAgICAgICAgc2FtZVNpdGUsXG4gICAgICAgICAgICBzZWN1cmUsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgdXNlcigpLmVycm9yKFRBRywgJ0Vycm9yIGV4cGFuZGluZyBjb29raWUgc3RyaW5nJywgZSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBTYW1lU2l0ZSBzdHJpbmcgdG8gU2FtZVNpdGUgdHlwZS5cbiAgICogQHBhcmFtIHtzdHJpbmc9fSBzYW1lU2l0ZVxuICAgKiBAcmV0dXJuIHtTYW1lU2l0ZXx1bmRlZmluZWR9XG4gICAqL1xuICBnZXRTYW1lU2l0ZVR5cGVfKHNhbWVTaXRlKSB7XG4gICAgc3dpdGNoIChzYW1lU2l0ZSkge1xuICAgICAgY2FzZSAnU3RyaWN0JzpcbiAgICAgICAgcmV0dXJuIFNhbWVTaXRlLlNUUklDVDtcbiAgICAgIGNhc2UgJ0xheCc6XG4gICAgICAgIHJldHVybiBTYW1lU2l0ZS5MQVg7XG4gICAgICBjYXNlICdOb25lJzpcbiAgICAgICAgcmV0dXJuIFNhbWVTaXRlLk5PTkU7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm47XG4gICAgfVxuICB9XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/cookie-writer.js