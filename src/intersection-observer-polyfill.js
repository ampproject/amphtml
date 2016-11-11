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

import {dev} from './log';
import {layoutRectLtwh, rectIntersection, moveLayoutRect} from './layout-rect';

/**
 * The structure that defines the rectangle used in intersection observers.
 *
 * @typedef {{
 *   top: number,
 *   bottom: number,
 *   left: number,
 *   right: number,
 *   width: number,
 *   height: number,
 *   x: number,
 *   y: number,
 * }}
 */
export let DOMRect;

/**
 * The IntersectionObserverPolyfill class lets any element receive its
 * intersection data with the viewport. It acts like native browser supported
 * IntersectionObserver.
 * The IntersectionObserver receives a callback function and an optional option
 * as params. Whenever the element intersection ratio cross a threshold value,
 * IntersectionObserverPolyfill will call the provided callback function with
 * the change entry.
 */
export class IntersectionObserverPolyfill {
  /**
   * @param {!function()} callback.
   * @param {Object=} opt_option
   */
  constructor(callback, opt_option) {
    /** @private @const {function()} */
    this.callback_ = callback;

    /**
     * A list of threshold, sorted in increasing numeric order
     * @private @const {!Array}
     */
    this.threshold_ = opt_option ? opt_option.threshold : [0];
    this.threshold_ = this.threshold_.sort();
    dev().assert(this.threshold_[0] >= 0 &&
        this.threshold_[this.threshold_.length - 1] <= 1,
        'Threshold should be in the range from "[0, 1]"');

    /** @private {?Element} */
    this.element_ = null;

    /** @private {boolean} */
    this.isAmpElement_ = false;

    /**
     * A cached value to store getBoundingClientRect() value
     * if element is not an AMP element
     * @private {?DOMRect}
     */
    this.elementRectForNonAMP_ = null;

    /**
     * The prev threshold slot which the previous ratio fills
     * Range [0, this.threshold_.length]
     * TODO: Do we always want to call callback at the first tick?
     * @private {number}
     */
    this.prevThresholdSlot_ = 0;

    // TODO: create the PositionObserver class, or create listener for position
    // info if inside an iframe

    // TODO: Add the postMessageApi logic outside IntersectionObserverPolyfill.
  }

  /**
   * Provide a way to observer the intersection change for a specific element
   * Please note that the IntersectionObserverPolyfill only allow to observe one
   * element at a time.
   * TODO: Support observing multiple elements.
   * @param {!Element} element
   */
  observe(element) {
    // Reset cached value for a new element
    this.elementRectForNonAMP_ = null;
    this.prevThresholdSlot_ = 0;
    this.isAmpElement_ = !!element.isBuilt && element.isBuilt();
    this.element_ = element;
  }

  /**
   * Tick function that update the DOMRect of the root of observed element.
   * Caller needs to make sure to pass in the correct container.
   * @param {!./layout-rect.LayoutRectDef} viewport.
   * @param {./layout-rect.LayoutRectDef=} opt_container. relative to viewport
   */
  tick(viewport, opt_container) {
    // Normalize container LayoutRect to be relative to page
    if (opt_container) {
      opt_container =
          moveLayoutRect(opt_container, viewport.left, viewport.top);
    }
    let elementRect;
    let ownerRect = null;

    if (this.isAmpElement_) {
      // If calls with container, always assume getLayoutBox() return relative
      // LayoutRect to container
      elementRect = this.element_.getLayoutBox();
      const owner = this.element_.getOwner();
      ownerRect = owner && owner.getLayoutBox();
      if (opt_container) {
        elementRect = moveLayoutRect(elementRect, opt_container.left,
            opt_container.top);
        if (ownerRect) {
          ownerRect = moveLayoutRect(ownerRect, opt_container.left,
              opt_container.top);
        }
      }
    } else {
      // If the element is not an AMP element, always assume its position to
      // the page won't change.
      if (!this.elementRectForNonAMP_) {
        elementRect = this.element_./*OK*/getBoundingClientRect();
        const normRect = opt_container || viewport;
        this.elementRectForNonAMP_ =
            moveLayoutRect(elementRect, normRect.left, normRect.top);
      }
      elementRect = this.elementRectForNonAMP_;
    }

    // Normalize container element
    const changeEntry = this.getValidIntersectionChangeEntry_(
        elementRect, ownerRect, viewport, opt_container);
    if (changeEntry) {
      this.callback_(changeEntry);
    }
  }

  /**
   * Return a change entry for that should be compatible with
   * IntersectionObserverEntry if it's valid with current config.
   * When the new intersection ratio doesn't cross one of a threshold value,
   * the function will return null.
   *
   * Mutates passed in rootBounds to have x and y according to spec.
   *
   * @param {!./layout-rect.LayoutRectDef} element element's rect
   * @param {?./layout-rect.LayoutRectDef} owner element's owner rect
   * @param {!./layout-rect.LayoutRectDef} viewport viewport's rect.
   * @param {./layout-rect.LayoutRectDef=} opt_container.
   * @return {?IntersectionObserverEntry} A valid change entry or null if ratio
   * does not fill in a new threshold bucket.
   * @private
   */
  getValidIntersectionChangeEntry_(element, owner, viewport, opt_container) {
    // TODO: need to include owner LayoutRect info

    // Building an IntersectionObserverEntry.
    let intersectionRect = element;
    const nonIntersectRect = layoutRectLtwh(0, 0, 0, 0);
    if (owner) {
      intersectionRect = rectIntersection(owner, element) || nonIntersectRect;
    }
    if (opt_container) {
      intersectionRect = rectIntersection(opt_container, intersectionRect) ||
          nonIntersectRect;
    }
    intersectionRect = rectIntersection(viewport, intersectionRect) ||
        nonIntersectRect;

    const ratio = intersectionRatio(intersectionRect, element);
    const newThresholdSlot = getThresholdSlot(this.threshold_, ratio);
    if (newThresholdSlot == this.prevThresholdSlot_) {
      return null;
    }
    this.prevThresholdSlot_ = newThresholdSlot;

    intersectionRect = moveLayoutRect(intersectionRect, -viewport.left,
        -viewport.top);

    // The element is relative to (0, 0), while the viewport moves. So, we must
    // adjust.
    const boundingClientRect = moveLayoutRect(element, -viewport.left,
        -viewport.top);

    // Now, move the viewport to (0, 0)
    const rootBounds = moveLayoutRect(viewport, -viewport.left, -viewport.top);
    return /** @type {!IntersectionObserverEntry} */ ({
      time: performance.now(),
      rootBounds: DomRectFromLayoutRect(rootBounds),
      boundingClientRect: DomRectFromLayoutRect(boundingClientRect),
      intersectionRect: DomRectFromLayoutRect(intersectionRect),
      intersectionRatio: ratio,
    });
  }
}

/**
 * Transforms a LayoutRect into a DOMRect for use in intersection observers.
 * @param {!./layout-rect.LayoutRectDef} rect
 * @return {!DOMRect}
 */
function DomRectFromLayoutRect(rect) {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    bottom: rect.bottom,
    right: rect.right,
    x: rect.left,
    y: rect.top,
  };
}

/**
 * Returns the ratio of the smaller box's area to the larger box's area.
 * @param {!./layout-rect.LayoutRectDef} smaller
 * @param {!./layout-rect.LayoutRectDef} larger
 * @return {number}
 */
function intersectionRatio(smaller, larger) {
  return (smaller.width * smaller.height) / (larger.width * larger.height);
}

/**
 * Returns the slot number that the current ratio fills in.
 * @param {!Array} sortedThreshold valid sorted IoB threshold
 * @param {number} ratio Range from [0, 1]
 * @return {number} Range from [0, threshold.length]
 * @visibleForTesting
 */
export function getThresholdSlot(sortedThreshold, ratio) {
  let startIdx = 0;
  let endIdx = sortedThreshold.length;
  // 0 is a special case that does not fit into [small, large) range
  if (ratio == 0) {
    return 0;
  }
  let mid = ((startIdx + endIdx) / 2) | 0;
  while (startIdx < mid) {
    const midValue = sortedThreshold[mid];
    // In the range of [small, large)
    if (ratio < midValue) {
      endIdx = mid;
    } else {
      startIdx = mid;
    }
    mid = ((startIdx + endIdx) / 2) | 0;
  }
  return endIdx;
}
