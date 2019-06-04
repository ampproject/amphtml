/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {createFormDataWrapper} from '../../../src/form-data-wrapper';
import {dev} from '../../../src/log';
import {isDisabled, isFieldDefault, isFieldEmpty} from '../../../src/form';
import {map} from '../../../src/utils/object';

export const DIRTINESS_INDICATOR_CLASS = 'amp-form-dirty';

/** @private {!Object<string, boolean>} */
const SUPPORTED_TYPES = {
  'text': true,
  'textarea': true,
};

export class FormDirtiness {
  /**
   * @param {!HTMLFormElement} form
   * @param {!Window} win
   */
  constructor(form, win) {
    /** @private @const {!HTMLFormElement} */
    this.form_ = form;

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {number} */
    this.dirtyFieldCount_ = 0;

    /** @private {!Object<string, boolean>} */
    this.isFieldNameDirty_ = map();

    /** @private {?FormData} */
    this.submittedFormData_ = null;

    /** @private {boolean} */
    this.isSubmitting_ = false;

    this.installEventHandlers_();
  }

  /**
   * Processes dirtiness state when a form is being submitted. This puts the
   * form in a "submitting" state, and temporarily clears the dirtiness state.
   */
  onSubmitting() {
    this.isSubmitting_ = true;
    this.updateDirtinessClass_();
  }

  /**
   * Processes dirtiness state when the form submission fails. This clears the
   * "submitting" state and reverts the form's dirtiness state.
   */
  onSubmitError() {
    this.isSubmitting_ = false;
    this.updateDirtinessClass_();
  }

  /**
   * Processes dirtiness state when the form submission succeeds. This clears
   * the "submitting" state and the form's overall dirtiness.
   */
  onSubmitSuccess() {
    this.isSubmitting_ = false;
    this.submittedFormData_ = this.takeFormDataSnapshot_();
    this.clearDirtyFields_();
    this.updateDirtinessClass_();
  }

  /**
   * @return {!FormData}
   * @private
   */
  takeFormDataSnapshot_() {
    return createFormDataWrapper(this.win_, this.form_).getFormData();
  }

  /**
   * Adds the `amp-form-dirty` class when there are dirty fields and the form
   * is not being submitted, otherwise removes the class.
   * @private
   */
  updateDirtinessClass_() {
    const isDirty = this.dirtyFieldCount_ > 0 && !this.isSubmitting_;
    this.form_.classList.toggle(DIRTINESS_INDICATOR_CLASS, isDirty);
  }

  /**
   * @private
   */
  installEventHandlers_() {
    this.form_.addEventListener('input', this.onInput_.bind(this));
    this.form_.addEventListener('reset', this.onReset_.bind(this));
  }

  /**
   * Listens to form field value changes, determines the field's dirtiness, and
   * updates the form's overall dirtiness.
   * @param {!Event} event
   * @private
   */
  onInput_(event) {
    const field = dev().assertElement(event.target);
    this.checkDirtinessAfterUserInteraction_(field);
    this.updateDirtinessClass_();
  }

  /**
   * Listens to the form reset event, and clears the overall dirtiness.
   * @param {!Event} unusedEvent
   * @private
   */
  onReset_(unusedEvent) {
    this.clearDirtyFields_();
    this.updateDirtinessClass_();
  }

  /**
   * Determine the given field's dirtiness.
   * @param {!Element} field
   * @private
   */
  checkDirtinessAfterUserInteraction_(field) {
    if (shouldSkipDirtinessCheck(field)) {
      return;
    }

    if (
      isFieldEmpty(field) ||
      isFieldDefault(field) ||
      this.isFieldSameAsLastSubmission_(field)
    ) {
      this.removeDirtyField_(field.name);
    } else {
      this.addDirtyField_(field.name);
    }
  }

  /**
   * Returns true if the form field's current value matches its most recent
   * submitted value.
   * @param {!Element} field
   * @return {boolean}
   * @private
   */
  isFieldSameAsLastSubmission_(field) {
    if (!this.submittedFormData_) {
      return false;
    }
    const {name, value} = field;
    return this.submittedFormData_.get(name) === value;
  }

  /**
   * Mark the field as dirty and increase the overall dirty field count, if the
   * field is previously clean.
   * @param {string} fieldName
   * @private
   */
  addDirtyField_(fieldName) {
    if (!this.isFieldNameDirty_[fieldName]) {
      this.isFieldNameDirty_[fieldName] = true;
      ++this.dirtyFieldCount_;
    }
  }

  /**
   * Mark the field as clean and decrease the overall dirty field count, if the
   * field is previously dirty.
   * @param {string} fieldName
   * @private
   */
  removeDirtyField_(fieldName) {
    if (this.isFieldNameDirty_[fieldName]) {
      this.isFieldNameDirty_[fieldName] = false;
      --this.dirtyFieldCount_;
    }
  }

  /**
   * Clears the dirty field name map and counter.
   * @private
   */
  clearDirtyFields_() {
    this.isFieldNameDirty_ = map();
    this.dirtyFieldCount_ = 0;
  }
}

/**
 * Returns true if the form should be subject to dirtiness check. Unsupported
 * elements, disabled elements, hidden elements, or elements without the `name`
 * attribute are skipped.
 * @param {!Element} field
 * @return {boolean}
 */
function shouldSkipDirtinessCheck(field) {
  const {type, name, hidden} = field;

  // TODO: add support for radio buttons, checkboxes, and dropdown menus
  if (!SUPPORTED_TYPES[type]) {
    return true;
  }

  return !name || hidden || isDisabled(field);
}
