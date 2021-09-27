/** @externs */

/** @const */
var BentoSidebarDef = {};

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent|undefined),
 *   side: (string|undefined),
 *   onBeforeOpen: (function():void|undefined),
 *   onAfterOpen: (function():void|undefined),
 *   onAfterClose: (function():void|undefined),
 *   backdropStyle: (?Object|undefined),
 *   backdropClassName: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
BentoSidebarDef.Props;

/**
 * @typedef {{
 *   toolbar: (string|undefined),
 *   toolbarTarget: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
BentoSidebarDef.BentoSidebarToolbarProps;

/**
 * @typedef {{
 *   domElement: (!Element),
 *   toolbar: (string|undefined),
 *   toolbarTarget: (string|undefined),
 * }}
 */
BentoSidebarDef.ToolbarShimProps;

/** @interface */
BentoSidebarDef.Api = class {
  /** Open the sidebar */
  open() {}

  /** Close the sidebar */
  close() {}

  /** Toggle the sidebar open or closed */
  toggle() {}
};
