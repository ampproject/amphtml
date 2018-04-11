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
import {dev} from '../../../src/log';

export class RefreshIntersectionObserverWrapper {
  /**
   * A thin wrapper class to allow the IntersectionObserverPolyfill to work with
   * refresh.
   * @param {function(!Array<!IntersectionObserverEntry>)} callback
   * @param {!AMP.BaseElement} baseElement
   * @param {Object} config
   */
  constructor(callback, baseElement, config) {

    /**
     * @private @const {!IntersectionObserverPolyfill}
     */
    this.intersectionObserver_ = new IntersectionObserverPolyfill(
        callback, config);

    /**
     * Stores elements and their original viewportCallback functions so that
     * they can be reverted upon invocation of unobserve.
     * @private {!Object<string, function()>}
     */
    this.viewportCallbacks_ = {};

    /** @private @const {!../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = baseElement.getViewport();

    /**
     * Flag that indicates when #tick should be called on the observer
     * polyfill.
     * @private {boolean}
     */
    this.updateObserver_ = false;
  }

  /**
   * Begin observing the given element.
   * @param {!Element} element
   */
  observe(element) {
    // The attribute name is exported in refresh-manager.js as
    // DATA_MANAGER_ID_NAME, but unfortunately, it can't be imported without
    // creating a cyclical dependency.
    const refreshId = element.getAttribute('data-amp-ad-refresh-id');
    dev().assert(refreshId, 'observe invoked on element without refresh id');

    if (!this.viewportCallbacks_[refreshId]) {
      const viewportCallback = element.viewportCallback.bind(element);
      this.viewportCallbacks_[refreshId] = viewportCallback;
      element.viewportCallback = inViewport => {
        if (this.updateObserver_) {
          this.intersectionObserver_.tick(this.viewport_.getRect());
        }
        viewportCallback(inViewport);
      };
    }

    this.updateObserver_ = true;
    this.intersectionObserver_.observe(element);
  }

  /**
   * Cease observing the given element.
   * @param {!Element} element
   */
  unobserve(element) {
    // We need to call 'tick' to update current host viewport state, otherwise
    // the next time we call 'observe', the viewport state might be stale, and
    // indicate that the element is in the viewport when it's not.
    this.intersectionObserver_.tick(this.viewport_.getRect());
    this.intersectionObserver_.unobserve(element);
    this.updateObserver_ = false;
  }
}
