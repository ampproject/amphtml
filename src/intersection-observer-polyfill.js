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

import {layoutRectLtwh, rectIntersection, moveLayoutRect} from './layout-rect';

const DEFAULT_THRESHOLD = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4,
    0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1];

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
 * Transforms a DOMRect into a LayoutRect for use in intersection observers.
 * @param {!DOMRect} rect
 * @return {!./layout-rect.LayoutRectDef}
 */
function LayoutRectFromDomRect(rect) {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    bottom: rect.bottom,
    right: rect.right,
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
 * The IntersectionObserverPolyfill class lets any element receive its
 * intersection data with the viewport. The IntersectionObserverPolyfill acts
 * like native browser supported IntersectionObserver.
 * IntersectionObserverPolyfill will
 * create a PositionObserver class (Not implemented yet) to track the
 * intersection between element and viewport.
 * The IntersectionObserver receives a callback function and an optional option
 * as params. If option is not provided, the default thresholds value will be
 * used. Whenever the element intersection ratio cross a threshold value,
 * IntersectionObserverPolyfill will call the callback function.
 * Note: To share the IntersectionObserverEntry to an iframe, whoever create the
 * IntersectionObserverPolyfill needs to handle postMessageApi and takes care of
 * sending messages rate etc outside the IntersectionObserverPolyfill.
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
    this.threshold_ = opt_option ? opt_option.threshold : DEFAULT_THRESHOLD;

    /**
     * TODO: Need to support multiple observed elements.
     * If support multiple elements, will they share the callback and threshold
     * @private {?Element}
     */
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
   * @param {!Element} element
   */
  observe(element) {
    // TODO: Need a good way to check if an element is AMP element
    if (element.isBuilt && element.isBuilt() && element.getLayoutBox) {
      this.isAmpElement_ = true;
    }
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
    let elementRectNorm;

    if (this.isAmpElement_) {
      // If calls with container, always assume getLayoutBox() return relative
      // LayoutRect to container
      const elementRect = this.element_.getLayoutBox();
      elementRectNorm = opt_container
          ? moveLayoutRect(elementRect, opt_container.left, opt_container.top)
          : elementRect;
    } else {
      // If the element is not an AMP element, always assume its position to
      // the page won't change.
      if (!this.elementRectForNonAMP_) {
        const elementRect = LayoutRectFromDomRect(
            this.element_./*OK*/getBoundingClientRect());
        this.elementRectForNonAMP_ =
            moveLayoutRect(elementRect, opt_container.left, opt_container.top);
      }
      elementRectNorm = this.elementRectForNonAMP_;
    }

    // Normalize container element
    const changeEntry = this.getValidIntersectionChangeEntry_(
        elementRectNorm, viewport, opt_container);
    if (changeEntry) {
      this.callback_(changeEntry);
    }
  }

  /**
   * Return a change entry for that should be compatible with
   * IntersectionObserverEntry if it's valid with current config.
   *
   * Mutates passed in rootBounds to have x and y according to spec.
   *
   * @param {!./layout-rect.LayoutRectDef} element element's rect
   * @param {!./layout-rect.LayoutRectDef} viewport viewport's rect.
   * @return {?IntersectionObserverEntry} A valid change entry.
   * @private
   */
  getValidIntersectionChangeEntry_(element, viewport, opt_container) {
    // TODO: need to include owner LayoutRect info

    // Building an IntersectionObserverEntry.
    let intersectionRect = element;
    if (opt_container) {
      intersectionRect = rectIntersection(opt_container, element) ||
          // No intersection.
          layoutRectLtwh(0, 0, 0, 0);
    }
    intersectionRect = rectIntersection(viewport, intersectionRect) ||
        // No intersection.
        layoutRectLtwh(0, 0, 0, 0);

    intersectionRect = moveLayoutRect(intersectionRect, -viewport.left,
        -viewport.top);

    const ratio = intersectionRatio(intersectionRect, element);
    const newThresholdSlot = this.getThresholdSlot_(ratio);
    if (newThresholdSlot == this.prevThresholdSlot_) {
      return null;
    }
    this.prevThresholdSlot_ = newThresholdSlot;

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

  /**
   * Returns the slot number that the current ratio fills in.
   * @param {number} ratio Range from [0, 1]
   * @return {number} Range from [0, threshold.length]
   * @private
   */
  getThresholdSlot_(ratio) {
    let startIdx = 0;
    let endIdx = this.threshold_.length;
    // 0 is a special case that does not fit into [small, large) range
    if (ratio == 0) {
      return 0;
    }
    let mid = ((startIdx + endIdx) / 2) | 0;
    while (startIdx < mid) {
      const midValue = this.threshold_[mid];
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
}
