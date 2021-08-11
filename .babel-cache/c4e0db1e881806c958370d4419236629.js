function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import { dev } from "../../../src/log";
import { registerServiceBuilder } from "../../../src/service-helpers";

/**
 * Util function to retrieve the media query service. Ensures we can retrieve
 * the service synchronously from the amp-story codebase without running into
 * race conditions.
 * @param  {!Window} win
 * @return {!AmpStoryMediaQueryService}
 */
export var getMediaQueryService = function getMediaQueryService(win) {
  var service = Services.storyMediaQueryService(win);

  if (!service) {
    service = new AmpStoryMediaQueryService(win);
    registerServiceBuilder(win, 'story-media-query', function () {
      return service;
    });
  }

  return service;
};

/**
 * Media query service.
 */
export var AmpStoryMediaQueryService = /*#__PURE__*/function () {
  /**
   * @param {!Window} win
   */
  function AmpStoryMediaQueryService(win) {_classCallCheck(this, AmpStoryMediaQueryService);
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Promise} */
    this.initializePromise_ = null;

    /** @private {?Element} Iframe matcher. */
    this.matcher_ = null;

    /** @private @const {!Element} */
    this.storyEl_ = /** @type {!Element} */(
    this.win_.document.querySelector('amp-story'));

  }

  /**
   * Registers the media query and triggering the provided callback on match.
   * @param {string} media The media query, ie: '(orientation: portrait)'
   * @param {function(boolean)} callback Called when the media query matches.
   * @return {!Promise<!MediaQueryList>}
   */_createClass(AmpStoryMediaQueryService, [{ key: "onMediaQueryMatch", value:
    function onMediaQueryMatch(media, callback) {var _this = this;
      return this.initialize_().then(function () {
        var mediaQueryList = _this.matcher_.contentWindow.matchMedia(media);
        mediaQueryList.addListener(function (event) {return callback(event.matches);});
        callback(mediaQueryList.matches);
        return mediaQueryList;
      });
    }

    /**
     * Creates an iframe that is positioned like an amp-story-page, used to match
     * media queries.
     * @return {!Promise} Resolves when the iframe is ready.
     * @private
     */ }, { key: "initialize_", value:
    function initialize_() {var _this2 = this;
      if (this.initializePromise_) {
        return this.initializePromise_;
      }

      this.initializePromise_ = new Promise(function (resolve) {
        _this2.matcher_ = _this2.win_.document.createElement('iframe');
        _this2.matcher_.classList.add('i-amphtml-story-media-query-matcher');
        _this2.matcher_.onload = resolve;
        _this2.storyEl_.appendChild(_this2.matcher_);
      });

      return this.initializePromise_;
    } }]);return AmpStoryMediaQueryService;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-media-query-service.js