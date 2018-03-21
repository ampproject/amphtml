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

import {
  PositionObserverFidelity,
} from '../../../../src/service/position-observer/position-observer-worker';
import {Services} from '../../../../src/services';
import {clamp} from '../../../../src/utils/math';
import {dev, user} from '../../../../src/log';
import {getServiceForDoc} from '../../../../src/service';
import {
  installPositionObserverServiceForDoc,
} from '../../../../src/service/position-observer/position-observer-impl';
import {setStyle, setStyles} from '../../../../src/style';

/**
 * Provides a fade-in visual effect.
 *
 * @implements {../amp-fx-collection.FxProviderInterface}
 */
export class FadeInProvider {

  /**
   * @param  {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {

    /** @private @const {!../../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!../../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private @const {!../../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    installPositionObserverServiceForDoc(ampdoc);

    /** @private @const {!../../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = getServiceForDoc(ampdoc, 'position-observer');
  }

  /**
   * Installs parallax effect on the element
   * @param {!Element} element
   */
  installOn(element) {
    setStyle(element, 'will-change', 'opacity');
    const fadeInElement = new FadeInElement(
        element, this.positionObserver_, this.viewport_, this.resources_);
    fadeInElement.initialize();
  }
}

/**
 * Encapsulates and tracks an element's fade-in effect.
 */
class FadeInElement {
  /**
   * @param {!Element} element The element to give a fade-in effect.
   * @param {!../../../../src/service/position-observer/position-observer-impl.PositionObserver} positionObserver
   * @param {!../../../../src/service/viewport/viewport-impl.Viewport} viewport
   * @param {!../../../../src/service/resources-impl.Resources} resources
   */
  constructor(element, positionObserver, viewport, resources) {

    /** @private @const {!../../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = positionObserver;

    /** @private @const {!../../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = viewport;

    /** @const @private {!../../../../src/service/resources-impl.Resources} */
    this.resources_ = resources;

    /** @private {?number} */
    this.adjustedViewportHeight_ = null;

    /** @private @const {!Element} */
    this.element_ = element;

    /** @private {number} */
    this.opacityOffset_ = 0;

    /** @private {boolean} */
    this.mutateScheduled_ = false;

    this.boundOpacity_ = this.opacity_.bind(this);
  }

  /**
   * Handles initializations such as getting initial positions and listening to
   * events.
   */
  initialize() {
    this.getAdjustedViewportHeight_().then(adjustedViewportHeight => {
      this.adjustedViewportHeight_ = adjustedViewportHeight;

      // start observing position of the element.
      this.observePositionChanges_();
    });
  }

  /**
   * Apply the fade-in effect to the offset given how much the page
   * has moved since the last frame.
   * @private
   */
  update_(entry) {
    dev().assert(this.adjustedViewportHeight_);
    // Outside viewport
    if (!entry.positionRect ||
        entry.positionRect.top > this.adjustedViewportHeight_) {
      return;
    }

    // Stop from fading out based on scroll
    if (this.opacityOffset_ > 1) {
      return;
    }

    const top = entry.positionRect.top;
    // Offset is how much extra to move the element which is position within
    // viewport.
    const offset = (this.adjustedViewportHeight_ - top);
    this.opacityOffset_ = offset / this.viewport_.getHeight();
    console.log(this.opacityOffset_);

    if (!this.mutateScheduled_) {
      this.mutateScheduled_ = true;
      this.resources_.mutateElement(this.element_, this.boundOpacity_);
    }
  }

  /**
   * This must be called inside a mutate phase.
   */
  opacity_() {
    this.mutateScheduled_ = false;
    // Change the opacity to the given value
    // TODO: This needs to be scaled to a value between 0 and 1
    setStyles(this.element_, {opacity: clamp(this.opacityOffset_, 0, 1)});
  }

  /**
   * @private
   */
  observePositionChanges_() {
    this.positionObserver_.observe(this.element_, PositionObserverFidelity.HIGH,
        this.update_.bind(this)
    );

    this.viewport_.onResize(() => {
      this.getAdjustedViewportHeight_().then(adjustedViewportHeight => {
        this.adjustedViewportHeight_ = adjustedViewportHeight;
      });
    });
  }

  /**
   * Fade-in effect behaves differently for elements that are initially above
   * the fold.
   *
   * Normally, fade-in factor is spread across a whole viewport height however
   * for elements above the fold, we should only apply the fade-in
   * between the element and top of the page.
   * @returns {!Promise<number>}
   * @private
   */
  getAdjustedViewportHeight_() {
    return this.resources_.measureElement(() => {
      const viewportHeight = this.viewport_.getHeight();

      let offsetTop = 0;
      for (let node = this.element_; node; node = node./*OK*/offsetParent) {
        offsetTop += node./*OK*/offsetTop;
      }
      const aboveTheFold = (offsetTop < viewportHeight);

      return aboveTheFold ? offsetTop : viewportHeight;
    });
  }
}
