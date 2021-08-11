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
export function concat(transitions, opt_delimiter) {
  if (opt_delimiter === void 0) {
    opt_delimiter = ' ';
  }

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
      return "translateX(" + res + ")";
    }

    return "translateX(" + res + "px)";
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
      return "translateY(" + res + ")";
    }

    return "translateY(" + res + "px)";
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
      return "translate(" + x + ")";
    }

    var y = opt_transitionY(time);

    if (typeof y == 'number') {
      y = st.px(y);
    }

    return "translate(" + x + "," + y + ")";
  };
}

/**
 * A transition for "scale" of CSS "transform" property.
 * @param {!TransitionDef<number|string>} transition
 * @return {!TransitionDef<string>}
 */
export function scale(transition) {
  return function (time) {
    return "scale(" + transition(time) + ")";
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zaXRpb24uanMiXSwibmFtZXMiOlsiYXNzZXJ0Tm90RGlzcGxheSIsImdldEN1cnZlIiwic3QiLCJzZXRTdHlsZSIsIk5PT1AiLCJ1bnVzZWRUaW1lIiwiYWxsIiwidHJhbnNpdGlvbnMiLCJ0aW1lIiwiY29tcGxldGUiLCJpIiwibGVuZ3RoIiwidHIiLCJjb25jYXQiLCJvcHRfZGVsaW1pdGVyIiwicmVzdWx0cyIsInJlc3VsdCIsInB1c2giLCJqb2luIiwid2l0aEN1cnZlIiwidHJhbnNpdGlvbiIsImN1cnZlIiwiY3VydmVGbiIsInNldFN0eWxlcyIsImVsZW1lbnQiLCJzdHlsZXMiLCJrIiwibnVtZXJpYyIsInN0YXJ0IiwiZW5kIiwic3ByaW5nIiwiZXh0ZW5kZWQiLCJ0aHJlc2hvbGQiLCJweCIsInRyYW5zbGF0ZVgiLCJyZXMiLCJ0cmFuc2xhdGVZIiwidHJhbnNsYXRlIiwidHJhbnNpdGlvblgiLCJvcHRfdHJhbnNpdGlvblkiLCJ4IiwieSIsInNjYWxlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxnQkFBUjtBQUNBLFNBQVFDLFFBQVI7QUFDQSxPQUFPLEtBQUtDLEVBQVo7QUFDQSxTQUFRQyxRQUFSO0FBRUEsT0FBTyxJQUFNQyxJQUFJLEdBQUcsU0FBUEEsSUFBTyxDQUFVQyxVQUFWLEVBQXNCO0FBQ3hDLFNBQU8sSUFBUDtBQUNELENBRk07O0FBSVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxHQUFULENBQWFDLFdBQWIsRUFBMEI7QUFDL0IsU0FBTyxVQUFDQyxJQUFELEVBQU9DLFFBQVAsRUFBb0I7QUFDekIsU0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHSCxXQUFXLENBQUNJLE1BQWhDLEVBQXdDRCxDQUFDLEVBQXpDLEVBQTZDO0FB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SUFBRCxFQUFVO0FBQ2YsUUFBSWdDLENBQUMsR0FBR0YsV0FBVyxDQUFDOUIsSUFBRCxDQUFuQjs7QUFDQSxRQUFJLE9BQU9nQyxDQUFQLElBQVksUUFBaEIsRUFBMEI7QUFDeEJBLE1BQUFBLENBQUMsR0FBR3RDLEVBQUUsQ0FBQytCLEVBQUgsQ0FBTU8sQ0FBTixDQUFKO0FBQ0Q7O0FBQ0QsUUFBSSxDQUFDRCxlQUFMLEVBQXNCO0FBQ3BCLDRCQUFvQkMsQ0FBcEI7QUFDRDs7QUFFRCxRQUFJQyxDQUFDLEdBQUdGLGVBQWUsQ0FBQy9CLElBQUQsQ0FBdkI7O0FBQ0EsUUFBSSxPQUFPaUMsQ0FBUCxJQUFZLFFBQWhCLEVBQTBCO0FBQ3hCQSxNQUFBQSxDQUFDLEdBQUd2QyxFQUFFLENBQUMrQixFQUFILENBQU1RLENBQU4sQ0FBSjtBQUNEOztBQUNELDBCQUFvQkQsQ0FBcEIsU0FBeUJDLENBQXpCO0FBQ0QsR0FkRDtBQWVEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLEtBQVQsQ0FBZXRCLFVBQWYsRUFBMkI7QUFDaEMsU0FBTyxVQUFDWixJQUFELEVBQVU7QUFDZixzQkFBZ0JZLFVBQVUsQ0FBQ1osSUFBRCxDQUExQjtBQUNELEdBRkQ7QUFHRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2Fzc2VydE5vdERpc3BsYXl9IGZyb20gJy4vYXNzZXJ0LWRpc3BsYXknO1xuaW1wb3J0IHtnZXRDdXJ2ZX0gZnJvbSAnLi9jb3JlL2RhdGEtc3RydWN0dXJlcy9jdXJ2ZSc7XG5pbXBvcnQgKiBhcyBzdCBmcm9tICcuL2NvcmUvZG9tL3N0eWxlJztcbmltcG9ydCB7c2V0U3R5bGV9IGZyb20gJy4vY29yZS9kb20vc3R5bGUnO1xuXG5leHBvcnQgY29uc3QgTk9PUCA9IGZ1bmN0aW9uICh1bnVzZWRUaW1lKSB7XG4gIHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgdHJhbnNpdGlvbiB0aGF0IGNvbWJpbmVzIGEgbnVtYmVyIG9mIG90aGVyIHRyYW5zaXRpb25zIGFuZFxuICogaW52b2tlcyB0aGVtIGFsbCBpbiBwYXJhbGxlbC5cbiAqIEBwYXJhbSB7IUFycmF5PCFUcmFuc2l0aW9uRGVmPn0gdHJhbnNpdGlvbnNcbiAqIEByZXR1cm4geyFUcmFuc2l0aW9uRGVmPHZvaWQ+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gYWxsKHRyYW5zaXRpb25zKSB7XG4gIHJldHVybiAodGltZSwgY29tcGxldGUpID0+IHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB0ciA9IHRyYW5zaXRpb25zW2ldO1xuICAgICAgdHIodGltZSwgY29tcGxldGUpO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgdHJhbnNpdGlvbiB0aGF0IGNvbWJpbmVzIHRoZSBzdHJpbmcgcmVzdWx0IG9mIG90aGVyIHN0cmluZy1iYXNlZFxuICogdHJhbnNpdGlvbnMgc3VjaCBhcyB0cmFuc2Zvcm0gYW5kIHNjYWxlIHVzaW5nIHRoZSBnaXZlbiBvcHRfZGVsaW1pdGVyLlxuICogQHBhcmFtIHshQXJyYXk8IVRyYW5zaXRpb25EZWY8c3RyaW5nPj59IHRyYW5zaXRpb25zXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9kZWxpbWl0ZXIgRGVmYXVsdHMgdG8gYSBzaW5nbGUgd2hpdGVzcGFjZS5cbiAqIEByZXR1cm4geyFUcmFuc2l0aW9uRGVmPHN0cmluZz59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25jYXQodHJhbnNpdGlvbnMsIG9wdF9kZWxpbWl0ZXIgPSAnICcpIHtcbiAgcmV0dXJuICh0aW1lLCBjb21wbGV0ZSkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRyYW5zaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB0ciA9IHRyYW5zaXRpb25zW2ldO1xuICAgICAgY29uc3QgcmVzdWx0ID0gdHIodGltZSwgY29tcGxldGUpO1xuICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzLmpvaW4ob3B0X2RlbGltaXRlcik7XG4gIH07XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc3BlY2lmaWVkIHRyYW5zaXRpb24gd2l0aCB0aGUgdGltZSBjdXJ2ZWQgdmlhIHNwZWNpZmllZCBjdXJ2ZVxuICogZnVuY3Rpb24uXG4gKiBAcGFyYW0geyFUcmFuc2l0aW9uRGVmPFJFU1VMVD59IHRyYW5zaXRpb25cbiAqIEBwYXJhbSB7IS4vY29yZS9kYXRhLXN0cnVjdHVyZXMvY3VydmUuQ3VydmVEZWZ8c3RyaW5nfSBjdXJ2ZVxuICogQHJldHVybiB7IVRyYW5zaXRpb25EZWY8UkVTVUxUPn1cbiAqIEB0ZW1wbGF0ZSBSRVNVTFRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhDdXJ2ZSh0cmFuc2l0aW9uLCBjdXJ2ZSkge1xuICAvKiogQGNvbnN0IHs/Li9jb3JlL2RhdGEtc3RydWN0dXJlcy9jdXJ2ZS5DdXJ2ZURlZn0gKi9cbiAgY29uc3QgY3VydmVGbiA9IGdldEN1cnZlKGN1cnZlKTtcbiAgcmV0dXJuICh0aW1lLCBjb21wbGV0ZSkgPT4ge1xuICAgIHJldHVybiB0cmFuc2l0aW9uKGNvbXBsZXRlID8gMSA6IGN1cnZlRm4odGltZSksIGNvbXBsZXRlKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBBIHRyYW5zaXRpb24gdGhhdCBzZXRzIHRoZSBDU1Mgc3R5bGUgb2YgdGhlIHNwZWNpZmllZCBlbGVtZW50LiBUaGUgc3R5bGVzXG4gKiBhIHNwZWNpZmllZCBhcyBhIG1hcCBmcm9tIENTUyBwcm9wZXJ0eSBuYW1lcyB0byB0cmFuc2l0aW9uIGZ1bmN0aW9ucyBmb3JcbiAqIGVhY2ggb2YgdGhlc2UgcHJvcGVydGllcy5cbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsICFUcmFuc2l0aW9uRGVmPn0gc3R5bGVzXG4gKiBAcmV0dXJuIHshVHJhbnNpdGlvbkRlZjx2b2lkPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFN0eWxlcyhlbGVtZW50LCBzdHlsZXMpIHtcbiAgcmV0dXJuICh0aW1lLCBjb21wbGV0ZSkgPT4ge1xuICAgIGZvciAoY29uc3QgayBpbiBzdHlsZXMpIHtcbiAgICAgIHNldFN0eWxlKGVsZW1lbnQsIGFzc2VydE5vdERpc3BsYXkoayksIHN0eWxlc1trXSh0aW1lLCBjb21wbGV0ZSkpO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBBIGJhc2ljIG51bWVyaWMgaW50ZXJwb2xhdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFxuICogQHBhcmFtIHtudW1iZXJ9IGVuZFxuICogQHJldHVybiB7IVRyYW5zaXRpb25EZWY8bnVtYmVyPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG51bWVyaWMoc3RhcnQsIGVuZCkge1xuICByZXR1cm4gKHRpbWUpID0+IHtcbiAgICByZXR1cm4gc3RhcnQgKyAoZW5kIC0gc3RhcnQpICogdGltZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBTcHJpbmcgbnVtZXJpYyBpbnRlcnBvbGF0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0XG4gKiBAcGFyYW0ge251bWJlcn0gZW5kXG4gKiBAcGFyYW0ge251bWJlcn0gZXh0ZW5kZWRcbiAqIEBwYXJhbSB7bnVtYmVyfSB0aHJlc2hvbGRcbiAqIEByZXR1cm4geyFUcmFuc2l0aW9uRGVmPG51bWJlcj59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcHJpbmcoc3RhcnQsIGVuZCwgZXh0ZW5kZWQsIHRocmVzaG9sZCkge1xuICBpZiAoZW5kID09IGV4dGVuZGVkKSB7XG4gICAgcmV0dXJuICh0aW1lKSA9PiB7XG4gICAgICByZXR1cm4gbnVtZXJpYyhzdGFydCwgZW5kKSh0aW1lKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiAodGltZSkgPT4ge1xuICAgIGlmICh0aW1lIDwgdGhyZXNob2xkKSB7XG4gICAgICByZXR1cm4gc3RhcnQgKyAoZXh0ZW5kZWQgLSBzdGFydCkgKiAodGltZSAvIHRocmVzaG9sZCk7XG4gICAgfVxuICAgIHJldHVybiBleHRlbmRlZCArIChlbmQgLSBleHRlbmRlZCkgKiAoKHRpbWUgLSB0aHJlc2hvbGQpIC8gKDEgLSB0aHJlc2hvbGQpKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBBZGRzIFwicHhcIiB1bml0cy5cbiAqIEBwYXJhbSB7IVRyYW5zaXRpb25EZWY8bnVtYmVyPn0gdHJhbnNpdGlvblxuICogQHJldHVybiB7IVRyYW5zaXRpb25EZWY8c3RyaW5nPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB4KHRyYW5zaXRpb24pIHtcbiAgcmV0dXJuICh0aW1lKSA9PiB7XG4gICAgcmV0dXJuIHRyYW5zaXRpb24odGltZSkgKyAncHgnO1xuICB9O1xufVxuXG4vKipcbiAqIEEgdHJhbnNpdGlvbiBmb3IgXCJ0cmFuc2xhdGVYXCIgb2YgQ1NTIFwidHJhbnNmb3JtXCIgcHJvcGVydHkuXG4gKiBAcGFyYW0geyFUcmFuc2l0aW9uRGVmPG51bWJlcnxzdHJpbmc+fSB0cmFuc2l0aW9uXG4gKiBAcmV0dXJuIHshVHJhbnNpdGlvbkRlZjxzdHJpbmc+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlWCh0cmFuc2l0aW9uKSB7XG4gIHJldHVybiAodGltZSkgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHRyYW5zaXRpb24odGltZSk7XG4gICAgaWYgKHR5cGVvZiByZXMgPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBgdHJhbnNsYXRlWCgke3Jlc30pYDtcbiAgICB9XG4gICAgcmV0dXJuIGB0cmFuc2xhdGVYKCR7cmVzfXB4KWA7XG4gIH07XG59XG5cbi8qKlxuICogQSB0cmFuc2l0aW9uIGZvciBcInRyYW5zbGF0ZVlcIiBvZiBDU1MgXCJ0cmFuc2Zvcm1cIiBwcm9wZXJ0eS5cbiAqIEBwYXJhbSB7IVRyYW5zaXRpb25EZWY8bnVtYmVyfHN0cmluZz59IHRyYW5zaXRpb25cbiAqIEByZXR1cm4geyFUcmFuc2l0aW9uRGVmPHN0cmluZz59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGVZKHRyYW5zaXRpb24pIHtcbiAgcmV0dXJuICh0aW1lKSA9PiB7XG4gICAgY29uc3QgcmVzID0gdHJhbnNpdGlvbih0aW1lKTtcbiAgICBpZiAodHlwZW9mIHJlcyA9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGB0cmFuc2xhdGVZKCR7cmVzfSlgO1xuICAgIH1cbiAgICByZXR1cm4gYHRyYW5zbGF0ZVkoJHtyZXN9cHgpYDtcbiAgfTtcbn1cblxuLyoqXG4gKiBBIHRyYW5zaXRpb24gZm9yIFwidHJhbnNsYXRlKHgsIHkpXCIgb2YgQ1NTIFwidHJhbnNmb3JtXCIgcHJvcGVydHkuXG4gKiBAcGFyYW0geyFUcmFuc2l0aW9uRGVmPG51bWJlcnxzdHJpbmc+fSB0cmFuc2l0aW9uWFxuICogQHBhcmFtIHshVHJhbnNpdGlvbkRlZjxudW1iZXJ8c3RyaW5nPnx1bmRlZmluZWR9IG9wdF90cmFuc2l0aW9uWVxuICogQHJldHVybiB7IVRyYW5zaXRpb25EZWY8c3RyaW5nPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZSh0cmFuc2l0aW9uWCwgb3B0X3RyYW5zaXRpb25ZKSB7XG4gIHJldHVybiAodGltZSkgPT4ge1xuICAgIGxldCB4ID0gdHJhbnNpdGlvblgodGltZSk7XG4gICAgaWYgKHR5cGVvZiB4ID09ICdudW1iZXInKSB7XG4gICAgICB4ID0gc3QucHgoeCk7XG4gICAgfVxuICAgIGlmICghb3B0X3RyYW5zaXRpb25ZKSB7XG4gICAgICByZXR1cm4gYHRyYW5zbGF0ZSgke3h9KWA7XG4gICAgfVxuXG4gICAgbGV0IHkgPSBvcHRfdHJhbnNpdGlvblkodGltZSk7XG4gICAgaWYgKHR5cGVvZiB5ID09ICdudW1iZXInKSB7XG4gICAgICB5ID0gc3QucHgoeSk7XG4gICAgfVxuICAgIHJldHVybiBgdHJhbnNsYXRlKCR7eH0sJHt5fSlgO1xuICB9O1xufVxuXG4vKipcbiAqIEEgdHJhbnNpdGlvbiBmb3IgXCJzY2FsZVwiIG9mIENTUyBcInRyYW5zZm9ybVwiIHByb3BlcnR5LlxuICogQHBhcmFtIHshVHJhbnNpdGlvbkRlZjxudW1iZXJ8c3RyaW5nPn0gdHJhbnNpdGlvblxuICogQHJldHVybiB7IVRyYW5zaXRpb25EZWY8c3RyaW5nPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKHRyYW5zaXRpb24pIHtcbiAgcmV0dXJuICh0aW1lKSA9PiB7XG4gICAgcmV0dXJuIGBzY2FsZSgke3RyYW5zaXRpb24odGltZSl9KWA7XG4gIH07XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/transition.js