import {isString} from '#core/types';

/**
 * Number between 0 and 1 that designates normalized time, as in "from start to
 * end".
 * @typedef {number} NormTimeDef
 */

/**
 * A CurveDef is a function that returns a normtime value (0 to 1) for another
 * normtime value.
 * @typedef {function(NormTimeDef): NormTimeDef} CurveDef
 */

/**
 * Returns a cubic bezier curve.
 * @param {number} x1 X coordinate of the first control point.
 * @param {number} y1 Y coordinate of the first control point.
 * @param {number} x2 X coordinate of the second control point.
 * @param {number} y2 Y coordinate of the second control point.
 * @return {CurveDef}
 */
export function bezierCurve(x1, y1, x2, y2) {
  return (xVal) =>
    Bezier.solveYValueFromXValue(xVal, 0, 0, x1, y1, x2, y2, 1, 1);
}

/**
 * Thanks to
 * https://closure-library.googlecode.com/git-history/docs/local_closure_goog_math_bezier.js.source.html
 */
class Bezier {
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
  static solveYValueFromXValue(xVal, x0, y0, x1, y1, x2, y2, x3, y3) {
    return Bezier.getPointY_(
      Bezier.solvePositionFromXValue_(xVal, x0, x1, x2, x3),
      y0,
      y1,
      y2,
      y3
    );
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
  static solvePositionFromXValue_(xVal, x0, x1, x2, x3) {
    // Desired precision on the computation.
    const epsilon = 1e-6;

    // Initial estimate of t using linear interpolation.
    let t = (xVal - x0) / (x3 - x0);
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
      value = Bezier.getPointX_(t, x0, x1, x2, x3);
      const derivative =
        (Bezier.getPointX_(t + epsilon, x0, x1, x2, x3) - value) / epsilon;
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
  static getPointX_(t, x0, x1, x2, x3) {
    // Special case start and end.
    if (t == 0) {
      return x0;
    } else if (t == 1) {
      return x3;
    }

    // Step one - from 4 points to 3
    let ix0 = Bezier.lerp_(x0, x1, t);
    let ix1 = Bezier.lerp_(x1, x2, t);
    const ix2 = Bezier.lerp_(x2, x3, t);

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
  static getPointY_(t, y0, y1, y2, y3) {
    // Special case start and end.
    if (t == 0) {
      return y0;
    } else if (t == 1) {
      return y3;
    }

    // Step one - from 4 points to 3
    let iy0 = Bezier.lerp_(y0, y1, t);
    let iy1 = Bezier.lerp_(y1, y2, t);
    const iy2 = Bezier.lerp_(y2, y3, t);

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
  static lerp_(a, b, x) {
    return a + x * (b - a);
  }
}

/**
 * A collection of common curves.
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/timing-function
 * @enum {CurveDef}
 */
export const Curves_Enum = {
  /**
   * linear
   * @param {NormTimeDef} xVal
   * @return {NormTimeDef}
   */
  LINEAR(xVal) {
    return xVal;
  },

  /**
   * ease
   * @param {NormTimeDef} xVal
   * @return {NormTimeDef}
   */
  EASE(xVal) {
    return Bezier.solveYValueFromXValue(xVal, 0, 0, 0.25, 0.1, 0.25, 1.0, 1, 1);
  },

  /**
   * ease-in: slow out, fast in
   * @param {NormTimeDef} xVal
   * @return {NormTimeDef}
   */
  EASE_IN(xVal) {
    return Bezier.solveYValueFromXValue(xVal, 0, 0, 0.42, 0.0, 1.0, 1.0, 1, 1);
  },

  /**
   * ease-out: fast out, slow in
   * @param {NormTimeDef} xVal
   * @return {NormTimeDef}
   */
  EASE_OUT(xVal) {
    return Bezier.solveYValueFromXValue(xVal, 0, 0, 0.0, 0.0, 0.58, 1.0, 1, 1);
  },

  /**
   * ease-in-out
   * @param {NormTimeDef} xVal
   * @return {NormTimeDef}
   */
  EASE_IN_OUT(xVal) {
    return Bezier.solveYValueFromXValue(xVal, 0, 0, 0.42, 0.0, 0.58, 1.0, 1, 1);
  },
};

/**
 * @type {{[key: string]: CurveDef}}
 * @const
 */
const NAME_MAP = {
  'linear': Curves_Enum.LINEAR,
  'ease': Curves_Enum.EASE,
  'ease-in': Curves_Enum.EASE_IN,
  'ease-out': Curves_Enum.EASE_OUT,
  'ease-in-out': Curves_Enum.EASE_IN_OUT,
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
    curve = /** @type {string} */ (curve);
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
  return /** @type {CurveDef} */ (curve);
}
