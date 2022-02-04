/** @externs */

/** @const */
var BentoInstagramDef = {};

/**
 * @typedef {{
 *   shortcode: string,
 *   captioned: (boolean|undefined),
 *   title: (string|undefined),
 *   requestResize: (function(number):*|undefined),
 *   loading: (string|undefined),
 *   onReadyState: (function(string, *=)|undefined),
 *   onLoad: (function():undefined|undefined),
 * }}
 */
BentoInstagramDef.Props;

/** @constructor */
BentoInstagramDef.Api = function () {};

/** @type {string} */
BentoInstagramDef.Api.prototype.readyState;
