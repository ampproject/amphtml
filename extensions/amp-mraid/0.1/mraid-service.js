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

import {
  ExitInterface,
  FullscreenInterface,
  VisibilityDataDef,
  VisibilityInterface,
} from '../../../src/inabox/host-services';

/**
 * Translates between the AMP HostServices APIs and MRAID.
 *
 * @implements {VisibilityInterface}
 * @implements {FullscreenInterface}
 * @implements {ExitInterface}
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
    // The MRAID3 specification says:
    //
    // * exposedPercentage: percentage of ad that is visible on screen, a
    //   floating-point number between 0.0 and 100.0, or 0.0 if not visible.
    //
    // * visibleRectangle: the visible portion of the ad container, or null if
    //   not visible. It has the fields {x, y, width, height}, where x and y are
    //   the position of the upper-left corner of the visible area, relative of
    //   the upper-left corner of the ad container's current extent, and width
    //   and height are size of the visible area. If the visible area is
    //   non-rectangular, then this parameter is the bounding box of the visible
    //   portion, and the occlusionRectangles parameter describes the
    //   non-visible areas within the bounding box.
    //
    // * occlusionRectangles: an array of rectangles describing the sections of
    //   the visibleRectangle that are not visible, or null if occlusion
    //   detection is not used or relevant. Each element of the array is has the
    //   fields {x, y, width, height}, where x and y are the position of the
    //   upper-left corner of the occluded area, relative of the upper-left
    //   corner of the ad container's current extent, and width and height are
    //   size of the occluded area. The rectangles must not overlap, and they
    //   must be sorted from largest area to smallest area. In common scenarios,
    //   the visible area is rectangular, and this parameter is null. If the
    //   implementation can detect non-rectangular exposures, then this
    //   parameter will be set.
    //
    // AMP doesn't currently understand occlusion rectangles so this parameter
    // is dropped when calling AMP's callback.
    //
    // We're trying to produce a VisibilityDataDef:
    //  * visibleRatio: an exact match for MRAID's exposedPercentage
    //  * visibleRect: a LayoutRectDef, which corresponds to a more detailed
    //    concept than visibleRectangle represents.  visibleRectangle is a
    //    subset of LayoutRectDef, though, with x/y position and width/height,
    //    and we can pass it through to the callback directly.
    this.mraid_.addEventListener(
        'exposureChange',
        (exposedPercentage,
          visibleRectangle,
          unusedOcclusionRectangles) => {
          callback({visibleRect: visibleRectangle,
            visibleRatio: exposedPercentage});
        });
  }

  /**
   * Request to expand the given element to fullscreen overlay.
   *
   * @param {!Element} unusedTargetElement not supported by MRAID
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  enterFullscreenOverlay(unusedTargetElement) {
    if (this.expanded_) {return Promise.resolve(false);}

    this.mraid_./*OK*/expand();
    this.expanded_ = true;
    return Promise.resolve(true);
  }

  /**
   * Request to exit from fullscreen overlay.
   *
   * @param {!Element} unusedTargetElement not supported by MRAID
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  exitFullscreenOverlay(unusedTargetElement) {
    if (!this.expanded_) {return Promise.resolve(false);}

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
