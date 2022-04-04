import {
  assertDoesNotContainDisplay,
  computedStyle,
  setStyles,
} from '#core/dom/style';

import {Services} from '#service';
import {installPositionObserverServiceForDoc} from '#service/position-observer/position-observer-impl';
import {PositionObserverFidelity_Enum} from '#service/position-observer/position-observer-worker';

import {devAssert} from '#utils/log';

import {Presets} from './amp-fx-presets';
import {
  convertEasingKeyword,
  defaultDurationValues,
  defaultEasingValues,
  defaultFlyInDistanceValues,
  defaultMarginValues,
  installStyles,
  resolvePercentageToNumber,
} from './amp-fx-presets-utils';

import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
} from '../../../../src/service-helpers';
import {FxType} from '../fx-type'; // eslint-disable-line @typescript-eslint/no-unused-vars
import {
  ScrollToggleDispatch,
  ScrollTogglePosition, // eslint-disable-line @typescript-eslint/no-unused-vars
  assertValidScrollToggleElement,
  getScrollToggleFloatInOffset,
  getScrollTogglePosition,
  installScrollToggleStyles,
  scrollToggleFloatIn,
} from '../scroll-toggle';

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
  const dispatch = getServiceForDoc(ampdoc, fxScrollDispatch);

  const mutator = Services.mutatorForDoc(element);

  let shouldMutate = true;

  const measure = () => {
    const computed = computedStyle(ampdoc.win, element);
    const position = getScrollTogglePosition(element, type, computed);
    const isValid = assertValidScrollToggleElement(element, computed);

    if (!position || !isValid) {
      shouldMutate = false;
      return;
    }

    dispatch.observe((isShown) => {
      scrollToggle(
        element,
        isShown,
        /** @type {!ScrollTogglePosition} */ (devAssert(position))
      );
    });
  };

  const mutate = () => {
    if (!shouldMutate) {
      return;
    }
    installScrollToggleStyles(element);
  };

  mutator.measureMutateElement(element, measure, mutate);
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

  Services.mutatorForDoc(element).measureMutateElement(
    element,
    measure,
    mutate
  );
}

/**
 * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} element The element to give a preset effect.
 * @param {!FxType} type
 */
export function installPositionBoundFx(ampdoc, element, type) {
  installPositionObserverServiceForDoc(ampdoc);
  new FxElement(ampdoc, element, type);
  setStyles(element, assertDoesNotContainDisplay(installStyles(element, type)));
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
    this.positionObserver_ = Services.positionObserverForDoc(element);

    /** @private @const {!../../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(element);

    /** @const @private {!../../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(element);

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
    this.marginStart = element.hasAttribute('data-margin-start')
      ? /** @type {number} */
        (resolvePercentageToNumber(element.getAttribute('data-margin-start')))
      : defaultMarginValues(fxType)['start'];

    /** @public @const {number} */
    this.marginEnd = element.hasAttribute('data-margin-end')
      ? /** @type {number} */
        (resolvePercentageToNumber(element.getAttribute('data-margin-end')))
      : defaultMarginValues(fxType)['end'];

    /** @public @const {string} */
    this.easing = convertEasingKeyword(
      element.hasAttribute('data-easing')
        ? element.getAttribute('data-easing')
        : defaultEasingValues(fxType)
    );

    /** @public @const {string} */
    this.duration = element.hasAttribute('data-duration')
      ? element.getAttribute('data-duration')
      : defaultDurationValues(ampdoc, fxType);

    /** @public @const {number} */
    this.flyInDistance = element.hasAttribute('data-fly-in-distance')
      ? parseFloat(element.getAttribute('data-fly-in-distance'))
      : defaultFlyInDistanceValues(ampdoc, fxType);

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

    this.getAdjustedViewportHeight_().then((adjustedViewportHeight) => {
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
    this.positionObserver_.observe(
      this.element,
      PositionObserverFidelity_Enum.HIGH,
      Presets[this.fxType_].update.bind(this)
    );

    this.viewport_.onResize(() => {
      this.updateViewportHeight_();
      this.getAdjustedViewportHeight_().then((adjustedViewportHeight) => {
        this.adjustedViewportHeight = adjustedViewportHeight;
      });
    });
  }

  /** @private	*/
  updateViewportHeight_() {
    this.mutator_.measureElement(() => {
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
    return this.mutator_.measureElement(() => {
      const viewportHeight = this.viewport_.getHeight();

      let offsetTop = 0;
      for (let node = this.element; node; node = node./*OK*/ offsetParent) {
        offsetTop += node./*OK*/ offsetTop;
      }
      const aboveTheFold = offsetTop < viewportHeight;

      return aboveTheFold ? offsetTop : viewportHeight;
    });
  }
}
