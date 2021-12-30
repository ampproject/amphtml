/** @externs */

/** @const */
var BentoListDef = {};

/**
 * @typedef {{
 *   src: (string|undefined),
 *   fetchItems?: (function(): Promise<*>),
 *   itemsKey?: string,
 *   template?: function(): PreactDef.Renderable,
 *   wrapper?: function(): PreactDef.Renderable,
 *   loading?: function(): PreactDef.Renderable,
 *   error?: function(): PreactDef.Renderable,
 * }}
 */
BentoListDef.Props;

/** @interface */
BentoListDef.BentoListApi = class {};
