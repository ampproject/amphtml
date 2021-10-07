import {cssParser as parser} from '#build/parsers/css-expr-impl';

/**
 * @param {string} cssString
 * @return {?./css-expr-ast.CssNode}
 */
export function parseCss(cssString) {
  return parser.parse(cssString);
}
