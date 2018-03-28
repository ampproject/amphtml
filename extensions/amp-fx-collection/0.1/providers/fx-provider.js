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

import {Presets} from './amp-fx-presets';
import {
  PositionObserverFidelity,
} from '../../../../src/service/position-observer/position-observer-worker';
import {Services} from '../../../../src/services';
import {getServiceForDoc} from '../../../../src/service';
import {
  installPositionObserverServiceForDoc,
} from '../../../../src/service/position-observer/position-observer-impl';
import {setStyle, setStyles} from '../../../../src/style';

/**
 * Enum for list of supported visual effects.
 * @enum {string}
 */
const FxType = {
  PARALLAX: 'parallax',
};

const propertyAnimated = {
  'parallax' : 'transform',
};

/**
 * Class that implements the various preset animation providers.
 */
export class FxProvider {

  /**
   * @param  {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc, fxType) {

    /** @private @const {!../../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @protected @const {!../../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @protected @const {!../../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    installPositionObserverServiceForDoc(ampdoc);

    /** @protected @const {!../../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = getServiceForDoc(ampdoc, 'position-observer');

    /** @protected @string */
    this.fxType_ = fxType;
  }

  installOn(element) {
    setStyle(element, 'will-change', propertyAnimated[this.fxType_]);
    const parallaxElement = new FxElement(
        element, this.positionObserver_, this.viewport_, this.resources_, this.fxType_);
    parallaxElement.initialize();
  }
}

/**
 * Encapsulates and tracks an element's linear parallax effect.
 */
export class FxElement {
  /**
   * @param {!Element} element The element to give a preset effect.
   * @param {!../../../../src/service/position-observer/position-observer-impl.PositionObserver} positionObserver
   * @param {!../../../../src/service/viewport/viewport-impl.Viewport} viewport
   * @param {!../../../../src/service/resources-impl.Resources} resources
   */
  constructor(element, positionObserver, viewport, resources, fxType) {

    /** @protected @const {!../../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = positionObserver;

    /** @protected @const {!../../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = viewport;

    /** @const @protected {!../../../../src/service/resources-impl.Resources} */
    this.resources_ = resources;

    /** @protected {?number} */
    this.adjustedViewportHeight_ = null;

    /** @protected @const {!Element} */
    this.element_ = element;

    /** @protected {boolean} */
    this.mutateScheduled_ = false;

    /** @private {number} */
    this.offset_ = 0;

    /** @protected @string */
    this.fxType_ = fxType;
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
   * @private
   */
  observePositionChanges_() {
    this.positionObserver_.observe(this.element_, PositionObserverFidelity.HIGH,
        Presets[this.fxType_].update.bind(this, this.element_)
    );

    this.viewport_.onResize(() => {
      this.getAdjustedViewportHeight_().then(adjustedViewportHeight => {
        this.adjustedViewportHeight_ = adjustedViewportHeight;
      });
    });
  }

  /**
   * Preset effect behaves differently for elements that are initially above
   * the fold.
   *
   * Normally, preset factor is spread across a whole viewport height however
   * for elements above the fold, we should only apply the animation after
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
