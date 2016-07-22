/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {isExperimentOn} from '../../../src/experiments';
import {getService} from '../../../src/service';
import {dev} from '../../../src/log';

/** @private @const {string} */
const TAG = 'amp-share-tracking';

class AmpShareTracking extends AMP.BaseElement {

  /** @override */
  buildCallback() {
    this.isExperimentOn_ = isExperimentOn(this.win, TAG);
    if (!this.isExperimentOn_) {
      dev.warn(TAG, `TAG ${TAG} disabled`);
      return;
    }
  }
}

/**
 * ShareTrackingService processes the incoming and outcoming url fragment
 */
export class ShareTrackingService {
  constructor(window) {
    this.win = window;
  }
}

/**
 * @param {!Window} window
 * @return {!ShareTrackingService}
 */
export function installShareTrackingService(window) {
  return getService(window, 'shareTrackingService', () => {
    return new ShareTrackingService(window);
  });
}

installShareTrackingService(AMP.win);

AMP.registerElement('amp-share-tracking', AmpShareTracking);
