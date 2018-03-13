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

import {dev} from './log';
import {getFormAsObject} from './form';
import {map} from './utils/object';

/**
 * A wrapper for a native `FormData` object that allows the retrieval of entries
 * in the form data after construction even on browsers that don't natively
 * support `FormData.prototype.entries`.
 *
 * @final
 * @note Subclassing `FormData` doesn't work in this case as the transpiler
 *     generates code that calls the super constructor directly using
 *     `Function.prototype.call`. WebKit (Safari) doesn't allow this and
 *     enforces that constructors be called with the `new` operator.
 */
export class FormDataWrapper {
  /**
   * Creates a new wrapper for a `FormData` object.
   *
   * If there's no native `FormData#entries`, chances are there are no native
   * methods to read the content of the `FormData` after construction, so the
   * only way to implement `entries` in this class is to capture the fields in
   * the form passed to the constructor (and the arguments passed to the
   * `append` method).
   *
   * For more details on this, see http://mdn.io/FormData.
   *
   * @param {!HTMLFormElement=} opt_form An HTML `<form>` element — when
   *     specified, the `FormData` object will be populated with the form's
   *     current keys/values using the name property of each element for the
   *     keys and their submitted value for the values. It will also encode file
   *     input content.
   */
  constructor(opt_form = undefined) {
    /** @private @const {!FormData} */
    this.formData_ = new FormData(opt_form);

    /** @private @const {?Object<string, !Array<string>>} */
    this.fieldValues_ =
        this.formData_['entries'] ?
          null :
          (opt_form ? getFormAsObject(opt_form) : map());
  }

  /**
   * Appends a new value onto an existing key inside a `FormData` object, or
   * adds the key if it does not already exist.
   *
   * If there's no native `FormData#entries`, chances are there are no native
   * methods to read the content of the `FormData` after construction, so the
   * only way to implement `entries` in this class is to capture the arguments
   * passed to the `append` method (and the form passed to the constructor).
   *
   * Since AMP doesn't support `<input type="file">`, appending a `File` object
   * is not supported and the `filename` parameter is ignored for this wrapper.
   *
   * For more details on this, see http://mdn.io/FormData/append.
   *
   * @param {string} name The name of the field whose data is contained in
   *     `value`.
   * @param {string} value The field's value.
   */
  append(name, value) {
    if (!this.formData_['entries']) {
      const nameString = String(name);
      this.fieldValues_[nameString] = this.fieldValues_[nameString] || [];
      this.fieldValues_[name].push(String(value));
    }

    return this.formData_.append(name, value);
  }

  /**
   * Returns an iterator of all key/value pairs contained in this object.
   *
   * For more details on this, see http://mdn.io/FormData/entries.
   *
   * @return {!Iterator<!Array<string>>}
   */
  entries() {
    if (this.formData_['entries']) {
      return this.formData_['entries']();
    }

    const fieldEntries = [];
    const fieldValues = /** @type {!Object<string, !Array<string>>} */ (
      dev().assert(this.fieldValues_));
    Object.keys(fieldValues).forEach(name => {
      const values = fieldValues[name];
      values.forEach(value => fieldEntries.push([name, value]));
    });

    // Generator functions are not supported by the current Babel configuration,
    // so we must manually implement the iterator interface.
    let nextIndex = 0;
    return /** @type {!Iterator<!Array<string>>} */ ({
      next() {
        return nextIndex < fieldEntries.length ?
          {value: fieldEntries[nextIndex++], done: false} :
          {value: undefined, done: true};
      },
    });
  }

  /**
   * Returns the wrapped native `FormData` object.
   *
   * @return {!FormData}
   */
  getFormData() {
    return this.formData_;
  }
}

/**
 * Check if the given object is a FormDataWrapper instance
 * @param {*} o
 * @return {boolean} True if the object is a FormDataWrapper instance.
 */
export function isFormDataWrapper(o) {
  // instanceof doesn't work as expected, so we detect with duck-typing.
  return !!o && typeof o.getFormData == 'function';
}
