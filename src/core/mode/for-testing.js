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

// Magic constant that is replaced by babel.
// IS_FORTESTING is only replaced when `amp dist` is called without the
// --fortesting flag.
const IS_FORTESTING = true;

/**
 * Returns true whenever closure compiler is used with --fortesting. Calls are
 * DCE'd when compiled.
 * @return {boolean}
 */
export function isFortesting() {
  return IS_FORTESTING;
}
