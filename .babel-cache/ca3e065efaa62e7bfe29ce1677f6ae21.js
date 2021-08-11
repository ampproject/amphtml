function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { isString } from "../types";

/**
 * Number between 0 and 1 that designates normalized time, as in "from start to
 * end".
 * @typedef {number}
 */
export var NormTimeDef;

/**
 * A CurveDef is a function that returns a normtime value (0 to 1) for another
 * normtime value.
 * @typedef {function(NormTimeDef): NormTimeDef}
 */
export var CurveDef;

/**
 * Returns a cubic bezier curve.
 * @param {number} x1 X coordinate of the first control point.
 * @param {number} y1 Y coordinate of the first control point.
 * @param {number} x2 X coordinate of the second control point.
 * @param {number} y2 Y coordinate of the second control point.
 * @return {!CurveDef}
 */
export function bezierCurve(x1, y1, x2, y2) {
  return function (xVal) {
    return Bezier.solveYValueFromXValue(xVal, 0, 0, x1, y1, x2, y2, 1, 1);
  };
}

/**
 * Thanks to
 * https://closure-library.googlecode.com/git-history/docs/local_closure_goog_math_bezier.js.source.html
 */
var Bezier = /*#__PURE__*/function () {
  function Bezier() {
    _classCallCheck(this, Bezier);
  }

  _createClass(Bezier, null, [{
    key: "solveYValueFromXValue",
    value:
    /**
     * Computes the y coordinate of a point on the curve given its x coordinate.
     * @param {number} xVal The x coordinate of the point on the curve.
     * @param {number} x0 X coordinate of the start point.
     * @param {number} y0 Y coordinate of the start point.
     * @param {number} x1 X coordinate of the first control point.
     * @param {number} y1 Y coordinate of the first control point.
     * @param {number} x2 X coordinate of the second control point.
     * @param {number} y2 Y coordinate of the second control point.
     * @param {number} x3 X coordinate of the end point.
     * @param {number} y3 Y coordinate of the end point.
     * @return {number} The y coordinate of the point on the curve.
     */
    function solveYValueFromXValue(xVal, x0, y0, x1, y1, x2, y2, x3, y3) {
      return Bezier.getPointY_(Bezier.solvePositionFromXValue_(xVal, x0, x1, x2, x3), y0, y1, y2, y3);
    }
    /**
     * Computes the position t of a point on the curve given its x coordinate.
     * That is, for an input xVal, finds t s.t. getPointX(t) = xVal.
     * As such, the following should always be true up to some small epsilon:
     * t ~ solvePositionFromXValue(getPointX(t)) for t in [0, 1].
     * @param {number} xVal The x coordinate of the point to find on the curve.
     * @param {number} x0 X coordinate of the start point.
     * @param {number} x1 X coordinate of the first control point.
     * @param {number} x2 X coordinate of the second control point.
     * @param {number} x3 X coordinate of the end point.
     * @return {number} The position t.
     * @private
     */

  }, {
    key: "solvePositionFromXValue_",
    value: function solvePositionFromXValue_(xVal, x0, x1, x2, x3) {
      // Desired precision on the computation.
      var epsilon = 1e-6;
      // Initial estimate of t using linear interpolation.
      var t = (xVal - x0) / (x3 - x0);

      if (t <= 0) {
        return 0;
      } else if (t >= 1) {
        return 1;
      }

      // Try gradient descent to solve for t. If it works, it is very fast.
      var tMin = 0;
      var tMax = 1;
      var value = 0;

      for (var i = 0; i < 8; i++) {
        value = Bezier.getPointX_(t, x0, x1, x2, x3);
        var derivative = (Bezier.getPointX_(t + epsilon, x0, x1, x2, x3) - value) / epsilon;

        if (Math.abs(value - xVal) < epsilon) {
          return t;
        } else if (Math.abs(derivative) < epsilon) {
          break;
        } else {
          if (value < xVal) {
            tMin = t;
          } else {
            tMax = t;
          }

          t -= (value - xVal) / derivative;
        }
      }

      // If the gradient descent got stuck in a local minimum, e.g. because
      // the derivative was close to 0, use a Dichotomy refinement instead.
      // We limit the number of iterations to 8.
      for (var _i = 0; Math.abs(value - xVal) > epsilon && _i < 8; _i++) {
        if (value < xVal) {
          tMin = t;
          t = (t + tMax) / 2;
        } else {
          tMax = t;
          t = (t + tMin) / 2;
        }

        value = Bezier.getPointX_(t, x0, x1, x2, x3);
      }

      return t;
    }
    /**
     * Computes the curve's X coordinate at a point between 0 and 1.
     * @param {number} t The point on the curve to find.
     * @param {number} x0 X coordinate of the start point.
     * @param {number} x1 X coordinate of the first control point.
     * @param {number} x2 X coordinate of the second control point.
     * @param {number} x3 X coordinate of the end point.
     * @return {number} The computed coordinate.
     * @private
     */

  }, {
    key: "getPointX_",
    value: function getPointX_(t, x0, x1, x2, x3) {
      // Special case start and end.
      if (t == 0) {
        return x0;
      } else if (t == 1) {
        return x3;
      }

      // Step one - from 4 points to 3
      var ix0 = Bezier.lerp_(x0, x1, t);
      var ix1 = Bezier.lerp_(x1, x2, t);
      var ix2 = Bezier.lerp_(x2, x3, t);
      // Step two - from 3 points to 2
      ix0 = Bezier.lerp_(ix0, ix1, t);
      ix1 = Bezier.lerp_(ix1, ix2, t);
      // Final step - last point
      return Bezier.lerp_(ix0, ix1, t);
    }
    /**
     * Computes the curve's Y coordinate at a point between 0 and 1.
     * @param {number} t The point on the curve to find.
     * @param {number} y0 Y coordinate of the start point.
     * @param {number} y1 Y coordinate of the first control point.
     * @param {number} y2 Y coordinate of the second control point.
     * @param {number} y3 Y coordinate of the end point.
     * @return {number} The computed coordinate.
     * @private
     */

  }, {
    key: "getPointY_",
    value: function getPointY_(t, y0, y1, y2, y3) {
      // Special case start and end.
      if (t == 0) {
        return y0;
      } else if (t == 1) {
        return y3;
      }

      // Step one - from 4 points to 3
      var iy0 = Bezier.lerp_(y0, y1, t);
      var iy1 = Bezier.lerp_(y1, y2, t);
      var iy2 = Bezier.lerp_(y2, y3, t);
      // Step two - from 3 points to 2
      iy0 = Bezier.lerp_(iy0, iy1, t);
      iy1 = Bezier.lerp_(iy1, iy2, t);
      // Final step - last point
      return Bezier.lerp_(iy0, iy1, t);
    }
    /**
     * Performs linear interpolation between values a and b. Returns the value
     * between a and b proportional to x (when x is between 0 and 1. When x is
     * outside this range, the return value is a linear extrapolation).
     * @param {number} a A number.
     * @param {number} b A number.
     * @param {number} x The proportion between a and b.
     * @return {number} The interpolated value between a and b.
     * @private
     */

  }, {
    key: "lerp_",
    value: function lerp_(a, b, x) {
      return a + x * (b - a);
    }
  }]);

  return Bezier;
}();

/**
 * A collection of common curves.
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/timing-function
 * @enum {!CurveDef}
 */
export var Curves = {
  /**
   * linear
   * @param {!NormTimeDef} xVal
   * @return {!NormTimeDef}
   */
  LINEAR: function LINEAR(xVal) {
    return xVal;
  },

  /**
   * ease
   * @param {!NormTimeDef} xVal
   * @return {!NormTimeDef}
   */
  EASE: function EASE(xVal) {
    return Bezier.solveYValueFromXValue(xVal, 0, 0, 0.25, 0.1, 0.25, 1.0, 1, 1);
  },

  /**
   * ease-in: slow out, fast in
   * @param {!NormTimeDef} xVal
   * @return {!NormTimeDef}
   */
  EASE_IN: function EASE_IN(xVal) {
    return Bezier.solveYValueFromXValue(xVal, 0, 0, 0.42, 0.0, 1.0, 1.0, 1, 1);
  },

  /**
   * ease-out: fast out, slow in
   * @param {!NormTimeDef} xVal
   * @return {!NormTimeDef}
   */
  EASE_OUT: function EASE_OUT(xVal) {
    return Bezier.solveYValueFromXValue(xVal, 0, 0, 0.0, 0.0, 0.58, 1.0, 1, 1);
  },

  /**
   * ease-in-out
   * @param {!NormTimeDef} xVal
   * @return {!NormTimeDef}
   */
  EASE_IN_OUT: function EASE_IN_OUT(xVal) {
    return Bezier.solveYValueFromXValue(xVal, 0, 0, 0.42, 0.0, 0.58, 1.0, 1, 1);
  }
};

/**
 * @const {!Object<string, !CurveDef>}
 */
var NAME_MAP = {
  'linear': Curves.LINEAR,
  'ease': Curves.EASE,
  'ease-in': Curves.EASE_IN,
  'ease-out': Curves.EASE_OUT,
  'ease-in-out': Curves.EASE_IN_OUT
};

/**
 * If the argument is a string, this methods matches an existing curve by name.
 * @param {?CurveDef|string|undefined} curve
 * @return {?CurveDef}
 */
export function getCurve(curve) {
  if (!curve) {
    return null;
  }

  if (isString(curve)) {
    curve =
    /** @type {string} */
    curve;

    // If the curve is a custom cubic-bezier curve
    if (curve.indexOf('cubic-bezier') != -1) {
      var match = curve.match(/cubic-bezier\((.+)\)/);

      if (match) {
        var values = match[1].split(',').map(parseFloat);

        if (values.length == 4) {
          for (var i = 0; i < 4; i++) {
            if (isNaN(values[i])) {
              return null;
            }
          }

          return bezierCurve(values[0], values[1], values[2], values[3]);
        }
      }

      return null;
    }

    return NAME_MAP[curve];
  }

  return (
    /** @type {!CurveDef} */
    curve
  );
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImN1cnZlLmpzIl0sIm5hbWVzIjpbImlzU3RyaW5nIiwiTm9ybVRpbWVEZWYiLCJDdXJ2ZURlZiIsImJlemllckN1cnZlIiwieDEiLCJ5MSIsIngyIiwieTIiLCJ4VmFsIiwiQmV6aWVyIiwic29sdmVZVmFsdWVGcm9tWFZhbHVlIiwieDAiLCJ5MCIsIngzIiwieTMiLCJnZXRQb2ludFlfIiwic29sdmVQb3NpdGlvbkZyb21YVmFsdWVfIiwiZXBzaWxvbiIsInQiLCJ0TWluIiwidE1heCIsInZhbHVlIiwiaSIsImdldFBvaW50WF8iLCJkZXJpdmF0aXZlIiwiTWF0aCIsImFicyIsIml4MCIsImxlcnBfIiwiaXgxIiwiaXgyIiwiaXkwIiwiaXkxIiwiaXkyIiwiYSIsImIiLCJ4IiwiQ3VydmVzIiwiTElORUFSIiwiRUFTRSIsIkVBU0VfSU4iLCJFQVNFX09VVCIsIkVBU0VfSU5fT1VUIiwiTkFNRV9NQVAiLCJnZXRDdXJ2ZSIsImN1cnZlIiwiaW5kZXhPZiIsIm1hdGNoIiwidmFsdWVzIiwic3BsaXQiLCJtYXAiLCJwYXJzZUZsb2F0IiwibGVuZ3RoIiwiaXNOYU4iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFFBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBSUMsV0FBSjs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFJQyxRQUFKOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLFdBQVQsQ0FBcUJDLEVBQXJCLEVBQXlCQyxFQUF6QixFQUE2QkMsRUFBN0IsRUFBaUNDLEVBQWpDLEVBQXFDO0FBQzFDLFNBQU8sVUFBQ0MsSUFBRDtBQUFBLFdBQ0xDLE1BQU0sQ0FBQ0MscUJBQVAsQ0FBNkJGLElBQTdCLEVB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WUFBTUMsTUFBTSxHQUFHRCxLQUFLLENBQUMsQ0FBRCxDQUFMLENBQVNFLEtBQVQsQ0FBZSxHQUFmLEVBQW9CQyxHQUFwQixDQUF3QkMsVUFBeEIsQ0FBZjs7QUFDQSxZQUFJSCxNQUFNLENBQUNJLE1BQVAsSUFBaUIsQ0FBckIsRUFBd0I7QUFDdEIsZUFBSyxJQUFJOUIsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBRyxDQUFwQixFQUF1QkEsQ0FBQyxFQUF4QixFQUE0QjtBQUMxQixnQkFBSStCLEtBQUssQ0FBQ0wsTUFBTSxDQUFDMUIsQ0FBRCxDQUFQLENBQVQsRUFBc0I7QUFDcEIscUJBQU8sSUFBUDtBQUNEO0FBQ0Y7O0FBQ0QsaUJBQU9uQixXQUFXLENBQUM2QyxNQUFNLENBQUMsQ0FBRCxDQUFQLEVBQVlBLE1BQU0sQ0FBQyxDQUFELENBQWxCLEVBQXVCQSxNQUFNLENBQUMsQ0FBRCxDQUE3QixFQUFrQ0EsTUFBTSxDQUFDLENBQUQsQ0FBeEMsQ0FBbEI7QUFDRDtBQUNGOztBQUNELGFBQU8sSUFBUDtBQUNEOztBQUNELFdBQU9MLFFBQVEsQ0FBQ0UsS0FBRCxDQUFmO0FBQ0Q7O0FBQ0Q7QUFBTztBQUEwQkEsSUFBQUE7QUFBakM7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2lzU3RyaW5nfSBmcm9tICcjY29yZS90eXBlcyc7XG5cbi8qKlxuICogTnVtYmVyIGJldHdlZW4gMCBhbmQgMSB0aGF0IGRlc2lnbmF0ZXMgbm9ybWFsaXplZCB0aW1lLCBhcyBpbiBcImZyb20gc3RhcnQgdG9cbiAqIGVuZFwiLlxuICogQHR5cGVkZWYge251bWJlcn1cbiAqL1xuZXhwb3J0IGxldCBOb3JtVGltZURlZjtcblxuLyoqXG4gKiBBIEN1cnZlRGVmIGlzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgbm9ybXRpbWUgdmFsdWUgKDAgdG8gMSkgZm9yIGFub3RoZXJcbiAqIG5vcm10aW1lIHZhbHVlLlxuICogQHR5cGVkZWYge2Z1bmN0aW9uKE5vcm1UaW1lRGVmKTogTm9ybVRpbWVEZWZ9XG4gKi9cbmV4cG9ydCBsZXQgQ3VydmVEZWY7XG5cbi8qKlxuICogUmV0dXJucyBhIGN1YmljIGJlemllciBjdXJ2ZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSB4MSBYIGNvb3JkaW5hdGUgb2YgdGhlIGZpcnN0IGNvbnRyb2wgcG9pbnQuXG4gKiBAcGFyYW0ge251bWJlcn0geTEgWSBjb29yZGluYXRlIG9mIHRoZSBmaXJzdCBjb250cm9sIHBvaW50LlxuICogQHBhcmFtIHtudW1iZXJ9IHgyIFggY29vcmRpbmF0ZSBvZiB0aGUgc2Vjb25kIGNvbnRyb2wgcG9pbnQuXG4gKiBAcGFyYW0ge251bWJlcn0geTIgWSBjb29yZGluYXRlIG9mIHRoZSBzZWNvbmQgY29udHJvbCBwb2ludC5cbiAqIEByZXR1cm4geyFDdXJ2ZURlZn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlemllckN1cnZlKHgxLCB5MSwgeDIsIHkyKSB7XG4gIHJldHVybiAoeFZhbCkgPT5cbiAgICBCZXppZXIuc29sdmVZVmFsdWVGcm9tWFZhbHVlKHhWYWwsIDAsIDAsIHgxLCB5MSwgeDIsIHkyLCAxLCAxKTtcbn1cblxuLyoqXG4gKiBUaGFua3MgdG9cbiAqIGh0dHBzOi8vY2xvc3VyZS1saWJyYXJ5Lmdvb2dsZWNvZGUuY29tL2dpdC1oaXN0b3J5L2RvY3MvbG9jYWxfY2xvc3VyZV9nb29nX21hdGhfYmV6aWVyLmpzLnNvdXJjZS5odG1sXG4gKi9cbmNsYXNzIEJlemllciB7XG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgeSBjb29yZGluYXRlIG9mIGEgcG9pbnQgb24gdGhlIGN1cnZlIGdpdmVuIGl0cyB4IGNvb3JkaW5hdGUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4VmFsIFRoZSB4IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50IG9uIHRoZSBjdXJ2ZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHgwIFggY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgcG9pbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MCBZIGNvb3JkaW5hdGUgb2YgdGhlIHN0YXJ0IHBvaW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0geDEgWCBjb29yZGluYXRlIG9mIHRoZSBmaXJzdCBjb250cm9sIHBvaW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0geTEgWSBjb29yZGluYXRlIG9mIHRoZSBmaXJzdCBjb250cm9sIHBvaW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0geDIgWCBjb29yZGluYXRlIG9mIHRoZSBzZWNvbmQgY29udHJvbCBwb2ludC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHkyIFkgY29vcmRpbmF0ZSBvZiB0aGUgc2Vjb25kIGNvbnRyb2wgcG9pbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MyBYIGNvb3JkaW5hdGUgb2YgdGhlIGVuZCBwb2ludC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHkzIFkgY29vcmRpbmF0ZSBvZiB0aGUgZW5kIHBvaW50LlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSB5IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50IG9uIHRoZSBjdXJ2ZS5cbiAgICovXG4gIHN0YXRpYyBzb2x2ZVlWYWx1ZUZyb21YVmFsdWUoeFZhbCwgeDAsIHkwLCB4MSwgeTEsIHgyLCB5MiwgeDMsIHkzKSB7XG4gICAgcmV0dXJuIEJlemllci5nZXRQb2ludFlfKFxuICAgICAgQmV6aWVyLnNvbHZlUG9zaXRpb25Gcm9tWFZhbHVlXyh4VmFsLCB4MCwgeDEsIHgyLCB4MyksXG4gICAgICB5MCxcbiAgICAgIHkxLFxuICAgICAgeTIsXG4gICAgICB5M1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgdGhlIHBvc2l0aW9uIHQgb2YgYSBwb2ludCBvbiB0aGUgY3VydmUgZ2l2ZW4gaXRzIHggY29vcmRpbmF0ZS5cbiAgICogVGhhdCBpcywgZm9yIGFuIGlucHV0IHhWYWwsIGZpbmRzIHQgcy50LiBnZXRQb2ludFgodCkgPSB4VmFsLlxuICAgKiBBcyBzdWNoLCB0aGUgZm9sbG93aW5nIHNob3VsZCBhbHdheXMgYmUgdHJ1ZSB1cCB0byBzb21lIHNtYWxsIGVwc2lsb246XG4gICAqIHQgfiBzb2x2ZVBvc2l0aW9uRnJvbVhWYWx1ZShnZXRQb2ludFgodCkpIGZvciB0IGluIFswLCAxXS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHhWYWwgVGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQgdG8gZmluZCBvbiB0aGUgY3VydmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MCBYIGNvb3JkaW5hdGUgb2YgdGhlIHN0YXJ0IHBvaW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0geDEgWCBjb29yZGluYXRlIG9mIHRoZSBmaXJzdCBjb250cm9sIHBvaW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0geDIgWCBjb29yZGluYXRlIG9mIHRoZSBzZWNvbmQgY29udHJvbCBwb2ludC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHgzIFggY29vcmRpbmF0ZSBvZiB0aGUgZW5kIHBvaW50LlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBwb3NpdGlvbiB0LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RhdGljIHNvbHZlUG9zaXRpb25Gcm9tWFZhbHVlXyh4VmFsLCB4MCwgeDEsIHgyLCB4Mykge1xuICAgIC8vIERlc2lyZWQgcHJlY2lzaW9uIG9uIHRoZSBjb21wdXRhdGlvbi5cbiAgICBjb25zdCBlcHNpbG9uID0gMWUtNjtcblxuICAgIC8vIEluaXRpYWwgZXN0aW1hdGUgb2YgdCB1c2luZyBsaW5lYXIgaW50ZXJwb2xhdGlvbi5cbiAgICBsZXQgdCA9ICh4VmFsIC0geDApIC8gKHgzIC0geDApO1xuICAgIGlmICh0IDw9IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZSBpZiAodCA+PSAxKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG5cbiAgICAvLyBUcnkgZ3JhZGllbnQgZGVzY2VudCB0byBzb2x2ZSBmb3IgdC4gSWYgaXQgd29ya3MsIGl0IGlzIHZlcnkgZmFzdC5cbiAgICBsZXQgdE1pbiA9IDA7XG4gICAgbGV0IHRNYXggPSAxO1xuICAgIGxldCB2YWx1ZSA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgIHZhbHVlID0gQmV6aWVyLmdldFBvaW50WF8odCwgeDAsIHgxLCB4MiwgeDMpO1xuICAgICAgY29uc3QgZGVyaXZhdGl2ZSA9XG4gICAgICAgIChCZXppZXIuZ2V0UG9pbnRYXyh0ICsgZXBzaWxvbiwgeDAsIHgxLCB4MiwgeDMpIC0gdmFsdWUpIC8gZXBzaWxvbjtcbiAgICAgIGlmIChNYXRoLmFicyh2YWx1ZSAtIHhWYWwpIDwgZXBzaWxvbikge1xuICAgICAgICByZXR1cm4gdDtcbiAgICAgIH0gZWxzZSBpZiAoTWF0aC5hYnMoZGVyaXZhdGl2ZSkgPCBlcHNpbG9uKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHZhbHVlIDwgeFZhbCkge1xuICAgICAgICAgIHRNaW4gPSB0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRNYXggPSB0O1xuICAgICAgICB9XG4gICAgICAgIHQgLT0gKHZhbHVlIC0geFZhbCkgLyBkZXJpdmF0aXZlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHRoZSBncmFkaWVudCBkZXNjZW50IGdvdCBzdHVjayBpbiBhIGxvY2FsIG1pbmltdW0sIGUuZy4gYmVjYXVzZVxuICAgIC8vIHRoZSBkZXJpdmF0aXZlIHdhcyBjbG9zZSB0byAwLCB1c2UgYSBEaWNob3RvbXkgcmVmaW5lbWVudCBpbnN0ZWFkLlxuICAgIC8vIFdlIGxpbWl0IHRoZSBudW1iZXIgb2YgaXRlcmF0aW9ucyB0byA4LlxuICAgIGZvciAobGV0IGkgPSAwOyBNYXRoLmFicyh2YWx1ZSAtIHhWYWwpID4gZXBzaWxvbiAmJiBpIDwgODsgaSsrKSB7XG4gICAgICBpZiAodmFsdWUgPCB4VmFsKSB7XG4gICAgICAgIHRNaW4gPSB0O1xuICAgICAgICB0ID0gKHQgKyB0TWF4KSAvIDI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0TWF4ID0gdDtcbiAgICAgICAgdCA9ICh0ICsgdE1pbikgLyAyO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSBCZXppZXIuZ2V0UG9pbnRYXyh0LCB4MCwgeDEsIHgyLCB4Myk7XG4gICAgfVxuICAgIHJldHVybiB0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSBjdXJ2ZSdzIFggY29vcmRpbmF0ZSBhdCBhIHBvaW50IGJldHdlZW4gMCBhbmQgMS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHQgVGhlIHBvaW50IG9uIHRoZSBjdXJ2ZSB0byBmaW5kLlxuICAgKiBAcGFyYW0ge251bWJlcn0geDAgWCBjb29yZGluYXRlIG9mIHRoZSBzdGFydCBwb2ludC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHgxIFggY29vcmRpbmF0ZSBvZiB0aGUgZmlyc3QgY29udHJvbCBwb2ludC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHgyIFggY29vcmRpbmF0ZSBvZiB0aGUgc2Vjb25kIGNvbnRyb2wgcG9pbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MyBYIGNvb3JkaW5hdGUgb2YgdGhlIGVuZCBwb2ludC5cbiAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgY29tcHV0ZWQgY29vcmRpbmF0ZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0YXRpYyBnZXRQb2ludFhfKHQsIHgwLCB4MSwgeDIsIHgzKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlIHN0YXJ0IGFuZCBlbmQuXG4gICAgaWYgKHQgPT0gMCkge1xuICAgICAgcmV0dXJuIHgwO1xuICAgIH0gZWxzZSBpZiAodCA9PSAxKSB7XG4gICAgICByZXR1cm4geDM7XG4gICAgfVxuXG4gICAgLy8gU3RlcCBvbmUgLSBmcm9tIDQgcG9pbnRzIHRvIDNcbiAgICBsZXQgaXgwID0gQmV6aWVyLmxlcnBfKHgwLCB4MSwgdCk7XG4gICAgbGV0IGl4MSA9IEJlemllci5sZXJwXyh4MSwgeDIsIHQpO1xuICAgIGNvbnN0IGl4MiA9IEJlemllci5sZXJwXyh4MiwgeDMsIHQpO1xuXG4gICAgLy8gU3RlcCB0d28gLSBmcm9tIDMgcG9pbnRzIHRvIDJcbiAgICBpeDAgPSBCZXppZXIubGVycF8oaXgwLCBpeDEsIHQpO1xuICAgIGl4MSA9IEJlemllci5sZXJwXyhpeDEsIGl4MiwgdCk7XG5cbiAgICAvLyBGaW5hbCBzdGVwIC0gbGFzdCBwb2ludFxuICAgIHJldHVybiBCZXppZXIubGVycF8oaXgwLCBpeDEsIHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSBjdXJ2ZSdzIFkgY29vcmRpbmF0ZSBhdCBhIHBvaW50IGJldHdlZW4gMCBhbmQgMS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHQgVGhlIHBvaW50IG9uIHRoZSBjdXJ2ZSB0byBmaW5kLlxuICAgKiBAcGFyYW0ge251bWJlcn0geTAgWSBjb29yZGluYXRlIG9mIHRoZSBzdGFydCBwb2ludC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHkxIFkgY29vcmRpbmF0ZSBvZiB0aGUgZmlyc3QgY29udHJvbCBwb2ludC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHkyIFkgY29vcmRpbmF0ZSBvZiB0aGUgc2Vjb25kIGNvbnRyb2wgcG9pbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MyBZIGNvb3JkaW5hdGUgb2YgdGhlIGVuZCBwb2ludC5cbiAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgY29tcHV0ZWQgY29vcmRpbmF0ZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0YXRpYyBnZXRQb2ludFlfKHQsIHkwLCB5MSwgeTIsIHkzKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlIHN0YXJ0IGFuZCBlbmQuXG4gICAgaWYgKHQgPT0gMCkge1xuICAgICAgcmV0dXJuIHkwO1xuICAgIH0gZWxzZSBpZiAodCA9PSAxKSB7XG4gICAgICByZXR1cm4geTM7XG4gICAgfVxuXG4gICAgLy8gU3RlcCBvbmUgLSBmcm9tIDQgcG9pbnRzIHRvIDNcbiAgICBsZXQgaXkwID0gQmV6aWVyLmxlcnBfKHkwLCB5MSwgdCk7XG4gICAgbGV0IGl5MSA9IEJlemllci5sZXJwXyh5MSwgeTIsIHQpO1xuICAgIGNvbnN0IGl5MiA9IEJlemllci5sZXJwXyh5MiwgeTMsIHQpO1xuXG4gICAgLy8gU3RlcCB0d28gLSBmcm9tIDMgcG9pbnRzIHRvIDJcbiAgICBpeTAgPSBCZXppZXIubGVycF8oaXkwLCBpeTEsIHQpO1xuICAgIGl5MSA9IEJlemllci5sZXJwXyhpeTEsIGl5MiwgdCk7XG5cbiAgICAvLyBGaW5hbCBzdGVwIC0gbGFzdCBwb2ludFxuICAgIHJldHVybiBCZXppZXIubGVycF8oaXkwLCBpeTEsIHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdmFsdWVzIGEgYW5kIGIuIFJldHVybnMgdGhlIHZhbHVlXG4gICAqIGJldHdlZW4gYSBhbmQgYiBwcm9wb3J0aW9uYWwgdG8geCAod2hlbiB4IGlzIGJldHdlZW4gMCBhbmQgMS4gV2hlbiB4IGlzXG4gICAqIG91dHNpZGUgdGhpcyByYW5nZSwgdGhlIHJldHVybiB2YWx1ZSBpcyBhIGxpbmVhciBleHRyYXBvbGF0aW9uKS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGEgQSBudW1iZXIuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiIEEgbnVtYmVyLlxuICAgKiBAcGFyYW0ge251bWJlcn0geCBUaGUgcHJvcG9ydGlvbiBiZXR3ZWVuIGEgYW5kIGIuXG4gICAqIEByZXR1cm4ge251bWJlcn0gVGhlIGludGVycG9sYXRlZCB2YWx1ZSBiZXR3ZWVuIGEgYW5kIGIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzdGF0aWMgbGVycF8oYSwgYiwgeCkge1xuICAgIHJldHVybiBhICsgeCAqIChiIC0gYSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGNvbGxlY3Rpb24gb2YgY29tbW9uIGN1cnZlcy5cbiAqIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvdGltaW5nLWZ1bmN0aW9uXG4gKiBAZW51bSB7IUN1cnZlRGVmfVxuICovXG5leHBvcnQgY29uc3QgQ3VydmVzID0ge1xuICAvKipcbiAgICogbGluZWFyXG4gICAqIEBwYXJhbSB7IU5vcm1UaW1lRGVmfSB4VmFsXG4gICAqIEByZXR1cm4geyFOb3JtVGltZURlZn1cbiAgICovXG4gIExJTkVBUih4VmFsKSB7XG4gICAgcmV0dXJuIHhWYWw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIGVhc2VcbiAgICogQHBhcmFtIHshTm9ybVRpbWVEZWZ9IHhWYWxcbiAgICogQHJldHVybiB7IU5vcm1UaW1lRGVmfVxuICAgKi9cbiAgRUFTRSh4VmFsKSB7XG4gICAgcmV0dXJuIEJlemllci5zb2x2ZVlWYWx1ZUZyb21YVmFsdWUoeFZhbCwgMCwgMCwgMC4yNSwgMC4xLCAwLjI1LCAxLjAsIDEsIDEpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBlYXNlLWluOiBzbG93IG91dCwgZmFzdCBpblxuICAgKiBAcGFyYW0geyFOb3JtVGltZURlZn0geFZhbFxuICAgKiBAcmV0dXJuIHshTm9ybVRpbWVEZWZ9XG4gICAqL1xuICBFQVNFX0lOKHhWYWwpIHtcbiAgICByZXR1cm4gQmV6aWVyLnNvbHZlWVZhbHVlRnJvbVhWYWx1ZSh4VmFsLCAwLCAwLCAwLjQyLCAwLjAsIDEuMCwgMS4wLCAxLCAxKTtcbiAgfSxcblxuICAvKipcbiAgICogZWFzZS1vdXQ6IGZhc3Qgb3V0LCBzbG93IGluXG4gICAqIEBwYXJhbSB7IU5vcm1UaW1lRGVmfSB4VmFsXG4gICAqIEByZXR1cm4geyFOb3JtVGltZURlZn1cbiAgICovXG4gIEVBU0VfT1VUKHhWYWwpIHtcbiAgICByZXR1cm4gQmV6aWVyLnNvbHZlWVZhbHVlRnJvbVhWYWx1ZSh4VmFsLCAwLCAwLCAwLjAsIDAuMCwgMC41OCwgMS4wLCAxLCAxKTtcbiAgfSxcblxuICAvKipcbiAgICogZWFzZS1pbi1vdXRcbiAgICogQHBhcmFtIHshTm9ybVRpbWVEZWZ9IHhWYWxcbiAgICogQHJldHVybiB7IU5vcm1UaW1lRGVmfVxuICAgKi9cbiAgRUFTRV9JTl9PVVQoeFZhbCkge1xuICAgIHJldHVybiBCZXppZXIuc29sdmVZVmFsdWVGcm9tWFZhbHVlKHhWYWwsIDAsIDAsIDAuNDIsIDAuMCwgMC41OCwgMS4wLCAxLCAxKTtcbiAgfSxcbn07XG5cbi8qKlxuICogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgIUN1cnZlRGVmPn1cbiAqL1xuY29uc3QgTkFNRV9NQVAgPSB7XG4gICdsaW5lYXInOiBDdXJ2ZXMuTElORUFSLFxuICAnZWFzZSc6IEN1cnZlcy5FQVNFLFxuICAnZWFzZS1pbic6IEN1cnZlcy5FQVNFX0lOLFxuICAnZWFzZS1vdXQnOiBDdXJ2ZXMuRUFTRV9PVVQsXG4gICdlYXNlLWluLW91dCc6IEN1cnZlcy5FQVNFX0lOX09VVCxcbn07XG5cbi8qKlxuICogSWYgdGhlIGFyZ3VtZW50IGlzIGEgc3RyaW5nLCB0aGlzIG1ldGhvZHMgbWF0Y2hlcyBhbiBleGlzdGluZyBjdXJ2ZSBieSBuYW1lLlxuICogQHBhcmFtIHs/Q3VydmVEZWZ8c3RyaW5nfHVuZGVmaW5lZH0gY3VydmVcbiAqIEByZXR1cm4gez9DdXJ2ZURlZn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnZlKGN1cnZlKSB7XG4gIGlmICghY3VydmUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoaXNTdHJpbmcoY3VydmUpKSB7XG4gICAgY3VydmUgPSAvKiogQHR5cGUge3N0cmluZ30gKi8gKGN1cnZlKTtcbiAgICAvLyBJZiB0aGUgY3VydmUgaXMgYSBjdXN0b20gY3ViaWMtYmV6aWVyIGN1cnZlXG4gICAgaWYgKGN1cnZlLmluZGV4T2YoJ2N1YmljLWJlemllcicpICE9IC0xKSB7XG4gICAgICBjb25zdCBtYXRjaCA9IGN1cnZlLm1hdGNoKC9jdWJpYy1iZXppZXJcXCgoLispXFwpLyk7XG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gbWF0Y2hbMV0uc3BsaXQoJywnKS5tYXAocGFyc2VGbG9hdCk7XG4gICAgICAgIGlmICh2YWx1ZXMubGVuZ3RoID09IDQpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgaWYgKGlzTmFOKHZhbHVlc1tpXSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBiZXppZXJDdXJ2ZSh2YWx1ZXNbMF0sIHZhbHVlc1sxXSwgdmFsdWVzWzJdLCB2YWx1ZXNbM10pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIE5BTUVfTUFQW2N1cnZlXTtcbiAgfVxuICByZXR1cm4gLyoqIEB0eXBlIHshQ3VydmVEZWZ9ICovIChjdXJ2ZSk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/core/data-structures/curve.js