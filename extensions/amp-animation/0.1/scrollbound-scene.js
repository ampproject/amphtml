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

import {
  installPositionObserverServiceForDoc,
  PositionObserverFidelity,
} from '../../../src/service/position-observer-impl';
import {getServiceForDoc} from '../../../src/service';

export class ScrollboundScene {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Element} element
   * @param {!function(!number)} onScroll
   * @param {!Function} onDurationChanged
   */
  constructor(ampdoc, element, onScroll, onDurationChanged) {

    /** @private {!Element} */
    this.element_ = element;

    /** @private {?number} */
    this.scrollDuration_ = null;

    /** @private {!function(!number)} */
    this.onScroll_ = onScroll;

    /** @private {!Function} */
    this.onDurationChanged_ = onDurationChanged;

    installPositionObserverServiceForDoc(ampdoc);
    this.positionObserver_ = getServiceForDoc(ampdoc, 'position-observer');

    getServiceForDoc(ampdoc, 'position-observer').observe(
      this.element_,
      PositionObserverFidelity.HIGH,
      this.onPositionChanged_.bind(this)
    );
  }

  onPositionChanged_(newPos) {
    // Until we have visibility conditions exposed scroll duration is amount
    // from when element is fully visible until element is partially
    // invisible which is basically viewportHeight - elementHeight.

    const vpRect = newPos.viewportRect;
    const posRec = newPos.positionRect;

    // If no positionRect, it is fully outside of the viewport.
    if (!posRec) {
      return;
    }

    // Did scroll duration changed?
    const scrollDuration = vpRect.height - posRec.height;
    if (scrollDuration != this.scrollDuration_) {
      this.scrollDuration_ = scrollDuration;
      this.onDurationChanged_(scrollDuration);
    }

    // Is scene fully visible?
    const isFullyVisible = posRec.bottom <= vpRect.height && posRec.top >= 0;

    if (isFullyVisible) {
      this.onScroll_(vpRect.height - posRec.bottom);
    } else {
      // Send the final position
      if (posRec.bottom < vpRect.height) {
        this.onScroll_(scrollDuration);
      } else {
        this.onScroll_(0);
      }
    }
  }
}
