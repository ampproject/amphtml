/**
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

import {CommonSignals} from '../../../src/common-signals';
import {Services} from '../../../src/services';
import {whenUpgradedToCustomElement} from '../../../src/dom';

/**
 * Maximum milliseconds to wait for service to load.
 * Needs to be shorter than the render delay timeout to account for the latency
 * downloading and executing the amp-story js.
 * @const
 */
const LOAD_TIMEOUT = 2900;

/** @implements {../../../src/render-delaying-services.RenderDelayingService} */
export class AmpStoryRenderService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
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
   */
  whenReady() {
    const whenReadyPromise = this.ampdoc_.whenReady().then((body) => {
      const storyEl = body.querySelector('amp-story[standalone]');

      if (!storyEl) {
        return;
      }

      return whenUpgradedToCustomElement(storyEl).then(() => {
        return storyEl.signals().whenSignal(CommonSignals.LOAD_END);
      });
    });

    return Promise.race([whenReadyPromise, this.timer_.promise(LOAD_TIMEOUT)]);
  }
}
