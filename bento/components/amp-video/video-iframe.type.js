/** @externs */

/** @const */
var VideoIframeDef = {};

/**
 * @mixin VideoWrapperDef.props
 * @typedef {{
 *   loading: (string|undefined),
 *   unloadOnPause: (boolean|undefined),
 *   sandbox: (string|undefined),
 *   origin: (RegExp|undefined),
 *   onMessage: function(!MessageEvent),
 *   makeMethodMessage: function(string):(!Object|string),
 *   onIframeLoad: (function(!Event)|undefined),
 * }}
 */
VideoIframeDef.Props;
