/** @externs */

/** @const */
var EmbedlyCardDef = {};

/**
 * @typedef {{
 *   onLoad: (function():undefined|undefined),
 *   requestResize: (function(number):*|undefined),
 *   title: (string|undefined),
 *   url: (string),
 * }}
 */
EmbedlyCardDef.Props;

/**
 * @typedef {{
 *   apiKey: (string|undefined),
 * }}
 */
EmbedlyCardDef.EmbedlyContext;
