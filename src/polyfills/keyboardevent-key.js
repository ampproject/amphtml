/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

// Original shim code: https://github.com/shvaikalesh/shim-keyboard-event-key

import {dict, hasOwn} from '../utils/object';

/** @dict */
const keys = dict({
  'Win': 'Meta',
  'Scroll': 'ScrollLock',
  'Spacebar': ' ',
  'Down': 'ArrowDown',
  'Left': 'ArrowLeft',
  'Right': 'ArrowRight',
  'Up': 'ArrowUp',
  'Del': 'Delete',
  'Apps': 'ContextMenu',
  'Esc': 'Escape',
  'Multiply': '*',
  'Add': '+',
  'Subtract': '-',
  'Decimal': '.',
  'Divide': '/',
});

/**
 * Sets the KeyboardEvent#key shim if it does not exist.
 * @param {!Window} win
 */
export function install(win) {
  const isIe = /Trident|MSIE|IEMobile/i.test(win.navigator.userAgent);
  if (!isIe) {
    return;
  }

  const descriptor = win.Object.getOwnPropertyDescriptor(
      win.KeyboardEvent.prototype, 'key');
  if (descriptor) {
    win.Object.defineProperty(win.KeyboardEvent.prototype, 'key', {
      get: function key() {
        const key = descriptor.get.call(this);
        return hasOwn(keys, key) ? keys[key] : key;
      },
    });
  }
}
