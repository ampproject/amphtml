/** @externs */

/** @const */
var RenderDef = {};

/**
 * @typedef {{
 *   src: (!string),
 *   getJson: (!Function),
 *   render: (?RendererFunctionType|undefined),
 *   onLoading: (Function),
 *   onReady: (Function),
 *   onRefresh: (Function),
 *   onError: (Function),
 *   ariaLiveValue: (!string)
 * }}
 */
RenderDef.Props;

/** @interface */
RenderDef.RenderApi = class {
  refresh() {}
};
