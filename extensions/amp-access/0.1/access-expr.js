import {accessParser as parser} from '#build/parsers/access-expr-impl';

import {hasOwn, map} from '#core/types/object';

/**
 * Evaluates access expressions.
 *
 * The grammar is defined in the `access-expr-impl.jison` and compiled using
 * (Jison)[https://zaach.github.io/jison/] parser. The compilation steps are
 * built into the `amp build` and `amp dist` tasks.
 *
 * Grammar highlights:
 * - Shorthand truthy expressions are allowed, such as `field`. Truthy value
 *   is defined as `X !== null && X !== '' && X !== 0 && X !== false`.
 * - Basic equality expressions: `X = 1`, `X = true`, `X = "A"`. And also,
 *   non-equality: `X != 1` and so on.
 * - Basic comparison expressions only defined for numbers: `X < 1`,
 *   `X >= 10`.
 * - Boolean logic: `X = 1 OR Y = 1`, `X = 1 AND Y = 2`, `NOT X`, `NOT (X = 1)`.
 *
 * @param {string} expr
 * @param {!JsonObject} data
 * @return {boolean}
 */
export function evaluateAccessExpr(expr, data) {
  try {
    parser.yy = data;
    return !!parser.parse(expr);
  } finally {
    parser.yy = null;
  }
}

/**
 * AmpAccessEvaluator evaluates amp-access expressions.
 * It uses a cache to speed up repeated evals for the same expression.
 */
export class AmpAccessEvaluator {
  /** */
  constructor() {
    /** @type {{[key: string]: boolean}} */
    this.cache = null;

    /** @private @type {JsonObject} */
    this.lastData_ = null;
  }

  /**
   * Evaluate access expressions, but turn to a cache first.
   * Cache is invalidated when given new data.
   *
   * @param {string} expr
   * @param {!JsonObject} data
   * @return {boolean}
   */
  evaluate(expr, data) {
    if (this.lastData_ !== data) {
      this.lastData_ = data;
      this.cache = map();
    }

    if (!hasOwn(this.cache, expr)) {
      this.cache[expr] = evaluateAccessExpr(expr, data);
    }

    return this.cache[expr];
  }
}
