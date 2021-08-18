

/** @externs */

/** @const */
var FacebookDef = {};

/**
 * @typedef {{
 *   action: (string|undefined),
 *   colorscheme: (string|undefined),
 *   hideCta: (string|undefined),
 *   hideCover: (string|undefined),
 *   href: (string|undefined),
 *   loading: (string|undefined),
 *   kdSite: (boolean|undefined),
 *   locale: (string|undefined),
 *   layout: (string|undefined),
 *   numPosts: (number|undefined),
 *   orderBy: (string|undefined),
 *   onReadyState: (function(string, *=)|undefined),
 *   refLabel: (string|undefined),
 *   requestResize: (function(number):*|undefined),
 *   share: (boolean|undefined),
 *   showFacepile: (string|undefined),
 *   size: (string|undefined),
 *   smallHeader: (string|undefined),
 *   tabs: (string|undefined),
 *   title: (string|undefined),
 * }}
 */
FacebookDef.Props;

/** @constructor */
FacebookDef.Api = function () {};

/** @type {string} */
FacebookDef.Api.prototype.readyState;
