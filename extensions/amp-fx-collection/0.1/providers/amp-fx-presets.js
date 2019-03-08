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

import {FxType} from '../fx-type';
import {Services} from '../../../../src/services';
import {
  assertDoesNotContainDisplay,
  computedStyle,
  setStyles,
} from '../../../../src/style';
import {dev, devAssert, userAssert} from '../../../../src/log';

/**
 * These fully qualified names, my goodness.
 * @typedef {!../../../../src/service/position-observer/position-observer-worker.PositionInViewportEntryDef}
 */
let PositionObserverEntryDef;

/** @typedef {function(this:./fx-provider.FxElement, ?PositionObserverEntryDef)} */
let FxUpdateDef;

/** @typedef {{userAsserts: function(!Element):*, update: !FxUpdateDef}} */
let FxPresetDef;

/**
 * @param {!./fx-provider.FxElement} fxElement
 * @param {string} axis 'left' or 'top'
 * @param {number} coeff 1 or -1
 */
function flyIn(fxElement, axis, coeff) {
  devAssert(axis == 'top' || axis == 'left');
  devAssert(Math.abs(coeff) == 1);

  const element = dev().assertElement(fxElement.element);
  const flyInDistance = coeff * fxElement.flyInDistance;

  const unit = axis == 'top' ? 'vh' : 'vw';

  // only do this on the first element
  if (!fxElement.initialTrigger) {
    Services.resourcesForDoc(element).mutateElement(element, () => {
      const style = computedStyle(fxElement.win, element);
      const axisAsLength = style[axis] === 'auto' ? '0px' : style[axis];
      const position =
          style.position === 'static' ?
            'relative' :
            style.position;
      const styles = {
        position,
        visibility: 'visible',
      };
      styles[axis] = `calc(${axisAsLength} + (${-flyInDistance}${unit}))`;
      setStyles(element, assertDoesNotContainDisplay(styles));
    });
    fxElement.initialTrigger = true;
  }

  const flyInDistanceAsLength = flyInDistance + unit;

  const offsetX = axis == 'left' ? flyInDistanceAsLength : 0;
  const offsetY = axis == 'top' ? flyInDistanceAsLength : 0;

  // If above the threshold of trigger-position
  // Translate the element offset pixels.
  setStyles(element, {
    'transition-duration': fxElement.duration,
    'transition-timing-function': fxElement.easing,
    'transform': `translate(${offsetX}, ${offsetY})`,
  });
}

/**
 * @param {!Element} element
 * @return {number} [data-margin-start] value
 */
function marginStartAsserts(element) {
  const marginStart = parseFloat(element.getAttribute('data-margin-start'));
  if (marginStart) {
    userAssert(marginStart >= 0 && marginStart <= 100,
        'data-margin-start must be a percentage value ' +
        'and be between 0% and 100% for: %s', element);
  }
  return marginStart;
}

/**
 * @param {?PositionObserverEntryDef} entry
 * @return {?number}
 */
function topFromPosObsEntryOrNull(entry) {
  return entry && entry.positionRect ? entry.positionRect.top : null;
}

/**
 * @param {?PositionObserverEntryDef} entry
 * @param {!./fx-provider.FxElement} fxElement
 * @param {number} coeff
 * @return {boolean}
 */
function isInViewportForTopAxis(entry, fxElement, coeff) {
  const top = topFromPosObsEntryOrNull(entry);
  devAssert(Math.abs(coeff) == 1);
  return !!top &&
    ((top + (coeff * fxElement.viewportHeight * fxElement.flyInDistance / 100))
      <= (1 - fxElement.marginStart) * fxElement.viewportHeight);
}

/**
 * @param {?PositionObserverEntryDef} entry
 * @param {!./fx-provider.FxElement} fxElement
 * @param {number=} opt_vh optional adjusted viewport height
 * @return {boolean}
 */
function isInViewportConsideringMargins(entry, fxElement, opt_vh) {
  const top = topFromPosObsEntryOrNull(entry);
  const vh = opt_vh !== undefined ? opt_vh : fxElement.viewportHeight;
  return !!top && top <= (1 - fxElement.marginStart) * vh;
}

/** @const {!Object<!FxType, !FxPresetDef>} */
export const Presets = {
  [FxType.PARALLAX]: {
    userAsserts(element) {
      const factorValue = userAssert(
          element.getAttribute('data-parallax-factor'),
          'data-parallax-factor=<number> attribute must be provided for: %s',
          element);
      userAssert(parseFloat(factorValue) > 0,
          'data-parallax-factor must be a number and greater than 0 for: %s',
          element);
    },
    update(entry) {
      const fxElement = this;
      const top = topFromPosObsEntryOrNull(entry);
      devAssert(fxElement.adjustedViewportHeight);
      if (!top || top > fxElement.adjustedViewportHeight) {
        return;
      }

      // User provided factor is 1-based for easier understanding.
      // Also negating number since we are using tranformY so negative = upward,
      // positive = downward.
      const adjustedFactor = -(parseFloat(fxElement.factor) - 1);
      // Offset is how much extra to move the element which is position within
      // viewport times adjusted factor.
      const offset = (fxElement.adjustedViewportHeight - top) * adjustedFactor;
      fxElement.offset = offset;

      // If above the threshold of trigger-position
      // Translate the element offset pixels.
      setStyles(fxElement.element,
          {transform:
            `translateY(${fxElement.offset.toFixed(0)}px)`});
    },
  },
  [FxType.FLY_IN_BOTTOM]: {
    userAsserts: marginStartAsserts,
    update(entry) {
      const fxElement = this;
      devAssert(fxElement.viewportHeight);
      if (!isInViewportForTopAxis(entry, fxElement, /* coeff */ -1)) {
        return;
      }
      flyIn(fxElement, 'top', /* coeff */ -1);
    },
  },
  [FxType.FLY_IN_LEFT]: {
    userAsserts: marginStartAsserts,
    update(entry) {
      const fxElement = this;
      devAssert(fxElement.viewportHeight);
      if (!isInViewportConsideringMargins(entry, fxElement)) {
        return;
      }
      flyIn(fxElement, 'left', /* coeff */ 1);
    },
  },
  [FxType.FLY_IN_RIGHT]: {
    userAsserts: marginStartAsserts,
    update(entry) {
      const fxElement = this;
      devAssert(fxElement.viewportHeight);
      if (!isInViewportConsideringMargins(entry, fxElement)) {
        return;
      }
      flyIn(fxElement, 'left', /* coeff */ -1);
    },
  },
  [FxType.FLY_IN_TOP]: {
    userAsserts: marginStartAsserts,
    update(entry) {
      const fxElement = this;
      devAssert(fxElement.viewportHeight);
      if (!isInViewportForTopAxis(entry, fxElement, /* coeff */ 1)) {
        return;
      }
      flyIn(fxElement, 'top', /* coeff */ 1);
    },
  },
  [FxType.FADE_IN]: {
    userAsserts: marginStartAsserts,
    update(entry) {
      const fxElement = this;
      devAssert(fxElement.viewportHeight);
      if (!isInViewportConsideringMargins(entry, fxElement)) {
        return;
      }

      // If above the threshold of trigger-position
      // Translate the element offset pixels.
      setStyles(fxElement.element, {
        'transition-duration': fxElement.duration,
        'transition-timing-function': fxElement.easing,
        'opacity': 1,
      });
    },
  },
  [FxType.FADE_IN_SCROLL]: {
    userAsserts(element) {
      const marginStart = marginStartAsserts(element);
      const marginEnd = parseFloat(element.getAttribute('data-margin-end'));

      if (!marginEnd) {
        return;
      }

      userAssert(marginEnd >= 0 && marginEnd <= 100,
          'data-margin-end must be a percentage value ' +
          'and be between 0% and 100% for: %s', element);

      userAssert(marginEnd > marginStart,
          'data-margin-end must be greater than data-margin-start for: %s',
          element);
    },
    update(entry) {
      const fxElement = this;
      const {viewportHeight, marginStart} = fxElement;
      devAssert(fxElement.adjustedViewportHeight);

      if (!isInViewportConsideringMargins(
          entry, fxElement, fxElement.adjustedViewportHeight)) {
        return;
      }

      // Early exit if the animation doesn't need to repeat and it is fully
      // opaque.
      if (!fxElement.hasRepeat && fxElement.offset >= 1) {
        return;
      }
      const top = topFromPosObsEntryOrNull(entry);
      // Translate the element offset pixels.
      const marginDelta = fxElement.marginEnd - marginStart;
      // Offset is how much extra to move the element which is position within
      // viewport times adjusted factor.
      const offset =
        1 * (viewportHeight - top - (marginStart * viewportHeight)) /
          (marginDelta * viewportHeight);
      fxElement.offset = offset;

      // If above the threshold of trigger-position
      // Translate the element offset pixels.
      setStyles(fxElement.element, {opacity: fxElement.offset});
    },
  },
};
