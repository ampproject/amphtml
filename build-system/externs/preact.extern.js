/** @externs */

/** @const */
var PreactDef = {};

/**
 * @typedef {function(?):PreactDef.Renderable}
 */
PreactDef.FunctionalComponent;

/**
 * @interface
 */
PreactDef.VNode = function () {};

/**
 * @interface
 * @template T
 */
PreactDef.Context = function () {};

/**
 * @param {{value: T, children: (?PreactDef.Renderable|undefined)}} props
 * @return {PreactDef.Renderable}
 */
PreactDef.Context.prototype.Provider = function (props) {};

/**
 * @interface
 */
PreactDef.Context.prototype.Consumer = function () {};

/**
 * @typedef {string|number|boolean|null|undefined}
 */
PreactDef.SimpleRenderable;

/**
 * @typedef {PreactDef.SimpleRenderable|!PreactDef.VNode|!Array<PreactDef.SimpleRenderable|!PreactDef.VNode|!Array<PreactDef.SimpleRenderable|!PreactDef.VNode>>}
 */
PreactDef.Renderable;

/**
 * @typedef {{__html: ?string}}
 */
PreactDef.InnerHTML;
