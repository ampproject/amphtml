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
import {
  ScrollToggleDispatcher,
  ScrollTogglePosition, // eslint-disable-line no-unused-vars
  getScrollToggleFloatInOffset,
  getScrollTogglePosition,
  installScrollToggleStyles,
  scrollToggleFloatIn,
  userAsertValidScrollToggleElement,
} from '../scroll-toggle';
import {Services} from '../../../../src/services';
import {
  assertDoesNotContainDisplay,
  computedStyle,
  setStyles,
} from '../../../../src/style';
import {
  convertEasingKeyword,
  defaultDurationValues,
  defaultEasingValues,
  defaultFlyInDistanceValues,
  defaultMarginValues,
  installStyles,
  resolvePercentageToNumber,
} from './amp-fx-presets-utils';
import {getServiceForDoc} from '../../../../src/service';
import {
  installPositionObserverServiceForDoc,
} from '../../../../src/service/position-observer/position-observer-impl';
import {once} from '../../../../src/utils/function';


/** @interface */
export class FxProviderInterface {
  /**
   * @param {!Element} unusedElement
   */
  installOn(unusedElement) {}
}


/**
 * Provides preset scroll-toggled fx.
 * These are intended for fixed-position elements that appear with the entire
 * document, similar to the auto-sliding header in the Google SERP viewer.
 * @implements {FxProviderInterface}
 */
export class ScrollToggleFxProvider {

  /**
   * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} unusedFxType
   */
  constructor(ampdoc, unusedFxType) {
    /** @private @const {!../../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!../../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    // TODO(alanorozco): This can be duplicated. This is not an issue since
    // there's only one scroll-toggled fx type currently, but some refactoring
    // is needed.
    /** @private @const {function():!ScrollToggleDispatcher} */
    this.dispatcher_ = once(() => new ScrollToggleDispatcher(this.ampdoc_));
  }

  /** @override */
  installOn(element) {
    // TODO(alanorozco): Remove assumption of one fxType.
    const measure = () => {
      const computed = computedStyle(this.ampdoc_.win, element);
      userAsertValidScrollToggleElement(computed, element);
      this.observe_(element, getScrollTogglePosition(computed, element));
    };

    const mutate = () => {
      installScrollToggleStyles(element);
    };

    this.resources_.measureMutateElement(element, measure, mutate);
  }

  /**
   * @param {!Element} element
   * @param {!ScrollTogglePosition} position
   * @private
   */
  observe_(element, position) {
    this.dispatcher_().observe(isShown => {
      this.toggle_(element, isShown, position);
    });
  }

  /**
   * @param {!Element} element
   * @param {boolean} isShown
   * @param {!ScrollTogglePosition} position
   * @private
   */
  toggle_(element, isShown, position) {
    // TODO(alanorozco): Remove assumption of one fxType.
    let offset = 0;

    const measure = () => {
      offset = getScrollToggleFloatInOffset(element, isShown, position);
    };

    const mutate = () => {
      scrollToggleFloatIn(element, offset);
    };

    this.resources_.measureMutateElement(element, measure, mutate);
  }
}


/**
 * Provides preset position-bound fx.
 * @implements {FxProviderInterface}
 */
export class PositionBoundFxProvider {

  /**
   * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} fxType
   */
  constructor(ampdoc, fxType) {

    /** @private @const {!../../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private @const {!../../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    installPositionObserverServiceForDoc(ampdoc);

    /** @private @const {!../../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = getServiceForDoc(ampdoc, 'position-observer');

    /** @private @const  {!../../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @string */
    this.fxType_ = fxType;
  }

  /** @override */
  installOn(element) {
    new FxElement(
        element, this.positionObserver_, this.viewport_, this.resources_,
        this.ampdoc_, this.fxType_);
    setStyles(element, assertDoesNotContainDisplay(installStyles(
        element, this.fxType_)));
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
   * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} fxType
   */
  constructor(element, positionObserver, viewport, resources, ampdoc, fxType) {

    /** @private @const {!../../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = positionObserver;

    /** @private @const {!../../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = viewport;

    /** @const @private {!../../../../src/service/resources-impl.Resources} */
    this.resources_ = resources;

    /** @type {?number} */
    this.viewportHeight = null;

    /** @type {?number} */
    this.adjustedViewportHeight = null;

    /** @private @const {!Element} */
    this.element_ = element;

    /** @private {number} */
    this.offset_ = 0;

    /** @private @string */
    this.fxType_ = fxType;

    /** @private @const  {!../../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    Presets[this.fxType_].userAsserts(element);

    /** @private {number} */
    this.factor_ = parseFloat(element.getAttribute('data-parallax-factor'));

    /** @private {number} */
    this.marginStart_ = element.hasAttribute('data-margin-start') ?
      /** @type {number} */
      (resolvePercentageToNumber(element.getAttribute('data-margin-start'))) :
      defaultMarginValues(this.fxType_)['start'];

    /** @private {number} */
    this.marginEnd_ = element.hasAttribute('data-margin-end') ?
      /** @type {number} */
      (resolvePercentageToNumber(element.getAttribute('data-margin-end'))) :
      defaultMarginValues(this.fxType_)['end'];

    /** @private {string} */
    this.easing_ = convertEasingKeyword(element.hasAttribute('data-easing') ?
      element.getAttribute('data-easing') : defaultEasingValues(this.fxType_));

    /** @private {string} */
    this.duration_ = element.hasAttribute('data-duration') ?
      element.getAttribute('data-duration') :
      defaultDurationValues(this.ampdoc_, this.fxType_);

    /** @private {number} */
    this.flyInDistance_ = element.hasAttribute('data-fly-in-distance') ?
      parseFloat(element.getAttribute('data-fly-in-distance')) :
      defaultFlyInDistanceValues(this.ampdoc_, this.fxType_);

    /** @private {boolean} */
    this.hasRepeat_ = element.hasAttribute('data-repeat');

    /** @public {boolean} */
    this.initialTrigger = false;

    this.getAdjustedViewportHeight_().then(adjustedViewportHeight => {
      this.adjustedViewportHeight = adjustedViewportHeight;

      // start observing position of the element.
      this.observePositionChanges_();
    });

    this.getViewportHeight_().then(viewportHeight => {
      this.viewportHeight = viewportHeight;
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
        this.adjustedViewportHeight = adjustedViewportHeight;
      });
      this.getViewportHeight_().then(viewportHeight => {
        this.viewportHeight = viewportHeight;
      });
    });
  }

  /**
   * Returns the current viewport height.
   * @return {!Promise<number>}
   * @private
   */
  getViewportHeight_() {
    return this.resources_.measureElement(() => {
      return this.viewport_.getHeight();
    });
  }

  /**
   * Preset effect behaves differently for elements that are initially above
   * the fold.
   *
   * Normally, preset factor is spread across a whole viewport height however
   * for elements above the fold, we should only apply the animation after
   * between the element and top of the page.
   * @return {!Promise<number>}
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

  /** @return {!../../../../src/service/ampdoc-impl.AmpDoc} */
  getAmpDoc() {
    return this.ampdoc_;
  }


  /**
   * @return {number}
   */
  getFactor() {
    return this.factor_;
  }

  /**
   * @return {string}
   */
  getDuration() {
    return this.duration_;
  }

  /**
   * @return {number}
   */
  getMarginStart() {
    return this.marginStart_;
  }

  /**
   * @return {number}
   */
  getMarginEnd() {
    return this.marginEnd_;
  }

  /**
   * @return {number}
   */
  getFlyInDistance() {
    return this.flyInDistance_;
  }

  /**
   * @return {string}
   */
  getEasing() {
    return this.easing_;
  }

  /**
   * @return {Element}
   */
  getElement() {
    return this.element_;
  }

  /**
   * @return {!../../../../src/service/resources-impl.Resources}
   */
  getResources() {
    return this.resources_;
  }

  /**
   * @return {number}
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
   * Boolean dictating whether or not the amp-fx preset has the `repeat`
   * attribute set. The `repeat` attribute allows the animation to be fully
   * dependent on scroll.
   * @return {boolean}
   */
  hasRepeat() {
    return this.hasRepeat_;
  }
}
