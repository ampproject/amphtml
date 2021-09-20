/** @externs */

/** @const */
var ImageSliderDef = {};

/**
 * @typedef {{
 *   initialPosition: (string|undefined),
 *   repeatHint: (boolean|undefined),
 *   stepSize: (number),
 * }}
 */
ImageSliderDef.Props;

/** @interface */
ImageSliderDef.ImageSliderApi = class {
  /**
   * Seeks Bar to specified percentage in slider.
   * 0-49 for right side image, 50 for both image (as half) and 51-100 for left side image.
   * @param {int} percent Percentage to seek
   */
  seekTo(percent = 50) {}
};
