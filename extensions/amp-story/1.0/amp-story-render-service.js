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
import {whenUpgradedToCustomElement} from '../../../src/dom';

/** @implements {../../../src/render-delaying-services.RenderDelayingService} */
export class AmpStoryRenderService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /**
     * @private {!Element}
     */
    this.ampdoc_ = ampdoc; //ampdoc.getRootNode());
  }

  /**
   * Function to return a promise for when it is finished delaying render, and
   * is ready.  Implemented from RenderDelayingService
   * @return {!Promise}
   */
  whenReady() {
    return this.ampdoc_.whenBodyAvailable().then(body => {
      const storyEl = body.querySelector('amp-story[standalone]');

      if (!storyEl) {
        return;
      }

      return whenUpgradedToCustomElement(storyEl).signals()
          .whenSignal(CommonSignals.LOAD_END);
    });
  }
}
