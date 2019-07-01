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

import {Observable} from '../../../src/observable';
import {Services} from '../../../src/services';

/**
 * @typedef {{
 *   top: number,
 *   left: number,
 *   width: number,
 *   height: number,
 *   scrollHeight: number,
 *   scrollWidth: number,
 * }}
 */
export let ScrollEventDef;

/**
 * A manager for handling multiple Scroll Event Trackers.
 * The instance of this class corresponds 1:1 to `AnalyticsRoot`. It represents
 * a collection of all scroll triggers declared within the `AnalyticsRoot`.
 * @implements {../../../src/service.Disposable}
 */
export class ScrollManager {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private {!../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {!UnlistenDef|null} */
    this.viewportOnChangedUnlistener_ = null;

    /** @private {!Observable<!./scroll-manager.ScrollEventDef>} */
    this.scrollObservable_ = new Observable();
  }

  /**
   * Function to dispose of all handlers on the scroll observable
   */
  dispose() {
    this.scrollObservable_.removeAll();
    this.removeViewportOnChangedListener_();
  }

  /**
   * @param {function(!Object)} handler
   */
  removeScrollHandler(handler) {
    this.scrollObservable_.remove(handler);

    if (this.scrollObservable_.getHandlerCount() <= 0) {
      this.removeViewportOnChangedListener_();
    }
  }

  /**
   * @param {function(!Object)} handler
   * @return {!UnlistenDef}
   */
  addScrollHandler(handler) {
    // Trigger an event to fire events that might have already happened.
    const size = this.viewport_.getSize();
    /** {./scroll-manager.ScrollEventDef} */
    const scrollEvent = {
      top: this.viewport_.getScrollTop(),
      left: this.viewport_.getScrollLeft(),
      width: size.width,
      height: size.height,
      scrollWidth: this.viewport_.getScrollWidth(),
      scrollHeight: this.viewport_.getScrollHeight(),
    };
    handler(scrollEvent);

    if (this.scrollObservable_.getHandlerCount() === 0) {
      this.addViewportOnChangedListener_();
    }

    return this.scrollObservable_.add(handler);
  }

  /**
   * @param {!../../../src/service/viewport/viewport-impl.ViewportChangedEventDef} e
   * @private
   */
  onScroll_(e) {
    /** {./scroll-manager.ScrollEventDef} */
    const scrollEvent = {
      top: e.top,
      left: e.left,
      width: e.width,
      height: e.height,
      scrollWidth: this.viewport_.getScrollWidth(),
      scrollHeight: this.viewport_.getScrollHeight(),
    };
    // Fire all of our children scroll observables
    this.scrollObservable_.fire(scrollEvent);
  }

  /**
   * Function to remove the viewport onChanged listener
   * @private
   */
  removeViewportOnChangedListener_() {
    if (this.viewportOnChangedUnlistener_) {
      this.viewportOnChangedUnlistener_();
      this.viewportOnChangedUnlistener_ = null;
    }
  }

  /**
   * Function to add the viewport onChanged listener
   * @private
   */
  addViewportOnChangedListener_() {
    this.viewportOnChangedUnlistener_ = this.viewport_.onChanged(
      this.onScroll_.bind(this)
    );
  }
}
