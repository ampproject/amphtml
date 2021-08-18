

/** @externs */

/** @const */
var BaseCarouselDef = {};

/**
 * @typedef {{
 *   advanceCount: (number|undefined),
 *   arrowNext: (?PreactDef.VNode|undefined),
 *   arrowPrev: (?PreactDef.VNode|undefined),
 *   autoAdvance: (boolean|undefined),
 *   autoAdvanceCount: (number|undefined),
 *   autoAdvanceInterval: (number|undefined),
 *   autoAdvanceLoops: (number|undefined),
 *   children: (!PreactDef.Renderable),
 *   controls: (string|undefined),
 *   defaultSlide: (number|undefined),
 *   loop: (boolean|undefined),
 *   mixedLength: (boolean|undefined),
 *   onSlideChange: (function(number):undefined|undefined),
 *   orientation: (string|undefined),
 *   snap: (boolean|undefined),
 *   snapAlign: (string|undefined),
 *   snapBy: (number|undefined),
 *   visibleCount: (number|undefined),
 * }}
 */
BaseCarouselDef.Props;

/**
 * @typedef {{
 *   advanceCount: (number|undefined),
 *   axis: number,
 *   children: !Array<PreactDef.Renderable>,
 *   loop: (boolean|undefined),
 *   mixedLength: (boolean|undefined),
 *   restingIndex: number,
 *   setRestingIndex: (function(number):undefined),
 *   snap: (boolean|undefined),
 *   snapAlign: (string|undefined),
 *   snapBy: (number|undefined),
 *   visibleCount: (number|undefined),
 * }}
 */
BaseCarouselDef.ScrollerProps;

/**
 * @typedef {{
 *   alt: (string|undefined),
 *   children: !Array<PreactDef.Renderable>,
 *   loop: (boolean|undefined),
 *   mixedLength: (boolean|undefined),
 *   offsetRef: {current: (null|number)},
 *   pivotIndex: number,
 *   restingIndex: number,
 *   snap: (boolean|undefined),
 *   snapBy: (number|undefined),
 *   src: (string|undefined),
 *   thumbnailSrc: (string|undefined),
 *   visibleCount: (number|undefined),
 * }}
 */
BaseCarouselDef.SlideProps;

/**
 * @typedef {{
 *   advance: (function():undefined|undefined),
 *   customArrow: (PreactDef.VNode|undefined),
 *   by: number,
 *   disabled: (boolean|undefined),
 *   outsetArrows: (boolean|undefined),
 * }}
 */
BaseCarouselDef.ArrowProps;

/**
 * @typedef {{
 *   currentSlide: (number|undefined),
 *   setCurrentSlide: (function(number):undefined),
 *   slides: !Array<BaseCarouselDef.SlideProps>,
 *   setSlides: (function(Array):undefined),
 * }}
 */
BaseCarouselDef.ContextProps;

/** @interface */
BaseCarouselDef.CarouselApi = class {
  /**
   * @param {number} index
   */
  goToSlide(index) {}

  /** Advance slides forward by `advanceCount` */
  next() {}

  /** Advance slides backward by `advanceCount` */
  prev() {}
};
