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
    this.threshold_ = opt_option && opt_option.threshold || [0];
    this.threshold_ = this.threshold_.sort();
    dev().assert(this.threshold_[0] >= 0 &&
        this.threshold_[this.threshold_.length - 1] <= 1,
        'Threshold should be in the range from "[0, 1]"');

    /** @private {?Element} */
    this.element_ = null;

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
   * TODO: Support non AMP element
   * @param {!Element} element
   */
  observe(element) {
    // Check the element is an AMP element
    dev().assert(element.isBuilt && element.isBuilt());
    // Reset cached value for a new element

    this.prevThresholdSlot_ = 0;
    this.element_ = element;
  }

  // TODO: Support unobserve() function

  /**
   * Tick function that update the DOMRect of the root of observed element.
   * Caller needs to make sure to pass in the correct container.
   * Note: the opt_iframe param is the iframe position relative to the host doc,
   * The iframe must be a non-scrollable iframe.
   * @param {!./layout-rect.LayoutRectDef} viewport.
   * @param {./layout-rect.LayoutRectDef=} opt_iframe.
   */
  tick(hostViewport, opt_iframe) {
    if (opt_iframe) {
      // If element inside an iframe. Adjust origin to the iframe.left/top.
      hostViewport =
          moveLayoutRect(hostViewport, -opt_iframe.left, -opt_iframe.top);
      opt_iframe =
          moveLayoutRect(opt_iframe, -opt_iframe.left, -opt_iframe.top);
    }

    // Normalize container LayoutRect to be relative to page
    let elementRect;
    let ownerRect = null;

    // If calls with container, always assume getLayoutBox() return relative
    // LayoutRect to container
    elementRect = this.element_.getLayoutBox();
    const owner = this.element_.getOwner();
    ownerRect = owner && owner.getLayoutBox();

    const changeEntry = this.getValidIntersectionChangeEntry_(
        elementRect, ownerRect, hostViewport, opt_iframe);
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
   * @param {!./layout-rect.LayoutRectDef} hostViewport hostViewport's rect
   * @param {./layout-rect.LayoutRectDef=} opt_iframe. iframe container rect
   * @return {?IntersectionObserverEntry} A valid change entry or null if ratio
   * does not fill in a new threshold bucket.
   * @private
   */
  getValidIntersectionChangeEntry_(element, owner, hostViewport, opt_iframe) {
    // If opt_iframe is provided, all LayoutRect has position relative to
    // the iframe.
    // If opt_iframe is not provided, all LayoutRect has position relative to
    // the host document.

    // Building an IntersectionObserverEntry.
    let intersectionRect = element;
    const nonIntersectRect = layoutRectLtwh(0, 0, 0, 0);
    // element intersects with its owner.
    if (owner) {
      intersectionRect = rectIntersection(owner, element) || nonIntersectRect;
    }
    // element intersects with container iframe.
    if (opt_iframe) {
      intersectionRect = rectIntersection(opt_iframe, intersectionRect) ||
          nonIntersectRect;
    }
    // element intersects with hostViewport
    intersectionRect = rectIntersection(hostViewport, intersectionRect) ||
        nonIntersectRect;

    // calculate ratio, call callback based on new ratio value.
    const ratio = intersectionRatio(intersectionRect, element);
    const newThresholdSlot = getThresholdSlot(this.threshold_, ratio);
    if (newThresholdSlot == this.prevThresholdSlot_) {
      return null;
    }
    this.prevThresholdSlot_ = newThresholdSlot;

    let boundingClientRect = element;
    let rootBounds = hostViewport;

    // If element inside an iframe. Every Layoutrect has already adjust their
    // origin according to opt_iframe rect origin.
    if (opt_iframe) {
      // If element is inside a non-scrollable iframe. LayoutRect position is
      // relative to iframe origin, thus relative to iframe's viewport origin,
      // because the viewport is at the iframe origin.
      // No need to adjust position here.
      // To get same behavior as native IntersectionObserver set rootBounds null
      rootBounds = null;
    } else {
      // If element not in an iframe.
      // adjust all LayoutRect to hostViewport Origin.
      intersectionRect = moveLayoutRect(intersectionRect, -hostViewport.left,
          -hostViewport.top);
      // The element is relative to (0, 0), while the viewport moves. So, we must
      // adjust.
      boundingClientRect = moveLayoutRect(boundingClientRect,
          -hostViewport.left, -hostViewport.top);
      // Now, move the viewport to (0, 0)
      rootBounds = moveLayoutRect(rootBounds,
          -hostViewport.left, -hostViewport.top);
    }

    return /** @type {!IntersectionObserverEntry} */ ({
      time: performance.now(),
      rootBounds: rootBounds && DomRectFromLayoutRect(rootBounds),
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
