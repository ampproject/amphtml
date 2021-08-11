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
import { Services } from "../../../src/service";
import { getChildJsonConfig } from "../../../src/core/dom";
import { isProtocolValid } from "../../../src/url";
import { once } from "../../../src/core/types/function";
import { registerServiceBuilder } from "../../../src/service-helpers";
import { user, userAssert } from "../../../src/log";

/** @private @const {string} */
export var CONFIG_SRC_ATTRIBUTE_NAME = 'src';

/** @private const {string} */
export var CREDENTIALS_ATTRIBUTE_NAME = 'data-credentials';

/** @private @const {string} */
var TAG = 'amp-story-request-service';

/**
 * Service to send XHRs.
 */
export var AmpStoryRequestService = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   * @param {!Element} storyElement
   */
  function AmpStoryRequestService(win, storyElement) {
    var _this = this;

    _classCallCheck(this, AmpStoryRequestService);

    /** @private @const {!Element} */
    this.storyElement_ = storyElement;

    /** @private @const {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(win);

    /** @const @type {function():(!Promise<!JsonObject>|!Promise<null>)} */
    this.loadShareConfig = once(function () {
      return _this.loadShareConfigImpl_();
    });
  }

  /**
   * @param {string} rawUrl
   * @param {Object=} opts
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   */
  _createClass(AmpStoryRequestService, [{
    key: "executeRequest",
    value: function executeRequest(rawUrl, opts) {
      var _this2 = this;

      if (opts === void 0) {
        opts = {};
      }

      if (!isProtocolValid(rawUrl)) {
        user().error(TAG, 'Invalid config url.');
        return Promise.resolve(null);
      }

      return Services.urlReplacementsForDoc(this.storyElement_).expandUrlAsync(user().assertString(rawUrl)).then(function (url) {
        return _this2.xhr_.fetchJson(url, opts);
      }).then(function (response) {
        userAssert(response.ok, 'Invalid HTTP response');
        return response.json();
      });
    }
    /**
     * Retrieves the publisher share providers.
     * Has to be called through `loadShareConfig`.
     * @return {(!Promise<!JsonObject>|!Promise<null>)}
     */

  }, {
    key: "loadShareConfigImpl_",
    value: function loadShareConfigImpl_() {
      var shareConfigEl = this.storyElement_.querySelector('amp-story-social-share, amp-story-bookend');

      if (!shareConfigEl) {
        return _resolvedPromise();
      }

      if (shareConfigEl.hasAttribute(CONFIG_SRC_ATTRIBUTE_NAME)) {
        var rawUrl = shareConfigEl.getAttribute(CONFIG_SRC_ATTRIBUTE_NAME);
        var credentials = shareConfigEl.getAttribute(CREDENTIALS_ATTRIBUTE_NAME);
        return this.executeRequest(rawUrl, credentials ? {
          credentials: credentials
        } : {});
      }

      // Fallback. Check for an inline json config.
      var config = null;

      try {
        config = getChildJsonConfig(shareConfigEl);
      } catch (err) {}

      return Promise.resolve(config);
    }
  }]);

  return AmpStoryRequestService;
}();

/**
 * Util function to retrieve the request service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param  {!Window} win
 * @param  {!Element} storyEl
 * @return {!AmpStoryRequestService}
 */
export var getRequestService = function getRequestService(win, storyEl) {
  var service = Services.storyRequestService(win);

  if (!service) {
    service = new AmpStoryRequestService(win, storyEl);
    registerServiceBuilder(win, 'story-request', function () {
      return service;
    });
  }

  return service;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zdG9yeS1yZXF1ZXN0LXNlcnZpY2UuanMiXSwibmFtZXMiOlsiU2VydmljZXMiLCJnZXRDaGlsZEpzb25Db25maWciLCJpc1Byb3RvY29sVmFsaWQiLCJvbmNlIiwicmVnaXN0ZXJTZXJ2aWNlQnVpbGRlciIsInVzZXIiLCJ1c2VyQXNzZXJ0IiwiQ09ORklHX1NSQ19BVFRSSUJVVEVfTkFNRSIsIkNSRURFTlRJQUxTX0FUVFJJQlVURV9OQU1FIiwiVEFHIiwiQW1wU3RvcnlSZXF1ZXN0U2VydmljZSIsIndpbiIsInN0b3J5RWxlbWVudCIsInN0b3J5RWxlbWVudF8iLCJ4aHJfIiwieGhyRm9yIiwibG9hZFNoYXJlQ29uZmlnIiwibG9hZFNoYXJlQ29uZmlnSW1wbF8iLCJyYXdVcmwiLCJvcHRzIiwiZXJyb3IiLCJQcm9taXNlIiwicmVzb2x2ZSIsInVybFJlcGxhY2VtZW50c0ZvckRvYyIsImV4cGFuZFVybEFzeW5jIiwiYXNzZXJ0U3RyaW5nIiwidGhlbiIsInVybCIsImZldGNoSnNvbiIsInJlc3BvbnNlIiwib2siLCJqc29uIiwic2hhcmVDb25maWdFbCIsInF1ZXJ5U2VsZWN0b3IiLCJoYXNBdHRyaWJ1dGUiLCJnZXRBdHRyaWJ1dGUiLCJjcmVkZW50aWFscyIsImV4ZWN1dGVSZXF1ZXN0IiwiY29uZmlnIiwiZXJyIiwiZ2V0UmVxdWVzdFNlcnZpY2UiLCJzdG9yeUVsIiwic2VydmljZSIsInN0b3J5UmVxdWVzdFNlcnZpY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsUUFBUjtBQUNBLFNBQVFDLGtCQUFSO0FBQ0EsU0FBUUMsZUFBUjtBQUNBLFNBQVFDLElBQVI7QUFDQSxTQUFRQyxzQkFBUjtBQUNBLFNBQVFDLElBQVIsRUFBY0MsVUFBZDs7QUFFQTtBQUNBLE9BQU8sSUFBTUMseUJBQXlC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QUFRLENBQUMyQyxtQkFBVCxDQUE2QmhDLEdBQTdCLENBQWQ7O0FBRUEsTUFBSSxDQUFDK0IsT0FBTCxFQUFjO0FBQ1pBLElBQUFBLE9BQU8sR0FBRyxJQUFJaEMsc0JBQUosQ0FBMkJDLEdBQTNCLEVBQWdDOEIsT0FBaEMsQ0FBVjtBQUNBckMsSUFBQUEsc0JBQXNCLENBQUNPLEdBQUQsRUFBTSxlQUFOLEVBQXVCLFlBQVk7QUFDdkQsYUFBTytCLE9BQVA7QUFDRCxLQUZxQixDQUF0QjtBQUdEOztBQUVELFNBQU9BLE9BQVA7QUFDRCxDQVhNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7U2VydmljZXN9IGZyb20gJyNzZXJ2aWNlJztcbmltcG9ydCB7Z2V0Q2hpbGRKc29uQ29uZmlnfSBmcm9tICcjY29yZS9kb20nO1xuaW1wb3J0IHtpc1Byb3RvY29sVmFsaWR9IGZyb20gJy4uLy4uLy4uL3NyYy91cmwnO1xuaW1wb3J0IHtvbmNlfSBmcm9tICcjY29yZS90eXBlcy9mdW5jdGlvbic7XG5pbXBvcnQge3JlZ2lzdGVyU2VydmljZUJ1aWxkZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9zZXJ2aWNlLWhlbHBlcnMnO1xuaW1wb3J0IHt1c2VyLCB1c2VyQXNzZXJ0fSBmcm9tICcuLi8uLi8uLi9zcmMvbG9nJztcblxuLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuZXhwb3J0IGNvbnN0IENPTkZJR19TUkNfQVRUUklCVVRFX05BTUUgPSAnc3JjJztcblxuLyoqIEBwcml2YXRlIGNvbnN0IHtzdHJpbmd9ICovXG5leHBvcnQgY29uc3QgQ1JFREVOVElBTFNfQVRUUklCVVRFX05BTUUgPSAnZGF0YS1jcmVkZW50aWFscyc7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdhbXAtc3RvcnktcmVxdWVzdC1zZXJ2aWNlJztcblxuLyoqXG4gKiBTZXJ2aWNlIHRvIHNlbmQgWEhScy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFtcFN0b3J5UmVxdWVzdFNlcnZpY2Uge1xuICAvKipcbiAgICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gc3RvcnlFbGVtZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIHN0b3J5RWxlbWVudCkge1xuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFFbGVtZW50fSAqL1xuICAgIHRoaXMuc3RvcnlFbGVtZW50XyA9IHN0b3J5RWxlbWVudDtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyEuLi8uLi8uLi9zcmMvc2VydmljZS94aHItaW1wbC5YaHJ9ICovXG4gICAgdGhpcy54aHJfID0gU2VydmljZXMueGhyRm9yKHdpbik7XG5cbiAgICAvKiogQGNvbnN0IEB0eXBlIHtmdW5jdGlvbigpOighUHJvbWlzZTwhSnNvbk9iamVjdD58IVByb21pc2U8bnVsbD4pfSAqL1xuICAgIHRoaXMubG9hZFNoYXJlQ29uZmlnID0gb25jZSgoKSA9PiB0aGlzLmxvYWRTaGFyZUNvbmZpZ0ltcGxfKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByYXdVcmxcbiAgICogQHBhcmFtIHtPYmplY3Q9fSBvcHRzXG4gICAqIEByZXR1cm4geyghUHJvbWlzZTwhSnNvbk9iamVjdD58IVByb21pc2U8bnVsbD4pfVxuICAgKi9cbiAgZXhlY3V0ZVJlcXVlc3QocmF3VXJsLCBvcHRzID0ge30pIHtcbiAgICBpZiAoIWlzUHJvdG9jb2xWYWxpZChyYXdVcmwpKSB7XG4gICAgICB1c2VyKCkuZXJyb3IoVEFHLCAnSW52YWxpZCBjb25maWcgdXJsLicpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gU2VydmljZXMudXJsUmVwbGFjZW1lbnRzRm9yRG9jKHRoaXMuc3RvcnlFbGVtZW50XylcbiAgICAgIC5leHBhbmRVcmxBc3luYyh1c2VyKCkuYXNzZXJ0U3RyaW5nKHJhd1VybCkpXG4gICAgICAudGhlbigodXJsKSA9PiB0aGlzLnhocl8uZmV0Y2hKc29uKHVybCwgb3B0cykpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgdXNlckFzc2VydChyZXNwb25zZS5vaywgJ0ludmFsaWQgSFRUUCByZXNwb25zZScpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBwdWJsaXNoZXIgc2hhcmUgcHJvdmlkZXJzLlxuICAgKiBIYXMgdG8gYmUgY2FsbGVkIHRocm91Z2ggYGxvYWRTaGFyZUNvbmZpZ2AuXG4gICAqIEByZXR1cm4geyghUHJvbWlzZTwhSnNvbk9iamVjdD58IVByb21pc2U8bnVsbD4pfVxuICAgKi9cbiAgbG9hZFNoYXJlQ29uZmlnSW1wbF8oKSB7XG4gICAgY29uc3Qgc2hhcmVDb25maWdFbCA9IHRoaXMuc3RvcnlFbGVtZW50Xy5xdWVyeVNlbGVjdG9yKFxuICAgICAgJ2FtcC1zdG9yeS1zb2NpYWwtc2hhcmUsIGFtcC1zdG9yeS1ib29rZW5kJ1xuICAgICk7XG4gICAgaWYgKCFzaGFyZUNvbmZpZ0VsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgaWYgKHNoYXJlQ29uZmlnRWwuaGFzQXR0cmlidXRlKENPTkZJR19TUkNfQVRUUklCVVRFX05BTUUpKSB7XG4gICAgICBjb25zdCByYXdVcmwgPSBzaGFyZUNvbmZpZ0VsLmdldEF0dHJpYnV0ZShDT05GSUdfU1JDX0FUVFJJQlVURV9OQU1FKTtcbiAgICAgIGNvbnN0IGNyZWRlbnRpYWxzID0gc2hhcmVDb25maWdFbC5nZXRBdHRyaWJ1dGUoXG4gICAgICAgIENSRURFTlRJQUxTX0FUVFJJQlVURV9OQU1FXG4gICAgICApO1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZVJlcXVlc3QocmF3VXJsLCBjcmVkZW50aWFscyA/IHtjcmVkZW50aWFsc30gOiB7fSk7XG4gICAgfVxuXG4gICAgLy8gRmFsbGJhY2suIENoZWNrIGZvciBhbiBpbmxpbmUganNvbiBjb25maWcuXG4gICAgbGV0IGNvbmZpZyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGNvbmZpZyA9IGdldENoaWxkSnNvbkNvbmZpZyhzaGFyZUNvbmZpZ0VsKTtcbiAgICB9IGNhdGNoIChlcnIpIHt9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG4gIH1cbn1cblxuLyoqXG4gKiBVdGlsIGZ1bmN0aW9uIHRvIHJldHJpZXZlIHRoZSByZXF1ZXN0IHNlcnZpY2UuIEVuc3VyZXMgd2UgY2FuIHJldHJpZXZlIHRoZVxuICogc2VydmljZSBzeW5jaHJvbm91c2x5IGZyb20gdGhlIGFtcC1zdG9yeSBjb2RlYmFzZSB3aXRob3V0IHJ1bm5pbmcgaW50byByYWNlXG4gKiBjb25kaXRpb25zLlxuICogQHBhcmFtICB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0gIHshRWxlbWVudH0gc3RvcnlFbFxuICogQHJldHVybiB7IUFtcFN0b3J5UmVxdWVzdFNlcnZpY2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRSZXF1ZXN0U2VydmljZSA9ICh3aW4sIHN0b3J5RWwpID0+IHtcbiAgbGV0IHNlcnZpY2UgPSBTZXJ2aWNlcy5zdG9yeVJlcXVlc3RTZXJ2aWNlKHdpbik7XG5cbiAgaWYgKCFzZXJ2aWNlKSB7XG4gICAgc2VydmljZSA9IG5ldyBBbXBTdG9yeVJlcXVlc3RTZXJ2aWNlKHdpbiwgc3RvcnlFbCk7XG4gICAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlcih3aW4sICdzdG9yeS1yZXF1ZXN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHNlcnZpY2U7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gc2VydmljZTtcbn07XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-request-service.js