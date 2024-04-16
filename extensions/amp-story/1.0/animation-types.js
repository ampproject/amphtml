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

/** @typedef {function(StoryAnimationDimsDef, {[key: string]: *}):!WebKeyframesDef} */
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
 *   keyframeOptions: (!{[key: string]: *}|undefined),
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
