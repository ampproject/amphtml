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

import {ActionTrust} from '../../../src/action-trust';
import {getServiceForDoc} from '../../../src/service';
import {Services} from '../../../src/services';
import {Layout} from '../../../src/layout';
import {createCustomEvent} from '../../../src/event-helper';
import {RelativePositions, layoutRectsRelativePos} from '../../../src/layout-rect';

import {
  installPositionObserverServiceForDoc,
  PositionObserverFidelity,
  PositionInViewportEntryDef,
} from '../../../src/service/position-observer-impl';

export class AmpVisibilityObserver extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {?Element} */
    this.scene_ = null;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private {?../../../src/service/position-observer-impl.AmpDocPositionObserver} */
    this.positionObserver_ = null;

    /** @private {number} */
    this.topRatio_ = 0;

    /** @private {number} */
    this.bottomRatio_ = 0;

    this.scrollProgress_ = 0;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  buildCallback() {
    // Trigger, but only when visible.
    const viewer = Services.viewerForDoc(this.getAmpDoc());
    viewer.whenFirstVisible().then(this.trigger_.bind(this));
    // Ratio is either "0.dd" or "0.dd 0.dd"
    const ratio = this.element.getAttribute('intersection-ratio');
    if (ratio) {
      const topBottom = ratio.split(' ');
      this.bottomRatio_ = parseFloat(topBottom[0]);
      if (topBottom[1]) {
        this.topRatio_ = parseFloat(topBottom[1]);
      } else {
        this.topRatio_ = this.bottomRatio_;
      }
    }
  }

  trigger_() {
    this.action_ = Services.actionServiceForDoc(this.element);
    this.scene_ = this.element.parentNode;
    this.maybeInstallPositionObserver_();
    this.positionObserver_.observe(this.scene_, PositionObserverFidelity.HIGH,
        this.positionChanged_.bind(this)
    );
  }

  positionChanged_(entry) {
    const adjustedViewportRect = this.adjustMargins_(entry.viewportRect);
    const positionRect = entry.positionRect;
    const wasVisible = this.isVisible_;

    const relativePos = layoutRectsRelativePos(positionRect,
        adjustedViewportRect);

    if (!positionRect) {
      this.isVisible_ = false;
    } else {
      this.updateVisibility_(positionRect, adjustedViewportRect, relativePos);
    }

    if (wasVisible && !this.isVisible_) {
      // Send final scroll progress state before exiting.
      this.scrollProgress_ = relativePos == RelativePositions.BOTTOM ? 0 : 1;
      this.triggerScroll_();
      this.triggerExit_();
    }

    if (!wasVisible && this.isVisible_) {
      this.triggerEnter_();
    }

    // Send scroll progress if visible
    if (this.isVisible_) {
      this.updateScrollProgress_(positionRect, adjustedViewportRect);
      this.triggerScroll_();
    }
  }

  updateScrollProgress_(positionRect, adjustedViewportRect) {
    const totalDurationOffset = (positionRect.height * this.bottomRatio_) +
        (positionRect.height * this.topRatio_);

    const totalDuration = adjustedViewportRect.height + positionRect.height - totalDurationOffset;
    const topOffset = Math.abs(positionRect.top - (adjustedViewportRect.height - (positionRect.height * this.bottomRatio_)));
    this.scrollProgress_ = topOffset / totalDuration;
  }

  updateVisibility_(positionRect, adjustedViewportRect, relativePos) {
    // Fully inside margin-adjusted viewport
    if (relativePos == RelativePositions.INSIDE) {
      this.isVisible_ = true;
      return;
    }

    const ratioToUse = relativePos == RelativePositions.TOP ?
        this.topRatio_ : this.bottomRatio_;

    const offset = positionRect.height * ratioToUse;
    if (relativePos == RelativePositions.BOTTOM) {
      this.isVisible_ = positionRect.top <= (adjustedViewportRect.bottom - offset);
      return;
    } else {
      this.isVisible_ = positionRect.bottom >= (adjustedViewportRect.top + offset);
      return;
    }
  }

  adjustMargins_(rect) {
    return rect;
  }

  triggerEnter_() {
    const evt = createCustomEvent(this.win, 'amp-visibility-observer.enter');
    this.action_.trigger(this.element, 'enter', evt, ActionTrust.LOW);
  }

  triggerExit_() {
    const evt = createCustomEvent(this.win, 'amp-visibility-observer.exit');
    this.action_.trigger(this.element, 'exit', evt, ActionTrust.LOW);
  }

  triggerScroll_() {
    const evt = createCustomEvent(this.win, 'amp-visibility-observer.scroll',
        {percent: this.scrollProgress_});
    this.action_.trigger(this.element, 'scroll', evt, ActionTrust.LOW);
  }

  maybeInstallPositionObserver_() {
    if (!this.positionObserver_) {
      installPositionObserverServiceForDoc(this.getAmpDoc());
      this.positionObserver_ = getServiceForDoc(
          this.getAmpDoc(),
          'position-observer'
      );
    }
  }
}

AMP.registerElement('amp-visibility-observer', AmpVisibilityObserver);
