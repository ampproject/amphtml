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
  WebAnimationSelectorDef,
  WebAnimationTimingDef,
  WebKeyframesDef,
} from '../../amp-animation/0.1/web-animation-types';

export {
  WebAnimationBuilderOptionsDef,
  WebAnimationDef,
  WebAnimationPlayState,
  WebKeyframesDef,
  WebAnimationSelectorDef,
  WebAnimationTimingDef,
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
 *   source: !Element,
 *   startAfterId: (?string),
 *   preset: (!StoryAnimationPresetDef|undefined),
 *   keyframeOptions: (!Object<string, *>|undefined),
 *   spec: !WebAnimationDef,
 * }}
 *
 * - source: Element that defines this animation. This is either an
 *   <amp-story-animation> element with a JSON spec, or an animated element with
 *   a preset that is the same as the target ([animate-in] elements).
 *
 * - startAfterId: This animation is sequenced after the animation defined by
 *   the element with this id.
 *
 * - preset: Optional, when using [animate-in]
 *
 * - keyframeOptions: These are taken from element attributes and passed to a
 *   preset keyframes() function.
 *
 * - spec: An effect spec defined like in <amp-animation>. If a preset is also
 *   provided, the spec's keyframes property will be resolved with the preset
 *   configuration.
 */
export let StoryAnimationConfigDef;
