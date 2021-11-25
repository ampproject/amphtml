/** @externs */

/** @const */
var BentoGptDef = {};

/**
 * @typedef {{
 *   adUnitPath: (string),
 *   fallback: (?PreactDef.Renderable),
 *   optDiv: (string|undefined),
 *   size: (!Array<!Array<number>>|undefined),
 *   targeting: (!Array<!Array<string>>|undefined),
 * }}
 */
BentoGptDef.Props;

/** @interface */
BentoGptDef.Api = class {
  /**
   * Display current ad slot
   */
  display() {}

  /**
   * Display current ad slot
   */
  refresh() {}
};
