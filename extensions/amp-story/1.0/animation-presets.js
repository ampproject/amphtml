/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {GRID_LAYER_TEMPLATE_CLASS_NAMES} from './amp-story-grid-layer';
import {StoryAnimationPresetDef} from './animation-types';
import {
  calculateTargetScalingFactor,
  rotateAndTranslate,
  scaleAndTranslate,
  translate2d,
  whooshIn,
} from './animation-presets-utils';
import {px} from '../../../src/style';
import {userAssert} from '../../../src/log';

/** @const {string} */
const FULL_BLEED_CATEGORY = 'full-bleed';
/** @const {string} */
const FILL_TEMPLATE_LAYOUT = 'fill';
/** @const {number} */
const SCALE_HIGH_DEFAULT = 3;
/** @const {number} */
const SCALE_LOW_DEFAULT = 1;

/** @const {string} */
const SCALE_START_ATTRIBUTE_NAME = 'scale-start';
/** @const {string} */
const SCALE_END_ATTRIBUTE_NAME = 'scale-end';
/** @const {string} */
const TRANSLATE_X_ATTRIBUTE_NAME = 'translate-x';
/** @const {string} */
const TRANSLATE_Y_ATTRIBUTE_NAME = 'translate-y';
/** @const {string} */
const DEFAULT_CURVE = '0.4, 0.4, 0.0, 1';

/** @const {!Array<string>} */
export const PRESET_OPTION_ATTRIBUTES = [
  SCALE_START_ATTRIBUTE_NAME,
  SCALE_END_ATTRIBUTE_NAME,
  TRANSLATE_X_ATTRIBUTE_NAME,
  TRANSLATE_Y_ATTRIBUTE_NAME,
];

/**
 * A list of animations that are full bleed.
 * @private @const {!Array<string>}
 */
const FULL_BLEED_ANIMATION_NAMES = [
  'pan-up',
  'pan-down',
  'pan-right',
  'pan-left',
  'zoom-in',
  'zoom-out',
];

/**
 * A mapping of animation categories to corresponding CSS class names.
 * @private @const {!Object<string, string>}
 */
const ANIMATION_CSS_CLASS_NAMES = {
  [FULL_BLEED_CATEGORY]:
    'i-amphtml-story-grid-template-with-full-bleed-animation',
};

/**
 * Perform style-specific operations for presets.
 * @param {!Element} el
 * @param {string} presetName
 */
export function setStyleForPreset(el, presetName) {
  // For full bleed animations.
  if (FULL_BLEED_ANIMATION_NAMES.indexOf(presetName) >= 0) {
    const parent = el.parentElement;
    if (
      parent.classList.contains(
        GRID_LAYER_TEMPLATE_CLASS_NAMES[FILL_TEMPLATE_LAYOUT]
      )
    ) {
      parent.classList.remove(
        GRID_LAYER_TEMPLATE_CLASS_NAMES[FILL_TEMPLATE_LAYOUT]
      );
    }
    parent.classList.add(ANIMATION_CSS_CLASS_NAMES[FULL_BLEED_CATEGORY]);
  }
}

/**
 * First keyframe will always be considered offset: 0 and will be applied to the
 * element as the first frame before animation starts.
 * @type {!Object<string, !StoryAnimationPresetDef>}
 */
export const presets = {
  'pulse': {
    duration: 600,
    easing: 'cubic-bezier(0.3, 0.0, 0.0, 1)',
    keyframes: [
      {
        offset: 0,
        transform: 'scale(1)',
      },
      {
        offset: 0.25,
        transform: 'scale(0.95)',
      },
      {
        offset: 0.75,
        transform: 'scale(1.05)',
      },
      {
        offset: 1,
        transform: 'scale(1)',
      },
    ],
  },
  'fly-in-left': {
    duration: 600,
    easing: `cubic-bezier(0.2, 0.6, 0.0, 1)`,
    keyframes(dimensions) {
      const offsetX = -(dimensions.targetX + dimensions.targetWidth);
      return translate2d(offsetX, 0, 0, 0);
    },
  },
  'fly-in-right': {
    duration: 600,
    easing: `cubic-bezier(0.2, 0.6, 0.0, 1)`,
    keyframes(dimensions) {
      const offsetX = dimensions.pageWidth - dimensions.targetX;
      return translate2d(offsetX, 0, 0, 0);
    },
  },
  'fly-in-top': {
    duration: 600,
    easing: `cubic-bezier(0.2, 0.6, 0.0, 1)`,
    keyframes(dimensions) {
      const offsetY = -(dimensions.targetY + dimensions.targetHeight);
      return translate2d(0, offsetY, 0, 0);
    },
  },
  'fly-in-bottom': {
    duration: 600,
    easing: `cubic-bezier(0.2, 0.6, 0.0, 1)`,
    keyframes(dimensions) {
      const offsetY = dimensions.pageHeight - dimensions.targetY;
      return translate2d(0, offsetY, 0, 0);
    },
  },
  'rotate-in-left': {
    duration: 1000,
    easing: `cubic-bezier(${DEFAULT_CURVE})`,
    keyframes(dimensions) {
      const offsetX = -(dimensions.targetX + dimensions.targetWidth);
      return rotateAndTranslate(offsetX, 0, 0, 0, -1);
    },
  },
  'rotate-in-right': {
    duration: 1000,
    easing: `cubic-bezier(${DEFAULT_CURVE})`,
    keyframes(dimensions) {
      const offsetX = dimensions.pageWidth - dimensions.targetX;
      return rotateAndTranslate(offsetX, 0, 0, 0, 1);
    },
  },
  'fade-in': {
    duration: 600,
    easing: `cubic-bezier(${DEFAULT_CURVE})`,
    keyframes: [
      {
        opacity: 0,
      },
      {
        opacity: 1,
      },
    ],
  },
  'scale-fade-up': {
    duration: 600,
    easing: `cubic-bezier(${DEFAULT_CURVE})`,
    keyframes: [
      {
        opacity: 0,
        transform: 'scale(0.8)',
      },
      {
        opacity: 1,
        transform: 'scale(1)',
      },
    ],
  },
  'scale-fade-down': {
    duration: 600,
    easing: `cubic-bezier(${DEFAULT_CURVE})`,
    keyframes: [
      {
        opacity: 0,
        transform: 'scale(1.4)',
      },
      {
        opacity: 1,
        transform: 'scale(1)',
      },
    ],
  },
  'drop': {
    duration: 1600,
    keyframes(dimensions) {
      const maxBounceHeight = Math.max(
        160,
        dimensions.targetY + dimensions.targetHeight
      );

      // addapted from https://easings.net/#easeOutBounce
      return [
        {
          offset: 0,
          transform: `translateY(${px((1 - 0) * -maxBounceHeight)})`,
        },
        {
          offset: 0.35,
          transform: `translateY(${px((1 - 0.9801) * -maxBounceHeight)})`,
          easing: 'cubic-bezier(0, 0.3, 0.3, 0)',
        },
        {
          offset: 0.45,
          transform: `translateY(${px((1 - 0.7502) * -maxBounceHeight)})`,
          easing: 'cubic-bezier(0, 0.3, 0.3, 0)',
        },
        {
          offset: 0.75,
          transform: `translateY(${px((1 - 0.9837) * -maxBounceHeight)})`,
          easing: 'cubic-bezier(0, 0.3, 0.3, 0)',
        },
        {
          offset: 0.82,
          transform: `translateY(${px((1 - 0.9375) * -maxBounceHeight)})`,
          easing: 'cubic-bezier(0, 0.3, 0.3, 0)',
        },
        {
          offset: 0.92,
          transform: `translateY(${px((1 - 0.9934) * -maxBounceHeight)})`,
          easing: 'cubic-bezier(0, 0.3, 0.3, 0)',
        },
        {
          offset: 0.96,
          transform: `translateY(${px((1 - 0.9846) * -maxBounceHeight)})`,
          easing: 'cubic-bezier(0, 0.3, 0.3, 0)',
        },
        {
          offset: 1,
          transform: `translateY(0)`,
          easing: 'cubic-bezier(0, 0.3, 0.3, 1)',
        },
      ];
    },
  },
  'twirl-in': {
    duration: 1000,
    easing: `cubic-bezier(${DEFAULT_CURVE})`,
    keyframes: [
      {
        transform: 'rotate(-540deg) scale(0.1)',
        opacity: 0,
      },
      {
        transform: 'none',
        opacity: 1,
      },
    ],
  },
  'whoosh-in-left': {
    duration: 600,
    easing: `cubic-bezier(${DEFAULT_CURVE})`,
    keyframes(dimensions) {
      const offsetX = -(dimensions.targetX + dimensions.targetWidth);
      return whooshIn(offsetX, 0, 0, 0);
    },
  },
  'whoosh-in-right': {
    duration: 600,
    easing: `cubic-bezier(${DEFAULT_CURVE})`,
    keyframes(dimensions) {
      const offsetX = dimensions.pageWidth - dimensions.targetX;
      return whooshIn(offsetX, 0, 0, 0);
    },
  },
  'pan-left': {
    duration: 1000,
    easing: 'linear',
    keyframes(dimensions, options) {
      const translateX = options[TRANSLATE_X_ATTRIBUTE_NAME];
      const scalingFactor = calculateTargetScalingFactor(dimensions);
      dimensions.targetWidth *= scalingFactor;
      dimensions.targetHeight *= scalingFactor;

      const offsetX = dimensions.pageWidth - dimensions.targetWidth;
      const offsetY = (dimensions.pageHeight - dimensions.targetHeight) / 2;

      return scaleAndTranslate(
        offsetX,
        offsetY,
        translateX ? offsetX + translateX : 0,
        offsetY,
        scalingFactor
      );
    },
  },
  'pan-right': {
    duration: 1000,
    easing: 'linear',
    keyframes(dimensions, options) {
      const translateX = options[TRANSLATE_X_ATTRIBUTE_NAME];

      const scalingFactor = calculateTargetScalingFactor(dimensions);
      dimensions.targetWidth *= scalingFactor;
      dimensions.targetHeight *= scalingFactor;

      const offsetX = dimensions.pageWidth - dimensions.targetWidth;
      const offsetY = (dimensions.pageHeight - dimensions.targetHeight) / 2;

      return scaleAndTranslate(
        0,
        offsetY,
        -translateX || offsetX,
        offsetY,
        scalingFactor
      );
    },
  },
  'pan-down': {
    duration: 1000,
    easing: 'linear',
    keyframes(dimensions, options) {
      const translateY = options[TRANSLATE_Y_ATTRIBUTE_NAME];
      const scalingFactor = calculateTargetScalingFactor(dimensions);
      dimensions.targetWidth *= scalingFactor;
      dimensions.targetHeight *= scalingFactor;

      const offsetX = -dimensions.targetWidth / 2;
      const offsetY = dimensions.pageHeight - dimensions.targetHeight;

      return scaleAndTranslate(
        offsetX,
        0,
        offsetX,
        -translateY || offsetY,
        scalingFactor
      );
    },
  },
  'pan-up': {
    duration: 1000,
    easing: 'linear',
    keyframes(dimensions, options) {
      const translateY = options[TRANSLATE_Y_ATTRIBUTE_NAME];
      const scalingFactor = calculateTargetScalingFactor(dimensions);
      dimensions.targetWidth *= scalingFactor;
      dimensions.targetHeight *= scalingFactor;

      const offsetX = -dimensions.targetWidth / 2;
      const offsetY = dimensions.pageHeight - dimensions.targetHeight;

      return scaleAndTranslate(
        offsetX,
        offsetY,
        offsetX,
        translateY ? offsetY + translateY : 0,
        scalingFactor
      );
    },
  },
  'zoom-in': {
    duration: 1000,
    easing: 'linear',
    keyframes(unusedDimensions, options) {
      const scaleStart = options[SCALE_START_ATTRIBUTE_NAME];
      const scaleEnd = options[SCALE_END_ATTRIBUTE_NAME];

      if (scaleStart) {
        userAssert(
          scaleEnd > scaleStart,
          '"scale-end" value must be greater ' +
            'than "scale-start" value when using "zoom-in" animation.'
        );
      }

      return [
        {transform: `scale(${scaleStart || SCALE_LOW_DEFAULT})`},
        {transform: `scale(${scaleEnd || SCALE_HIGH_DEFAULT})`},
      ];
    },
  },
  'zoom-out': {
    duration: 1000,
    easing: 'linear',
    keyframes(unusedDimensions, options) {
      const scaleStart = options[SCALE_START_ATTRIBUTE_NAME];
      const scaleEnd = options[SCALE_END_ATTRIBUTE_NAME];

      if (scaleStart) {
        userAssert(
          scaleStart > scaleEnd,
          '"scale-start" value must be ' +
            'higher than "scale-end" value when using "zoom-out" animation.'
        );
      }

      return [
        {transform: `scale(${scaleStart || SCALE_HIGH_DEFAULT})`},
        {transform: `scale(${scaleEnd || SCALE_LOW_DEFAULT})`},
      ];
    },
  },
};
