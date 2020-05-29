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

/**
 * @typedef {
 *   key: string,
 *   type: (!Object|undefined),
 *   calc: !ContextCalcDef,
 * }
 * @template T
 */
export let ContextPropDef;

/**
 * @typedef {
 *   recursive: (boolean|undefined),
 *   deps: (!Array<!ContextPropDef>|undefined),
 *   compute: (function():(T|!Promise<T>)|undefined),
 *   rootDefault: (T|undefined),
 *   rootFactory: (function(!ContextNode):(T|!Promise<T>)|undefined),
 * }
 * @template T
 */
export let ContextCalcDef;

const DEFAULT_CALC = {
  recursive: false,
};

/**
 * @param {string|!ContextCalcDef} keyOrSpec
 * @param {!ContextCalcDef<T>=} opt_calc
 * @return {!ContextPropDef<T>}
 * @template T
 */
export function contextProp(keyOrSpec, opt_calc) {
  const spec =
    typeof keyOrSpec == 'string' ?
    {key: keyOrSpec, type: null} :
    keyOrSpec;
  return {
    ...spec,
    calc: contextCalc(opt_calc ?? keyOrSpec.calc),
  };
}

/**
 * @param {!ContextCalcDef<T>=} spec
 * @return {!ContextCalcDef<T>}
 * @template T
 */
export function contextCalc(spec) {
  return {
    ...DEFAULT_CALC,
    ...spec,
  };
}
