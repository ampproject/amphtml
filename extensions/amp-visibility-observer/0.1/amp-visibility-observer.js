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
import {createCustomEvent} from '../../../src/event-helper';
import {dev, user} from '../../../src/log';
import {
  RelativePositions,
  layoutRectsRelativePos,
  layoutRectLtwh,
} from '../../../src/layout-rect';
import {
  Layout,
  getLengthNumeral,
  getLengthUnits,
  assertLength,
  parseLength,
} from '../../../src/layout';
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

    /** @private {!boolean} */
    this.isVisible_ = false;

    /** @private {?../../../src/service/position-observer-impl.AmpDocPositionObserver} */
    this.positionObserver_ = null;

    /** @private {!number} */
    this.topRatio_ = 0;

    /** @private {!number} */
    this.bottomRatio_ = 0;

    /** @private {!string} */
    this.topMarginExpr_ = '0';

    /** @private {!string} */
    this.bottomMarginExpr_ = '0';

    /** @private {!number} */
    this.resolvedTopMargin_ = 0;

    /** @private {!number} */
    this.resolvedBottomMargin_ = 0;

    /** @private {!../../../src/layout-rect.LayoutRectDef} */
    this.viewportRect_ = null;

    /** @private {!number} */
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
  }

  trigger_() {
    this.parseAttributes_();
    this.scene_ = this.element.parentNode;
    this.action_ = Services.actionServiceForDoc(this.element);
    this.maybeInstallPositionObserver_();
    this.positionObserver_.observe(this.scene_, PositionObserverFidelity.HIGH,
        this.positionChanged_.bind(this)
    );
  }

  parseAttributes_() {
    // Ratio is either "0.dd" or "0.dd 0.dd"
    const ratios = this.element.getAttribute('intersection-ratio');
    if (ratios) {
      const topBottom = ratios.trim().split(' ');
      this.topRatio_ = this.validateAndResolveRatio_(topBottom[0]);
      this.bottomRatio_ = this.topRatio_;
      if (topBottom[1]) {
        this.bottomRatio_ = this.validateAndResolveRatio_(topBottom[1]);
      }
    }

    const margins = this.element.getAttribute('exclusion-margins');
    if (margins) {
      const topBottom = margins.trim().split(' ');
      this.topMarginExpr_ = topBottom[0];
      this.bottomMarginExpr_ = this.topMarginExpr_;
      if (topBottom[1]) {
        this.bottomMarginExpr_ = topBottom[1];
      }
    }
  }

  positionChanged_(entry) {
    const wasVisible = this.isVisible_;
    const prevViewportHeight = this.viewportRect_ && this.viewportRect_.height;

    this.viewportRect_ = entry.viewportRect;

    if (prevViewportHeight != entry.viewportRect.height) {
      this.recalculateMargins_();
    }

    // Adjust numbers for based on exclusion margins
    const adjViewportRect = this.adjustMargins_(entry.viewportRect,
        entry.viewportRect.height);
    const adjPositionRect = entry.positionRect;

    // Relative position of the element to the adjusted viewport
    let relPos;
    if (!adjPositionRect) {
      this.isVisible_ = false;
      relPos = entry.relativePos;
    } else {
      relPos = layoutRectsRelativePos(adjPositionRect, adjViewportRect);
      this.updateVisibility_(adjPositionRect, adjViewportRect, relPos);
    }

    if (wasVisible && !this.isVisible_) {
      // Send final scroll progress state before exiting.
      this.scrollProgress_ = relPos == RelativePositions.BOTTOM ? 0 : 1;
      this.triggerScroll_();
      this.triggerExit_();
    }

    if (!wasVisible && this.isVisible_) {
      this.triggerEnter_();
    }

    // Send scroll progress if visible
    if (this.isVisible_) {
      this.updateScrollProgress_(adjPositionRect, adjViewportRect);
      this.triggerScroll_();
    }
  }

  updateScrollProgress_(positionRect, adjustedViewportRect) {
    const totalDurationOffset = (positionRect.height * this.bottomRatio_) +
        (positionRect.height * this.topRatio_);

    const totalDuration = adjustedViewportRect.height + positionRect.height - totalDurationOffset;
    const topOffset = Math.abs(positionRect.top - this.resolvedTopMargin_ -
    (adjustedViewportRect.height - (positionRect.height * this.bottomRatio_)));
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
      this.isVisible_ =
        positionRect.top <= (adjustedViewportRect.bottom - offset);
      return;
    } else {
      this.isVisible_ =
        positionRect.bottom >= (adjustedViewportRect.top + offset);
      return;
    }
  }

  recalculateMargins_() {
    dev().assert(this.viewportRect_);
    dev().assert(this.bottomMarginExpr_);
    dev().assert(this.topMarginExpr_);

    this.resolvedTopMargin_ =
        this.validateAndResolveMargin_(this.topMarginExpr_);

    this.resolvedBottomMargin_ =
        this.validateAndResolveMargin_(this.bottomMarginExpr_);

  }

  validateAndResolveMargin_(val) {
    val = assertLength(parseLength(val));
    const unit = getLengthUnits(val);
    let num = getLengthNumeral(val);
    user().assert(unit == 'px' || unit == 'vh', 'Only pixel or vh are valid ' +
      'values for exclusion margin: ' + val);

    if (unit == 'vh') {
      num = (num / 100) * this.viewportRect_.height;
    }
    return num;
  }

  adjustMargins_(rect) {
    dev().assert(rect);
    const r = layoutRectLtwh(
        rect.left,
        rect.top,
        rect.width,
        rect.height
    );
    r.top = r.top + this.resolvedTopMargin_;
    r.height = r.height - this.resolvedBottomMargin_ - this.resolvedTopMargin_;
    r.bottom = r.bottom - this.resolvedBottomMargin_;
    return r;
  }

  validateAndResolveRatio_(val) {
    const num = parseFloat(val);
    user().assert(num >= 0 && num <= 1,
        'Ratios must be a decimal between 0 and 1: ' + val);
    return num;
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
