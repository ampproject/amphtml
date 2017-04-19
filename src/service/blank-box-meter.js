/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {performanceForOrNull} from '../performance';
import {map} from '../utils/object';
import {dev} from '../log';

const TAG = 'BlankBoxMeter';
const NTH_IN_VIEWPORT_RESOURCE = 5;

export class BlankBoxMeter {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {?./performance-impl.Performance} */
    this.perf_ = performanceForOrNull(this.win_);
    /** @private {!Object<number, boolean>} */
    this.layoutCompleteResources_ = map();
    /** @private {!Object<number, boolean>} */
    this.everInViewportResources_ = map();
    /** @private {number} */
    this.inViewportLayoutCompleteNum_ = 0;
  }

  /**
   * @param {!./resource.Resource} resource
   */
  enterViewport(resource) {
    if (!this.shouldMeasure_(resource)) {
      return;
    }
    if (this.everInViewportResources_[resource.getId()]) {
      return;
    }
    this.everInViewportResources_[resource.getId()] = true;
    if (this.layoutCompleteResources_[resource.getId()]) {
      this.inViewportLayoutCompleteNum_++;
    }
    const inViewportTotalCnt_ = this.getEverInViewportResourcesNum_();
    dev().info(
        TAG, this.inViewportLayoutCompleteNum_ + '/' + inViewportTotalCnt_);
    // We send ping when the NTH_IN_VIEWPORT_RESOURCE resource enter viewport.
    if (inViewportTotalCnt_ == NTH_IN_VIEWPORT_RESOURCE) {
      // Good layout probability
      const glp = this.win_.Math.floor(
          this.inViewportLayoutCompleteNum_ / inViewportTotalCnt_ * 100);
      this.perf_.tickDelta('glp', glp);
      this.perf_.flush();
    }
  }

  /**
   * @param {!./resource.Resource} resource
   */
  layoutComplete(resource) {
    if (!this.shouldMeasure_(resource)) {
      return;
    }
    this.layoutCompleteResources_[resource.getId()] = true;
  }

  /**
   * @param {!./resource.Resource} resource
   * @return {boolean}
   */
  shouldMeasure_(resource) {
    if (!this.perf_ || !this.perf_.isPerformanceTrackingOn()) {
      return false;
    }
    if (resource.getPriority() > 0) {
      // For now we only measure content resources.
      // TODO: Consider to exclude FIE resources.
      return false;
    }
    // Only measure resources below the fold.
    return !resource.isInFirstViewport();
  }

  /**
   * @return {number}
   */
  getEverInViewportResourcesNum_() {
    return Object.keys(this.everInViewportResources_).length;
  }
}
