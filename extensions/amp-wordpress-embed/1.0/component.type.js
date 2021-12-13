/** @externs */

/** @const */
var BentoWordPressEmbedDef = {};

/**
 * @typedef {{
 *   url: string,
 *   title: (string|undefined),
 *   requestResize: (function(number):*|undefined),
 *   loading: (string|undefined),
 *   onReadyState: (function(string, *=)|undefined),
 *   onLoad: (function():undefined|undefined),
 * }}
 */
BentoWordPressEmbedDef.Props;

/** @constructor */
BentoWordPressEmbedDef.Api = function () {};

/** @type {string} */
BentoWordPressEmbedDef.Api.prototype.readyState;
