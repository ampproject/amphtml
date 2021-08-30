/** @externs */

/** @const */
var InstagramDef = {};

/**
 * @typedef {{
 *   shortcode: string,
 *   captioned: (boolean|undefined),
 *   title: (string|undefined),
 *   requestResize: (function(number):*|undefined),
 *   loading: (string|undefined),
 *   onReadyState: (function(string, *=)|undefined),
 * }}
 */
InstagramDef.Props;

/** @constructor */
InstagramDef.Api = function () {};

/** @type {string} */
InstagramDef.Api.prototype.readyState;
