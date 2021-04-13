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

let resolved;

/**
 * Returns a cached resolved promise.
 * Use this instead of directly calling Promise.resolve().
 * @return {!Promise<undefined>}
 */
export function resolvedPromise() {
  if (resolved) {
    return resolved;
  }

  // It's important that we call with `undefined` here, to prevent a transform
  // recursion. If we didn't pass an arg, then the transformer would replace
  // this callsite with a call to `resolvedPromise()`.
  resolved = Promise.resolve(undefined);
  return resolved;
}
