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

import {devAssert} from '../core/assert';

// typedef imports
import {ContextPropDef} from './prop.type';

const EMPTY_DEPS = [];

/**
 * Creates the `ContextPropDef` type.
 *
 * @param {string} key
 * @param {{
 *   type: (!Object|undefined),
 *   deps: (!Array<!ContextPropDef>|undefined),
 *   recursive: (boolean|(function(!Array<T>):boolean)|undefined),
 *   compute: (function(!Node, !Array<T>, ...*):(T|undefined)),
 *   defaultValue: (T|undefined),
 * }=} opt_spec
 * @return {!ContextPropDef<T>}
 * @template T
 */
export function contextProp(key, opt_spec) {
  const prop = /** @type {!ContextPropDef} */ ({
    key,
    // Default values.
    type: null,
    deps: EMPTY_DEPS,
    recursive: false,
    compute: null,
    defaultValue: undefined,
    // Overrides.
    ...opt_spec,
  });
  devAssert(prop.deps.length == 0 || prop.compute);
  return prop;
}
