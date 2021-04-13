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

/**
 * Triple zero width space.
 *
 * This is added to user error messages, so that we can later identify
 * them, when the only thing that we have is the message. This is the
 * case in many browsers when the global exception handler is invoked.
 *
 * @const {string}
 */
export const USER_ERROR_SENTINEL = '\u200B\u200B\u200B';

/**
 * Converts an element to a readable string; all other types are unchanged.
 * TODO(rcebulko): Unify with log.js
 * @param {*} val
 * @return {*}
 */
export function elementStringOrPassThru(val) {
  // Do check equivalent to `val instanceof Element` without cross-window bug
  if (val?.nodeType == 1) {
    return val.tagName.toLowerCase() + (val.id ? `#${val.id}` : '');
  }
  return val;
}
