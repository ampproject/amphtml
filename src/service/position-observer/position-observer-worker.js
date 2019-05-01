/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../services';
import {devAssert} from '../../log';
import {
  layoutRectEquals,
  layoutRectLtwh,
  layoutRectsOverlap,
  layoutRectsRelativePos,
} from '../../layout-rect';

/** @enum {number} */
export const PositionObserverFidelity = {
  HIGH: 1,
  LOW: 0,
};

/** @const @private */
const LOW_FIDELITY_FRAME_COUNT = 4;

/**
 * TODO (@zhouyx): rename relativePos to relativePositions
 * The positionObserver returned position value which includes the position rect
 * relative to viewport. And viewport rect which always has top 0, left 0, and
 * viewport width and height.
 * @typedef {{
 *  positionRect: ?../../layout-rect.LayoutRectDef,
 *  viewportRect: !../../layout-rect.LayoutRectDef,
 *  relativePos: string,
 * }}
 */
export let PositionInViewportEntryDef;

export class PositionObserverWorker {
  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   * @param {!Element} element
   * @param {!PositionObserverFidelity} fidelity
   * @param {function(?PositionInViewportEntryDef)} handler
   */
  constructor(ampdoc, element, fidelity, handler) {
    /** @const {!Element} */
    this.element = element;

    /** @const {function(?PositionInViewportEntryDef)} */
    this.handler_ = handler;

    /** @type {!PositionObserverFidelity} */
    this.fidelity = fidelity;

    /** @type {number} */
    this.turn = (fidelity == PositionObserverFidelity.LOW) ?
      Math.floor(Math.random() * LOW_FIDELITY_FRAME_COUNT) : 0;

    /** @type {?PositionInViewportEntryDef} */
    this.prevPosition_ = null;

    /** @private {!../viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);
  }

  /**
   * Call to trigger an entry handler
   * @param {!PositionInViewportEntryDef} position
   * @private
   */
  trigger_(position) {
    const prevPos = this.prevPosition_;
    if (prevPos
        && layoutRectEquals(prevPos.positionRect, position.positionRect)
        && layoutRectEquals(prevPos.viewportRect, position.viewportRect)) {
      // position didn't change, do nothing.
      return;
    }

    devAssert(position.positionRect,
        'PositionObserver should always trigger entry with clientRect');
    const positionRect =
    /** @type {!../../layout-rect.LayoutRectDef} */ (position.positionRect);
    // Add the relative position of the element to its viewport
    position.relativePos = layoutRectsRelativePos(positionRect,
        position.viewportRect);

    if (layoutRectsOverlap(positionRect, position.viewportRect)) {
      // Update position
      this.prevPosition_ = position;
      // Only call handler if entry element overlap with viewport.
      this.handler_(position);
    } else if (this.prevPosition_) {
      // Need to notify that element gets outside viewport
      // NOTE: This is required for inabox position observer.
      this.prevPosition_ = null;
      position.positionRect = null;
      this.handler_(position);
    }
  }

  /**
   * To update the position of entry element when it is ready.
   * Called when updateAllEntries, or when first observe an element.
   * @param {boolean=} opt_force
   */
  update(opt_force) {
    if (!opt_force) {
      if (this.turn != 0) {
        this.turn--;
        return;
      }

      if (this.fidelity == PositionObserverFidelity.LOW) {
        this.turn = LOW_FIDELITY_FRAME_COUNT;
      }
    }

    const viewportSize = this.viewport_.getSize();
    const viewportBox =
        layoutRectLtwh(0, 0, viewportSize.width, viewportSize.height);
    this.viewport_.getClientRectAsync(this.element).then(elementBox => {
      this.trigger_(
      /** @type {./position-observer-worker.PositionInViewportEntryDef}*/ ({
            positionRect: elementBox,
            viewportRect: viewportBox,
            relativePos: '',
          }));
    });
  }
}
