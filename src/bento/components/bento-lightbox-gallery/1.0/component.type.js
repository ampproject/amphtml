/** @externs */

/** @const */
var BentoLightboxGalleryDef = {};

/**
 * @typedef {{
 *   children: (PreactDef.Renderable),
 *   onBeforeOpen: (function():void|undefined),
 *   onAfterOpen: (function():void|undefined),
 *   onAfterClose: (function():void|undefined),
 *   onViewGrid: (function():void|undefined),
 *   onToggleCaption: (function():void|undefined),
 *   render: (function():PreactDef.Renderable|undefined),
 * }}
 */
BentoLightboxGalleryDef.Props;

/**
 * @typedef {{
 *   as: (string|undefined),
 *   children: (!PreactDef.Renderable),
 *   enableActivation: (boolean|undefined),
 *   onClick: (function(Event)|undefined),
 *   render: (function():PreactDef.Renderable),
 * }}
 */
BentoLightboxGalleryDef.WithBentoLightboxGalleryProps;

/**
 * @typedef {{
 *   deregister: (function(string):undefined),
 *   register: (function(string, Element):undefined),
 *   open: (function():undefined),
 * }}
 */
BentoLightboxGalleryDef.ContextProps;
