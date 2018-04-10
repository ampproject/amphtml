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
import {Presets} from './amp-fx-presets';
import {Services} from '../../../../src/services';
import {convertEasingKeyword} from './amp-fx-presets-utils';
import {getServiceForDoc} from '../../../../src/service';
import {
  installPositionObserverServiceForDoc,
} from '../../../../src/service/position-observer/position-observer-impl';
import {setStyles} from '../../../../src/style';

const installStyles = {
  'parallax': {
    'will-change': 'transform',
  },
  'fade-in': {
    'will-change': 'opacity',
    'opacity': 0,
  },
  'fly-in-bottom': {
    'will-change': 'transform',
  },
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

    /** @private @const {!../../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private @const {!../../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    installPositionObserverServiceForDoc(ampdoc);

    /** @private @const {!../../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = getServiceForDoc(ampdoc, 'position-observer');

    /** @private @string */
    this.fxType_ = fxType;
  }

  /**
   * Installs effect on the element
   * @param {!Element} element
   */
  installOn(element) {
    setStyles(element, installStyles[this.fxType_]);
    const parallaxElement = new FxElement(
        element, this.positionObserver_, this.viewport_, this.resources_,
        this.fxType_);
    parallaxElement.initialize_();
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

    /** @private {boolean} */
    this.mutateScheduled_ = false;

    /** @private {number} */
    this.offset_ = 0;

    /** @private @string */
    this.fxType_ = fxType;

    Presets[this.fxType_].userAsserts(element);

    /** @private {number} */
    this.factor_ = parseFloat(element.getAttribute('data-parallax-factor'));

    /** @private {number} */
    this.margin_ = element.hasAttribute('data-margin') ?
      parseFloat(element.getAttribute('data-margin')) : 0.05;

    /** @private {string} */
    this.easing_ = convertEasingKeyword(element.hasAttribute('data-easing') ?
      element.getAttribute('data-easing') : 'ease-in');

    /** @private {string} */
    this.duration_ = element.hasAttribute('data-duration') ?
      element.getAttribute('data-duration') : '1000ms';
  }

  /**
   * Handles initializations such as getting initial positions and listening to
   * events.
   * @private
   */
  initialize_() {
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
        Presets[this.fxType_].update.bind(this)
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

  /**
   * @returns {number}
   */
  getFactor() {
    return this.factor_;
  }

  /**
   * @returns {string}
   */
  getDuration() {
    return this.duration_;
  }

  /**
   * @returns {number}
   */
  getMargin() {
    return this.margin_;
  }

  /**
   * @returns {string}
   */
  getEasing() {
    return this.easing_;
  }

  /**
   * @returns {Element}
   */
  getElement() {
    return this.element_;
  }

  /**
   * @returns {!../../../../src/service/resources-impl.Resources}
   */
  getResources() {
    return this.resources_;
  }

  /**
   * @returns {number}
   */
  getOffset() {
    return this.offset_;
  }

  /**
   * @param {number} offset
   */
  setOffset(offset) {
    this.offset_ = offset;
  }

  /**
   * @returns {boolean}
   */
  isMutateScheduled() {
    return this.mutateScheduled_;
  }

  /**
   * @param {boolean} mutateScheduled
   */
  setIsMutateScheduled(mutateScheduled) {
    this.mutateScheduled_ = mutateScheduled;
  }
}
