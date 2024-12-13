// WARNING
// WARNING
// WARNING
// WARNING
// File must be synced with amp.extens.js

/**
 * A struct for parameters for `Element.animate` call.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
 *
 * @typedef {{
 *   target: !Element,
 *   keyframes: !WebKeyframesDef,
 *   vars: ?{[key: string]: *},
 *   timing: !WebAnimationTimingDef,
 * }}
 */
export let InternalWebAnimationRequestDef;

/**
 * @typedef {
 *   !WebMultiAnimationDef|
 *   !WebSwitchAnimationDef|
 *   !WebCompAnimationDef|
 *   !WebKeyframeAnimationDef
 * }
 */
export let WebAnimationDef;

/**
 * @mixes WebAnimationSelectorDef
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @mixes WebAnimationConditionalDef
 * @typedef {{
 *   animations: !Array<!WebAnimationDef>,
 * }}
 */
export let WebMultiAnimationDef;

/**
 * @mixes WebAnimationSelectorDef
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @mixes WebAnimationConditionalDef
 * @typedef {{
 *   switch: !Array<!WebAnimationDef>,
 * }}
 */
export let WebSwitchAnimationDef;

/**
 * @mixes WebAnimationSelectorDef
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @mixes WebAnimationConditionalDef
 * @typedef {{
 *   animation: string,
 * }}
 */
export let WebCompAnimationDef;

/**
 * @mixes WebAnimationSelectorDef
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @mixes WebAnimationConditionalDef
 * @typedef {{
 *   keyframes: (string|!WebKeyframesDef),
 * }}
 */
export let WebKeyframeAnimationDef;

/**
 * @typedef {!{[key: string]: *}|!Array<!{[key: string]: *}>}
 */
export let WebKeyframesDef;

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffectTimingProperties
 *
 * @mixin
 * @typedef {{
 *   duration: (time|undefined),
 *   delay: (time|undefined),
 *   endDelay: (time|undefined),
 *   iterations: (number|string|undefined),
 *   iterationStart: (number|undefined),
 *   easing: (string|undefined),
 *   direction: (!WebAnimationTimingDirection|undefined),
 *   fill: (!WebAnimationTimingFill|undefined),
 * }}
 */
export let WebAnimationTimingDef;

/**
 * Indicates an extension to a type that allows specifying vars. Vars are
 * specified as properties with the name in the format of `--varName`.
 *
 * @mixin
 * @typedef {object}
 */
export let WebAnimationVarsDef;

/**
 * Defines media parameters for an animation.
 *
 * @mixin
 * @typedef {{
 *   media: (string|undefined),
 *   supports: (string|undefined),
 * }}
 */
export let WebAnimationConditionalDef;

/**
 * @typedef {{
 *   target: (!Element|undefined),
 *   selector: (string|undefined),
 *   subtargets: (!Array<!WebAnimationSubtargetDef>|undefined),
 * }}
 */
export let WebAnimationSelectorDef;

/**
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @typedef {{
 *   matcher: (function(!Element, number):boolean|undefined),
 *   index: (number|undefined),
 *   selector: (string|undefined),
 * }}
 */
export let WebAnimationSubtargetDef;

/**
 * @typedef {{
 *   scope: (!Element|undefined),
 *   scaleByScope: (boolean|undefined),
 * }}
 *
 * - scope delimits selectors.
 * - scaleByScope determines that CSS resolution should treat the scope
 *   element as a virtual viewport, so that:
 *   1. vw/vh units are relative to the scope's size
 *   2. element's x() and y() coords are relative to the scope's top-left corner
 *   3. element's size and position (width()/height()/x()/y()) are inversely
 *      relative to the scope's transformed scale, e.g. if the scope is scaled
 *      to 90%, the element's dimensions will be returned as if it was unscaled
 *      to 100%.
 */
export let WebAnimationBuilderOptionsDef;

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/Animation/playState
 * @enum {string}
 */
export const WebAnimationPlayState = {
  IDLE: 'idle',
  PENDING: 'pending',
  RUNNING: 'running',
  PAUSED: 'paused',
  FINISHED: 'finished',
};

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffectTimingProperties/direction
 * @enum {string}
 */
export const WebAnimationTimingDirection = {
  NORMAL: 'normal',
  REVERSE: 'reverse',
  ALTERNATE: 'alternate',
  ALTERNATE_REVERSE: 'alternate-reverse',
};

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffectTimingProperties/fill
 * @enum {string}
 */
export const WebAnimationTimingFill = {
  NONE: 'none',
  FORWARDS: 'forwards',
  BACKWARDS: 'backwards',
  BOTH: 'both',
  AUTO: 'auto',
};

/** @const {!{[key: string]: boolean}} */
const ALLOWLISTED_PROPS = {
  'opacity': true,
  'transform': true,
  'transform-origin': true,
  'visibility': true,
  'offset-distance': true,
  'offsetDistance': true,
  'clip-path': true,
  'clipPath': true,
};

/**
 * @param {string} prop
 * @return {boolean}
 */
export function isAllowlistedProp(prop) {
  return ALLOWLISTED_PROPS[prop] || false;
}
