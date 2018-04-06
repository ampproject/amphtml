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

import {DATA_MANAGER_ID_NAME} from './refresh-manager';
import {IntersectionObserverPolyfill} from '../../../src/intersection-observer-polyfill';
import {dev} from '../../../src/log';

export class RefreshIntersectionObserverWrapper {
  /**
   * A thin wrapper class to allow the IntersectionObserverPolyfill to work with
   * refresh.
   * @param {function(?Array<!IntersectionObserverEntry>)} callback
   * @param {!AMP.BaseElement} baseElement
   * @param {Object} config
   */
  constructor(callback, baseElement, config) {

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
  }

  observe(element) {
    const refreshId = element.getAttribute(DATA_MANAGER_ID_NAME);
    dev().assert(refreshId, 'observe invoked on element without refresh id');

    const viewportCallback = element.viewportCallback.bind(element);
    this.viewportCallbacks_[refreshId] = viewportCallback;

    // We need to call tick to update current host viewport state, otherwise we
    // might get into a situation where observe is called with the viewport
    // state indicating that it's in the viewport when it's not.
    this.intersectionObserver_.tick(this.viewport_.getRect());
    this.intersectionObserver_.observe(element);
    element.viewportCallback = inViewport => {
      this.intersectionObserver_.tick(this.viewport_.getRect());
      viewportCallback(inViewport);
    };
  }

  unobserve(element) {
    const refreshId = element.getAttribute(DATA_MANAGER_ID_NAME);
    dev().assert(refreshId, 'unobserve invoked on element without refresh id');

    element.viewportCallback = this.viewportCallbacks_[refreshId];
    delete this.viewportCallbacks_[refreshId];
    this.intersectionObserver_.unobserve(element);
  }
}
