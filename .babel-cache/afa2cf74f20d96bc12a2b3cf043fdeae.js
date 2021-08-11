/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
 *   vars: ?Object<string, *>,
 *   timing: !WebAnimationTimingDef,
 * }}
 */
export var InternalWebAnimationRequestDef;

/**
 * @typedef {
 *   !WebMultiAnimationDef|
 *   !WebSwitchAnimationDef|
 *   !WebCompAnimationDef|
 *   !WebKeyframeAnimationDef
 * }
 */
export var WebAnimationDef;

/**
 * @mixes WebAnimationSelectorDef
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @mixes WebAnimationConditionalDef
 * @typedef {{
 *   animations: !Array<!WebAnimationDef>,
 * }}
 */
export var WebMultiAnimationDef;

/**
 * @mixes WebAnimationSelectorDef
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @mixes WebAnimationConditionalDef
 * @typedef {{
 *   switch: !Array<!WebAnimationDef>,
 * }}
 */
export var WebSwitchAnimationDef;

/**
 * @mixes WebAnimationSelectorDef
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @mixes WebAnimationConditionalDef
 * @typedef {{
 *   animation: string,
 * }}
 */
export var WebCompAnimationDef;

/**
 * @mixes WebAnimationSelectorDef
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @mixes WebAnimationConditionalDef
 * @typedef {{
 *   keyframes: (string|!WebKeyframesDef),
 * }}
 */
export var WebKeyframeAnimationDef;

/**
 * @typedef {!Object<string, *>|!Array<!Object<string, *>>}
 */
export var WebKeyframesDef;

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
export var WebAnimationTimingDef;

/**
 * Indicates an extension to a type that allows specifying vars. Vars are
 * specified as properties with the name in the format of `--varName`.
 *
 * @mixin
 * @typedef {Object}
 */
export var WebAnimationVarsDef;

/**
 * Defines media parameters for an animation.
 *
 * @mixin
 * @typedef {{
 *   media: (string|undefined),
 *   supports: (string|undefined),
 * }}
 */
export var WebAnimationConditionalDef;

/**
 * @typedef {{
 *   target: (!Element|undefined),
 *   selector: (string|undefined),
 *   subtargets: (!Array<!WebAnimationSubtargetDef>|undefined),
 * }}
 */
export var WebAnimationSelectorDef;

/**
 * @mixes WebAnimationTimingDef
 * @mixes WebAnimationVarsDef
 * @typedef {{
 *   matcher: (function(!Element, number):boolean|undefined),
 *   index: (number|undefined),
 *   selector: (string|undefined),
 * }}
 */
export var WebAnimationSubtargetDef;

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
export var WebAnimationBuilderOptionsDef;

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/Animation/playState
 * @enum {string}
 */
export var WebAnimationPlayState = {
  IDLE: 'idle',
  PENDING: 'pending',
  RUNNING: 'running',
  PAUSED: 'paused',
  FINISHED: 'finished'
};

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffectTimingProperties/direction
 * @enum {string}
 */
export var WebAnimationTimingDirection = {
  NORMAL: 'normal',
  REVERSE: 'reverse',
  ALTERNATE: 'alternate',
  ALTERNATE_REVERSE: 'alternate-reverse'
};

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffectTimingProperties/fill
 * @enum {string}
 */
export var WebAnimationTimingFill = {
  NONE: 'none',
  FORWARDS: 'forwards',
  BACKWARDS: 'backwards',
  BOTH: 'both',
  AUTO: 'auto'
};

/** @const {!Object<string, boolean>} */
var ALLOWLISTED_PROPS = {
  'opacity': true,
  'transform': true,
  'transform-origin': true,
  'visibility': true,
  'offset-distance': true,
  'offsetDistance': true,
  'clip-path': true,
  'clipPath': true
};

/**
 * @param {string} prop
 * @return {boolean}
 */
export function isAllowlistedProp(prop) {
  return ALLOWLISTED_PROPS[prop] || false;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYi1hbmltYXRpb24tdHlwZXMuanMiXSwibmFtZXMiOlsiSW50ZXJuYWxXZWJBbmltYXRpb25SZXF1ZXN0RGVmIiwiV2ViQW5pbWF0aW9uRGVmIiwiV2ViTXVsdGlBbmltYXRpb25EZWYiLCJXZWJTd2l0Y2hBbmltYXRpb25EZWYiLCJXZWJDb21wQW5pbWF0aW9uRGVmIiwiV2ViS2V5ZnJhbWVBbmltYXRpb25EZWYiLCJXZWJLZXlmcmFtZXNEZWYiLCJXZWJBbmltYXRpb25UaW1pbmdEZWYiLCJXZWJBbmltYXRpb25WYXJzRGVmIiwiV2ViQW5pbWF0aW9uQ29uZGl0aW9uYWxEZWYiLCJXZWJBbmltYXRpb25TZWxlY3RvckRlZiIsIldlYkFuaW1hdGlvblN1YnRhcmdldERlZiIsIldlYkFuaW1hdGlvbkJ1aWxkZXJPcHRpb25zRGVmIiwiV2ViQW5pbWF0aW9uUGxheVN0YXRlIiwiSURMRSIsIlBFTkRJTkciLCJSVU5OSU5HIiwiUEFVU0VEIiwiRklOSVNIRUQiLCJXZWJBbmltYXRpb25UaW1pbmdEaXJlY3Rpb24iLCJOT1JNQUwiLCJSRVZFUlNFIiwiQUxURVJOQVRFIiwiQUxURVJOQVRFX1JFVkVSU0UiLCJXZWJBbmltYXRpb25UaW1pbmdGaWxsIiwiTk9ORSIsIkZPUldBUkRTIiwiQkFDS1dBUkRTIiwiQk9USCIsIkFVVE8iLCJBTExPV0xJU1RFRF9QUk9QUyIsImlzQWxsb3dsaXN0ZWRQcm9wIiwicHJvcCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQSw4QkFBSjs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxlQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBSUMsb0JBQUo7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxxQkFBSjs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLG1CQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBSUMsdUJBQUo7O0FBRVA7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxlQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBSUMscUJBQUo7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLG1CQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBSUMsMEJBQUo7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLHVCQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBSUMsd0JBQUo7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLDZCQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxxQkFBcUIsR0FBRztBQUNuQ0MsRUFBQUEsSUFBSSxFQUFFLE1BRDZCO0FBRW5DQyxFQUFBQSxPQUFPLEVBQUUsU0FGMEI7QUFHbkNDLEVBQUFBLE9BQU8sRUFBRSxTQUgwQjtBQUluQ0MsRUFBQUEsTUFBTSxFQUFFLFFBSjJCO0FBS25DQyxFQUFBQSxRQUFRLEVBQUU7QUFMeUIsQ0FBOUI7O0FBUVA7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQU1DLDJCQUEyQixHQUFHO0FBQ3pDQyxFQUFBQSxNQUFNLEVBQUUsUUFEaUM7QUFFekNDLEVBQUFBLE9BQU8sRUFBRSxTQUZnQztBQUd6Q0MsRUFBQUEsU0FBUyxFQUFFLFdBSDhCO0FBSXpDQyxFQUFBQSxpQkFBaUIsRUFBRTtBQUpzQixDQUFwQzs7QUFPUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBTUMsc0JBQXNCLEdBQUc7QUFDcENDLEVBQUFBLElBQUksRUFBRSxNQUQ4QjtBQUVwQ0MsRUFBQUEsUUFBUSxFQUFFLFVBRjBCO0FBR3BDQyxFQUFBQSxTQUFTLEVBQUUsV0FIeUI7QUFJcENDLEVBQUFBLElBQUksRUFBRSxNQUo4QjtBQUtwQ0MsRUFBQUEsSUFBSSxFQUFFO0FBTDhCLENBQS9COztBQVFQO0FBQ0EsSUFBTUMsaUJBQWlCLEdBQUc7QUFDeEIsYUFBVyxJQURhO0FBRXhCLGVBQWEsSUFGVztBQUd4QixzQkFBb0IsSUFISTtBQUl4QixnQkFBYyxJQUpVO0FBS3hCLHFCQUFtQixJQUxLO0FBTXhCLG9CQUFrQixJQU5NO0FBT3hCLGVBQWEsSUFQVztBQVF4QixjQUFZO0FBUlksQ0FBMUI7O0FBV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLGlCQUFULENBQTJCQyxJQUEzQixFQUFpQztBQUN0QyxTQUFPRixpQkFBaUIsQ0FBQ0UsSUFBRCxDQUFqQixJQUEyQixLQUFsQztBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8vIFdBUk5JTkdcbi8vIFdBUk5JTkdcbi8vIFdBUk5JTkdcbi8vIFdBUk5JTkdcbi8vIEZpbGUgbXVzdCBiZSBzeW5jZWQgd2l0aCBhbXAuZXh0ZW5zLmpzXG5cbi8qKlxuICogQSBzdHJ1Y3QgZm9yIHBhcmFtZXRlcnMgZm9yIGBFbGVtZW50LmFuaW1hdGVgIGNhbGwuXG4gKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvYW5pbWF0ZVxuICpcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIHRhcmdldDogIUVsZW1lbnQsXG4gKiAgIGtleWZyYW1lczogIVdlYktleWZyYW1lc0RlZixcbiAqICAgdmFyczogP09iamVjdDxzdHJpbmcsICo+LFxuICogICB0aW1pbmc6ICFXZWJBbmltYXRpb25UaW1pbmdEZWYsXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IEludGVybmFsV2ViQW5pbWF0aW9uUmVxdWVzdERlZjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7XG4gKiAgICFXZWJNdWx0aUFuaW1hdGlvbkRlZnxcbiAqICAgIVdlYlN3aXRjaEFuaW1hdGlvbkRlZnxcbiAqICAgIVdlYkNvbXBBbmltYXRpb25EZWZ8XG4gKiAgICFXZWJLZXlmcmFtZUFuaW1hdGlvbkRlZlxuICogfVxuICovXG5leHBvcnQgbGV0IFdlYkFuaW1hdGlvbkRlZjtcblxuLyoqXG4gKiBAbWl4ZXMgV2ViQW5pbWF0aW9uU2VsZWN0b3JEZWZcbiAqIEBtaXhlcyBXZWJBbmltYXRpb25UaW1pbmdEZWZcbiAqIEBtaXhlcyBXZWJBbmltYXRpb25WYXJzRGVmXG4gKiBAbWl4ZXMgV2ViQW5pbWF0aW9uQ29uZGl0aW9uYWxEZWZcbiAqIEB0eXBlZGVmIHt7XG4gKiAgIGFuaW1hdGlvbnM6ICFBcnJheTwhV2ViQW5pbWF0aW9uRGVmPixcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgV2ViTXVsdGlBbmltYXRpb25EZWY7XG5cbi8qKlxuICogQG1peGVzIFdlYkFuaW1hdGlvblNlbGVjdG9yRGVmXG4gKiBAbWl4ZXMgV2ViQW5pbWF0aW9uVGltaW5nRGVmXG4gKiBAbWl4ZXMgV2ViQW5pbWF0aW9uVmFyc0RlZlxuICogQG1peGVzIFdlYkFuaW1hdGlvbkNvbmRpdGlvbmFsRGVmXG4gKiBAdHlwZWRlZiB7e1xuICogICBzd2l0Y2g6ICFBcnJheTwhV2ViQW5pbWF0aW9uRGVmPixcbiAqIH19XG4gKi9cbmV4cG9ydCBsZXQgV2ViU3dpdGNoQW5pbWF0aW9uRGVmO1xuXG4vKipcbiAqIEBtaXhlcyBXZWJBbmltYXRpb25TZWxlY3RvckRlZlxuICogQG1peGVzIFdlYkFuaW1hdGlvblRpbWluZ0RlZlxuICogQG1peGVzIFdlYkFuaW1hdGlvblZhcnNEZWZcbiAqIEBtaXhlcyBXZWJBbmltYXRpb25Db25kaXRpb25hbERlZlxuICogQHR5cGVkZWYge3tcbiAqICAgYW5pbWF0aW9uOiBzdHJpbmcsXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IFdlYkNvbXBBbmltYXRpb25EZWY7XG5cbi8qKlxuICogQG1peGVzIFdlYkFuaW1hdGlvblNlbGVjdG9yRGVmXG4gKiBAbWl4ZXMgV2ViQW5pbWF0aW9uVGltaW5nRGVmXG4gKiBAbWl4ZXMgV2ViQW5pbWF0aW9uVmFyc0RlZlxuICogQG1peGVzIFdlYkFuaW1hdGlvbkNvbmRpdGlvbmFsRGVmXG4gKiBAdHlwZWRlZiB7e1xuICogICBrZXlmcmFtZXM6IChzdHJpbmd8IVdlYktleWZyYW1lc0RlZiksXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IFdlYktleWZyYW1lQW5pbWF0aW9uRGVmO1xuXG4vKipcbiAqIEB0eXBlZGVmIHshT2JqZWN0PHN0cmluZywgKj58IUFycmF5PCFPYmplY3Q8c3RyaW5nLCAqPj59XG4gKi9cbmV4cG9ydCBsZXQgV2ViS2V5ZnJhbWVzRGVmO1xuXG4vKipcbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQW5pbWF0aW9uRWZmZWN0VGltaW5nUHJvcGVydGllc1xuICpcbiAqIEBtaXhpblxuICogQHR5cGVkZWYge3tcbiAqICAgZHVyYXRpb246ICh0aW1lfHVuZGVmaW5lZCksXG4gKiAgIGRlbGF5OiAodGltZXx1bmRlZmluZWQpLFxuICogICBlbmREZWxheTogKHRpbWV8dW5kZWZpbmVkKSxcbiAqICAgaXRlcmF0aW9uczogKG51bWJlcnxzdHJpbmd8dW5kZWZpbmVkKSxcbiAqICAgaXRlcmF0aW9uU3RhcnQ6IChudW1iZXJ8dW5kZWZpbmVkKSxcbiAqICAgZWFzaW5nOiAoc3RyaW5nfHVuZGVmaW5lZCksXG4gKiAgIGRpcmVjdGlvbjogKCFXZWJBbmltYXRpb25UaW1pbmdEaXJlY3Rpb258dW5kZWZpbmVkKSxcbiAqICAgZmlsbDogKCFXZWJBbmltYXRpb25UaW1pbmdGaWxsfHVuZGVmaW5lZCksXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IFdlYkFuaW1hdGlvblRpbWluZ0RlZjtcblxuLyoqXG4gKiBJbmRpY2F0ZXMgYW4gZXh0ZW5zaW9uIHRvIGEgdHlwZSB0aGF0IGFsbG93cyBzcGVjaWZ5aW5nIHZhcnMuIFZhcnMgYXJlXG4gKiBzcGVjaWZpZWQgYXMgcHJvcGVydGllcyB3aXRoIHRoZSBuYW1lIGluIHRoZSBmb3JtYXQgb2YgYC0tdmFyTmFtZWAuXG4gKlxuICogQG1peGluXG4gKiBAdHlwZWRlZiB7T2JqZWN0fVxuICovXG5leHBvcnQgbGV0IFdlYkFuaW1hdGlvblZhcnNEZWY7XG5cbi8qKlxuICogRGVmaW5lcyBtZWRpYSBwYXJhbWV0ZXJzIGZvciBhbiBhbmltYXRpb24uXG4gKlxuICogQG1peGluXG4gKiBAdHlwZWRlZiB7e1xuICogICBtZWRpYTogKHN0cmluZ3x1bmRlZmluZWQpLFxuICogICBzdXBwb3J0czogKHN0cmluZ3x1bmRlZmluZWQpLFxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBXZWJBbmltYXRpb25Db25kaXRpb25hbERlZjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICB0YXJnZXQ6ICghRWxlbWVudHx1bmRlZmluZWQpLFxuICogICBzZWxlY3RvcjogKHN0cmluZ3x1bmRlZmluZWQpLFxuICogICBzdWJ0YXJnZXRzOiAoIUFycmF5PCFXZWJBbmltYXRpb25TdWJ0YXJnZXREZWY+fHVuZGVmaW5lZCksXG4gKiB9fVxuICovXG5leHBvcnQgbGV0IFdlYkFuaW1hdGlvblNlbGVjdG9yRGVmO1xuXG4vKipcbiAqIEBtaXhlcyBXZWJBbmltYXRpb25UaW1pbmdEZWZcbiAqIEBtaXhlcyBXZWJBbmltYXRpb25WYXJzRGVmXG4gKiBAdHlwZWRlZiB7e1xuICogICBtYXRjaGVyOiAoZnVuY3Rpb24oIUVsZW1lbnQsIG51bWJlcik6Ym9vbGVhbnx1bmRlZmluZWQpLFxuICogICBpbmRleDogKG51bWJlcnx1bmRlZmluZWQpLFxuICogICBzZWxlY3RvcjogKHN0cmluZ3x1bmRlZmluZWQpLFxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBXZWJBbmltYXRpb25TdWJ0YXJnZXREZWY7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgc2NvcGU6ICghRWxlbWVudHx1bmRlZmluZWQpLFxuICogICBzY2FsZUJ5U2NvcGU6IChib29sZWFufHVuZGVmaW5lZCksXG4gKiB9fVxuICpcbiAqIC0gc2NvcGUgZGVsaW1pdHMgc2VsZWN0b3JzLlxuICogLSBzY2FsZUJ5U2NvcGUgZGV0ZXJtaW5lcyB0aGF0IENTUyByZXNvbHV0aW9uIHNob3VsZCB0cmVhdCB0aGUgc2NvcGVcbiAqICAgZWxlbWVudCBhcyBhIHZpcnR1YWwgdmlld3BvcnQsIHNvIHRoYXQ6XG4gKiAgIDEuIHZ3L3ZoIHVuaXRzIGFyZSByZWxhdGl2ZSB0byB0aGUgc2NvcGUncyBzaXplXG4gKiAgIDIuIGVsZW1lbnQncyB4KCkgYW5kIHkoKSBjb29yZHMgYXJlIHJlbGF0aXZlIHRvIHRoZSBzY29wZSdzIHRvcC1sZWZ0IGNvcm5lclxuICogICAzLiBlbGVtZW50J3Mgc2l6ZSBhbmQgcG9zaXRpb24gKHdpZHRoKCkvaGVpZ2h0KCkveCgpL3koKSkgYXJlIGludmVyc2VseVxuICogICAgICByZWxhdGl2ZSB0byB0aGUgc2NvcGUncyB0cmFuc2Zvcm1lZCBzY2FsZSwgZS5nLiBpZiB0aGUgc2NvcGUgaXMgc2NhbGVkXG4gKiAgICAgIHRvIDkwJSwgdGhlIGVsZW1lbnQncyBkaW1lbnNpb25zIHdpbGwgYmUgcmV0dXJuZWQgYXMgaWYgaXQgd2FzIHVuc2NhbGVkXG4gKiAgICAgIHRvIDEwMCUuXG4gKi9cbmV4cG9ydCBsZXQgV2ViQW5pbWF0aW9uQnVpbGRlck9wdGlvbnNEZWY7XG5cbi8qKlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9BbmltYXRpb24vcGxheVN0YXRlXG4gKiBAZW51bSB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgV2ViQW5pbWF0aW9uUGxheVN0YXRlID0ge1xuICBJRExFOiAnaWRsZScsXG4gIFBFTkRJTkc6ICdwZW5kaW5nJyxcbiAgUlVOTklORzogJ3J1bm5pbmcnLFxuICBQQVVTRUQ6ICdwYXVzZWQnLFxuICBGSU5JU0hFRDogJ2ZpbmlzaGVkJyxcbn07XG5cbi8qKlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9BbmltYXRpb25FZmZlY3RUaW1pbmdQcm9wZXJ0aWVzL2RpcmVjdGlvblxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFdlYkFuaW1hdGlvblRpbWluZ0RpcmVjdGlvbiA9IHtcbiAgTk9STUFMOiAnbm9ybWFsJyxcbiAgUkVWRVJTRTogJ3JldmVyc2UnLFxuICBBTFRFUk5BVEU6ICdhbHRlcm5hdGUnLFxuICBBTFRFUk5BVEVfUkVWRVJTRTogJ2FsdGVybmF0ZS1yZXZlcnNlJyxcbn07XG5cbi8qKlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9BbmltYXRpb25FZmZlY3RUaW1pbmdQcm9wZXJ0aWVzL2ZpbGxcbiAqIEBlbnVtIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBXZWJBbmltYXRpb25UaW1pbmdGaWxsID0ge1xuICBOT05FOiAnbm9uZScsXG4gIEZPUldBUkRTOiAnZm9yd2FyZHMnLFxuICBCQUNLV0FSRFM6ICdiYWNrd2FyZHMnLFxuICBCT1RIOiAnYm90aCcsXG4gIEFVVE86ICdhdXRvJyxcbn07XG5cbi8qKiBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCBib29sZWFuPn0gKi9cbmNvbnN0IEFMTE9XTElTVEVEX1BST1BTID0ge1xuICAnb3BhY2l0eSc6IHRydWUsXG4gICd0cmFuc2Zvcm0nOiB0cnVlLFxuICAndHJhbnNmb3JtLW9yaWdpbic6IHRydWUsXG4gICd2aXNpYmlsaXR5JzogdHJ1ZSxcbiAgJ29mZnNldC1kaXN0YW5jZSc6IHRydWUsXG4gICdvZmZzZXREaXN0YW5jZSc6IHRydWUsXG4gICdjbGlwLXBhdGgnOiB0cnVlLFxuICAnY2xpcFBhdGgnOiB0cnVlLFxufTtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvcFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQWxsb3dsaXN0ZWRQcm9wKHByb3ApIHtcbiAgcmV0dXJuIEFMTE9XTElTVEVEX1BST1BTW3Byb3BdIHx8IGZhbHNlO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-animation/0.1/web-animation-types.js