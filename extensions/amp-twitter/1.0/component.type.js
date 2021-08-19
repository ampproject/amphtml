/** @externs */

/** @const */
var TwitterDef = {};

/**
 * @typedef {{
 *   loading: (string|undefined),
 *   onReadyState: (function(string, *=)|undefined),
 *   requestResize: (function(number):*|undefined),
 *   title: (string|undefined),
 * }}
 */
TwitterDef.Props;

/** @constructor */
TwitterDef.Api = function () {};

/** @type {string} */
TwitterDef.Api.prototype.readyState;
