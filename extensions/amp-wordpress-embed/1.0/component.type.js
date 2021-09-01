/** @externs */

/** @const */
var WordPressEmbedDef = {};

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
WordPressEmbedDef.Props;

/** @constructor */
WordPressEmbedDef.Api = function () {};

/** @type {string} */
WordPressEmbedDef.Api.prototype.readyState;
