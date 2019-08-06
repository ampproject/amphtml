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

import {Pass} from './pass';
import {Services} from './services';
import {SubscriptionApi} from './iframe-helper';
import {dev, devAssert} from './log';
import {dict} from './utils/object';
import {isArray, isFiniteNumber} from './types';
import {layoutRectLtwh, moveLayoutRect, rectIntersection} from './layout-rect';

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

export const DEFAULT_THRESHOLD = [
  0,
  0.05,
  0.1,
  0.15,
  0.2,
  0.25,
  0.3,
  0.35,
  0.4,
  0.45,
  0.5,
  0.55,
  0.6,
  0.65,
  0.7,
  0.75,
  0.8,
  0.85,
  0.9,
  0.95,
  1,
];

/** @typedef {{
 *    element: !Element,
 *    currentThresholdSlot: number,
 *  }}
 */
let ElementIntersectionStateDef;

/** @const @private */
const TAG = 'INTERSECTION-OBSERVER';

/** @const @private */
const INIT_TIME = Date.now();

/**
 * A function to get the element's current IntersectionObserverEntry
 * regardless of the intersetion ratio. Only available when element is not
 * nested in a container iframe.
 * TODO: support opt_iframe if there's valid use cases.
 * @param {!./layout-rect.LayoutRectDef} element element's rect
 * @param {?./layout-rect.LayoutRectDef} owner element's owner rect
 * @param {!./layout-rect.LayoutRectDef} hostViewport hostViewport's rect
 * @return {!IntersectionObserverEntry} A change entry.
 */
export function getIntersectionChangeEntry(element, owner, hostViewport) {
  const intersection =
    rectIntersection(element, owner, hostViewport) ||
    layoutRectLtwh(0, 0, 0, 0);
  const ratio = intersectionRatio(intersection, element);
  return calculateChangeEntry(element, hostViewport, intersection, ratio);
}

/**
 * @param {!Window} win
 * @return {boolean}
 */
export function nativeIntersectionObserverSupported(win) {
  return (
    'IntersectionObserver' in win &&
    'IntersectionObserverEntry' in win &&
    'intersectionRatio' in win.IntersectionObserverEntry.prototype
  );
}

/**
 * A class to help amp-iframe and amp-ad nested iframe listen to intersection
 * change.
 */
export class IntersectionObserverApi {
  /**
   * @param {!AMP.BaseElement} baseElement
   * @param {!Element} iframe
   * @param {boolean=} opt_is3p
   */
  constructor(baseElement, iframe, opt_is3p) {
    /** @private @const {!AMP.BaseElement} */
    this.baseElement_ = baseElement;

    /** @private {?IntersectionObserverPolyfill} */
    this.intersectionObserver_ = null;

    /** @private {boolean} */
    this.shouldObserve_ = false;

    /** @private {boolean} */
    this.isInViewport_ = false;

    /** @private {?function()} */
    this.unlistenOnDestroy_ = null;

    /** @private {!./service/viewport/viewport-impl.Viewport} */
    this.viewport_ = baseElement.getViewport();

    /** @private {?SubscriptionApi} */
    this.subscriptionApi_ = new SubscriptionApi(
      iframe,
      'send-intersections',
      opt_is3p || false,
      () => {
        this.startSendingIntersection_();
      }
    );

    this.intersectionObserver_ = new IntersectionObserverPolyfill(
      entries => {
        // Remove target info from cross origin iframe.
        for (let i = 0; i < entries.length; i++) {
          delete entries[i]['target'];
        }
        this.subscriptionApi_.send('intersection', dict({'changes': entries}));
      },
      {threshold: DEFAULT_THRESHOLD}
    );
    this.intersectionObserver_.tick(this.viewport_.getRect());

    /** @const {function()} */
    this.fire = () => {
      if (!this.shouldObserve_ || !this.isInViewport_) {
        return;
      }
      this.intersectionObserver_.tick(this.viewport_.getRect());
    };
  }

  /**
   * Function to start listening to viewport event. and observer intersection
   * change on the element.
   */
  startSendingIntersection_() {
    this.shouldObserve_ = true;
    this.intersectionObserver_.observe(this.baseElement_.element);
    this.baseElement_.getVsync().measure(() => {
      this.isInViewport_ = this.baseElement_.isInViewport();
      this.fire();
    });

    const unlistenViewportScroll = this.viewport_.onScroll(this.fire);
    const unlistenViewportChange = this.viewport_.onChanged(this.fire);
    this.unlistenOnDestroy_ = () => {
      unlistenViewportScroll();
      unlistenViewportChange();
    };
  }

  /**
   * Enable to the PositionObserver to listen to viewport events
   * @param {boolean} inViewport
   */
  onViewportCallback(inViewport) {
    this.isInViewport_ = inViewport;
  }

  /**
   * Clean all listenrs
   */
  destroy() {
    this.shouldObserve_ = false;
    this.intersectionObserver_.disconnect();
    this.intersectionObserver_ = null;
    if (this.unlistenOnDestroy_) {
      this.unlistenOnDestroy_();
      this.unlistenOnDestroy_ = null;
    }
    this.subscriptionApi_.destroy();
    this.subscriptionApi_ = null;
  }
}

/**
 * The IntersectionObserverPolyfill class lets any element receive its
 * intersection data with the viewport. It acts like native browser supported
 * IntersectionObserver.
 * The IntersectionObserver receives a callback function and an optional option
 * as params. Whenever the element intersection ratio cross a threshold value,
 * IntersectionObserverPolyfill will call the provided callback function with
 * the change entry. Only Works with one document for now.
 * @visibleForTesting
 */
export class IntersectionObserverPolyfill {
  /**
   * @param {function(!Array<!IntersectionObserverEntry>)} callback
   * @param {Object=} opt_option
   */
  constructor(callback, opt_option) {
    /** @private @const {function(!Array<!IntersectionObserverEntry>)} */
    this.callback_ = callback;

    // The input threshold can be a number or an array of numbers.
    let threshold = opt_option && opt_option.threshold;
    if (threshold) {
      threshold = isArray(threshold) ? threshold : [threshold];
    } else {
      threshold = [0];
    }

    for (let i = 0; i < threshold.length; i++) {
      devAssert(
        isFiniteNumber(threshold[i]),
        'Threshold should be a finite number or an array of finite numbers'
      );
    }

    /**
     * A list of threshold, sorted in increasing numeric order
     * @private @const {!Array}
     */
    this.threshold_ = threshold.sort();
    devAssert(
      this.threshold_[0] >= 0 &&
        this.threshold_[this.threshold_.length - 1] <= 1,
      'Threshold should be in the range from "[0, 1]"'
    );

    /** @private {?./layout-rect.LayoutRectDef} */
    this.lastViewportRect_ = null;

    /** @private {./layout-rect.LayoutRectDef|undefined} */
    this.lastIframeRect_ = undefined;

    /**
     * Store a list of observed elements and their current threshold slot which
     * their intersection ratio fills, range from [0, this.threshold_.length]
     * @private {Array<!ElementIntersectionStateDef>}
     */
    this.observeEntries_ = [];

    /**
     * Mutation observer to fire off on visibility changes
     * @private {?function()}
     */
    this.hiddenObserverUnlistener_ = null;

    /** @private {Pass} */
    this.mutationPass_ = null;
  }

  /**
   * Function to unobserve all elements.
   * and clean up the polyfill.
   */
  disconnect() {
    this.observeEntries_.length = 0;
    this.disconnectMutationObserver_();
  }

  /**
   * Provide a way to observe the intersection change for a specific element
   * Please note IntersectionObserverPolyfill only support AMP element now
   * TODO: Support non AMP element
   * @param {!Element} element
   */
  observe(element) {
    // Check the element is an AMP element.
    devAssert(element.getLayoutBox);

    // If the element already exists in current observeEntries, do nothing
    for (let i = 0; i < this.observeEntries_.length; i++) {
      if (this.observeEntries_[i].element === element) {
        dev().warn(TAG, 'should observe same element once');
        return;
      }
    }

    const newState = {
      element,
      currentThresholdSlot: 0,
    };

    // Get the new observed element's first changeEntry based on last viewport
    if (this.lastViewportRect_) {
      const change = this.getValidIntersectionChangeEntry_(
        newState,
        this.lastViewportRect_,
        this.lastIframeRect_
      );
      if (change) {
        this.callback_([change]);
      }
    }

    // Add a mutation observer to tick ourself
    // TODO (@torch2424): Allow this to observe elements,
    // from multiple documents.
    const ampdoc = Services.ampdoc(element);
    if (ampdoc.win.MutationObserver && !this.hiddenObserverUnlistener_) {
      this.mutationPass_ = new Pass(
        ampdoc.win,
        this.handleMutationObserverPass_.bind(this, element)
      );
      const hiddenObserver = Services.hiddenObserverForDoc(element);
      this.hiddenObserverUnlistener_ = hiddenObserver.add(
        this.handleMutationObserverNotification_.bind(this)
      );
    }

    // push new observed element
    this.observeEntries_.push(newState);
  }

  /**
   * Provide a way to unobserve intersection change for a specified element
   * @param {!Element} element
   */
  unobserve(element) {
    // find the unobserved element in observeEntries
    for (let i = 0; i < this.observeEntries_.length; i++) {
      if (this.observeEntries_[i].element === element) {
        this.observeEntries_.splice(i, 1);
        if (this.observeEntries_.length <= 0) {
          this.disconnectMutationObserver_();
        }
        return;
      }
    }
    dev().warn(TAG, 'unobserve non-observed element');
  }

  /**
   * Tick function that update the DOMRect of the root of observed elements.
   * Caller needs to make sure to pass in the correct container.
   * Note: the opt_iframe param is the iframe position relative to the host doc,
   * The iframe must be a non-scrollable iframe.
   * @param {!./layout-rect.LayoutRectDef} hostViewport
   * @param {./layout-rect.LayoutRectDef=} opt_iframe
   */
  tick(hostViewport, opt_iframe) {
    if (opt_iframe) {
      // If element inside an iframe. Adjust origin to the iframe.left/top.
      hostViewport = moveLayoutRect(
        hostViewport,
        -opt_iframe.left,
        -opt_iframe.top
      );
      opt_iframe = moveLayoutRect(
        opt_iframe,
        -opt_iframe.left,
        -opt_iframe.top
      );
    }

    this.lastViewportRect_ = hostViewport;
    this.lastIframeRect_ = opt_iframe;

    const changes = [];

    for (let i = 0; i < this.observeEntries_.length; i++) {
      const change = this.getValidIntersectionChangeEntry_(
        this.observeEntries_[i],
        hostViewport,
        opt_iframe
      );
      if (change) {
        changes.push(change);
      }
    }

    if (changes.length) {
      this.callback_(changes);
    }
  }

  /**
   * Return a change entry for one element that should be compatible with
   * IntersectionObserverEntry if it's valid with current config.
   * When the new intersection ratio doesn't cross one of a threshold value,
   * the function will return null.
   *
   * @param {!ElementIntersectionStateDef} state
   * @param {!./layout-rect.LayoutRectDef} hostViewport hostViewport's rect
   * @param {./layout-rect.LayoutRectDef=} opt_iframe iframe container rect
   *    If opt_iframe is provided, all LayoutRect has position relative to
   *    the iframe. If opt_iframe is not provided,
   *    all LayoutRect has position relative to the host document.
   * @return {?IntersectionObserverEntry} A valid change entry or null if ratio
   * @private
   */
  getValidIntersectionChangeEntry_(state, hostViewport, opt_iframe) {
    const {element} = state;

    const elementRect = element.getLayoutBox();
    const owner = element.getOwner();
    const ownerRect = owner && owner.getLayoutBox();

    // calculate intersectionRect. that the element intersects with hostViewport
    // and intersects with owner element and container iframe if exists.
    const intersectionRect =
      rectIntersection(elementRect, ownerRect, hostViewport, opt_iframe) ||
      layoutRectLtwh(0, 0, 0, 0);
    // calculate ratio, call callback based on new ratio value.
    const ratio = intersectionRatio(intersectionRect, elementRect);
    const newThresholdSlot = getThresholdSlot(this.threshold_, ratio);

    if (newThresholdSlot == state.currentThresholdSlot) {
      return null;
    }
    state.currentThresholdSlot = newThresholdSlot;

    // To get same behavior as native IntersectionObserver set hostViewport null
    // if inside an iframe
    const changeEntry = calculateChangeEntry(
      elementRect,
      opt_iframe ? null : hostViewport,
      intersectionRect,
      ratio
    );
    changeEntry.target = element;
    return changeEntry;
  }

  /**
   * Handle Mutation Oberserver events
   * @private
   */
  handleMutationObserverNotification_() {
    if (this.mutationPass_.isPending()) {
      return;
    }

    // Wait one animation frame so that other mutations may arrive.
    this.mutationPass_.schedule(16);
  }

  /**
   * Handle Mutation Observer Pass
   * This performas the tick, and is wrapped in a paas
   * To handle throttling of the observer
   * @param {!Element} element
   * @private
   */
  handleMutationObserverPass_(element) {
    const viewport = Services.viewportForDoc(element);
    const resources = Services.resourcesForDoc(element);
    resources.onNextPass(() => {
      this.tick(viewport.getRect());
    });
  }

  /**
   * Clean up the mutation observer
   * @private
   */
  disconnectMutationObserver_() {
    if (this.hiddenObserverUnlistener_) {
      this.hiddenObserverUnlistener_();
    }
    this.hiddenObserverUnlistener_ = null;
    if (this.mutationPass_) {
      this.mutationPass_.cancel();
    }
    this.mutationPass_ = null;
  }
}

/**
 * Returns the ratio of the smaller box's area to the larger box's area.
 * @param {!./layout-rect.LayoutRectDef} smaller
 * @param {!./layout-rect.LayoutRectDef} larger
 * @return {number}
 * @visibleForTesting
 */
export function intersectionRatio(smaller, larger) {
  const smallerBoxArea = smaller.width * smaller.height;
  const largerBoxArea = larger.width * larger.height;

  // Check for a divide by zero
  return largerBoxArea === 0 ? 0 : smallerBoxArea / largerBoxArea;
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

/**
 * Helper function to calculate the IntersectionObserver change entry.
 * @param {!./layout-rect.LayoutRectDef} element element's rect
 * @param {?./layout-rect.LayoutRectDef} hostViewport hostViewport's rect
 * @param {!./layout-rect.LayoutRectDef} intersection
 * @param {number} ratio
 * @return {!IntersectionObserverEntry}}
 */
function calculateChangeEntry(element, hostViewport, intersection, ratio) {
  // If element not in an iframe.
  // adjust all LayoutRect to hostViewport Origin.
  let boundingClientRect = element;
  let rootBounds = hostViewport;
  // If no hostViewport is provided, element is inside an non-scrollable iframe.
  // Every Layoutrect has already adjust their origin according to iframe
  // rect origin. LayoutRect position is relative to iframe origin,
  // thus relative to iframe's viewport origin because the viewport is at the
  // iframe origin. No need to adjust position here.

  if (hostViewport) {
    // If element not in an iframe.
    // adjust all LayoutRect to hostViewport Origin.
    rootBounds = /** @type {!./layout-rect.LayoutRectDef} */ (rootBounds);
    intersection = moveLayoutRect(
      intersection,
      -hostViewport.left,
      -hostViewport.top
    );
    // The element is relative to (0, 0), while the viewport moves. So, we must
    // adjust.
    boundingClientRect = moveLayoutRect(
      boundingClientRect,
      -hostViewport.left,
      -hostViewport.top
    );
    // Now, move the viewport to (0, 0)
    rootBounds = moveLayoutRect(
      rootBounds,
      -hostViewport.left,
      -hostViewport.top
    );
  }

  return /** @type {!IntersectionObserverEntry} */ ({
    time:
      typeof performance !== 'undefined' && performance.now
        ? performance.now()
        : Date.now() - INIT_TIME,
    rootBounds,
    boundingClientRect,
    intersectionRect: intersection,
    intersectionRatio: ratio,
  });
}
