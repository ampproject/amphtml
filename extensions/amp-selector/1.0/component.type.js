/** @externs */

/** @const */
var BentoSelectorDef = {};

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent|undefined),
 *   disabled: (boolean|undefined),
 *   form: (string|undefined),
 *   shimDomElement: !Element,
 *   value: (!Array|undefined),
 *   multiple: (boolean|undefined),
 *   name: (string|undefined),
 *   onChange: (?function({value: !Array, option: *})|undefined),
 *   role: (string|undefined),
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
BentoSelectorDef.Props;

/**
 * Note: `index` must be a positive integer to use
 * `selectBy`, otherwise it will be noop.
 *
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent),
 *   option: *,
 *   disabled: (boolean|undefined),
 *   shimDomElement: !Element,
 *   index: (number|undefined),
 *   onClick: (?function(!Event)|undefined),
 *   role: (string|undefined),
 *   shimSelected: (boolean|undefined),
 *   style: (!Object|undefined),
 * }}
 */
BentoSelectorDef.OptionProps;

/**
 * @typedef {{
 *   disabled: (boolean|undefined),
 *   focusRef: ({current: {active: *, focusMap: !Object}}),
 *   keyboardSelectMode: (string|undefined),
 *   multiple: (boolean|undefined),
 *   optionsRef: ({current: !Array<*>}),
 *   selected: (!Array|undefined),
 *   selectOption: (function(*):undefined|undefined),
 * }}
 */
BentoSelectorDef.ContextProps;

/** @interface */
BentoSelectorDef.SelectorApi = class {
  clear() {}

  /**
   * @param {*} option
   * @param {boolean|undefined} value
   */
  toggle(option, value) {}

  /**
   * @param {number} delta
   */
  selectBy(delta) {}
};
