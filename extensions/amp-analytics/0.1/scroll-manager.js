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
 * A manager for handling multiple Scroll Event Trackers.
 * The instance of this class corresponds 1:1 to `AnalyticsRoot`. It represents
 * a collection of all scroll triggers declared within the `AnalyticsRoot`.
 * @implements {../../../src/service.Disposable}
 * @abstract
 */
export class ScrollManager {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {

    /** @const @protected {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc*/
    this.ampdoc = ampdoc;

    /** @private {!Observable<!../../../src/service/viewport/viewport-impl.ViewportChangedEventDef>} */
    this.scrollObservable_ = new Observable();

    /** @const @private {!../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);
    this.viewport_.onChanged(this.onScroll_.bind(this));
  }

  /**
   * Function to dispose of all handlers on the scroll observable
   */
  dispose() {
    this.scrollObservable_.removeAll();
  }

  /**
   * @param {function(!Event)} handler
   */
  removeScrollHandler(handler) {
    this.scrollObservable_.remove(handler);
  }

  /**
   * @param {function(!Event)} handler
   */
  addScrollHandler(handler) {
    this.scrollObservable_.add(handler);

    // Trigger an event to fire events that might have already happened.
    const size = this.viewport_.getSize();
    handler({
      scrollTop: this.viewport_.getScrollTop(),
      scrollLeft: this.viewport_.getScrollLeft(),
      scrollWidth: this.viewport_.getScrollWidth(),
      scrollHeight: this.viewport_.getScrollHeight(),
      screenWidth: size.width,
      screenHeight: size.height,
      relayoutAll: false,
      velocity: 0, // Hack for typing.
    });
  }

  /**
   * @param {!../../../src/service/viewport/viewport-impl.ViewportChangedEventDef} e
   * @private
   */
  onScroll_(e) {
    // Fire all of our children scroll observables
    this.scrollObservable_.fire(e);
  }
}

