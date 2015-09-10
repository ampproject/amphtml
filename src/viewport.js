/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Observable} from './observable';
import {layoutRectLtwh} from './layout-rect';
import {log} from './log';
import {platform} from './platform';
import {timer} from './timer';

let TAG_ = 'Viewport';


/**
 * @typedef {{
 *   relayoutAll: boolean,
 *   top: number,
 *   width: number,
 *   height: number,
 *   velocity: number
 * }}
 */
var ViewportChangedEvent;


/**
 * This object represents the viewport. It tracks scroll position, resize
 * and other events and notifies interesting parties when viewport has changed
 * and how.
 */
export class Viewport {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private {number} */
    this.width_ = this.getSize().width;

    /** @private {number} */
    this.scrollTop_ = this.calcScrollTop_();

    /** @private {number} */
    this.scrollMeasureTime_ = 0;

    /** @private {boolean} */
    this.scrollTracking_ = false;

    /** @private @const {!Observable<!ViewportChangedEvent>} */
    this.changeObservable_ = new Observable();

    this.win.addEventListener('scroll', this.scroll_.bind(this));
    this.win.addEventListener('resize', this.resize_.bind(this));
    this.changed_(/* relayoutAll */ false, /* velocity */ 0);
  }

  /**
   * Returns the viewport's top position in the document. This is essentially
   * the scroll position.
   * @return {number}
   */
  getTop() {
    return this.scrollTop_;
  }

  /**
   * Returns the size of the viewport.
   * @return {!{width: number, height: number}}
   */
  getSize() {
    // Notice, that documentElement.clientHeight is buggy on iOS Safari and thus
    // cannot be used. But when the values are undefined, fallback to
    // documentElement.clientHeight.
    if (platform.isIos() && !platform.isChrome()) {
      var winWidth = this.win.innerWidth;
      var winHeight = this.win.innerHeight;
      if (winWidth && winHeight) {
        return {width: winWidth, height: winHeight};
      }
    }
    var el = this.win.document.documentElement;
    return {width: el.clientWidth, height: el.clientHeight};
  }

  /**
   * Returns the rect of the viewport which includes scroll positions and size.
   * @return {!LayoutRect}
   */
  getRect() {
    var scrollTop = this.calcScrollTop_();
    var scrollLeft = this.calcScrollLeft_();
    var size = this.getSize();
    return layoutRectLtwh(scrollLeft, scrollTop, size.width, size.height);
  }

  /**
   * Returns the rect of the element within the document.
   * @param {!Element} el
   * @return {!LayoutRect}
   */
  getLayoutRect(el) {
    var scrollTop = this.calcScrollTop_();
    var scrollLeft = this.calcScrollLeft_();
    var b = el.getBoundingClientRect();
    return layoutRectLtwh(Math.round(b.left + scrollLeft),
        Math.round(b.top + scrollTop),
        Math.round(b.width),
        Math.round(b.height));
  }

  /**
   * Registers the handler for ViewportChangedEvent events.
   * @param {!function(!ViewportChangedEvent)} handler
   * @return {!Unlisten}
   */
  onChanged(handler) {
    return this.changeObservable_.add(handler);
  }

  /**
   * @return {!Element}
   */
  getScrollingElement_() {
    var doc = this.win.document;
    if (doc.scrollingElement) {
      return doc.scrollingElement;
    }
    if (doc.body) {
      return doc.body;
    }
    return doc.documentElement;
  }

  /**
   * @return {number}
   * @private
   */
  calcScrollTop_() {
    return this.getScrollingElement_().scrollTop || this.win.pageYOffset;
  }

  /**
   * @return {number}
   * @private
   */
  calcScrollLeft_() {
    return this.getScrollingElement_().scrollLeft || this.win.pageXOffset;
  }

  /**
   * @param {boolean} relayoutAll
   * @param {number} velocity
   * @private
   */
  changed_(relayoutAll, velocity) {
    var size = this.getSize();
    log.fine(TAG_, 'changed event: ' +
        'relayoutAll=' + relayoutAll + '; ' +
        'top=' + this.scrollTop_ + '; ' +
        'bottom=' + (this.scrollTop_ + size.height) + '; ' +
        'velocity=' + velocity);
    this.changeObservable_.fire({
      relayoutAll: relayoutAll,
      top: this.scrollTop_,
      width: size.width,
      height: size.height,
      velocity: velocity
    });
  }

  /** @private */
  scroll_() {
    if (this.scrollTracking_) {
      return;
    }

    var newScrollTop = this.calcScrollTop_();
    if (newScrollTop < 0) {
      // iOS and some other browsers use negative values of scrollTop for
      // overscroll. Overscroll does not affect the viewport and thus should
      // be ignored here.
      return;
    }

    this.scrollTracking_ = true;
    this.scrollTop_ = newScrollTop;
    this.scrollMeasureTime_ = timer.now();
    timer.delay(() => this.scrollDeferred_(), 500);
  }

  /** @private */
  scrollDeferred_() {
    this.scrollTracking_ = false;
    var newScrollTop = this.calcScrollTop_();
    var now = timer.now();
    var velocity = 0;
    if (now != this.scrollMeasureTime_) {
      velocity = (newScrollTop - this.scrollTop_) /
          (now - this.scrollMeasureTime_);
    }
    log.fine(TAG_, 'scroll: ' +
        'scrollTop=' + newScrollTop + '; ' +
        'velocity=' + velocity);
    this.scrollTop_ = newScrollTop;
    this.scrollMeasureTime_ = now;
    // TODO(dvoytenko): confirm the desired value and document it well.
    // Currently, this is 20px/second -> 0.02px/millis
    if (Math.abs(velocity) < 0.02) {
      this.changed_(/* relayoutAll */ false, velocity);
    } else {
      timer.delay(() => {
        if (!this.scrollTracking_) {
          this.scrollDeferred_();
        }
      }, 250);
    }
  }

  /** @private */
  resize_() {
    let oldWidth = this.width_;
    this.width_ = this.getSize().width;
    this.changed_(oldWidth != this.width_, 0);
  }
}

/**
 * @return {!Viewport}
 */
export function viewportFor(window) {
  if (window.__viewport) {
    return window.__viewport;
  }
  return window.__viewport = new Viewport(window);
};

export const viewport = viewportFor(window);
