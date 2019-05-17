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

import {ActionTrust} from '../../../src/action-constants';
import {PositionObserverFidelity} from '../../../src/service/position-observer/position-observer-worker';
import {
  RelativePositions,
  layoutRectLtwh,
  layoutRectsRelativePos,
} from '../../../src/layout-rect';
import {Services} from '../../../src/services';
import {
  assertLength,
  getLengthNumeral,
  getLengthUnits,
  parseLength,
} from '../../../src/layout';
import {createCustomEvent} from '../../../src/event-helper';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getServiceForDoc} from '../../../src/service';
import {installPositionObserverServiceForDoc} from '../../../src/service/position-observer/position-observer-impl';

const TAG = 'amp-position-observer';

/**
 * Minimum number of pixels in height that need to change before we consider
 * a resize has happened.
 * We have this threshold  because we do not want viewport height changes
 * caused by hide/show of addressbar on mobile browsers cause jumps in
 * scrollbound animations.
 * 150 pixels accounts for most addressbar sizes on mobile browsers.
 */
const RESIZE_THRESHOLD = 150;

/**
 * @typedef {!../../../src/service/position-observer/position-observer-worker.PositionInViewportEntryDef}
 */
let PositionInViewportEntryDef;

export class AmpVisibilityObserver extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {?../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = null;

    /** @private {?../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = null;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private {number} */
    this.topRatio_ = 0;

    /** @private {number} */
    this.bottomRatio_ = 0;

    /** @private {string} */
    this.topMarginExpr_ = '0';

    /** @private {string} */
    this.bottomMarginExpr_ = '0';

    /** @private {number} */
    this.resolvedTopMargin_ = 0;

    /** @private {number} */
    this.resolvedBottomMargin_ = 0;

    /** @private {?../../../src/layout-rect.LayoutRectDef} */
    this.viewportRect_ = null;

    /** @private {?string} */
    this.targetId_ = null;

    /** @private {?number} */
    this.initialViewportHeight_ = null;

    /** @private {number} */
    this.scrollProgress_ = 0;

    /** @private {number} */
    this.remainingScrollToExit_ = 0;

    /** @private {boolean} */
    this.runOnce_ = false;

    /** @private {boolean} */
    this.firstIterationComplete_ = false;
  }

  /** @override */
  buildCallback() {
    // Since this is a functional component and not visual,
    // layoutCallback is meaningless. We delay the heavy work until
    // we become visible.
    const viewer = Services.viewerForDoc(this.getAmpDoc());
    viewer.whenFirstVisible().then(this.init_.bind(this));

    this.runOnce_ = this.element.hasAttribute('once');
  }

  /**
   * @private
   */
  init_() {
    this.parseAttributes_();
    this.action_ = Services.actionServiceForDoc(this.element);
    this.viewport_ = Services.viewportForDoc(this.element);
    this.maybeInstallPositionObserver_();
    this.getAmpDoc()
      .whenReady()
      .then(() => {
        const scene = this.discoverScene_();
        this.positionObserver_.observe(
          scene,
          PositionObserverFidelity.HIGH,
          /** @type {function(?PositionInViewportEntryDef)} */ (this.positionChanged_.bind(
            this
          ))
        );
      });
  }

  /**
   * Dispatches the `enter` event.
   * @private
   */
  triggerEnter_() {
    const name = 'enter';
    const event = createCustomEvent(this.win, `${TAG}.${name}`, dict({}));
    this.action_.trigger(this.element, name, event, ActionTrust.LOW);
  }

  /**
   * Dispatches the `exit` event.
   * @private
   */
  triggerExit_() {
    const name = 'exit';
    const event = createCustomEvent(this.win, `${TAG}.${name}`, dict({}));
    this.action_.trigger(this.element, name, event, ActionTrust.LOW);
  }

  /**
   * Dispatches the `scroll` event (at most every animation frame)
   *
   * This event is triggered only when position-observer triggers which is
   * at most every animation frame.
   *
   * @private
   */
  triggerScroll_() {
    const scrolltop = this.viewport_.getScrollTop();
    const positionObserverData = dict({
      'start-scroll-offset': scrolltop,
      'end-scroll-offset': scrolltop + this.remainingScrollToExit_,
      'initial-inview-percent': this.scrollProgress_,
    });
    const name = 'scroll';
    const event = createCustomEvent(
      this.win,
      `${TAG}.${name}`,
      dict({
        'percent': this.scrollProgress_,
        'positionObserverData': positionObserverData,
      })
    );
    this.action_.trigger(this.element, name, event, ActionTrust.LOW);
    // TODO(nainar): We want to remove the position observer if the scroll
    // event is only used by the AnimationWorklet codepath of amp-animation.
    // This involves having amp-animation signal back to amp-position-observer
    // that it is using AnimationWorklet AND amp-position-observer needs to
    // ensure nothing else other than amp-animation is using scroll AND
    // that `enter` and `exit` events are not used.
  }

  /**
   * Called by position observer.
   * It calculates visibility and progress, and triggers the appropriate events.
   * @param {!PositionInViewportEntryDef} entry PositionObserver entry
   * @private
   */
  positionChanged_(entry) {
    if (this.runOnce_ && this.firstIterationComplete_) {
      return;
    }

    const wasVisible = this.isVisible_;
    const prevViewportHeight = this.viewportRect_ && this.viewportRect_.height;

    this.adjustForSmallViewportResize_(entry);

    this.viewportRect_ = entry.viewportRect;

    if (prevViewportHeight != entry.viewportRect.height) {
      // Margins support viewport sizing.
      this.recalculateMargins_();
    }

    // Adjust viewport based on exclusion margins
    const adjViewportRect = this.applyMargins_(entry.viewportRect);
    const {positionRect} = entry;

    // Relative position of the element to the adjusted viewport.
    let relPos;
    if (!positionRect) {
      this.isVisible_ = false;
      relPos = entry.relativePos;
    } else {
      relPos = layoutRectsRelativePos(positionRect, adjViewportRect);
      this.updateVisibility_(positionRect, adjViewportRect, relPos);
    }

    if (wasVisible && !this.isVisible_) {
      // Send final scroll progress state before exiting to handle fast-scroll.
      this.scrollProgress_ = relPos == RelativePositions.BOTTOM ? 0 : 1;
      this.triggerScroll_();
      this.triggerExit_();
      this.firstIterationComplete_ = true;
    }

    if (!wasVisible && this.isVisible_) {
      this.triggerEnter_();
    }

    // Send scroll progress if visible.
    if (this.isVisible_) {
      this.updateScrollProgress_(positionRect, adjViewportRect);
      this.triggerScroll_();
    }
  }

  /**
   * Calculates whether the scene is visible considering ratios and margins.
   * @param {!../../../src/layout-rect.LayoutRectDef} positionRect position rect as returned by position observer
   * @param {!../../../src/layout-rect.LayoutRectDef} adjustedViewportRect viewport rect adjusted for margins.
   * @param {!RelativePositions} relativePos Relative position of rect to viewportRect
   * @private
   */
  updateVisibility_(positionRect, adjustedViewportRect, relativePos) {
    // Fully inside margin-adjusted viewport.
    if (relativePos == RelativePositions.INSIDE) {
      this.isVisible_ = true;
      return;
    }

    const ratioToUse =
      relativePos == RelativePositions.TOP ? this.topRatio_ : this.bottomRatio_;

    const offset = positionRect.height * ratioToUse;
    if (relativePos == RelativePositions.BOTTOM) {
      this.isVisible_ =
        positionRect.top <= adjustedViewportRect.bottom - offset;
    } else {
      this.isVisible_ =
        positionRect.bottom >= adjustedViewportRect.top + offset;
    }
  }

  /**
   * Calculates the current scroll progress as a percentage.
   * Scroll progress is a decimal between 0-1 and shows progress between
   * enter and exit, considering ratio and margins.
   * When a scene becomes visible (enters based on ratio and margins), from
   * bottom, progress is 0 as it moves toward the top, progress increases until
   * it becomes exists with 1 from the top.
   *
   * Entering from the top gives the reverse values, 1 at enter, 0 at exit.
   * @param {?../../../src/layout-rect.LayoutRectDef} positionRect position rect as returned by position observer
   * @param {!../../../src/layout-rect.LayoutRectDef} adjustedViewportRect viewport rect adjusted for margins.
   * @private
   */
  updateScrollProgress_(positionRect, adjustedViewportRect) {
    if (!positionRect) {
      return;
    }
    const totalProgressOffset =
      positionRect.height * this.bottomRatio_ +
      positionRect.height * this.topRatio_;

    const totalProgress =
      adjustedViewportRect.height + positionRect.height - totalProgressOffset;

    const topOffset = Math.abs(
      positionRect.top -
        this.resolvedTopMargin_ -
        (adjustedViewportRect.height - positionRect.height * this.bottomRatio_)
    );

    this.scrollProgress_ = topOffset / totalProgress;
    this.remainingScrollToExit_ = totalProgress - topOffset;
  }

  /**
   * @private
   */
  parseAttributes_() {
    // Ratio is either "<top-bottom:{0,1}>" or "<top:{0,1}> <bottom:{0,1}>" e.g,
    // "0.5 1": use 50% visibility at top and 100% at the bottom of viewport.
    const ratios = this.element.getAttribute('intersection-ratios');
    if (ratios) {
      const topBottom = ratios.trim().split(' ');
      this.topRatio_ = this.validateAndResolveRatio_(topBottom[0]);
      this.bottomRatio_ = this.topRatio_;
      if (topBottom[1]) {
        this.bottomRatio_ = this.validateAndResolveRatio_(topBottom[1]);
      }
    }

    // Margin is either "<top-bottom:{px,vh}>" or "<top:{px,vh}>
    // <bottom:{px,vh}>" e.g, "100px 10vh": exclude 100px from top and 10vh from
    // bottom of viewport.
    const margins = this.element.getAttribute('viewport-margins');
    if (margins) {
      const topBottom = margins.trim().split(' ');
      this.topMarginExpr_ = topBottom[0];
      this.bottomMarginExpr_ = this.topMarginExpr_;
      if (topBottom[1]) {
        this.bottomMarginExpr_ = topBottom[1];
      }
    }

    this.targetId_ = this.element.getAttribute('target');
  }

  /**
   * Finds the container scene. Either parent of the component or specified by
   * `target` attribute.
   * @return {!Element} scene element.
   * @private
   */
  discoverScene_() {
    let scene;
    if (this.targetId_) {
      scene = user().assertElement(
        this.getAmpDoc().getElementById(this.targetId_),
        'No element found with id:' + this.targetId_
      );
    } else {
      scene = this.element.parentNode;
    }
    // Hoist body to documentElement.
    if (this.getAmpDoc().getBody() == scene) {
      scene = this.win.document.documentElement;
    }

    return dev().assertElement(scene);
  }

  /**
   * Parses and validates margins.
   * @private
   * @param {string} val
   * @return {number} resolved margin
   */
  validateAndResolveMargin_(val) {
    val = assertLength(parseLength(val));
    const unit = getLengthUnits(val);
    let num = getLengthNumeral(val);
    if (!num) {
      return 0;
    }
    userAssert(
      unit == 'px' || unit == 'vh',
      'Only pixel or vh are valid as units for exclusion margins: ' + val
    );

    if (unit == 'vh') {
      num = (num / 100) * this.viewportRect_.height;
    }
    return num;
  }

  /**
   * Parses and validates ratios.
   * @param {string} val
   * @return {number} resolved ratio
   * @private
   */
  validateAndResolveRatio_(val) {
    const num = parseFloat(val);
    userAssert(
      num >= 0 && num <= 1,
      'Ratios must be a decimal between 0 and 1: ' + val
    );
    return num;
  }

  /**
   * Margins can be of `vh` unit which means they may need to be recalculated
   * when viewport height changes.
   * @private
   */
  recalculateMargins_() {
    devAssert(this.viewportRect_);
    devAssert(this.bottomMarginExpr_);
    devAssert(this.topMarginExpr_);

    this.resolvedTopMargin_ = this.validateAndResolveMargin_(
      this.topMarginExpr_
    );

    this.resolvedBottomMargin_ = this.validateAndResolveMargin_(
      this.bottomMarginExpr_
    );
  }

  /**
   * Readjusts the given rect using the configured exclusion margins.
   * @param {!../../../src/layout-rect.LayoutRectDef} rect viewport rect adjusted for margins.
   * @private
   */
  applyMargins_(rect) {
    devAssert(rect);
    rect = layoutRectLtwh(
      rect.left,
      rect.top + this.resolvedTopMargin_,
      rect.width,
      rect.height - this.resolvedBottomMargin_ - this.resolvedTopMargin_
    );

    return rect;
  }

  /**
   * Detects whether viewport height has changed and if that change
   * is within our acceptable threshold.
   * If within, we offset calculation by the delta so that small viewport
   * changes caused by hide/show of addressbar on mobile browsers do not
   * cause jumps in scrollbond animations.
   * @param {!PositionInViewportEntryDef} entry PositionObserver entry
   */
  adjustForSmallViewportResize_(entry) {
    if (!this.initialViewportHeight_) {
      this.initialViewportHeight_ = entry.viewportRect.height;
    }
    const viewportHeightChangeDelta =
      this.initialViewportHeight_ - entry.viewportRect.height;
    let resizeOffset = 0;
    if (Math.abs(viewportHeightChangeDelta) < RESIZE_THRESHOLD) {
      resizeOffset = viewportHeightChangeDelta;
    } else {
      this.initialViewportHeight_ = null;
    }
    entry.viewportRect = layoutRectLtwh(
      entry.viewportRect.left,
      entry.viewportRect.top,
      entry.viewportRect.width,
      entry.viewportRect.height + resizeOffset
    );
  }

  /**
   * @private
   */
  maybeInstallPositionObserver_() {
    if (!this.positionObserver_) {
      installPositionObserverServiceForDoc(this.getAmpDoc());
      this.positionObserver_ = getServiceForDoc(
        this.getAmpDoc(),
        'position-observer'
      );
    }
  }

  /**
   * @private
   */
  maybeUninstallPositionObserver_() {
    if (this.positionObserver_) {
      const scene = this.discoverScene_();
      this.positionObserver_.unobserve(scene);
      this.positionObserver_ = null;
    }
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpVisibilityObserver);
});
