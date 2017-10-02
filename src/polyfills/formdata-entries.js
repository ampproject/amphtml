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

import {getFormAsObject} from '../form';
import {map} from '../utils/object';

/**
 * Creates a new `FormData` object.
 *
 * This patches the native constructor so that the polyfill can capture the
 * fields in the form passed to the constructor. If `FormData#entries` needs a
 * polyfill, chances are there are no methods to read the content of the
 * `FormData` after construction, so the only way to partially polyfill
 * `entries` is to patch the constructor (and the `append` method).
 *
 * For more details on this, see http://mdn.io/FormData.
 *
 * @param {!HTMLFormElement=} form An HTML `<form>` element — when specified,
 *     the FormData object will be populated with the form's current keys/values
 *     using the name property of each element for the keys and their submitted
 *     value for the values. It will also encode file input content.
 */
function FormDataPolyfill(form) {
  const instance = new FormDataPolyfill['FormDataNative_'](form);
  instance.fieldValues_ = form ? getFormAsObject(form) : map();
  return instance;
}

/**
 * Appends a new value onto an existing key inside a `FormData` object, or adds
 * the key if it does not already exist.
 *
 * This patches the native `append` method so that the polyfill can capture the
 * field passed to the method. If `FormData#entries` needs a polyfill, chances
 * are there are no methods to read the content of the `FormData` after
 * construction, so the only way to partially polyfill `entries` is to patch
 * this method (and the constructor).
 *
 * Since AMP doesn't support `<input type="file">`, appending a `File` object
 * is not supported and the `filename` parameter is ignored for this polyfill.
 *
 * For more details on this, see http://mdn.io/FormData/append.
 *
 * @param {string} name The name of the field whose data is contained in
 *     `value`.
 * @param {string} value The field's value.
 * @this {FormData}
 */
function appendPolyfill(name, value, filename) {
  const nameString = String(name);
  this.fieldValues_[nameString] = this.fieldValues_[nameString] || [];
  this.fieldValues_[name].push(String(value));

  return this['appendNative_'](name, value, filename);
}

/**
 * Returns an iterator of all key/value pairs contained in this object.
 *
 * For more details on this, see http://mdn.io/FormData/entries.
 *
 * @return {!Iterator<!Array<string>>}
 * @this {FormData}
 */
function entriesPolyfill() {
  const fieldEntries = [];
  Object.keys(this.fieldValues_).forEach(name => {
    const values = this.fieldValues_[name];
    values.forEach(value => fieldEntries.push([name, value]));
  });

  // Generator functions are not supported by the current Babel configuration,
  // so we must manually implement the iterator interface.
  let nextIndex = 0;
  return /** @type {!Iterator<!Array<string>>} */ ({
    next: () => {
      return nextIndex < fieldEntries.length ?
          {value: fieldEntries[nextIndex++], done: false} :
          {done: true};
    },
  });
}

/**
 * Sets the FormData.entries polyfill if it does not exist.
 * @param {!Window} win
 */
export function install(win) {
  if (win.FormData.prototype.entries) {
    return;
  }

  win.Object.defineProperty(win.FormData.prototype, 'appendNative_', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: win.FormData.prototype.append,
  });
  win.Object.defineProperty(win.FormData.prototype, 'append', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: appendPolyfill,
  });

  win.Object.defineProperty(win.FormData.prototype, 'entries', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: entriesPolyfill,
  });

  if (!FormDataPolyfill['FormDataNative_']) {
    // Store the native FormData constructor as a property of the polyfill
    // constructor so that it can be referenced from the polyfill constructor.
    win.Object.defineProperty(FormDataPolyfill, 'FormDataNative_', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: win.FormData,
    });
  }
  FormDataPolyfill.prototype = win.FormData.prototype;

  // This needs to come last so that code above can simply operate on the
  // native FormData by referencing `win.FormData`.
  win.Object.defineProperty(win, 'FormData', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: FormDataPolyfill,
  });
}
