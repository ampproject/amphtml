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

import {
  PositionInViewportEntryDef,
  PositionObserverFidelity,
} from '../../../src/service/position-observer/position-observer-worker';
import {
  PositionObserver, // eslint-disable-line no-unused-vars
  installPositionObserverServiceForDoc,
} from '../../../src/service/position-observer/position-observer-impl';
import {RelativePositions} from '../../../src/layout-rect';
import {Services} from '../../../src/services';
import {throttle} from '../../../src/utils/rate-limit';

/** @enum {number} */
export const ViewportRelativePos = {
  INSIDE_VIEWPORT: 1,
  OUTSIDE_VIEWPORT: 2,
  LEAVING_VIEWPORT: 3,
  ENTERING_VIEWPORT: 4,
  CONTAINS_VIEWPORT: 5,
};

/** @const {number} */
const SCROLL_DIRECTION_THRESHOLD = 20;

/** @enum {number} */
export const ScrollDirection = {UP: 1, DOWN: -1};

export class VisibilityObserverEntry {
  /**
   * @param {!VisibilityObserver} observer
   * @param {function(!ViewportRelativePos)} callback
   */
  constructor(observer, callback) {
    /** @private {!VisibilityObserver} */
    this.observer_ = observer;
    /** @private {?RelativePositions} */
    this.topSentinelPosition_ = null;
    /** @private {?RelativePositions} */
    this.bottomSentinelPosition_ = null;
    /** @private {!ViewportRelativePos} */
    this.relativePos_ = ViewportRelativePos.OUTSIDE_VIEWPORT;
    /** @private {function(!ViewportRelativePos)} */
    this.callback_ = callback;
  }

  /**
   * @param {!Element} element
   * @param {!Element} parent
   */
  observe(element, parent) {
    this.top_ = element.ownerDocument.createElement('div');
    this.top_.classList.add('i-amphtml-next-page-document-top-sentinel');
    this.bottom_ = element.ownerDocument.createElement('div');
    this.bottom_.classList.add('i-amphtml-next-page-document-bottom-sentinel');

    parent.insertBefore(this.top_, element);
    parent.insertBefore(this.bottom_, element.nextSibling);

    this.observer_
      .getPositionObserver()
      .observe(this.top_, PositionObserverFidelity.LOW, position =>
        this.topSentinelPositionChanged(position)
      );
    this.observer_
      .getPositionObserver()
      .observe(this.bottom_, PositionObserverFidelity.LOW, position =>
        this.bottomSentinelPositionChanged(position)
      );
  }

  /**
   * Called when a position change is detected on the injected
   * top sentinel element
   * @param {?PositionInViewportEntryDef} position
   */
  topSentinelPositionChanged(position) {
    if (position.positionRect) {
      this.topSentinelTop_ = position.positionRect.top;
    }
    this.topSentinelPosition_ = position.relativePos;
    this.updateRelativePos();
  }

  /**
   * Called when a position change is detected on the injected
   * bottom sentinel element
   * @param {?PositionInViewportEntryDef} position
   */
  bottomSentinelPositionChanged(position) {
    if (position.positionRect) {
      this.bottomSentinelTop_ = position.positionRect.top;
    }
    this.bottomSentinelPosition_ = position.relativePos;
    this.updateRelativePos();
  }

  /**
   * Calculates the position of the element relative to the viewport
   * based on the positions of the injected bottom and top sentinel elements
   */
  updateRelativePos() {
    const {topSentinelPosition_: top, bottomSentinelPosition_: bottom} = this;
    const {INSIDE, TOP, BOTTOM} = RelativePositions;

    if (!top && !bottom) {
      // Early exit if this an intersection change happening before a
      // sentinel position change
      return;
    } else if (top === INSIDE && bottom === INSIDE) {
      // Both the top and bottom sentinel elements are within the
      // viewport bounds meaning that the document is short enough
      // to be contained inside the viewport
      this.relativePos_ = ViewportRelativePos.INSIDE_VIEWPORT;
    } else if ((!top || top === TOP) && (!bottom || bottom === BOTTOM)) {
      // The head of the document is above the viewport and the
      // foot of the document is below it, meaning that the viewport
      // is looking at a section of the document
      this.relativePos_ = ViewportRelativePos.CONTAINS_VIEWPORT;
    } else if (
      ((!top || top === TOP) && bottom === TOP) ||
      (top === BOTTOM && (!bottom || bottom === BOTTOM))
    ) {
      // Both the top and the bottom of the document are either
      // above or below the document meaning that the viewport hasn't
      // reached the document yet or has passed it
      this.relativePos_ = ViewportRelativePos.OUTSIDE_VIEWPORT;
    } else {
      const atBottom =
        (top === TOP || top === INSIDE) && (!bottom || bottom === BOTTOM);
      const scrollingUp = this.observer_.isScrollingUp();
      // The remaining case is the case where the document is halfway
      // through being scrolling into/out of the viewport in which case
      // we don't need to update the visibility
      this.relativePos_ =
        !!atBottom === !!scrollingUp
          ? ViewportRelativePos.LEAVING_VIEWPORT
          : ViewportRelativePos.ENTERING_VIEWPORT;
    }

    this.callback_(this.relativePos_);
  }
}

export default class VisibilityObserver {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {Array<!VisibilityObserverEntry>} */
    this.entries_ = [];

    /** @private {number} */
    this.lastScrollTop_ = 0;

    /** @private {!ScrollDirection} */
    this.scrollDirection_ = ScrollDirection.DOWN;

    /** @private {?ScrollDirection} */
    this.lastScrollDirection_ = null;

    /**
     * @private
     * @const {!../../../src/service/viewport/viewport-interface.ViewportInterface}
     */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {number} */
    this.viewportHeight_ = 0;

    /**
     * @private
     * @const {!../../../src/service/mutator-interface.MutatorInterface}
     */
    this.mutator_ = Services.mutatorForDoc(ampdoc);

    const updateScrollThrottled = throttle(
      ampdoc.win,
      this.updateScroll_.bind(this),
      200
    );

    this.viewport_.onScroll(updateScrollThrottled.bind(this));
    this.viewport_.onResize(updateScrollThrottled.bind(this));
    this.updateScroll_();
  }

  /** @return {!../../../src/service/mutator-interface.MutatorInterface} */
  get mutator() {
    return this.mutator_;
  }

  /** @return {number} */
  get viewportHeight() {
    return this.viewportHeight_;
  }

  /**
   * @private
   */
  updateScroll_() {
    this.mutator_.measureElement(() => {
      this.viewportHeight_ = this.viewport_.getHeight();
      const scrollTop = this.viewport_.getScrollTop();
      const delta = scrollTop - this.lastScrollTop_;
      // Throttle
      if (Math.abs(delta) < SCROLL_DIRECTION_THRESHOLD) {
        return;
      }
      const scrollDirection =
        delta > 0 ? ScrollDirection.DOWN : ScrollDirection.UP;
      if (this.lastScrollDirection_ !== scrollDirection) {
        this.entries_.forEach(entry => entry.updateRelativePos());
      }
      this.lastScrollTop_ = scrollTop;
      this.lastScrollDirection_ = this.scrollDirection_;
      this.scrollDirection_ = scrollDirection;
    });
  }

  /**
   * @return {boolean}
   */
  isScrollingUp() {
    return this.scrollDirection_ === ScrollDirection.UP;
  }

  /**
   * @return {boolean}
   */
  isScrollingDown() {
    return this.scrollDirection_ === ScrollDirection.DOWN;
  }

  /**
   * @param {!Element} element
   * @param {!Element} parent
   * @param {function(!ViewportRelativePos, number)} callback
   */
  observe(element, parent, callback) {
    const entry = new VisibilityObserverEntry(this, callback);
    this.entries_.push(entry);
    entry.observe(element, parent);
  }

  /**
   * @return {!PositionObserver}
   */
  getPositionObserver() {
    installPositionObserverServiceForDoc(this.ampdoc_);
    return Services.positionObserverForDoc(this.ampdoc_.getHeadNode());
  }
}
