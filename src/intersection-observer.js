/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from './services';
import {SubscriptionApi} from './iframe-helper';
import {devAssert} from './log';
import {dict} from './utils/object';
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
 * Produces a change entry for that should be compatible with
 * IntersectionObserverEntry.
 *
 * Mutates passed in rootBounds to have x and y according to spec.
 *
 * @param {!./layout-rect.LayoutRectDef} element The element's layout rectangle
 * @param {?./layout-rect.LayoutRectDef} owner The owner's layout rect, if
 *     there is an owner.
 * @param {!./layout-rect.LayoutRectDef} viewport The viewport's layout rect.
 * @return {!IntersectionObserverEntry} A change entry.
 * @private
 */
export function getIntersectionChangeEntry(element, owner, viewport) {
  devAssert(
    element.width >= 0 && element.height >= 0,
    'Negative dimensions in element.'
  );
  // Building an IntersectionObserverEntry.

  let intersectionRect = element;
  if (owner) {
    intersectionRect =
      rectIntersection(owner, element) ||
      // No intersection.
      layoutRectLtwh(0, 0, 0, 0);
  }
  intersectionRect =
    rectIntersection(viewport, intersectionRect) ||
    // No intersection.
    layoutRectLtwh(0, 0, 0, 0);

  // The element is relative to (0, 0), while the viewport moves. So, we must
  // adjust.
  const boundingClientRect = moveLayoutRect(
    element,
    -viewport.left,
    -viewport.top
  );
  intersectionRect = moveLayoutRect(
    intersectionRect,
    -viewport.left,
    -viewport.top
  );
  // Now, move the viewport to (0, 0)
  const rootBounds = moveLayoutRect(viewport, -viewport.left, -viewport.top);

  return /** @type {!IntersectionObserverEntry} */ ({
    time: Date.now(),
    rootBounds,
    boundingClientRect,
    intersectionRect,
    intersectionRatio: intersectionRatio(intersectionRect, element),
  });
}

/**
 * The IntersectionObserver class lets any element share its viewport
 * intersection data with an iframe of its choice (most likely contained within
 * the element itself.). When instantiated the class will start listening for a
 * 'send-intersections' postMessage from the iframe, and only then  would start
 * sending intersection data to the iframe. The intersection data would be sent
 * when the element is moved inside or outside the viewport as well as on scroll
 * and resize. The element should create an IntersectionObserver instance once
 * the Iframe element is created. The IntersectionObserver class exposes a
 * `fire` method that would send the intersection data to the iframe. The
 * IntersectionObserver class exposes a `onViewportCallback` method that should
 * be called inside if the viewportCallback of the element. This would let the
 * element sent intersection data automatically when there element comes inside
 * or goes outside the viewport and also manage sending intersection data
 * onscroll and resize. Note: The IntersectionObserver would not send any data
 * over to the iframe if it had not requested the intersection data already via
 * a postMessage.
 */
export class IntersectionObserver {
  /**
   * @param {!AMP.BaseElement} baseElement
   * @param {!Element} iframe Iframe element which requested the
   *     intersection data.
   * @param {?boolean} opt_is3p Set to `true` when the iframe is 3'rd party.
   */
  constructor(baseElement, iframe, opt_is3p) {
    /** @private @const {!AMP.BaseElement} */
    this.baseElement_ = baseElement;
    /** @private @const {!./service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(baseElement.win);
    /** @private {boolean} */
    this.shouldSendIntersectionChanges_ = false;
    /** @private {boolean} */
    this.inViewport_ = false;

    /** @private {!Array<!IntersectionObserverEntry>} */
    this.pendingChanges_ = [];

    /** @private {number|string} */
    this.flushTimeout_ = 0;

    /** @private @const {function()} */
    this.boundFlush_ = this.flush_.bind(this);

    /**
     * An object which handles tracking subscribers to the
     * intersection updates for this element.
     * Triggered by context.observeIntersection(…) inside the ad/iframe
     * or by directly posting a send-intersections message.
     * @private {!SubscriptionApi}
     */
    this.postMessageApi_ = new SubscriptionApi(
      iframe,
      'send-intersections',
      opt_is3p || false,
      // Each time someone subscribes we make sure that they
      // get an update.
      () => this.startSendingIntersectionChanges_()
    );

    /** @private {?Function} */
    this.unlistenViewportChanges_ = null;
  }

  /**
   * Fires element intersection
   */
  fire() {
    this.sendElementIntersection_();
  }

  /**
   * Check if we need to unlisten when moving out of viewport,
   * unlisten and reset unlistenViewportChanges_.
   * @private
   */
  unlistenOnOutViewport_() {
    if (this.unlistenViewportChanges_) {
      this.unlistenViewportChanges_();
      this.unlistenViewportChanges_ = null;
    }
  }
  /**
   * Called via postMessage from the child iframe when the ad/iframe starts
   * observing its position in the viewport.
   * Sets a flag, measures the iframe position if necessary and sends
   * one change record to the iframe.
   * Note that this method may be called more than once if a single ad
   * has multiple parties interested in viewability data.
   * @private
   */
  startSendingIntersectionChanges_() {
    this.shouldSendIntersectionChanges_ = true;
    this.baseElement_.getVsync().measure(() => {
      if (this.baseElement_.isInViewport()) {
        this.onViewportCallback(true);
      }
      this.fire();
    });
  }

  /**
   * Triggered by the AmpElement to when it either enters or exits the visible
   * viewport.
   * @param {boolean} inViewport true if the element is in viewport.
   */
  onViewportCallback(inViewport) {
    if (this.inViewport_ == inViewport) {
      return;
    }
    this.inViewport_ = inViewport;
    // Lets the ad know that it became visible or no longer is.
    this.fire();
    // And update the ad about its position in the viewport while
    // it is visible.
    if (inViewport) {
      const send = this.fire.bind(this);
      // Scroll events.
      const unlistenScroll = this.baseElement_.getViewport().onScroll(send);
      // Throttled scroll events. Also fires for resize events.
      const unlistenChanged = this.baseElement_.getViewport().onChanged(send);
      this.unlistenViewportChanges_ = () => {
        unlistenScroll();
        unlistenChanged();
      };
    } else {
      this.unlistenOnOutViewport_();
    }
  }

  /**
   * Sends 'intersection' message to ad/iframe with intersection change records
   * if this has been activated and we measured the layout box of the iframe
   * at least once.
   * @private
   */
  sendElementIntersection_() {
    if (!this.shouldSendIntersectionChanges_) {
      return;
    }
    const change = this.baseElement_.element.getIntersectionChangeEntry();
    if (
      this.pendingChanges_.length > 0 &&
      this.pendingChanges_[this.pendingChanges_.length - 1].time == change.time
    ) {
      return;
    }
    this.pendingChanges_.push(change);
    if (!this.flushTimeout_) {
      // Send one immediately, …
      this.flush_();
      // but only send a maximum of 10 postMessages per second.
      this.flushTimeout_ = this.timer_.delay(this.boundFlush_, 100);
    }
  }

  /**
   * @private
   */
  flush_() {
    // TODO(zhouyx): One potential place to check if element is still in doc.
    this.flushTimeout_ = 0;
    if (!this.pendingChanges_.length) {
      return;
    }
    // Note that SubscribeApi multicasts the update to all interested windows.
    this.postMessageApi_.send(
      'intersection',
      dict({
        'changes': this.pendingChanges_,
      })
    );
    this.pendingChanges_.length = 0;
  }

  /**
   * Provide a function to clear timeout before set this intersection to null.
   */
  destroy() {
    this.timer_.cancel(this.flushTimeout_);
    this.unlistenOnOutViewport_();
    this.postMessageApi_.destroy();
  }
}
