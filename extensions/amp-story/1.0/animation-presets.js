import {px} from '#core/dom/style';

import {userAssert} from '#utils/log';

import {
  calculateTargetScalingFactor,
  rotateAndTranslate,
  scaleAndTranslate,
  translate2d,
  whooshIn,
} from './animation-presets-utils';
import {StoryAnimationPresetDef} from './animation-types';

/** @const {string} */
const FULL_BLEED_CATEGORY = 'full-bleed';
/** @const {number} */
const SCALE_HIGH_DEFAULT = 3;
/** @const {number} */
const SCALE_LOW_DEFAULT = 1;

/** @const {string} */
const SCALE_START_ATTRIBUTE_NAME = 'scale-start';
/** @const {string} */
const SCALE_END_ATTRIBUTE_NAME = 'scale-end';
/** @const {string} */
const PAN_SCALING_FACTOR_ATTRIBUTE_NAME = 'pan-scaling-factor';
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
  PAN_SCALING_FACTOR_ATTRIBUTE_NAME,
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
 * @private @const {!{[key: string]: string}}
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
    parent.classList.add(ANIMATION_CSS_CLASS_NAMES[FULL_BLEED_CATEGORY]);
  }
}

/**
 * First keyframe will always be considered offset: 0 and will be applied to the
 * element as the first frame before animation starts.
 * @type {!{[key: string]: !StoryAnimationPresetDef}}
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
    easing: `linear`,
    keyframes(dimensions) {
      const maxBounceHeight = Math.max(
        160,
        dimensions.targetY + dimensions.targetHeight
      );
      return [
        {
          offset: 0.0,
          transform: `translateY(${px(Number(-maxBounceHeight))})`,
          easing: 'cubic-bezier(.5, 0, 1, 1)',
        },
        {
          offset: 0.29,
          transform: `translateY(0)`,
          easing: 'cubic-bezier(0, 0, .5, 1)',
        },
        {
          offset: 0.45,
          transform: `translateY(${px(-maxBounceHeight * 0.2812)})`,
          easing: 'cubic-bezier(.5, 0, 1, 1)',
        },
        {
          offset: 0.61,
          transform: `translateY(0)`,
          easing: 'cubic-bezier(0, 0, .5, 1)',
        },
        {
          offset: 0.71,
          transform: `translateY(${px(-maxBounceHeight * 0.0956)})`,
          easing: 'cubic-bezier(.5, 0, 1, 1)',
        },
        {
          offset: 0.8,
          transform: `translateY(0)`,
          easing: 'cubic-bezier(0, 0, .5, 1)',
        },
        {
          offset: 0.85,
          transform: `translateY(${px(-maxBounceHeight * 0.0359)})`,
          easing: 'cubic-bezier(.5, 0, 1, 1)',
        },
        {
          offset: 0.92,
          transform: `translateY(0)`,
          easing: 'cubic-bezier(0, 0, .5, 1)',
        },
        {
          offset: 0.96,
          transform: `translateY(${px(-maxBounceHeight * 0.0156)})`,
          easing: 'cubic-bezier(.5, 0, 1, 1)',
        },
        {
          offset: 1,
          transform: `translateY(0)`,
          easing: 'cubic-bezier(0, 0, .5, 1)',
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
      const scalingFactor =
        options[PAN_SCALING_FACTOR_ATTRIBUTE_NAME] ??
        calculateTargetScalingFactor(dimensions);
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
      const scalingFactor =
        options[PAN_SCALING_FACTOR_ATTRIBUTE_NAME] ??
        calculateTargetScalingFactor(dimensions);
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
      const scalingFactor =
        options[PAN_SCALING_FACTOR_ATTRIBUTE_NAME] ??
        calculateTargetScalingFactor(dimensions);
      dimensions.targetWidth *= scalingFactor;
      dimensions.targetHeight *= scalingFactor;

      const offsetX = (dimensions.pageWidth - dimensions.targetWidth) * 0.5;
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
      const scalingFactor =
        options[PAN_SCALING_FACTOR_ATTRIBUTE_NAME] ??
        calculateTargetScalingFactor(dimensions);
      dimensions.targetWidth *= scalingFactor;
      dimensions.targetHeight *= scalingFactor;

      const offsetX = (dimensions.pageWidth - dimensions.targetWidth) * 0.5;
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
