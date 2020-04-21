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

import {
  WebAnimationBuilderOptionsDef,
  WebAnimationDef,
  WebAnimationPlayState,
  WebKeyframesDef,
} from '../../amp-animation/0.1/web-animation-types';

export {
  WebAnimationBuilderOptionsDef,
  WebAnimationDef,
  WebAnimationPlayState,
  WebKeyframesDef,
};

/** @typedef {function(StoryAnimationDimsDef, Object<string, *>):!WebKeyframesDef} */
export let WebKeyframesCreateFnDef;

/**
 * @typedef {{
 *   pageWidth: number,
 *   pageHeight: number,
 *   targetWidth: number,
 *   targetHeight: number,
 *   targetX: number,
 *   targetY: number,
 * }}
 */
export let StoryAnimationDimsDef;

/**
 * @typedef {{
 *   duration: number,
 *   easing: (string|undefined),
 *   keyframes: (!WebKeyframesCreateFnDef|!WebKeyframesDef),
 * }}
 */
export let StoryAnimationPresetDef;

/**
 * @typedef {{
 *  target: !Element,
 *  startAfterId: (string|undefined),
 *  preset: !StoryAnimationPresetDef,
 *  duration: (number|undefined),
 *  delay: (number|undefined),
 *  easing: (string|undefined),
 * }}
 */
export let StoryAnimationDef;
