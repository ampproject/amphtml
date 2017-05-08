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

import {dev} from '../../../src/log';
import {ValidationBubble} from './validation-bubble';
import {getAmpDoc} from '../../../src/ampdoc';


/** @type {boolean|undefined} */
let reportValiditySupported;

/** @type {boolean|undefined} */
let checkValiditySupported;

/** @type {number} */
let validationBubbleCount = 0;


/**
 * @param {boolean} isSupported
 * @private visible for testing.
 */
export function setReportValiditySupportedForTesting(isSupported) {
  reportValiditySupported = isSupported;
}


/**
 * @param {boolean} isSupported
 * @private visible for testing.
 */
export function setCheckValiditySupportedForTesting(isSupported) {
  checkValiditySupported = isSupported;
}


/** @const @enum {string} */
const CustomValidationTypes = {
  AsYouGo: 'as-you-go',
  ShowAllOnSubmit: 'show-all-on-submit',
  ShowFirstOnSubmit: 'show-first-on-submit',
};


/**
 * Form validator interface.
 * @abstract
 */
export class FormValidator {

  /**
   * @param {!HTMLFormElement} form
   */
  constructor(form) {
    /** @protected @const {!HTMLFormElement} */
    this.form = form;

    /** @protected @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = getAmpDoc(form);

    /** @protected @const {!Document} */
    this.doc = /** @type {!Document} */ (form.ownerDocument);
  }

  /**
   * Called to report validation errors.
   */
  report() {}

  /**
   * @param {!Event} unusedEvent
   */
  onBlur(unusedEvent) {}

  /**
   * @param {!Event} unusedEvent
   */
  onInput(unusedEvent) {}
}


/** @private visible for testing */
export class DefaultValidator extends FormValidator {

  /** @override */
  report() {
    this.form.reportValidity();
  }

}


/** @private visible for testing */
export class PolyfillDefaultValidator extends FormValidator {

  constructor(form) {
    super(form);
    const bubbleId = `i-amphtml-validation-bubble-${validationBubbleCount++}`;
    /** @private @const {!./validation-bubble.ValidationBubble} */
    this.validationBubble_ = new ValidationBubble(this.ampdoc, bubbleId);
  }

  /** @override */
  report() {
    const inputs = this.form.querySelectorAll('input,select,textarea');
    for (let i = 0; i < inputs.length; i++) {
      if (!inputs[i].checkValidity()) {
        inputs[i]./*REVIEW*/focus();
        this.validationBubble_.show(inputs[i], inputs[i].validationMessage);
        break;
      }
    }
  }

  /** @override */
  onBlur(unusedEvent) {
    this.validationBubble_.hide();
  }

  /** @override */
  onInput(event) {
    const input = dev().assertElement(event.target);
    if (!this.validationBubble_.isActiveOn(input)) {
      return;
    }

    if (input.checkValidity()) {
      input.removeAttribute('aria-invalid');
      this.validationBubble_.hide();
    } else {
      input.setAttribute('aria-invalid', 'true');
      this.validationBubble_.show(input, input.validationMessage);
    }
  }
}


/**
 * @abstract
 * @private visible for testing
 */
export class AbstractCustomValidator extends FormValidator {

  constructor(form) {
    super(form);

    /** @private @const {!Object<string, ?Element>} */
    this.inputValidationsDict_ = {};

    /** @private @const {!Object<string, ?Element>} */
    this.inputVisibleValidationDict_ = {};
  }

  /**
   * @param {!Element} input
   */
  reportInput(input) {
    const invalidType = getInvalidType(input);
    if (invalidType) {
      this.showValidationFor(input, invalidType);
    }
  }

  /**
   * Hides all validation messages.
   */
  hideAllValidations() {
    for (const id in this.inputVisibleValidationDict_) {
      const input = this.doc.getElementById(id);
      this.hideValidationFor(dev().assertElement(input));
    }
  }

  /**
   * @param {!Element} input
   * @param {!string} invalidType
   * @return {?Element}
   */
  getValidationFor(input, invalidType) {
    if (!input.id) {
      return null;
    }
    const selector = `[visible-when-invalid=${invalidType}]` +
        `[validation-for=${input.id}]`;
    if (this.inputValidationsDict_[selector] === undefined) {
      this.inputValidationsDict_[selector] = this.doc.querySelector(selector);
    }
    return this.inputValidationsDict_[selector];
  }

  /**
   * @param {!Element} input
   * @param {string} invalidType
   */
  showValidationFor(input, invalidType) {
    const validation = this.getValidationFor(input, invalidType);
    if (!validation) {
      return;
    }

    if (!validation.textContent.trim()) {
      validation.textContent = input.validationMessage;
    }

    input.setAttribute('aria-invalid', 'true');
    validation.classList.add('visible');
    this.inputVisibleValidationDict_[input.id] = validation;
  }

  /**
   * @param {!Element} input
   */
  hideValidationFor(input) {
    const visibleValidation = this.getVisibleValidationFor(input);
    if (!visibleValidation) {
      return;
    }
    input.removeAttribute('aria-invalid');
    visibleValidation.classList.remove('visible');
    delete this.inputVisibleValidationDict_[input.id];
  }

  /**
   * @param {!Element} input
   * @return {?Element}
   */
  getVisibleValidationFor(input) {
    if (!input.id) {
      return null;
    }
    return this.inputVisibleValidationDict_[input.id];
  }

  /**
   * Whether an input should validate after an interaction.
   * @param {!Element} unusedInput
   * @return {boolean}
   */
  shouldValidateOnInteraction(unusedInput) {
    throw Error('Not Implemented');
  }

  /**
   * @param {!Event} event
   */
  onInteraction(event) {
    const input = dev().assertElement(event.target);
    const shouldValidate = this.shouldValidateOnInteraction(input);
    this.hideValidationFor(input);
    if (shouldValidate && !input.checkValidity()) {
      this.reportInput(input);
    }
  }

  /** @override */
  onBlur(event) {
    this.onInteraction(event);
  }

  /** @override */
  onInput(event) {
    this.onInteraction(event);
  }
}


/** @private visible for testing */
export class ShowFirstOnSubmitValidator extends AbstractCustomValidator {

  /** @override */
  report() {
    this.hideAllValidations();
    const inputs = this.form.querySelectorAll('input,select,textarea');
    for (let i = 0; i < inputs.length; i++) {
      if (!inputs[i].checkValidity()) {
        this.reportInput(inputs[i]);
        inputs[i]./*REVIEW*/focus();
        break;
      }
    }
  }

  /** @override */
  shouldValidateOnInteraction(input) {
    return !!this.getVisibleValidationFor(input);
  }

}


/** @private visible for testing */
export class ShowAllOnSubmitValidator extends AbstractCustomValidator {

  /** @override */
  report() {
    this.hideAllValidations();
    let firstInvalidInput = null;
    const inputs = this.form.querySelectorAll('input,select,textarea');
    for (let i = 0; i < inputs.length; i++) {
      if (!inputs[i].checkValidity()) {
        firstInvalidInput = firstInvalidInput || inputs[i];
        this.reportInput(inputs[i]);
      }
    }

    if (firstInvalidInput) {
      firstInvalidInput./*REVIEW*/focus();
    }
  }

  /** @override */
  shouldValidateOnInteraction(input) {
    return !!this.getVisibleValidationFor(input);
  }
}


/** @private visible for testing */
export class AsYouGoValidator extends AbstractCustomValidator {
  /** @override */
  shouldValidateOnInteraction(unusedInput) {
    return true;
  }
}


/**
 * Returns the form validator instance.
 *
 * @param {!HTMLFormElement} form
 * @return {!FormValidator}
 */
export function getFormValidator(form) {
  const customValidation = form.getAttribute(
      'custom-validation-reporting');
  switch (customValidation) {
    case CustomValidationTypes.AsYouGo:
      return new AsYouGoValidator(form);
    case CustomValidationTypes.ShowAllOnSubmit:
      return new ShowAllOnSubmitValidator(form);
    case CustomValidationTypes.ShowFirstOnSubmit:
      return new ShowFirstOnSubmitValidator(form);
  }

  if (isReportValiditySupported(form.ownerDocument)) {
    return new DefaultValidator(form);
  }

  return new PolyfillDefaultValidator(form);
}


/**
 * Returns whether reportValidity API is supported.
 * @param {?Document} doc
 * @return {boolean}
 */
function isReportValiditySupported(doc) {
  if (doc && reportValiditySupported === undefined) {
    reportValiditySupported = !!document.createElement('form').reportValidity;
  }
  return !!reportValiditySupported;
}


/**
 * Returns whether reportValidity API is supported.
 * @param {!Document} doc
 * @return {boolean}
 */
export function isCheckValiditySupported(doc) {
  if (checkValiditySupported === undefined) {
    checkValiditySupported = !!doc.createElement('input').checkValidity;
  }
  return checkValiditySupported;
}


/**
 * Returns invalid error type on the input.
 * @param {!Element} input
 * @return {?string}
 */
function getInvalidType(input) {
  for (const invalidType in input.validity) {
    if (input.validity[invalidType]) {
      return invalidType;
    }
  }
  return null;
}
