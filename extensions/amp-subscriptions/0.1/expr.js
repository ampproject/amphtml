import {evaluateAccessExpr} from '../../amp-access/0.1/access-expr';

/**
 * @param {string} expr
 * @param {!JsonObject} data
 * @return {boolean}
 */
export function evaluateExpr(expr, data) {
  return evaluateAccessExpr(expr, data);
}
