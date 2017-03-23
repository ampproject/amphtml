/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
 * Returns a CustomEvent with a given type and detail; supports fallback for IE.
 * @param {!Window} win
 * @param {string} type
 * @param {Object} detail
 * @return {!Event}
 */
export function customEvent(win, type, detail) {
  if (win.CustomEvent) {
    return new win.CustomEvent(`slidescroll.${name}`, {detail});
  } else {
    // Deprecated fallback for IE.
    const e = win.document.createEvent('CustomEvent');
    e.initCustomEvent(
        type, /* canBubble */ true, /* cancelable */ true, detail);
    return e;
  }
}
