/** @externs */

/** @const */
var BentoBeopinionDef = {};

/**
 * @typedef {{
 *   account: (string|undefined),
 *   content: (string|undefined),
 *   myContent: (string|undefined),
 *   loading: (string|undefined),
 *   name: (string|undefined),
 *   onLoad: (function():undefined|undefined),
 *   onReadyState: (function(string, *=)|undefined),
 *   requestResize: (function(number):*|undefined),
 *   title: (string|undefined),
 * }}
 */
BentoBeopinionDef.Props;

/** @constructor */
BentoBeopinionDef.Api = function () {};

/** @type {string} */
BentoBeopinionDef.Api.prototype.readyState;
