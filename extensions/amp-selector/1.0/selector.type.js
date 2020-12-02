/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @externs */

/** @const */
var SelectorDef = {};

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
SelectorDef.Props;

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
SelectorDef.OptionProps;

/**
 * @typedef {{
 *   disabled: (boolean|undefined),
 *   focusRef: ({current: {active: *, focusMap: !Object}),
 *   keyboardSelectMode: (string|undefined),
 *   multiple: (boolean|undefined),
 *   optionsRef: ({current: !Array<*>}),
 *   selected: (!Array|undefined),
 *   selectOption: (function(*):undefined|undefined),
 * }}
 */
SelectorDef.ContextProps;

/** @interface */
SelectorDef.SelectorApi = class {
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
