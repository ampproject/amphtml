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

import {FxType} from '../fx-type'; // eslint-disable-line no-unused-vars
import {
  PositionObserverFidelity,
} from '../../../../src/service/position-observer/position-observer-worker';
import {Presets} from './amp-fx-presets';
import {
  ScrollToggleDispatch,
  ScrollTogglePosition, // eslint-disable-line no-unused-vars
  assertValidScrollToggleElement,
  getScrollToggleFloatInOffset,
  getScrollTogglePosition,
  installScrollToggleStyles,
  scrollToggleFloatIn,
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
import {devAssert} from '../../../../src/log';
import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
} from '../../../../src/service';
import {
  installPositionObserverServiceForDoc,
} from '../../../../src/service/position-observer/position-observer-impl';


/**
 * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} element The element to give a preset effect.
 * @param {!FxType} type
 */
export function installScrollToggledFx(ampdoc, element, type) {
  // TODO(alanorozco): Surface FixedLayer APIs to make this work.
  if (Services.viewerForDoc(element).isEmbedded()) {
    return;
  }

  const fxScrollDispatch = 'fx-scroll-dispatch';

  registerServiceBuilderForDoc(ampdoc, fxScrollDispatch, ScrollToggleDispatch);

  const resources = Services.resourcesForDoc(element);
  const dispatch = getServiceForDoc(ampdoc, fxScrollDispatch);

  let shouldMutate = true;

  const measure = () => {
    const computed = computedStyle(ampdoc.win, element);
    const position = getScrollTogglePosition(element, type, computed);
    const isValid = assertValidScrollToggleElement(element, computed);

    if (!position || !isValid) {
      shouldMutate = false;
      return;
    }

    dispatch.observe(isShown => {
      scrollToggle(element, isShown,
          /** @type {!ScrollTogglePosition} */ (devAssert(position)));
    });
  };

  const mutate = () => {
    if (!shouldMutate) {
      return;
    }
    installScrollToggleStyles(element);
  };

  resources.measureMutateElement(element, measure, mutate);
}

/**
 * @param {!Element} element
 * @param {boolean} isShown
 * @param {!ScrollTogglePosition} position
 */
function scrollToggle(element, isShown, position) {
  let offset = 0;

  const measure = () => {
    offset = getScrollToggleFloatInOffset(element, isShown, position);
  };

  const mutate = () => {
    scrollToggleFloatIn(element, offset);
  };

  Services.resourcesForDoc(element)
      .measureMutateElement(element, measure, mutate);
}

/**
 * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} element The element to give a preset effect.
 * @param {!FxType} type
 */
export function installPositionBoundFx(ampdoc, element, type) {
  installPositionObserverServiceForDoc(ampdoc);
  new FxElement(ampdoc, element, type);
  setStyles(element,
      assertDoesNotContainDisplay(installStyles(element, type)));
}

/**
 * Encapsulates and tracks an element's linear parallax effect.
 */
export class FxElement {
  /**
   * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Element} element The element to give a preset effect.
   * @param {!FxType} fxType
   */
  constructor(ampdoc, element, fxType) {

    /** @public @const  {!Window} */
    this.win = ampdoc.win;

    /** @private @const {!../../../../src/service/position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = getServiceForDoc(ampdoc, 'position-observer');

    /** @private @const {!../../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(element);

    /** @const @private {!../../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(element);

    /** @type {?number} */
    this.viewportHeight = null;

    /** @type {?number} */
    this.adjustedViewportHeight = null;

    /** @public @const {!Element} */
    this.element = element;

    /** @public {number} */
    this.offset = 0;

    /** @private @const {!FxType} */
    this.fxType_ = fxType;

    Presets[fxType].userAsserts(element);

    /** @public @const {number} */
    this.factor = parseFloat(element.getAttribute('data-parallax-factor'));

    /** @public @const {number} */
    this.marginStart = element.hasAttribute('data-margin-start') ?
      /** @type {number} */
      (resolvePercentageToNumber(element.getAttribute('data-margin-start'))) :
      defaultMarginValues(fxType)['start'];

    /** @public @const {number} */
    this.marginEnd = element.hasAttribute('data-margin-end') ?
      /** @type {number} */
      (resolvePercentageToNumber(element.getAttribute('data-margin-end'))) :
      defaultMarginValues(fxType)['end'];

    /** @public @const {string} */
    this.easing = convertEasingKeyword(element.hasAttribute('data-easing') ?
      element.getAttribute('data-easing') : defaultEasingValues(fxType));

    /** @public @const {string} */
    this.duration = element.hasAttribute('data-duration') ?
      element.getAttribute('data-duration') :
      defaultDurationValues(ampdoc, fxType);

    /** @public @const {number} */
    this.flyInDistance = element.hasAttribute('data-fly-in-distance') ?
      parseFloat(element.getAttribute('data-fly-in-distance')) :
      defaultFlyInDistanceValues(ampdoc, fxType);

    /**
     * Boolean dictating whether or not the amp-fx preset has the `repeat`
     * attribute set. The `repeat` attribute allows the animation to be fully
     * dependent on scroll.
     *
     * Applies only for `fade-in-scroll`.
     * @public @const {boolean}
     */
    this.hasRepeat = element.hasAttribute('data-repeat');

    /** @public {boolean} */
    this.initialTrigger = false;

    this.getAdjustedViewportHeight_().then(adjustedViewportHeight => {
      this.adjustedViewportHeight = adjustedViewportHeight;

      // start observing position of the element.
      this.observePositionChanges_();
    });

    this.updateViewportHeight_();
  }

  /**
   * @private
   */
  observePositionChanges_() {
    this.positionObserver_.observe(this.element, PositionObserverFidelity.HIGH,
        Presets[this.fxType_].update.bind(this)
    );

    this.viewport_.onResize(() => {
      this.updateViewportHeight_();
      this.getAdjustedViewportHeight_().then(adjustedViewportHeight => {
        this.adjustedViewportHeight = adjustedViewportHeight;
      });
    });
  }

  /** @private	*/
  updateViewportHeight_() {
    this.resources_.measureElement(() => {
      this.viewportHeight = this.viewport_.getHeight();
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
      for (let node = this.element; node; node = node./*OK*/offsetParent) {
        offsetTop += node./*OK*/offsetTop;
      }
      const aboveTheFold = (offsetTop < viewportHeight);

      return aboveTheFold ? offsetTop : viewportHeight;
    });
  }
}
