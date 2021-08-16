/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {isString} from '#core/types';

import {
  assertNotDisplay,
  setStyle,
  px as stylePx,
  scale as styleScale,
  translate as styleTranslate,
} from './style';

/**
 * TransitionDef function that accepts normtime, typically between 0 and 1 and
 * performs an arbitrary animation action. Notice that sometimes normtime can
 * dip above 1 or below 0. This is an acceptable case for some curves. The
 * second argument is a boolean value that equals "true" for the completed
 * transition and "false" for ongoing.
 * @typedef {function(number, boolean):?|function(number):?}
 */
let TransitionDef;

/** @type {!TransitionDef<null>} */
export const NOOP = (unusedTime) => null;

/**
 * Returns a transition that combines the string result of other string-based
 * transitions such as transform and scale using the given opt_delimiter.
 * @param {!Array<!TransitionDef<string>>} transitions
 * @param {string=} opt_delimiter Defaults to a single whitespace.
 * @return {!TransitionDef<string>}
 */
export function concat(transitions, opt_delimiter = ' ') {
  return (time, complete) =>
    transitions
      .map((tr) => tr(time, complete))
      .filter(isString)
      .join(opt_delimiter);
}

/**
 * A transition that sets the CSS style of the specified element. The styles
 * a specified as a map from CSS property names to transition functions for
 * each of these properties.
 * @param {!Element} element
 * @param {!Object<string, !TransitionDef>} styles
 * @return {!TransitionDef<void>}
 */
export function setStyles(element, styles) {
  return (time, complete) => {
    for (const k in styles) {
      setStyle(element, assertNotDisplay(k), styles[k](time, complete));
    }
  };
}

/**
 * A basic numeric interpolation.
 * @param {number} start
 * @param {number} end
 * @return {!TransitionDef<number>}
 */
export function numeric(start, end) {
  return (time) => start + (end - start) * time;
}

/**
 * Adds "px" units.
 * @param {!TransitionDef<number>} transition
 * @return {!TransitionDef<string>}
 */
export function px(transition) {
  return (time) => stylePx(transition(time));
}

/**
 * A transition for "translate(x, y)" of CSS "transform" property.
 * @param {!TransitionDef<number|string>} transitionX
 * @param {!TransitionDef<number|string>|undefined} opt_transitionY
 * @return {!TransitionDef<string>}
 */
export function translate(transitionX, opt_transitionY) {
  return (time) => styleTranslate(transitionX(time), opt_transitionY?.(time));
}

/**
 * A transition for "scale" of CSS "transform" property.
 * @param {!TransitionDef<number|string>} transition
 * @return {!TransitionDef<string>}
 */
export function scale(transition) {
  return (time) => styleScale(transition(time));
}
