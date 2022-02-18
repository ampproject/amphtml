/** @externs */

/** @const */
var BentoListDef = {};

/**
 * @typedef {{
 *   loadMoreSpinner: string,
 *   loadMoreIcon: string,
 * }}
 */
BentoListDef.CssStyles;

/**
 * @typedef {{
 *   src: (string|undefined),
 *   fetchItems?: (function(): Promise<*>),
 *   itemsKey?: string,
 *   maxItems?: number,
 *   loadMore?: 'manual' | 'none' | 'auto',
 *   loadMoreBookmark?: string,
 *   viewportBuffer?: number,
 *   template?: function(item: *): PreactDef.Renderable,
 *   wrapperTemplate?: function(list: PreactDef.Renderable): PreactDef.Renderable,
 *   loadingTemplate?: function(styles: BentoListDef.CssStyles): PreactDef.Renderable,
 *   loadMoreTemplate?: function(styles: BentoListDef.CssStyles): PreactDef.Renderable,
 *   errorTemplate?: function(styles: BentoListDef.CssStyles): PreactDef.Renderable,
 * }}
 */
BentoListDef.Props;

/** @interface */
BentoListDef.BentoListApi = class {
  async refresh() {}
};
