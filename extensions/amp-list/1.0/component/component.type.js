/** @externs */

/** @const */
var BentoListDef = {};

/**
 * @typedef {{
 *   src: (string|undefined),
 *   fetchItems?: (function(): Promise<*>),
 *   itemsKey?: string,
 *   maxItems?: number,
 *   resetOnRefresh?: boolean,
 *   loadMore?: 'manual' | 'none' | 'auto',
 *   loadMoreBookmark?: string,
 *   viewportBuffer?: number,
 *   template?: function(): PreactDef.Renderable,
 *   wrapper?: function(): PreactDef.Renderable,
 *   loading?: function(): PreactDef.Renderable,
 *   error?: function(): PreactDef.Renderable,
 * }}
 */
BentoListDef.Props;

/** @interface */
BentoListDef.BentoListApi = class {
  async refresh() {}
};
