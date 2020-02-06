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
import {dev, devAssert} from '../../../src/log';

/**
 * @typedef {{
 *   top: number,
 *   left: number,
 *   width: number,
 *   height: number,
 *   scrollHeight: number,
 *   scrollWidth: number,
 *   initialScrollHeight: number,
 *   initialScrollWidth: number,
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
    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @const @private {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @const @private {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(ampdoc);

    /** @private {!UnlistenDef|null} */
    this.viewportOnChangedUnlistener_ = null;

    /** @private {!Observable<!./scroll-manager.ScrollEventDef>} */
    this.scrollObservable_ = new Observable();

    /** @const @private {!Element} */
    this.root_ = this.getRootElement_();

    /** @const @private {../../../src/layout-rect.LayoutRectDef} */
    this.initialRootLayoutRect_ = null;
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

    this.measureRootElement_(true /** initial */).then(layoutRect => {
      const {
        top,
        left,
        width,
        height,
      } = (this.initialRootLayoutRect_ = layoutRect);

      /** {./scroll-manager.ScrollEventDef} */
      const scrollEvent = {
        top: this.viewport_.getScrollTop() - top,
        left: this.viewport_.getScrollLeft() - left,
        width: size.width,
        height: size.height,
        scrollWidth: width,
        scrollHeight: height,
        initialScrollWidth: width,
        initialScrollHeight: height,
      };
      handler(scrollEvent);
    });

    if (this.scrollObservable_.getHandlerCount() === 0) {
      this.addViewportOnChangedListener_();
    }

    return this.scrollObservable_.add(handler);
  }

  /**
   * @param {!../../../src/service/viewport/viewport-interface.ViewportChangedEventDef} e
   * @return {!Promise}
   * @private
   */
  onScroll_(e) {
    return this.measureRootElement_(true /** initial */).then(() => {
      devAssert(this.initialRootLayoutRect_);
      const {
        width: initialWidth,
        height: initialHeight,
      } = this.initialRootLayoutRect_;

      return this.measureRootElement_().then(layoutRect => {
        /** {./scroll-manager.ScrollEventDef} */
        const scrollEvent = {
          top: e.top - layoutRect.top,
          left: e.left - layoutRect.left,
          width: e.width,
          height: e.height,
          scrollWidth: layoutRect.width,
          scrollHeight: layoutRect.height,
          initialScrollWidth: initialWidth,
          initialScrollHeight: initialHeight,
        };
        // Fire all of our children scroll observables
        this.scrollObservable_.fire(scrollEvent);
      });
    });
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

  /** @return {!Element} */
  getRootElement_() {
    const root = this.ampdoc_.getRootNode();
    return dev().assertElement(
      // In the case of a shadow doc, its host will be used as
      // a refrence point, otherwise use the same implementation
      // as in `analytics-root.js`
      root.host || root.documentElement || root.body || root
    );
  }

  /**
   * Gets the layout rectangle of the root element
   * @param {cached=} initial
   * @return {!Promise<!../../../src/layout-rect.LayoutRectDef>}
   */
  measureRootElement_(initial = false) {
    if (initial && this.initialRootLayoutRect_) {
      return Promise.resolve(this.initialRootLayoutRect_);
    }

    return this.mutator_.measureElement(() => {
      const layoutRect = this.viewport_.getLayoutRect(this.root_);
      if (!this.initialRootLayoutRect_) {
        this.initialRootLayoutRect_ = layoutRect;
      }
      return layoutRect;
    });
  }
}
