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
 *   wrapperTemplate?: function(): PreactDef.Renderable,
 *   loadingTemplate?: function(): PreactDef.Renderable,
 *   errorTemplate?: function(): PreactDef.Renderable,
 * }}
 */
BentoListDef.Props;

/** @interface */
BentoListDef.BentoListApi = class {
  async refresh() {}
};
