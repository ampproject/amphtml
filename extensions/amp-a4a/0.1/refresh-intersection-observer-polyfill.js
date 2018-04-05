/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {IntersectionObserverPolyfill} from '../../../src/intersection-observer-polyfill';

/**
 * @typedef {{
 *   element: !Element,
 *   callback: function(),
 * }}
 */
let ElementViewportCallbackPair;

export class RefreshIntersectionObserverWrapper {
  constructor(callback, threshold) {

    this.intersectionObserver_ = new IntersectionObserverPolyfill(
        callback, {threshold});

    /**
     * Stores elements and their original viewportCallback functions so that
     * they can be reverted upon invocation of unobserve.
     * @private {!Array<!ElementViewportCallbackPair>}}
     */
    this.viewportCallbacks_ = [];
  }

  observe(element) {
    const elementViewportCallbackPair = {
      element,
      callback: element.viewportCallback.bind(element),
    };

    element.viewportCallback = inViewport => {
      if (inViewport) {
        this.intersectionObserver_.tick(element.getViewport().getRect());
      }
      elementViewportCallbackPair.callback(inViewport);
    };

    this.viewportCallbacks_.push(elementViewportCallbackPair);
    this.intersectionObserver_.observe(element);
  }

  unobserve(element) {
    for (let i = 0; i < this.viewportCallbacks_.length; i++) {
      if (this.viewportCallbacks_[i] == element) {
        element.viewportCallback = this.viewportCallbacks_[i].callback;
      }
    }
    this.intersectionObserver_unobserve(element);
  }
}
