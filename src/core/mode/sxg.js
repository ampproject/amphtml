/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/** @fileoverview Magic constant that is replaced by babel. */

// IS_SXG is replaced with true when `amp dist` is called with the --sxg flag.
const IS_SXG = false;

/**
 * Returns true whenever `amp dist` is called with `--sxg`. If this is true,
 * isEsmMode() is guaranteed to also be true.
 * @return {boolean}
 */
export function isSxgMode() {
  return IS_SXG;
}
