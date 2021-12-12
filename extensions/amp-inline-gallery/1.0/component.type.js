/** @externs */

/** @const */
var BentoInlineGalleryDef = {};

/**
 * @typedef {{
 *   arrowNext: (?PreactDef.VNode|undefined),
 *   arrowPrev: (?PreactDef.VNode|undefined),
 *   children: (!PreactDef.Renderable),
 *   loop: (boolean|undefined),
 *   onSlideChange: (function(number):undefined|undefined),
 * }}
 */
BentoInlineGalleryDef.Props;

/**
 * @typedef {{
 *   current: number,
 *   height: (number|undefined),
 *   inset: (boolean|undefined),
 *   goTo: (function(number):undefined),
 *   children: !Array<PreactDef.Renderable>
 * }}
 */
BentoInlineGalleryDef.PaginationProps;

/**
 * Note that aspectRatio is expressed in terms of width/height.
 * @typedef {{
 *   aspectRatio: number,
 *   loop: (boolean|undefined),
 *   children: !Array<PreactDef.Renderable>
 * }}
 */
BentoInlineGalleryDef.ThumbnailProps;

/**
 * @typedef {{
 *   children: !Array<PreactDef.Renderable>,
 *   style: (!Object|undefined),
 * }}
 */
BentoInlineGalleryDef.SlideProps;
