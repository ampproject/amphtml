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

/**
 * Returns true whenever `amp dist` is called with `--esm`.
 * @return {boolean}
 */
export function isEsmMode() {
  // IS_ESM is replaced with true when `amp dist` is called with the --esm flag.
  // TODO(rcebulko): Refactor transformers to handle this the same way as the
  // IS_MINIFIED/IS_FORTESTING constants (or vice versa). Until then, it needs
  // to be used as a variable, not a declaration.
  return IS_ESM;
}
