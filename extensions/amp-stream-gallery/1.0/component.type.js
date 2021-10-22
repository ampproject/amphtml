/** @externs */

/** @const */
var BentoStreamGalleryDef = {};

/**
 * @typedef {{
 *   arrowNext: (?PreactDef.VNode|undefined),
 *   arrowPrev: (?PreactDef.VNode|undefined),
 *   children: (!PreactDef.Renderable),
 *   controls: (string|undefined),
 *   extraSpace: (string|undefined),
 *   loop: (boolean|undefined),
 *   maxItemWidth: (number|undefined),
 *   minItemWidth: (number|undefined),
 *   maxVisibleCount: (number|undefined),
 *   minVisibleCount: (number|undefined),
 *   onSlideChange: (function(number):undefined|undefined),
 *   outsetArrows: (boolean|undefined),
 *   peek: (number|undefined),
 *   slideAlign: (string|undefined),
 *   snap: (boolean|undefined)
 * }}
 */
BentoStreamGalleryDef.Props;

/**
 * @typedef {{
 *   advance: (function(number):undefined|undefined),
 *   customArrow: (PreactDef.VNode|undefined),
 *   by: number,
 *   disabled: (boolean|undefined),
 *   outsetArrows: (boolean|undefined)
 * }}
 */
BentoStreamGalleryDef.ArrowProps;
