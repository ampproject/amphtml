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

/**
 * The PositionObserver class lets an element gets the current viewport info
 * when it is inside the current viewport.
 */
export class PositionObserver {
  /**
   * @param {!AMP.BaseElement} baseElement
   * @param {!function(!./layout-rect.LayoutRectDef)} callback
   */
  constructor(baseElement, callback) {
    this.shouldObserver_ = false;
    this.baseElement_ = baseElement;
    this.unlistenViewportChanges_ = null;
    this.inViewport_ = false;
    this.viewport_ = baseElement.getViewport();
    this.callback_ = callback;
  }

  /**
   * Function to start listening to viewport position.
   */
  startObserving() {
    this.shouldObserver_ = true;
    this.baseElement_.getVsync().measure(() => {
      this.onViewportCallback(this.baseElement_.isInViewport());
    });
  }

  /**
   * Function to stop listening to viewport change when element is out viewport
   * @private
   */
  unlistenOnOutViewport_() {
    if (this.unlistenViewportChanges_) {
      this.unlistenViewportChanges_();
      this.unlistenViewportChanges_ = null;
    }
  }

  /**
   * Function that enables element to tell when enter or exit viewport
   * @param {!boolean} inViewport
   */
  onViewportCallback(inViewport) {
    if (!this.shouldObserver_) {
      return;
    }
    if (this.inViewport_ == inViewport) {
      return;
    }
    this.inViewport_ = inViewport;

    this.callback_(this.viewport_.getRect());
    if (inViewport) {
      const unlistenScroll = this.viewport_.onScroll(() => {
        this.callback_(this.viewport_.getRect());
      });
        // Throttled scroll events. Also fires for resize events.
      const unlistenChanged = this.viewport_.onChanged(() => {
        this.callback_(this.viewport_.getRect());
      });
      this.unlistenViewportChanges_ = () => {
        unlistenScroll();
        unlistenChanged();
      };
    } else {
      this.unlistenOnOutViewport_();
    }
  }

  /**
   * Function that enables element to tell when it is measured
   */
  onLayoutMeasure() {
    if (!this.shouldObserver_ || !this.inViewport_) {
      return;
    }
    this.callback_(this.viewport_.getRect());
  }

  /**
   * Destroy listener on viewport position
   */
  destroy() {
    this.unlistenOnOutViewport_();
  }
}
