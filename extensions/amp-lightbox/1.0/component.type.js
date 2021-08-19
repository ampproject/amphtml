/** @externs */

var LightboxDef = {};

/**
 * @typedef {{
 *   id: (string),
 *   animation: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 *   closeButtonAs: (function():PreactDef.Renderable|undefined),
 *   scrollable: (boolean),
 *   initialOpen: (boolean),
 *   onBeforeOpen: (function():void|undefined),
 *   onAfterOpen: (function():void|undefined),
 *   onAfterClose: (function():void|undefined),
 * }}
 */
LightboxDef.Props;

/**
 * @typedef {{
 *   aria-label: (string),
 *   as: (function():PreactDef.Renderable|undefined),
 *   onClick: function():void,
 * }}
 */
LightboxDef.CloseButtonProps;

/** @interface */
LightboxDef.LightboxApi = class {
  /** Open the lightbox */
  open() {}

  /** Close the lightbox */
  close() {}
};
