import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise";function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  function AmpStoryRequestService(win, storyElement) {var _this = this;_classCallCheck(this, AmpStoryRequestService);
    /** @private @const {!Element} */
    this.storyElement_ = storyElement;

    /** @private @const {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(win);

    /** @const @type {function():(!Promise<!JsonObject>|!Promise<null>)} */
    this.loadShareConfig = once(function () {return _this.loadShareConfigImpl_();});
  }

  /**
   * @param {string} rawUrl
   * @param {Object=} opts
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   */_createClass(AmpStoryRequestService, [{ key: "executeRequest", value:
    function executeRequest(rawUrl) {var _this2 = this;var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!isProtocolValid(rawUrl)) {
        user().error(TAG, 'Invalid config url.');
        return Promise.resolve(null);
      }

      return Services.urlReplacementsForDoc(this.storyElement_).
      expandUrlAsync(user().assertString(rawUrl)).
      then(function (url) {return _this2.xhr_.fetchJson(url, opts);}).
      then(function (response) {
        userAssert(response.ok, 'Invalid HTTP response');
        return response.json();
      });
    }

    /**
     * Retrieves the publisher share providers.
     * Has to be called through `loadShareConfig`.
     * @return {(!Promise<!JsonObject>|!Promise<null>)}
     */ }, { key: "loadShareConfigImpl_", value:
    function loadShareConfigImpl_() {
      var shareConfigEl = this.storyElement_.querySelector(
      'amp-story-social-share, amp-story-bookend');

      if (!shareConfigEl) {
        return _resolvedPromise();
      }

      if (shareConfigEl.hasAttribute(CONFIG_SRC_ATTRIBUTE_NAME)) {
        var rawUrl = shareConfigEl.getAttribute(CONFIG_SRC_ATTRIBUTE_NAME);
        var credentials = shareConfigEl.getAttribute(
        CREDENTIALS_ATTRIBUTE_NAME);

        return this.executeRequest(rawUrl, credentials ? { credentials: credentials } : {});
      }

      // Fallback. Check for an inline json config.
      var config = null;
      try {
        config = getChildJsonConfig(shareConfigEl);
      } catch (err) {}

      return Promise.resolve(config);
    } }]);return AmpStoryRequestService;}();


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
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-request-service.js