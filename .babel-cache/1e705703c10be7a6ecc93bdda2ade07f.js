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

import { assertNotDisplay } from "./assert-display";
import { getCurve } from "./core/data-structures/curve";
import * as st from "./core/dom/style";
import { setStyle } from "./core/dom/style";

export var NOOP = function NOOP(unusedTime) {
  return null;
};

/**
 * Returns a transition that combines a number of other transitions and
 * invokes them all in parallel.
 * @param {!Array<!TransitionDef>} transitions
 * @return {!TransitionDef<void>}
 */
export function all(transitions) {
  return function (time, complete) {
    for (var i = 0; i < transitions.length; i++) {
      var tr = transitions[i];
      tr(time, complete);
    }
  };
}

/**
 * Returns a transition that combines the string result of other string-based
 * transitions such as transform and scale using the given opt_delimiter.
 * @param {!Array<!TransitionDef<string>>} transitions
 * @param {string=} opt_delimiter Defaults to a single whitespace.
 * @return {!TransitionDef<string>}
 */
export function concat(transitions) {var opt_delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ' ';
  return function (time, complete) {
    var results = [];
    for (var i = 0; i < transitions.length; i++) {
      var tr = transitions[i];
      var result = tr(time, complete);
      if (typeof result == 'string') {
        results.push(result);
      }
    }
    return results.join(opt_delimiter);
  };
}

/**
 * Returns the specified transition with the time curved via specified curve
 * function.
 * @param {!TransitionDef<RESULT>} transition
 * @param {!./core/data-structures/curve.CurveDef|string} curve
 * @return {!TransitionDef<RESULT>}
 * @template RESULT
 */
export function withCurve(transition, curve) {
  /** @const {?./core/data-structures/curve.CurveDef} */
  var curveFn = getCurve(curve);
  return function (time, complete) {
    return transition(complete ? 1 : curveFn(time), complete);
  };
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
  return function (time, complete) {
    for (var k in styles) {
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
  return function (time) {
    return start + (end - start) * time;
  };
}

/**
 * Spring numeric interpolation.
 * @param {number} start
 * @param {number} end
 * @param {number} extended
 * @param {number} threshold
 * @return {!TransitionDef<number>}
 */
export function spring(start, end, extended, threshold) {
  if (end == extended) {
    return function (time) {
      return numeric(start, end)(time);
    };
  }
  return function (time) {
    if (time < threshold) {
      return start + (extended - start) * (time / threshold);
    }
    return extended + (end - extended) * ((time - threshold) / (1 - threshold));
  };
}

/**
 * Adds "px" units.
 * @param {!TransitionDef<number>} transition
 * @return {!TransitionDef<string>}
 */
export function px(transition) {
  return function (time) {
    return transition(time) + 'px';
  };
}

/**
 * A transition for "translateX" of CSS "transform" property.
 * @param {!TransitionDef<number|string>} transition
 * @return {!TransitionDef<string>}
 */
export function translateX(transition) {
  return function (time) {
    var res = transition(time);
    if (typeof res == 'string') {
      return "translateX(".concat(res, ")");
    }
    return "translateX(".concat(res, "px)");
  };
}

/**
 * A transition for "translateY" of CSS "transform" property.
 * @param {!TransitionDef<number|string>} transition
 * @return {!TransitionDef<string>}
 */
export function translateY(transition) {
  return function (time) {
    var res = transition(time);
    if (typeof res == 'string') {
      return "translateY(".concat(res, ")");
    }
    return "translateY(".concat(res, "px)");
  };
}

/**
 * A transition for "translate(x, y)" of CSS "transform" property.
 * @param {!TransitionDef<number|string>} transitionX
 * @param {!TransitionDef<number|string>|undefined} opt_transitionY
 * @return {!TransitionDef<string>}
 */
export function translate(transitionX, opt_transitionY) {
  return function (time) {
    var x = transitionX(time);
    if (typeof x == 'number') {
      x = st.px(x);
    }
    if (!opt_transitionY) {
      return "translate(".concat(x, ")");
    }

    var y = opt_transitionY(time);
    if (typeof y == 'number') {
      y = st.px(y);
    }
    return "translate(".concat(x, ",").concat(y, ")");
  };
}

/**
 * A transition for "scale" of CSS "transform" property.
 * @param {!TransitionDef<number|string>} transition
 * @return {!TransitionDef<string>}
 */
export function scale(transition) {
  return function (time) {
    return "scale(".concat(transition(time), ")");
  };
}
// /Users/mszylkowski/src/amphtml/src/transition.js