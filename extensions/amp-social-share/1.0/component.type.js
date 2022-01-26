/** @externs */

/** @const */
var BentoSocialShareDef = {};

/**
 * @typedef {{
 *   type: (string),
 *   endpoint: (string|undefined),
 *   params: (JsonObject|Object|undefined),
 *   target: (string|undefined),
 *   width: (number|string|undefined),
 *   height: (number|string|undefined),
 *   color: (string|undefined),
 *   background: (string|undefined),
 *   tabindex: (number|string|undefined),
 *   tabIndex: (number|string|undefined),
 *   style: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 * (We support tabindex and tabIndex equally, see tabindexFromProps())
 */
BentoSocialShareDef.Props;
