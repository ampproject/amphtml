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

import { CommonSignals } from "../../../src/core/constants/common-signals";
import { Services } from "../../../src/service";
import { whenUpgradedToCustomElement } from "../../../src/amp-element-helpers";

/**
 * Maximum milliseconds to wait for service to load.
 * Needs to be shorter than the render delay timeout to account for the latency
 * downloading and executing the amp-story js.
 * @const
 */
var LOAD_TIMEOUT = 2900;

/** @implements {../../../src/render-delaying-services.RenderDelayingService} */
export var AmpStoryRenderService = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function AmpStoryRenderService(ampdoc) {_classCallCheck(this, AmpStoryRenderService);
    /**
     * @private {!../../../src/service/ampdoc-impl.AmpDoc}
     */
    this.ampdoc_ = ampdoc;

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);
  }

  /**
   * Function to return a promise for when it is finished delaying render, and
   * is ready.  Implemented from RenderDelayingService
   * @return {!Promise}
   */_createClass(AmpStoryRenderService, [{ key: "whenReady", value:
    function whenReady() {
      var whenReadyPromise = this.ampdoc_.whenReady().then(function (body) {
        var storyEl = body.querySelector('amp-story[standalone]');

        if (!storyEl) {
          return;
        }

        return whenUpgradedToCustomElement(storyEl).then(function () {
          return storyEl.signals().whenSignal(CommonSignals.LOAD_END);
        });
      });

      return Promise.race([whenReadyPromise, this.timer_.promise(LOAD_TIMEOUT)]);
    } }]);return AmpStoryRenderService;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/amp-story-render-service.js