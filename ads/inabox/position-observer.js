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

import {layoutRectLtwh, LayoutRectDef} from '../../src/layout-rect';
import {Observable} from '../../src/observable';
import {throttle} from '../../src/utils/function';

/**
 * @typedef {{
 *   viewport: !LayoutRectDef,
 *   target: !LayoutRectDef
 * }}
 */
let PositionEntryDef;

/** @const */
const MIN_EVENT_INTERVAL_IN_MS = 100;

export class PositionObserver {

  /**
   * @param win {!Window}
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {?Observable} */
    this.positionObservable_ = null;
    /** @private {!Element} */
    this.scrollingElement_ = getScrollingElement(this.win_);
    /** @private {?number} */
    this.scrollLeft_ = null;
    /** @private {?number} */
    this.scrollTop_ = null;
    /** @private {?LayoutRectDef} */
    this.viewportRect_ = null;
  }

  /**
   * Start to observe the target element's position change and trigger callback.
   * TODO: maybe take DOM mutation into consideration
   * @param element {!Element}
   * @param callback {function(!PositionEntryDef)}
   */
  observe(element, callback) {
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
    callback(this.getPositionEntry_(element));
    this.positionObservable_.add(() => {
      callback(this.getPositionEntry_(element));
    });
  }

  update_() {
    this.scrollLeft_ = this.scrollingElement_./*OK*/scrollLeft
        || this.win_./*OK*/pageXOffset;
    this.scrollTop_ = this.scrollingElement_./*OK*/scrollTop
        || this.win_./*OK*/pageYOffset;
    this.viewportRect_ = layoutRectLtwh(
        Math.round(this.scrollLeft_),
        Math.round(this.scrollTop_),
        this.win_./*OK*/innerWidth,
        this.win_./*OK*/innerHeight);
  }

  /**
   * @param element {!Element}
   * @returns {!PositionEntryDef}
   * @private
   */
  getPositionEntry_(element) {
    const b = element./*OK*/getBoundingClientRect();
    return {
      viewport: /** @type {!LayoutRectDef} */(this.viewportRect_),
      // relative position to host doc
      target: layoutRectLtwh(
          Math.round(b.left + this.scrollLeft_),
          Math.round(b.top + this.scrollTop_),
          Math.round(b.width),
          Math.round(b.height)),
    };
  }
}

/**
 * @param win {!Window}
 * @returns {!Element}
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
 * @param ua {string}
 * @return {boolean}
 */
function isWebKit(ua) {
  return /WebKit/i.test(ua) && !/Edge/i.test(ua);
}
