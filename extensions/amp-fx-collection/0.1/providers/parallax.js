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

import {FxElement, FxProvider} from './fx-provider';
import {dev, user} from '../../../../src/log';
import {setStyle, setStyles} from '../../../../src/style';

const FACTOR_ATTR = 'data-parallax-factor';

/**
 * Provides a parallax visual effect given a parallax factor.
 *
 * @implements {../amp-fx-collection.FxProviderInterface}
 */
export class ParallaxProvider extends FxProvider {

  /**
   * @override
   * Installs parallax effect on the element
   * @param {!Element} element
   */
  installOn(element) {
    setStyle(element, 'will-change', 'transform');
    const parallaxElement = new ParallaxElement(
        element, this.positionObserver_, this.viewport_, this.resources_);
    parallaxElement.initialize();
  }
}

/**
 * Encapsulates and tracks an element's linear parallax effect.
 */
class ParallaxElement extends FxElement {
  /**
   * @param {!Element} element The element to give a parallax effect.
   * @param {!../../../../src/service/position-observer/position-observer-impl.PositionObserver} positionObserver
   * @param {!../../../../src/service/viewport/viewport-impl.Viewport} viewport
   * @param {!../../../../src/service/resources-impl.Resources} resources
   */
  constructor(element, positionObserver, viewport, resources) {
    super(element, positionObserver, viewport, resources);

    /** @const {string} */
    const factorValue = user().assert(element.getAttribute(FACTOR_ATTR),
        `${FACTOR_ATTR}=<number> attribute must be provided for: %s`, element);

    /** @private @const {number} */
    this.factor_ = parseFloat(factorValue);

    user().assert(this.factor_ > 0,
        `${FACTOR_ATTR} must be a number and greater than 0 for: %s`, element);

    /** @private {number} */
    this.translateYOffset_ = 0;

    this.boundTranslateY_ = this.translateY_.bind(this);
  }

  /**
   * @override
   * Apply the parallax effect to the offset given how much the page
   * has moved since the last frame.
   * @private
   */
  update_(entry) {
    dev().assert(this.adjustedViewportHeight_);
    // outside viewport
    if (!entry.positionRect ||
        entry.positionRect.top > this.adjustedViewportHeight_) {
      return;
    }

    // User provided factor is 1-based for easier understanding.
    // Also negating number since we are using tranformY so negative = upward,
    // positive = downward.
    const adjustedFactor = -(this.factor_ - 1);
    const top = entry.positionRect.top;
    // Offset is how much extra to move the element which is position within
    // viewport times adjusted factor.
    const offset = (this.adjustedViewportHeight_ - top) * adjustedFactor;
    this.translateYOffset_ = offset;

    if (!this.mutateScheduled_) {
      this.mutateScheduled_ = true;
      this.resources_.mutateElement(this.element_, this.boundTranslateY_);
    }
  }

  /**
   * This must be called inside a mutate phase.
   */
  translateY_() {
    this.mutateScheduled_ = false;
    // Translate the element offset pixels.
    setStyles(this.element_,
        {transform: `translateY(${this.translateYOffset_.toFixed(0)}px)`}
    );
  }

}
