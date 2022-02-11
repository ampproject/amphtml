/** @externs */

/** @const */
var BentoPanZoomDef = {};

/**
 * @typedef {{
 *   children: (?PreactDef.Renderable|undefined),
 *   controls: (boolean|undefined),
 *   initialScale: (number|undefined),
 *   initialX: (number|undefined),
 *   initialY: (number|undefined),
 *   maxScale: (number|undefined),
 *   onTransformEnd: (function(number, number, number):undefined),
 *   resetOnResize: (boolean|undefined),
 * }}
 */
BentoPanZoomDef.Props;

/** @interface */
BentoPanZoomDef.PanZoomApi = class {
  /**
   * @param {number} scale
   * @param {number} x
   * @param {number} y
   */
  transform(scale, x, y) {}
};
