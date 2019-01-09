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

import {Exit, Fullscreen, Visible, VisibilityDataDef} from '../../../src/inabox/host-services';


/**
 * Translates between the AMP HostServices APIs and MRAID.
 *
 * @implements {Visibility}
 * @implements {Fullscreen}
 * @implements {Exit}
 */
export class MraidService {
  /**
   * @param {Object} mraid validated global mraid object
   */
  constructor(mraid) {
    /** @private */
    this.mraid_ = mraid;

    /** @private {boolean} */
    this.expanded_ = false;
  }

  /**
   * Register a callback for visibility change events.
   *
   * @param {function(!VisibilityDataDef)} callback
   */
  onVisibilityChange(callback) {
    // TODO: impedance matching.  The format of data MRAID returns doesn't
    // exactly match the format of data that the callback expects yet.
    this.mraid_.addEventListener(
        'exposureChange',
        (exposedPercentage,
         visibileRectangle,
         occlusionRectangles) => {
           callback({visibleRect: visibileRectangle,
                     visibleRatio: exposedPercentage});
         });
  }

  /**
   * Request to expand the given element to fullscreen overlay.
   *
   * @param {!Element} targetElement
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  enterFullscreenOverlay(targetElement) {
    if (this.expanded_) return Promise.resolve(false);

    this.mraid_.expand();
    this.expanded_ = true;
    return Promise.resolve(true);
  }

  /**
   * Request to exit from fullscreen overlay.
   *
   * @param {!Element} targetElement
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  exitFullscreenOverlay(targetElement) {
    if (!this.expanded_) return Promise.resolve(false);

    this.mraid_.close();
    this.expanded_ = false;
    return Promise.resolve(true);
  }

  /**
   * Request to navigate to URL.
   *
   * @param {string} url
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  openUrl(url) {
    this.mraid_.open(url);
    return Promise.resolve(true);
  }
}
