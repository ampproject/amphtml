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

export function dev() {
  return {
    assertElement: element => {
      console.assert(element && element.nodeType == 1, 'Element expected');
      return element;
    },
  };
}

export function user() {
  return {
    error: (unusedTag, var_args) => {
      console.error.apply(null, Array.prototype.slice.call(arguments, 1));
    },
  };
}

export function devAssert() {}

export function userAssert() {}

export const urls = {};
