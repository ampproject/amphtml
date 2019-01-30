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
  LayoutRectDef,
  layoutRectFromDomRect,
  layoutRectLtwh,
  moveLayoutRect,
} from '../../src/layout-rect';
import {Observable} from '../../src/observable';
import {throttle} from '../../src/utils/rate-limit';

/**
 * @typedef {{
 *   viewportRect: !LayoutRectDef,
 *   targetRect: !LayoutRectDef,
 * }}
 */
let PositionEntryDef;

/** @const */
const MIN_EVENT_INTERVAL_IN_MS = 100;

export class PositionObserver {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {?Observable} */
    this.positionObservable_ = null;
    /** @private {!Element} */
    this.scrollingElement_ = getScrollingElement(this.win_);
    /** @private {?LayoutRectDef} */
    this.viewportRect_ = null;
  }

  /**
   * Start to observe the target element's position change and trigger callback.
   * TODO: maybe take DOM mutation into consideration
   * @param {!Element} element
   * @param {function(!PositionEntryDef)} callback
   * @param {?Window} parentWin
   * @return {!UnlistenDef}
   */
  observe(element, callback, parentWin) {
    if (!this.positionObservable_) {
      this.positionObservable_ = new Observable();
      const listener = throttle(this.win_, () => {
        this.update_();
        this.positionObservable_.fire();
      }, MIN_EVENT_INTERVAL_IN_MS);
      this.update_();
      this.win_.addEventListener('scroll', listener, true);
      this.win_.addEventListener('resize', listener, true);
    }
    // Send the 1st ping immediately
    callback(this.getPositionEntry_(element, parentWin));
    return this.positionObservable_.add(() => {
      callback(this.getPositionEntry_(element, parentWin));
    });
  }

  /**
   * Updates viewport rect.
   */
  update_() {
    this.viewportRect_ = this.getViewportRect();
  }

  /**
   * @param {!Element} element
   * @param {?Window} parentWin The window that contains the element
   * @return {!PositionEntryDef}
   * @private
   */
  getPositionEntry_(element, parentWin) {
    return {
      viewportRect: /** @type {!LayoutRectDef} */(this.viewportRect_),
      // relative position to viewport
      targetRect: getTargetRect(element, parentWin),
    };
  }

  /**
   * A  method to get viewport rect
   */
  getViewportRect() {
    const {scrollingElement_: scrollingElement, win_: win} = this;

    const scrollLeft = scrollingElement./*OK*/scrollLeft ||
        win./*OK*/pageXOffset;
    const scrollTop = scrollingElement./*OK*/scrollTop ||
        win./*OK*/pageYOffset;
    return layoutRectLtwh(
        Math.round(scrollLeft),
        Math.round(scrollTop),
        win./*OK*/innerWidth,
        win./*OK*/innerHeight);
  }
}

/**
 * @param {!Window} win
 * @return {!Element}
 */
function getScrollingElement(win) {
  const doc = win.document;
  if (doc./*OK*/scrollingElement) {
    return doc./*OK*/scrollingElement;
  }
  if (doc.body
      // Due to https://bugs.webkit.org/show_bug.cgi?id=106133, WebKit
      // browsers have to use `body` and NOT `documentElement` for
      // scrolling purposes. This has mostly being resolved via
      // `scrollingElement` property, but this branch is still necessary
      // for backward compatibility purposes.
      && isWebKit(win.navigator.userAgent)) {
    return doc.body;
  }
  return doc.documentElement;
}

/**
 * Whether the current browser is based on the WebKit engine.
 * @param {string} ua
 * @return {boolean}
 */
function isWebKit(ua) {
  return /WebKit/i.test(ua) && !/Edge/i.test(ua);
}

/**
 * Get the element's layout rect relative to the viewport.
 * If parentWin is provided, then attempt to walk up the DOM and add the
 * offset of all nested parent iframes. Assumes that all parent frames are
 * friendly and can be inspected (because the element itself can be inspected
 * as well).
 * @param {!Element} element
 * @param {?Window} parentWin The window that contains the element
 * @return {!LayoutRectDef}
 */
export function getTargetRect(element, parentWin) {
  let targetRect = layoutRectFromDomRect(element./*OK*/getBoundingClientRect());
  if (parentWin) {
    for (let j = 0, tempWin = parentWin;
      j < 10 && tempWin != tempWin.top; j++, tempWin = tempWin.parent) {
      const parentFrameRect = layoutRectFromDomRect(
          parentWin.frameElement./*OK*/getBoundingClientRect());
      targetRect = moveLayoutRect(targetRect,
          parentFrameRect.left, parentFrameRect.top);
    }
  }
  return targetRect;
}
