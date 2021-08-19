/** @externs */

/** @const */
var AmpContextDef = {};

/**
 * @typedef {{
 *   renderable: boolean,
 *   playable: boolean,
 *   loading: string,
 *   notify: (function()|undefined),
 * }}
 */
AmpContextDef.ContextType;

/**
 * @typedef {{
 *   renderable: (boolean|undefined),
 *   playable: (boolean|undefined),
 *   loading: (string|undefined),
 *   notify: (function()|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
AmpContextDef.ProviderProps;
