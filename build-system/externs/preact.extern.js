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
