/** @externs */

/** @const */
var SidebarDef = {};

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
SidebarDef.SidebarProps;

/**
 * @typedef {{
 *   toolbar: (string|undefined),
 *   toolbarTarget: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
SidebarDef.SidebarToolbarProps;

/**
 * @typedef {{
 *   domElement: (!Element),
 *   toolbar: (string|undefined),
 *   toolbarTarget: (string|undefined),
 * }}
 */
SidebarDef.ToolbarShimProps;

/** @interface */
SidebarDef.SidebarApi = class {
  /** Open the sidebar */
  open() {}

  /** Close the sidebar */
  close() {}

  /** Toggle the sidebar open or closed */
  toggle() {}
};
