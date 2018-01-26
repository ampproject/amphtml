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
  installPositionObserverServiceForDoc,
} from '../../../../src/service/position-observer/position-observer-impl';
import {
  PositionObserverFidelity,
} from '../../../../src/service/position-observer/position-observer-worker';
import {getServiceForDoc} from '../../../../src/service';
import {Services} from '../../../../src/services';
import {setStyles} from '../../../../src/style';

export class ParallaxProvider {

  /**
   * @param  {!../../../../src/service/ampdoc-impl.AmpDoc} unusedAmpDoc
   */
  constructor(ampdoc) {
    this.ampdoc_ = ampdoc;

    installPositionObserverServiceForDoc(ampdoc);
    this.positionObserver_ = getServiceForDoc(ampdoc, 'position-observer');

    this.viewport_ = Services.viewportForDoc(ampdoc);
  }

  /**
   *
   * @param {!Element} unusedElement
   */
  installOn(element) {
    Services.vsyncFor(this.ampdoc_.win).measure(() => {
      new ParallaxElement(element, this.viewport_, this.positionObserver_);
    });
  }
}

/**
 * Encapsulates and tracks an element's linear parallax effect.
 */
class ParallaxElement {
  /**
   * @param {!Element} element The element to give a parallax effect.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(element, viewport, positionObserver) {

    this.positionObserver_ = positionObserver;

    this.viewport_ = viewport;

    const factor = element.getAttribute('data-parallax-factor');

    /** @private @const {number} */
    this.factor_ = (factor ? parseFloat(factor) : 0.5) - 1;

    /** @private {number} */
    this.offset_ = 0;

    /** @private @const {!Element} */
    this.element_ = element;

    this.previousPosition_ = null;

    this.adjustedViewportHeight_ = this.getAdjustedViewportHeight_();

    this.observe_();
  }

  /**
   * Apply the parallax effect to the offset given how much the page
   * has moved since the last frame.
   */
  update_(entry) {
    // outside viewport or user has not scrolled yet
    if (!entry.positionRect) {
      return;
    }
    const top = entry.positionRect.top;

    if (this.adjustedViewportHeight_ <= top) {
      return;
    }

    const offset = -(this.adjustedViewportHeight_ - top) * this.factor_;
    // No need for vsync mutate, position observer only calls back at most
    // every animation frame.
    setStyles(this.element_,
        {transform: `translateY(${offset.toFixed(0)}px)`}
    );
  }

  observe_() {
    this.viewport_.onResize(() => {
      this.previousPosition_ = null;
      this.adjustedViewportHeight_ = this.getAdjustedViewportHeight_();
    });

    this.positionObserver_.observe(this.element_, PositionObserverFidelity.HIGH,
        this.update_.bind(this)
    );
  }

  getAdjustedViewportHeight_() {
    const viewportHeight = this.viewport_.getHeight();

    let offsetTop = 0;
    for (let n = this.element_; n; n = n./*OK*/offsetParent) {
      offsetTop += n./*OK*/offsetTop;
    }
    const aboveTheFold = (offsetTop <= viewportHeight);

    if (aboveTheFold) {
      return offsetTop;
    } else {
      return viewportHeight;
    }
  }
};
