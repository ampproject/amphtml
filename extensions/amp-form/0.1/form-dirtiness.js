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
   */
  constructor(form) {
    /** @private @const {!HTMLFormElement} */
    this.form_ = form;

    /** @private {number} */
    this.dirtyFieldCount_ = 0;

    /** @private {!Object<string, boolean>} */
    this.isFieldNameDirty_ = map();

    /** @private {boolean} */
    this.isSubmitting_ = false;

    this.installEventHandlers_();
  }

  /**
   * Processes dirtiness state when a form is being submitted.
   */
  onSubmitting() {
    this.isSubmitting_ = true;
    this.updateDirtinessClass_();
  }

  /**
   * Processes dirtiness state when the form submission fails.
   */
  onSubmitError() {
    this.isSubmitting_ = false;
    this.updateDirtinessClass_();
  }

  /**
   * Processes dirtiness state when the form submission succeeds.
   */
  onSubmitSuccess() {
    this.isSubmitting_ = false;
    this.clearDirtyFields_();
    this.updateDirtinessClass_();
  }

  /**
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
   * @param {!Event} event
   * @private
   */
  onInput_(event) {
    const field = dev().assertElement(event.target);
    this.checkDirtinessAfterUserInteraction_(field);
    this.updateDirtinessClass_();
  }

  /**
   * @param {!Event} unusedEvent
   * @private
   */
  onReset_(unusedEvent) {
    this.clearDirtyFields_();
    this.updateDirtinessClass_();
  }

  /**
   * @param {!Element} field
   * @private
   */
  checkDirtinessAfterUserInteraction_(field) {
    if (shouldSkipDirtinessCheck(field)) {
      return;
    }

    if (isFieldEmpty(field) || isFieldDefault(field)) {
      this.removeDirtyField_(field.name);
    } else {
      this.addDirtyField_(field.name);
    }
  }

  /**
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
   * @private
   */
  clearDirtyFields_() {
    this.isFieldNameDirty_ = map();
    this.dirtyFieldCount_ = 0;
  }
}

/**
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
