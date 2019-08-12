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

import {Services} from '../../../src/services';

const NO_INTERSECTION_MARGIN = '0%';

/**
 * The default margin around the scrolling element.
 */
const DEFAULT_NEARBY_MARGIN = '100%';

/**
 * What percentage of an Element must intersect before being considered as
 * visible. This defaults to 1%, as the value for zero is not intuitive. For
 * example, a horizontal scrolling container that has full width items will
 * intersect on the second element if you have an intersection margin/threshold
 * of 0, since the left edge of the second element "intersects" with the
 * scrolling container, even though none of element is visible (not even 1 pixel).
 *
 * While the sepc says a value of "0" means "any non-zero number of pixels",
 * there are actual no pixels actually visible at this threshold.
 */
const DEFAULT_INTERSECTION_THRESHOLD = 0.01;

/**
 * Manages scheduling layout/unlayout for children of an AMP component as they
 * intersect with the AMP component. The parent AMP component should notify the
 * manager as its own layout state changes so that the children can be updated
 * accordingly.
 * 
 * Note: For Safari 12, this does not schedule layout for slides until they
 * enter the viewport, since `rootMargin` on `IntersectionObserver` is not
 * properly handled.
 *
 * Usage:
 *
 * Parent element:
 * ```
 * constructor() {
 *   this.childLayoutManager = new ChildLayoutManager({
 *     ampElement: this,
 *   });
 * }
 
 * buildCallback() {
 *   // Call this each time the effective children you want to manage change.
 *   this.childLayoutManager.updateChildren(children);
 * }
 *
 * layoutCallback() {
 *   this.childLayoutManager.wasLaidOut();
 * }
 *
 *
 * unlayoutCallback() {
 *   this.childLayoutManager.wasUnlaidOut();
 * }
 * ```
 */
export class ChildLayoutManager {
  /**
   * Creates a ChildLayoutManager for a given intersection container.
   *
   * Note: If the children live within a scrolling container, the
   * intersectionElement must be the scrolling container, and not an
   * ancestor in order for `nearbyMargin` to work.
   * @param {{
   *  ampElement: !AMP.BaseElement,
   *  intersectionElement: !Element,
   *  intersectionThreshold: (number|undefined),
   *  nearbyMargin: (string|undefined),
   *  viewportIntersectionCallback: (function(!Element, boolean)|undefined)
   * }} config
   */
  constructor({
    ampElement,
    intersectionElement,
    intersectionThreshold = DEFAULT_INTERSECTION_THRESHOLD,
    nearbyMargin = DEFAULT_NEARBY_MARGIN,
    viewportIntersectionCallback = () => {},
  }) {
    /** @private @const */
    this.ampElement_ = ampElement;

    /** @private @const */
    this.owners_ = Services.ownersForDoc(ampElement.element);

    /** @private @const */
    this.intersectionElement_ = intersectionElement;

    /** @private @const */
    this.intersectionThreshold_ = intersectionThreshold;

    /** @private @const */
    this.nearbyMargin_ = nearbyMargin;

    /** @private @const */
    this.viewportIntersectionCallback_ = viewportIntersectionCallback;

    /** @private {!IArrayLike<!Element>} */
    this.children_ = [];

    /** @private {?IntersectionObserver}] */
    this.nearbyObserver_ = null;

    /** @private {?IntersectionObserver}] */
    this.visibleObserver_ = null;

    /** @private {boolean} */
    this.laidOut_ = false;
  }

  /**
   * @param {string} margin
   * @param {function(!Element, boolean)} intersectionCallback
   * @return {!IntersectionObserver}
   */
  createObserver_(margin, intersectionCallback) {
    return new this.ampElement_.win.IntersectionObserver(
      entries => {
        entries.forEach(({target, isIntersecting}) => {
          intersectionCallback(target, isIntersecting);
        });
      },
      {
        root: this.intersectionElement_,
        rootMargin: margin,
        threshold: this.intersectionThreshold_,
      }
    );
  }

  /**
   * @param {!Element} target
   * @param {boolean} isIntersecting
   */
  triggerLayout_(target, isIntersecting) {
    if (isIntersecting) {
      // TODO(sparhami) do we want to delay the layout for the farther
      // away elements? Do we want schedule preload farther away elements?
      this.owners_.scheduleLayout(this.ampElement_.element, target);
    } else {
      this.owners_./*OK */ scheduleUnlayout(this.ampElement_.element, target);
    }
  }

  /**
   * @param {!Element} target
   * @param {boolean} isIntersecting
   */
  triggerVisibility_(target, isIntersecting) {
    this.owners_.updateInViewport(
      this.ampElement_.element,
      target,
      isIntersecting
    );
    this.viewportIntersectionCallback_(target, isIntersecting);
  }

  /**
   * Sets up for intersection monitoring, creating IntersectionObserver
   * instances for nearby Eelements as well as those that are actually visible.
   */
  setup_() {
    if (this.nearbyObserver_ && this.visibleObserver_) {
      return;
    }

    this.nearbyObserver_ = this.createObserver_(
      this.nearbyMargin_,
      (target, isIntersecting) => {
        this.triggerLayout_(target, isIntersecting);
      }
    );

    this.visibleObserver_ = this.createObserver_(
      NO_INTERSECTION_MARGIN,
      (target, isIntersecting) => {
        this.triggerVisibility_(target, isIntersecting);
      }
    );
  }

  /**
   * @param {boolean} observe Whether or not the parent element is laid out.
   */
  monitorChildren_(observe) {
    // TODO(sparhami) Load a polyfill for browsers that do not support it? We
    // currently just rely on Resource's periodic scan if we do not have
    // IntersectionObserver. This means slides may get loaded later than might
    // be ideal.
    if (!('IntersectionObserver' in this.ampElement_.win)) {
      return;
    }

    this.setup_();

    // Simply disconnect, in case the children have changed, we can make sure
    // everything is detached.
    if (!observe) {
      this.nearbyObserver_.disconnect();
      this.visibleObserver_.disconnect();
      return;
    }

    for (let i = 0; i < this.children_.length; i++) {
      this.nearbyObserver_.observe(this.children_[i]);
      this.visibleObserver_.observe(this.children_[i]);
    }
  }

  /**
   * Updates the children that should have their layout managed. Should be
   * called whenever the children change.
   * @param {!IArrayLike<!Element>} children
   */
  updateChildren(children) {
    this.children_ = children;

    if (!('IntersectionObserver' in this.ampElement_.win)) {
      return;
    }

    for (let i = 0; i < this.children_.length; i++) {
      this.owners_.setOwner(this.children_[i], this.ampElement_.element);
    }

    // Update the layout state to false so that we stop observing (and holding
    // on to a reference for) any children that stopped existing.
    this.monitorChildren_(false);
    this.monitorChildren_(this.laidOut_);
  }

  /**
   * This should be called from the `layoutCallback` of the AMP element that
   * constructed this manager.
   */
  wasLaidOut() {
    this.laidOut_ = true;
    this.monitorChildren_(this.laidOut_);
  }

  /**
   * This should be called from the `unlayoutCallback` of the AMP element that
   * constructed this manager.
   */
  wasUnlaidOut() {
    this.laidOut_ = false;
    this.monitorChildren_(this.laidOut_);

    for (let i = 0; i < this.children_.length; i++) {
      this.triggerLayout_(this.children_[i], false);
      this.triggerVisibility_(this.children_[i], false);
    }
  }
}
