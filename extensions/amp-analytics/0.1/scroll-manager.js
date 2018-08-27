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
 *   relayoutAll: boolean,
 *   top: number,
 *   left: number,
 *   width: number,
 *   height: number,
 *   screenHeight: number,
 *   screenWidth: number,
 *   velocity: number
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

    /** @const @protected {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc*/
    this.ampdoc = ampdoc;

    /** @private {!Observable<!./scroll-manager.ScrollEventDef>} */
    this.scrollObservable_ = new Observable();

    /** @const @private {!../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);
    
    /** @const @private {!UnlistenDef|null} */
    this.viewportOnChangedUnlistenDef_ = null;
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
      width: this.viewport_.getScrollWidth(),
      height: this.viewport_.getScrollHeight(),
      screenWidth: size.width,
      screenHeight: size.height,
      relayoutAll: false,
      velocity: 0, // Hack for typing.
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
      width: this.viewport_.getScrollWidth(),
      height: this.viewport_.getScrollHeight(),
      screenWidth: e.width,
      screenHeight: e.height,
      relayoutAll: e.relayoutAll,
      velocity: e.velocity, // Hack for typing.
    };
    // Fire all of our children scroll observables
    this.scrollObservable_.fire(scrollEvent);
  }

  /**
   * Function to remove the viewport onChanged listener
   * @private
   */
  removeViewportOnChangedListener_() {
    if (this.viewportOnChangedUnlistenDef_) {
      this.viewportOnChangedUnlistenDef_();
      this.viewportOnChangedUnlistenDef_ = null;
    }
  }

  /**
   * Function to add the viewport onChanged listener
   * @private
   */
  addViewportOnChangedListener_() {
    this.viewportOnChangedUnlistenDef_ = this.viewport_.onChanged(this.onScroll_.bind(this));
  }

}

