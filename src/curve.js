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

// Imported just for the side effect of getting the `types` it exports into
// the type system during compile time.
import './time';

/**
 * A CurveDef is a function that returns a normtime value (0 to 1) for another
 * normtime value.
 * @typedef {function(./time.normtimeDef): ./time.normtimeDef}
 */
export let CurveDef;

/**
 * Returns a cubic bezier curve.
 * @param {number} x1 X coordinate of the first control point.
 * @param {number} y1 Y coordinate of the first control point.
 * @param {number} x2 X coordinate of the second control point.
 * @param {number} y2 Y coordinate of the second control point.
 * @return {!CurveDef}
 */
export function bezierCurve(x1, y1, x2, y2) {
  const bezier = new Bezier(0, 0, x1, y1, x2, y2, 1, 1);
  return bezier.solveYValueFromXValue.bind(bezier);
}

/**
 * Thanks to
 * https://closure-library.googlecode.com/git-history/docs/local_closure_goog_math_bezier.js.source.html
 */
class Bezier {
  /**
   * @param {number} x0 X coordinate of the start point.
   * @param {number} y0 Y coordinate of the start point.
   * @param {number} x1 X coordinate of the first control point.
   * @param {number} y1 Y coordinate of the first control point.
   * @param {number} x2 X coordinate of the second control point.
   * @param {number} y2 Y coordinate of the second control point.
   * @param {number} x3 X coordinate of the end point.
   * @param {number} y3 Y coordinate of the end point.
   */
  constructor(x0, y0, x1, y1, x2, y2, x3, y3) {
    /**
     * X coordinate of the first point.
     * @type {number}
     */
    this.x0 = x0;

    /**
     * Y coordinate of the first point.
     * @type {number}
     */
    this.y0 = y0;

    /**
     * X coordinate of the first control point.
     * @type {number}
     */
    this.x1 = x1;

    /**
     * Y coordinate of the first control point.
     * @type {number}
     */
    this.y1 = y1;

    /**
     * X coordinate of the second control point.
     * @type {number}
     */
    this.x2 = x2;

    /**
     * Y coordinate of the second control point.
     * @type {number}
     */
    this.y2 = y2;

    /**
     * X coordinate of the end point.
     * @type {number}
     */
    this.x3 = x3;

    /**
     * Y coordinate of the end point.
     * @type {number}
     */
    this.y3 = y3;
  }

  /**
   * Computes the y coordinate of a point on the curve given its x coordinate.
   * @param {number} xVal The x coordinate of the point on the curve.
   * @return {number} The y coordinate of the point on the curve.
   */
  solveYValueFromXValue(xVal) {
    return this.getPointY(this.solvePositionFromXValue(xVal));
  }

  /**
   * Computes the position t of a point on the curve given its x coordinate.
   * That is, for an input xVal, finds t s.t. getPointX(t) = xVal.
   * As such, the following should always be true up to some small epsilon:
   * t ~ solvePositionFromXValue(getPointX(t)) for t in [0, 1].
   * @param {number} xVal The x coordinate of the point to find on the curve.
   * @return {number} The position t.
   */
  solvePositionFromXValue(xVal) {
    // Desired precision on the computation.
    const epsilon = 1e-6;

    // Initial estimate of t using linear interpolation.
    let t = (xVal - this.x0) / (this.x3 - this.x0);
    if (t <= 0) {
      return 0;
    } else if (t >= 1) {
      return 1;
    }

    // Try gradient descent to solve for t. If it works, it is very fast.
    let tMin = 0;
    let tMax = 1;
    let value = 0;
    for (let i = 0; i < 8; i++) {
      value = this.getPointX(t);
      const derivative = (this.getPointX(t + epsilon) - value) / epsilon;
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
    for (let i = 0; Math.abs(value - xVal) > epsilon && i < 8; i++) {
      if (value < xVal) {
        tMin = t;
        t = (t + tMax) / 2;
      } else {
        tMax = t;
        t = (t + tMin) / 2;
      }
      value = this.getPointX(t);
    }
    return t;
  }

  /**
   * Computes the curve's X coordinate at a point between 0 and 1.
   * @param {number} t The point on the curve to find.
   * @return {number} The computed coordinate.
   */
  getPointX(t) {
    // Special case start and end.
    if (t == 0) {
      return this.x0;
    } else if (t == 1) {
      return this.x3;
    }

    // Step one - from 4 points to 3
    let ix0 = this.lerp(this.x0, this.x1, t);
    let ix1 = this.lerp(this.x1, this.x2, t);
    const ix2 = this.lerp(this.x2, this.x3, t);

    // Step two - from 3 points to 2
    ix0 = this.lerp(ix0, ix1, t);
    ix1 = this.lerp(ix1, ix2, t);

    // Final step - last point
    return this.lerp(ix0, ix1, t);
  }

  /**
   * Computes the curve's Y coordinate at a point between 0 and 1.
   * @param {number} t The point on the curve to find.
   * @return {number} The computed coordinate.
   */
  getPointY(t) {
    // Special case start and end.
    if (t == 0) {
      return this.y0;
    } else if (t == 1) {
      return this.y3;
    }

    // Step one - from 4 points to 3
    let iy0 = this.lerp(this.y0, this.y1, t);
    let iy1 = this.lerp(this.y1, this.y2, t);
    const iy2 = this.lerp(this.y2, this.y3, t);

    // Step two - from 3 points to 2
    iy0 = this.lerp(iy0, iy1, t);
    iy1 = this.lerp(iy1, iy2, t);

    // Final step - last point
    return this.lerp(iy0, iy1, t);
  }

  /**
   * Performs linear interpolation between values a and b. Returns the value
   * between a and b proportional to x (when x is between 0 and 1. When x is
   * outside this range, the return value is a linear extrapolation).
   * @param {number} a A number.
   * @param {number} b A number.
   * @param {number} x The proportion between a and b.
   * @return {number} The interpolated value between a and b.
   */
  lerp(a, b, x) {
    return a + x * (b - a);
  }
}

/**
 * A collection of common curves.
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/timing-function
 * @enum {!CurveDef}
 */
export const Curves = {
  /**
   * linear
   * @param {number} n
   * @return {number}
   */
  LINEAR(n) {
    return n;
  },

  /**
   * ease
   */
  EASE: bezierCurve(0.25, 0.1, 0.25, 1.0),

  /**
   * ease-in: slow out, fast in
   */
  EASE_IN: bezierCurve(0.42, 0.0, 1.0, 1.0),

  /**
   * ease-out: fast out, slow in
   */
  EASE_OUT: bezierCurve(0.0, 0.0, 0.58, 1.0),

  /**
   * ease-in-out
   */
  EASE_IN_OUT: bezierCurve(0.42, 0.0, 0.58, 1.0),
};

/**
 * @const {!Object<string, !CurveDef>}
 */
const NAME_MAP = {
  'linear': Curves.LINEAR,
  'ease': Curves.EASE,
  'ease-in': Curves.EASE_IN,
  'ease-out': Curves.EASE_OUT,
  'ease-in-out': Curves.EASE_IN_OUT,
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
  if (typeof curve == 'string') {
    // If the curve is a custom cubic-bezier curve
    if (curve.indexOf('cubic-bezier') != -1) {
      const match = curve.match(/cubic-bezier\((.+)\)/);
      if (match) {
        const values = match[1].split(',').map(parseFloat);
        if (values.length == 4) {
          for (let i = 0; i < 4; i++) {
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
  return curve;
}
