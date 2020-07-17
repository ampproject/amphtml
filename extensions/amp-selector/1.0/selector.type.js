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

// TODO(#29293): Make "as" and "role" optional.

/** @const */
var SelectorDef = {};

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent),
 *   disabled: (boolean|undefined),
 *   value: (!Array|undefined),
 *   multiple: (boolean|undefined),
 *   onChange: (?function({value: !Array, option: *})|undefined),
 *   role: string,
 *   children: (?PreactDef.Renderable|undefined),
 * }}
 */
SelectorDef.Props;

/**
 * @typedef {{
 *   domElement: !Element,
 *   disabled: (boolean|undefined),
 *   multiple: (boolean|undefined),
 *   role: string,
 * }}
 */
SelectorDef.ShimProps;

/**
 * @typedef {{
 *   as: (string|PreactDef.FunctionalComponent),
 *   option: *,
 *   disabled: (boolean|undefined),
 *   onClick: (?function(!Event)|undefined),
 *   role: string,
 *   style: (!Object|undefined),
 * }}
 */
SelectorDef.OptionProps;

/**
 * @typedef {{
 *   domElement: !Element,
 *   onClick: (?function(!Event)|undefined),
 *   selected: (boolean|undefined),
 *   isDisabled: (boolean|undefined),
 *   role: string,
 * }}
 */
SelectorDef.OptionShimProps;
