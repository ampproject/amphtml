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
import {dev} from '../../../../src/log';
import {setStyles} from '../../../../src/style';

/**
 * Provides a fade-in visual effect.
 *
 * @implements {../amp-fx-collection.FxProviderInterface}
 */
export class FadeInProvider extends FxProvider {

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
class FadeInElement extends FxElement {
  /**
   * @param {!Element} element The element to give a fade-in effect.
   * @param {!../../../../src/service/position-observer/position-observer-impl.PositionObserver} positionObserver
   * @param {!../../../../src/service/viewport/viewport-impl.Viewport} viewport
   * @param {!../../../../src/service/resources-impl.Resources} resources
   */
  constructor(element, positionObserver, viewport, resources) {
    super(element, positionObserver, viewport, resources);

    /** @private {string} */
    this.margin_ = element.hasAttribute('data-fade-in-margin') ?
      element.getAttribute('data-fade-in-margin') : '0.25';

    /** @private {string} */
    this.easing_ = element.hasAttribute('data-fade-in-easing') ?
      element.getAttribute('data-fade-in-easing') :
      'cubic-bezier(0.00, 0.00, 1.00, 1.00)';

    /** @private {string} */
    this.duration_ = element.hasAttribute('data-fade-in-duration') ?
      element.getAttribute('data-fade-in-duration') : '1500ms';

    /** @private {number} */
    this.opacityOffset_ = 0;

    this.opacityAnimation_ = this.opacityAnimation_.bind(this);
  }

  /**
   * @override
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
    if (!this.mutateScheduled_) {
      this.mutateScheduled_ = true;
      this.resources_.mutateElement(this.element_, this.opacityAnimation_);
    }
  }

  /**
   * This must be called inside a mutate phase.
   */
  opacityAnimation_() {
    // What about timing?
    this.mutateScheduled_ = false;
    // Translate the element offset pixels.
    setStyles(this.element_, {
      'transition-duration': this.duration_,
      'transition-timing-function': this.easing_,
      'opacity': 1,
    });
  }

}
