/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

export function supportsOptions(win) {
  return false;
}

export function polyfillOptionsSupport(win) {
  let originalAdd = win.EventTarget.prototype.addEventListener;
  let originalRemove = win.EventTarget.prototype.removeEventListener;

  win.EventTarget.prototype.addEventListener = function(type, listener, opt) {
    console.log('\n\n*** in new add');
    return originalAdd.call(this, type, listener, opt);
  };

  win.EventTarget.prototype.removeEventListener = function(type, listener, opt) {
    return originalRemove.call(this, type, listener, opt);
  };
}

/**
 *
 * @param {!Window} win
 */
export function install(win) {
  if (!supportsOptions(win)) {
    polyfillOptionsSupport(win);
  }
}
