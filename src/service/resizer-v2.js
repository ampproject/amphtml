/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {Deferred} from '../utils/promise';
import {FocusHistory} from '../focus-history';
import {Services} from '../services';
import {computedStyle} from '../style';

const FOCUS_HISTORY_TIMEOUT = 1000 * 60; // 1min

/** @implements {!Disposable} */
export class ResizerV2 {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    const {win} = ampdoc;

    /** @private {!WeakMap<!Element, !Deferred>} */
    this.measuredElements_ = new WeakMap();

    /** @private @const {!IntersectionObserver} */
    this.measuringObserver_ = new win.IntersectionObserver(
      (records) => {
        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          const element = record.target;
          const deferred = this.measuredElements_.get(element);
          if (deferred) {
            deferred.resolve(record);
            this.measuringObserver_.unobserve(element);
            this.measuredElements_.delete(element);
          }
        }
      },
      {root: win.document}
    );

    /** @private @const {function(!Element):!Promise<!IntersectionObserverEntry>} */
    this.measure_ = (element) => {
      let deferred = this.measuredElements_.get(element);
      if (!deferred) {
        deferred = new Deferred();
        this.measuredElements_.set(element, deferred);
        this.measuringObserver_.observe(element);
      }
      return deferred.promise;
    };

    /** @private @const {!./viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private @const {!FocusHistory} */
    this.activeHistory_ = new FocusHistory(win, FOCUS_HISTORY_TIMEOUT);

    /** @private {?number} */
    this.initialContentHeight_ = null;
  }

  /** @override */
  dispose() {
    this.measuringObserver_.disconnect();
    this.measuredElements_ = null;
  }

  /* QQQ
  someCaller() {
    return new Promise((resolve, reject) => {
      tryChangeSize_(a, b, c,
        (newHeight, newWidth, newMargins) => {
          resource.changeSize(newHeight, newWidth, newMargins);
          // QQQQ: notify resources
        },
        (approved, newHeight, newWidth, newMargins) => {
          resource.overflowCallback(
            \* overflown *\ !approved,
            newHeight,
            newWidth,
            newMargins
          );
          if (approved) {
            resolve();
          } else {
            reject(new Error('...'));
          }
        });
    });
  }
  */

  /**
   * @param {!Element} element
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {!../layout-rect.LayoutMarginsChangeDef|undefined} newMargins
   * @param {?Event} event
   * @param {function(number|undefined, number|undefined, !../layout-rect.LayoutMarginsChangeDef|undefined)} onChange
   * @param {function(boolean, number|undefined, number|undefined, !../layout-rect.LayoutMarginsChangeDef|undefined)} onComplete
   */
  tryChangeSize(
    element,
    newHeight,
    newWidth,
    newMargins,
    event,
    onChange,
    onComplete
  ) {
    this.measure_(element).then((intersection) =>
      this.tryChangeSize_(
        element,
        intersection,
        newHeight,
        newWidth,
        newMargins,
        event,
        onChange,
        onComplete
      )
    );
  }

  /**
   * @param {!Element} element
   * @param {!IntersectionObserverEntry} intersection
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {!../layout-rect.LayoutMarginsChangeDef|undefined} newMargins
   * @param {?Event} event
   * @param {function(number|undefined, number|undefined, !../layout-rect.LayoutMarginsChangeDef|undefined)} onChange
   * @param {function(boolean, number|undefined, number|undefined, !../layout-rect.LayoutMarginsChangeDef|undefined)} onComplete
   * @private
   */
  tryChangeSize_(
    element,
    intersection,
    newHeight,
    newWidth,
    newMargins,
    event,
    onChange,
    onComplete
  ) {
    const {boundingClientRect, rootBounds} = intersection;

    // The element might no longer be attached to DOM. If so, it can be
    // resized w/o problems.
    if (!rootBounds) {
      onChange(newHeight, newWidth, newMargins);
      onComplete(true);
      return;
    }

    // Measuring from the InOb callback is mostly free.
    const topOffset = rootBounds.height / 10;
    const bottomOffset = rootBounds.height / 10;
    const scrollTop = this.viewport_.getScrollTop();

    const {top, bottom, height, width} = boundingClientRect;
    let topUnchangedBoundary = top;
    let bottomDisplacedBoundary = bottom;
    let topMarginDiff = 0;
    let bottomMarginDiff = 0;
    let leftMarginDiff = 0;
    let rightMarginDiff = 0;

    if (newMargins) {
      const margins = computeMargins(this.ampdoc_.win, element);
      if (newMargins.top != undefined) {
        topMarginDiff = newMargins.top - margins.top;
      }
      if (newMargins.bottom != undefined) {
        bottomMarginDiff = newMargins.bottom - margins.bottom;
      }
      if (newMargins.left != undefined) {
        leftMarginDiff = newMargins.left - margins.left;
      }
      if (newMargins.right != undefined) {
        rightMarginDiff = newMargins.right - margins.right;
      }
      if (topMarginDiff) {
        topUnchangedBoundary -= margins.top;
      }
      if (bottomMarginDiff) {
        // The lowest boundary of the element that would appear to be
        // resized as a result of this size change. If the bottom margin is
        // being changed then it is the bottom edge of the margin box,
        // otherwise it is the bottom edge of the layout box as set above.
        bottomDisplacedBoundary += margins.bottom;
      }
    }
    const heightDiff = newHeight == null ? 0 : newHeight - height;
    const widthDiff = newWidth == null ? 0 : newWidth - width;

    const changed = !(
      heightDiff == 0 &&
      topMarginDiff == 0 &&
      bottomMarginDiff == 0 &&
      widthDiff == 0 &&
      leftMarginDiff == 0 &&
      rightMarginDiff == 0
    );
    let allow = false;
    let adjScrollHeight = false;
    if (!changed) {
      // 1. Nothing to resize.
      allow = true;
    } else if (!this.ampdoc_.isVisible()) {
      // 2. An immediate execution requested or the document is hidden.
      allow = true;
    } else if (
      this.activeHistory_.hasDescendantsOf(element) ||
      (event && event.userActivation && event.userActivation.hasBeenActive)
    ) {
      // 3. Active elements are immediately resized. The assumption is that
      // the resize is triggered by the user action or soon after.
      allow = true;
    } else if (
      topUnchangedBoundary >= rootBounds.height - bottomOffset ||
      (topMarginDiff == 0 &&
        bottom + Math.min(heightDiff, 0) >= rootBounds.height - bottomOffset)
    ) {
      // 4. Elements under viewport are resized immediately, but only if
      // an element's boundary is not changed above the viewport after
      // resize.
      allow = true;
    } else if (
      scrollTop > 1 &&
      bottomDisplacedBoundary <= topOffset &&
      (heightDiff >= 0 || scrollTop + heightDiff >= 0)
    ) {
      // 5. Elements above the viewport can only be resized if we are able
      // to compensate the height change by setting scrollTop and only if
      // the page has already been scrolled by some amount (1px due to iOS).
      // Otherwise the scrolling might move important things like the menu
      // bar out of the viewport at initial page load.
      allow = true;
      adjScrollHeight = true;
    } else if (this.isNearBottom_(bottom + scrollTop)) {
      // 6. Elements close to the bottom of the document (not viewport)
      // are resized immediately.
      allow = true;
    } else if (heightDiff < 0 || topMarginDiff < 0 || bottomMarginDiff < 0) {
      // 7. The new height (or one of the margins) is smaller than the
      // current one.
    } else if (heightDiff == 0 && widthDiff != 0) {
      // 8. Element is in viewport, but this is a width-only expansion.
      // Check whether this should be reflow-free, in which case,
      // schedule a size change.
      const parent = element.parentElement;
      if (parent) {
        const parentWidth = parent./*OK*/ offsetWidth;
        let cumulativeWidth = widthDiff;
        for (let i = 0; i < parent.childElementCount; i++) {
          cumulativeWidth += parent.children[i]./*OK*/ offsetWidth;
          if (cumulativeWidth > parentWidth) {
            break;
          }
        }
        allow = cumulativeWidth <= parentWidth;
      }
    }

    if (allow && changed) {
      if (adjScrollHeight) {
        // The browser is normally fully sync'd in a InOb callback, thus reads
        // would not be blocking.
        const scrollHeight = this.viewport_.getScrollHeight();

        onChange(newHeight, newWidth, newMargins);

        // This measurement is definitely blocking, but we have to do it sync
        // to avoid scroll jumps causing FOUC.
        const newScrollHeight = this.viewport_.getScrollHeight();
        if (newScrollHeight != scrollHeight) {
          this.viewport_.setScrollTop(
            scrollTop + (newScrollHeight - scrollHeight)
          );
        }
      } else {
        onChange(newHeight, newWidth, newMargins);
      }
    }

    onComplete(allow, newHeight, newWidth, newMargins);
  }

  /**
   * @param {number} bottom
   * @return {boolean}
   * @private
   */
  isNearBottom_(bottom) {
    const contentHeight = this.viewport_.getContentHeight();
    if (this.initialContentHeight_ == null) {
      this.initialContentHeight_ = contentHeight;
    }
    const minContentHeight = Math.min(
      contentHeight,
      this.initialContentHeight_
    );
    const threshold = Math.max(
      minContentHeight * 0.85,
      minContentHeight - 1000
    );
    return bottom >= threshold;
  }
}

/**
 * @param {!Window} win
 * @param {!Element} element
 * @return {!../layout-rect.LayoutMarginsChangeDef}
 */
function computeMargins(win, element) {
  const style = computedStyle(win, element);
  return {
    top: parseInt(style.marginTop, 10) || 0,
    right: parseInt(style.marginRight, 10) || 0,
    bottom: parseInt(style.marginBottom, 10) || 0,
    left: parseInt(style.marginLeft, 10) || 0,
  };
}
