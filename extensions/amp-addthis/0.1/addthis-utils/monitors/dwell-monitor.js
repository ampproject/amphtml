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

import {Services} from '../../../../../src/services';

export class DwellMonitor {
  /**
   * Creates an instance of DwellMonitor.
   */
  constructor() {
    this.dwellTime_ = 0;
    this.viewer_ = null;
  }

  /**
   * Add visibility listener to ampdoc.
   *
   * @param {!../../../../../src/service/ampdoc-impl.AmpDoc} ampDoc
   */
  startForDoc(ampDoc) {
    this.viewer_ = Services.viewerForDoc(ampDoc);
    this.viewer_.onVisibilityChanged(this.listener.bind(this));
  }

  /**
   * Calculates dwell time.
   */
  listener() {
    if (!this.viewer_.isVisible()) {
      const lastVisibleTime = this.viewer_.getLastVisibleTime() || 0;
      this.dwellTime_ += (Date.now() - lastVisibleTime);
    }
  }

  /**
   * Returns dwell time.
   *
   * @return {number}
   */
  getDwellTime() {
    return this.dwellTime_;
  }
}
