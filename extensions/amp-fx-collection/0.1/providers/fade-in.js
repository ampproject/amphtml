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
import {dev} from '../../../../src/log';
import {getServiceForDoc} from '../../../../src/service';
import {
  installPositionObserverServiceForDoc,
} from '../../../../src/service/position-observer/position-observer-impl';
import {setStyles} from '../../../../src/style';

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
   * Installs fade-in effect on the element
   * @param {!Element} element
   */
  installOn(element) {
    setStyles(element, {
      'will-change': 'opacity',
      'opacity': 0,
    });
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
    this.margin_ = element.hasAttribute('data-fade-in-margin') ?
      parseInt(element.getAttribute('data-fade-in-margin'), 10) : 0.25;

    /** @private {string} */
    this.easing_ = element.hasAttribute('data-fade-in-easing') ?
      element.getAttribute('data-fade-in-easing') :
      'cubic-bezier(0.00, 0.00, 1.00, 1.00)';

    /** @private {string} */
    this.duration_ = element.hasAttribute('data-fade-in-duration') ?
      element.getAttribute('data-fade-in-duration') : '1.5s';

    /** @private {number} */
    this.opacityOffset_ = 0;

    /** @private {boolean} */
    this.animationScheduled_ = false;

    this.opacityAnimation_ = this.opacityAnimation_.bind(this);
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
        entry.positionRect.top >
          (1 - this.margin_) * this.adjustedViewportHeight_) {
      return;
    }

    // If above the threshold of trigger-position
    if (!this.animationScheduled_) {
      this.animationScheduled_ = true;
      this.resources_.mutateElement(this.element_, this.opacityAnimation_);
    }
  }

  /**
   * This must be called inside a mutate phase.
   */
  opacityAnimation_() {
    // What about timing?
    this.animationScheduled_ = false;
    // Translate the element offset pixels.
    setStyles(this.element_, {
      'transition-duration': this.duration_,
      'transition-timing-function': this.easing_,
      'opacity': 1,
    });
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
