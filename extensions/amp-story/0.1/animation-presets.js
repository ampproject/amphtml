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

const FULL_BLEED_CATEGORY = 'full-bleed';
const FILL_TEMPLATE_LAYOUT = 'fill';

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
    if (parent.classList.contains(
        GRID_LAYER_TEMPLATE_CLASS_NAMES[FILL_TEMPLATE_LAYOUT])) {
      parent.classList
          .remove(GRID_LAYER_TEMPLATE_CLASS_NAMES[FILL_TEMPLATE_LAYOUT]);
    }
    parent.classList.add(ANIMATION_CSS_CLASS_NAMES[FULL_BLEED_CATEGORY]);
  }
}

/** @const {!Object<string, !StoryAnimationPresetDef>} */
// First keyframe will always be considered offset: 0 and will be applied to the
// element as the first frame before animation starts.
export const PRESETS = {
  'pulse': {
    duration: 500,
    easing: 'linear',
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
    duration: 500,
    easing: 'ease-out',
    keyframes(dimensions) {
      const offsetX = -(dimensions.targetX + dimensions.targetWidth);
      return translate2d(offsetX, 0, 0, 0);
    },
  },
  'fly-in-right': {
    duration: 500,
    easing: 'ease-out',
    keyframes(dimensions) {
      const offsetX = dimensions.pageWidth - dimensions.targetX;
      return translate2d(offsetX, 0, 0, 0);
    },
  },
  'fly-in-top': {
    duration: 500,
    easing: 'ease-out',
    keyframes(dimensions) {
      const offsetY = -(dimensions.targetY + dimensions.targetHeight);
      return translate2d(0, offsetY, 0, 0);
    },
  },
  'fly-in-bottom': {
    duration: 500,
    easing: 'ease-out',
    keyframes(dimensions) {
      const offsetY = dimensions.pageHeight - dimensions.targetY;
      return translate2d(0, offsetY, 0, 0);
    },
  },
  'rotate-in-left': {
    duration: 700,
    easing: 'ease-out',
    keyframes(dimensions) {
      const offsetX = -(dimensions.targetX + dimensions.targetWidth);
      return rotateAndTranslate(offsetX, 0, 0, 0, -1);
    },
  },
  'rotate-in-right': {
    duration: 700,
    easing: 'ease-out',
    keyframes(dimensions) {
      const offsetX = dimensions.pageWidth - dimensions.targetX;
      return rotateAndTranslate(offsetX, 0, 0, 0, 1);
    },
  },
  'fade-in': {
    duration: 500,
    easing: 'ease-out',
    keyframes: [
      {
        opacity: 0,
      },
      {
        opacity: 1,
      },
    ],
  },
  'drop': {
    duration: 1600,
    keyframes(dimensions) {
      const maxBounceHeight =
          Math.max(160, dimensions.targetY + dimensions.targetHeight);

      return [
        {
          offset: 0,
          transform: `translateY(${px(-maxBounceHeight)})`,
          easing: 'cubic-bezier(.75,.05,.86,.08)',
        },
        {
          offset: 0.3,
          transform: 'translateY(0)',
          easing: 'cubic-bezier(.22,.61,.35,1)',
        },
        {
          offset: 0.52,
          transform: `translateY(${px(-0.6 * maxBounceHeight)})`,
          easing: 'cubic-bezier(.75,.05,.86,.08)',
        },
        {
          offset: 0.74,
          transform: 'translateY(0)',
          easing: 'cubic-bezier(.22,.61,.35,1)',
        },
        {
          offset: 0.83,
          transform: `translateY(${px(-0.3 * maxBounceHeight)})`,
          easing: 'cubic-bezier(.75,.05,.86,.08)',
        },
        {
          offset: 1,
          transform: 'translateY(0)',
          easing: 'cubic-bezier(.22,.61,.35,1)',
        },
      ];
    },
  },
  'twirl-in': {
    duration: 1000,
    easing: 'cubic-bezier(.2,.75,.4,1)',
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
    duration: 500,
    easing: 'ease-out',
    keyframes(dimensions) {
      const offsetX = -(dimensions.targetX + dimensions.targetWidth);
      return whooshIn(offsetX, 0, 0, 0);
    },
  },
  'whoosh-in-right': {
    duration: 500,
    easing: 'ease-out',
    keyframes(dimensions) {
      const offsetX = dimensions.pageWidth - dimensions.targetX;
      return whooshIn(offsetX, 0, 0, 0);
    },
  },
  'pan-left': {
    duration: 1000,
    easing: 'linear',
    keyframes(dimensions) {
      const scalingFactor = calculateTargetScalingFactor(dimensions);
      dimensions.targetWidth *= scalingFactor;
      dimensions.targetHeight *= scalingFactor;

      const offsetX = dimensions.pageWidth - dimensions.targetWidth;
      const offsetY = (dimensions.pageHeight - dimensions.targetHeight) / 2;

      return scaleAndTranslate(offsetX, offsetY, 0, offsetY, scalingFactor);
    },
  },
  'pan-right': {
    duration: 1000,
    easing: 'linear',
    keyframes(dimensions) {
      const scalingFactor = calculateTargetScalingFactor(dimensions);
      dimensions.targetWidth *= scalingFactor;
      dimensions.targetHeight *= scalingFactor;

      const offsetX = dimensions.pageWidth - dimensions.targetWidth;
      const offsetY = (dimensions.pageHeight - dimensions.targetHeight) / 2;

      return scaleAndTranslate(0, offsetY, offsetX, offsetY, scalingFactor);
    },
  },
  'pan-down': {
    duration: 1000,
    easing: 'linear',
    keyframes(dimensions) {
      const scalingFactor = calculateTargetScalingFactor(dimensions);
      dimensions.targetWidth *= scalingFactor;
      dimensions.targetHeight *= scalingFactor;

      const offsetX = -dimensions.targetWidth / 2;
      const offsetY = dimensions.pageHeight - dimensions.targetHeight;

      return scaleAndTranslate(offsetX, 0, offsetX, offsetY, scalingFactor);
    },
  },
  'pan-up': {
    duration: 1000,
    easing: 'linear',
    keyframes(dimensions) {
      const scalingFactor = calculateTargetScalingFactor(dimensions);
      dimensions.targetWidth *= scalingFactor;
      dimensions.targetHeight *= scalingFactor;

      const offsetX = -dimensions.targetWidth / 2;
      const offsetY = dimensions.pageHeight - dimensions.targetHeight;

      return scaleAndTranslate(offsetX, offsetY, offsetX, 0, scalingFactor);
    },
  },
  'zoom-in': {
    duration: 1000,
    easing: 'linear',
    keyframes: [
      {transform: 'scale(1,1)'},
      {transform: 'scale(3,3)'},
    ],
  },
  'zoom-out': {
    duration: 1000,
    easing: 'linear',
    keyframes: [
      {transform: 'scale(3,3)'},
      {transform: 'scale(1,1)'},
    ],
  },
};
