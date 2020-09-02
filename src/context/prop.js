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

// import {devAssert} from '../log';

const EMPTY_DEPS = [];

/**
 * Creates the `ContextProp` type.
 *
 * @param {string} key
 * @param {{
 *   type: (!Object|undefined),
 *   deps: (!Array<!ContextProp>|undefined),
 *   recursive: (boolean|(function(!Array<T>):boolean)|undefined),
 *   compute: ((function(!Node, !Array<T>, ...*):(T|undefined))|undefined),
 *   defaultValue: (T|undefined),
 * }=} opt_spec
 * @return {!ContextProp<T>}
 * @template T
 */
export function contextProp(key, opt_spec) {
  const prop = /** @type {!ContextProp<T>} */ ({
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
  // devAssert(prop.deps.length == 0 || prop.compute);
  return prop;
}
