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

// TODO(zhangsu): investigate whether we can whitelist `Array.from` for
// supported browsers so that we can simply return using native calls here
// (e.g., `return Array.from(this.entries())`) here for better performance.
/**
 * Returns an array of all key/value pairs contained in this object.
 *
 * By specification, `entries` returns an iterator instead of an array. However,
 * returning an iterator requires writing an ES6 generator, which is not
 * supported with the current Babel configuration (need the regenerator
 * runtime). Polyfilling `entries` to return an array won't work either, because
 * it would create an inconsistent API return value across browsers. Callers
 * cannot use `Array.from` to unify the return value either, because
 * `Array.from` is not supported by IE and it's super hard to polyfill.
 *
 * As a workaround, instead of trying to fully polyfill `entries`, a new method
 * called `entryArray` is defined, which behaves exactly like `entries` except
 * it returns an array. Callers are expected to call `formData.entryArray()`
 * instead of `formData.entries()` so that an array can be obtained on all
 * browsers supported by AMP.
 *
 * For more details on this, see http://mdn.io/FormData/entries.
 *
 * @return {!Array<!Array<string>>}
 * @this {FormData}
 */
function entryArray() {
  if (!this.fieldValues_) {
    return [];
  }

  const fieldEntries = [];
  Object.keys(this.fieldValues_).forEach(name => {
    const values = this.fieldValues_[name];
    values.forEach(value => fieldEntries.push([name, value]));
  });
  return fieldEntries;
}

/**
 * Sets the FormData.entries polyfill if it does not exist.
 * @param {!Window} win
 */
export function install(win) {
  if (win.FormData.prototype.entryArray) {
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

  win.Object.defineProperty(win.FormData.prototype, 'entryArray', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: entryArray,
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
