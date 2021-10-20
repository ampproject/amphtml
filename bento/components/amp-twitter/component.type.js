/** @externs */

/** @const */
var BentoTwitterDef = {};

/**
 * @typedef {{
 *   loading: (string|undefined),
 *   onReadyState: (function(string, *=)|undefined),
 *   requestResize: (function(number):*|undefined),
 *   title: (string|undefined),
 *   onLoad: (function():undefined|undefined),
 * }}
 */
BentoTwitterDef.Props;

/** @constructor */
BentoTwitterDef.Api = function () {};

/** @type {string} */
BentoTwitterDef.Api.prototype.readyState;
