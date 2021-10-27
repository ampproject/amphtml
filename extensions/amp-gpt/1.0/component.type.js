/** @externs */

/** @const */
var BentoGptDef = {};

/**
 * @typedef {{
 *   adUnitPath: (string),
 *   optDiv: (string|undefined),
 *   size: (!Array<!Array<number>>|undefined),
 *   targeting: (!Array<!Array<string>>|undefined),
 * }}
 */
BentoGptDef.Props;

/** @interface */
BentoGptDef.BentoGptApi = class {
  /** Example: API method to toggle the component */
  exampleToggle() {} // DO NOT SUBMIT
};
