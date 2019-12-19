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
import {devAssert} from '../../../src/log';

/** @enum {number} */
export const ViewportRelativePos = {
  INSIDE_VIEWPORT: 0,
  OUTSIDE_VIEWPORT: 1,
  LEAVING_VIEWPORT: 2,
  CONTAINS_VIEWPORT: 3,
};

export class VisibilityObserverEntry {
  /**
   * @param {!VisibilityObserver} observer
   */
  constructor(observer) {
    /** @private {!VisibilityObserver} */
    this.observer_ = observer;
    /** @private {?RelativePositions} */
    this.topSentinelPosition_ = null;
    /** @private {?RelativePositions} */
    this.bottomSentinelPosition_ = null;
    /** @private {!ViewportRelativePos} */
    this.relativePos_ = ViewportRelativePos.OUTSIDE_VIEWPORT;
  }

  /**
   * @param {!Element} element
   * @param {!Element} parent
   * @param {function(!ViewportRelativePos)} callback
   */
  observe(element, parent, callback) {
    const top = element.ownerDocument.createElement('div');
    const bottom = element.ownerDocument.createElement('div');

    parent.insertBefore(top, element);
    parent.insertBefore(bottom, element.nextSibling);

    this.observer_
      .getPositionObserver()
      .observe(top, PositionObserverFidelity.LOW, position =>
        this.topSentinelPositionChanged(position, callback)
      );
    this.observer_
      .getPositionObserver()
      .observe(bottom, PositionObserverFidelity.LOW, position =>
        this.bottomSentinelPositionChanged(position, callback)
      );
  }

  /**
   * Called when a position change is detected on the injected
   * top sentinel element
   * @param {?PositionInViewportEntryDef} position
   * @param {function(!ViewportRelativePos)} callback
   */
  topSentinelPositionChanged(position, callback) {
    const prevTopSentinelPosition = this.topSentinelPosition_;
    if (!position || position.relativePos === prevTopSentinelPosition) {
      return;
    }
    this.topSentinelPosition_ = position.relativePos;
    this.updateRelativePos_(callback);
  }

  /**
   * Called when a position change is detected on the injected
   * bottom sentinel element
   * @param {?PositionInViewportEntryDef} position
   * @param {function(!ViewportRelativePos)} callback
   */
  bottomSentinelPositionChanged(position, callback) {
    const prevBottomSentinelPosition = this.bottomSentinelPosition_;
    if (!position || position.relativePos === prevBottomSentinelPosition) {
      return;
    }
    this.bottomSentinelPosition_ = position.relativePos;
    this.updateRelativePos_(callback);
  }

  /**
   * Calculates the position of the element relative to the viewport
   * based on the positions of the injected bottom and top sentinel elements
   * @param {function(!ViewportRelativePos)} callback
   * @private
   */
  updateRelativePos_(callback) {
    const {topSentinelPosition_: top, bottomSentinelPosition_: bottom} = this;
    const {INSIDE, TOP, BOTTOM} = RelativePositions;

    devAssert(
      top || bottom,
      'scroll triggered without a top or bottom sentinel position'
    );

    if (top === INSIDE && bottom === INSIDE) {
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
      // The remaining case is the case where the document is halfway
      // through being scrolling into/out of the viewport in which case
      // we don't need to update the visibility
      this.relativePos_ = ViewportRelativePos.LEAVING_VIEWPORT;
      return;
    }

    callback(this.relativePos_);
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
  }

  /**
   * @param {!Element} element
   * @param {!Element} parent
   * @param {function(!ViewportRelativePos)} callback
   */
  observe(element, parent, callback) {
    const entry = new VisibilityObserverEntry(this);
    this.entries_.push(entry);
    entry.observe(element, parent, callback);
  }

  /**
   * @return {!PositionObserver}
   */
  getPositionObserver() {
    installPositionObserverServiceForDoc(this.ampdoc_);
    return Services.positionObserverForDoc(this.ampdoc_.getHeadNode());
  }
}
