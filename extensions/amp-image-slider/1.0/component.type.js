/** @externs */

/** @const */
var BentoImageSliderDef = {};

/**
 * @typedef {{
 *   initialPosition: (string|undefined),
 *   displayHintOnce: (boolean|undefined),
 *   stepSize: (number),
 * }}
 */
BentoImageSliderDef.Props;

/** @interface */
BentoImageSliderDef.Api = class {
  /**
   * Seeks Bar to specified percentage in slider.
   * 0-49 for right side image, 50 for both image (as half) and 51-100 for left side image.
   * @param {number} percent Percentage to seek
   */
  seekTo(percent = 50) {}
};
