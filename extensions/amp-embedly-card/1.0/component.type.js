/** @externs */

/** @const */
var BentoEmbedlyCardDef = {};

/**
 * @typedef {{
 *   onLoad: (function():undefined|undefined),
 *   requestResize: (function(number):*|undefined),
 *   title: (string|undefined),
 *   url: (string),
 * }}
 */
BentoEmbedlyCardDef.Props;

/**
 * @typedef {{
 *   apiKey: (string|undefined),
 * }}
 */
BentoEmbedlyCardDef.EmbedlyContext;
