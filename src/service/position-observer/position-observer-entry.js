/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use baseInstance file except in compliance with the License.
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
  layoutRectEquals,
  layoutRectsOverlap,
  layoutRectsRelativePos,
} from '../../layout-rect';
import {
  PositionObserverFidelity,
  LOW_FIDELITY_FRAME_COUNT,
} from './position-observer-fidelity';

/**
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

export class PositionObserverEntry {
  /**
   *
   * @param {!Element} element
   * @param {!PositionObserverFidelity} fidelity
   * @param {!function(?PositionInViewportEntryDef)} handler
   */
  constructor(element, fidelity, handler) {
    /** @const {!Element} */
    this.element = element;

    /** @const {!function(?PositionInViewportEntryDef)} */
    this.handler_ = handler;

    /** @type {!PositionObserverFidelity} */
    this.fidelity = fidelity;

    /** @type {number} */
    this.turn = (fidelity == PositionObserverFidelity.LOW) ?
        Math.floor(Math.random() * LOW_FIDELITY_FRAME_COUNT) : 0;

    /** @type {?PositionInViewportEntryDef} */
    this.position = null;

    /** @type {?../../layout-rect.LayoutRectDef} */
    this.inIframePositionRect = null;
  }

  /**
   * Call to update entry position
   * @param {!PositionInViewportEntryDef} position
   */
  trigger(position) {
    if (!position.positionRect) {
      return;
    }
    const prePos = this.position;
    if (prePos
        && layoutRectEquals(prePos.positionRect, position.positionRect)
        && layoutRectEquals(prePos.viewportRect, position.viewportRect)) {
      // position didn't change, do nothing.
      return;
    }

    // Add the relative position of the element to its viewport
    position.relativePos = layoutRectsRelativePos(
        /** @type {!../../layout-rect.LayoutRectDef} */ (position.positionRect),
        position.viewportRect
    );
    if (layoutRectsOverlap(
        /** @type {!../../layout-rect.LayoutRectDef} */ (position.positionRect),
        position.viewportRect)) {
      // Update position
      this.position = position;
      // Only call handler if entry element overlap with viewport.
      try {
        this.handler_(position);
      } catch (err) {
        // TODO(@zhouyx, #9208) Throw error.
      }
    } else if (this.position) {
      // Need to notify that element gets outside viewport
      // NOTE: This is required for inabox position observer.
      this.position = null;
      position.positionRect = null;
      try {
        this.handler_(position);
      } catch (err) {
        // TODO(@zhouyx, #9208) Throw error.
      }
    }
  }
}
