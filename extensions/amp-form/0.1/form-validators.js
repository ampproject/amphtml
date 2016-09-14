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

import {ValidationBubble} from './validation-bubble';


/** @type {?./validation-bubble.ValidationBubble|undefined} */
let validationBubble;


/** @type {boolean|undefined} */
let reportValiditySupported;


/**
 * @param {boolean} isSupported
 * @private visible for testing.
 */
export function setReportValiditySupported(isSupported) {
  reportValiditySupported = isSupported;
}


/** @const @enum {string} */
const CustomValidationTypes = {
  AsYouGo: 'as-you-go',
  ShowAllOnSubmit: 'show-all-on-submit',
  ShowFirstOnSubmit: 'show-first-on-submit',
};


class FormValidator {

  /**
   * @param {!HTMLFormElement} form
   */
  constructor(form) {
    /** @const {!HTMLFOrmElement} */
    this.form = form;
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


class DefaultValidator extends FormValidator {

  /** @override */
  report() {
    this.form.reportValidity();
  }

}


class PolyfillDefaultValidator extends FormValidator {

  constructor(form) {
    super(form);

    if (!validationBubble) {
      const win = form.ownerDocument.defaultView;
      validationBubble = new ValidationBubble(win, 'amp-validation-bubble');
    }
  }

  /** @override */
  report() {
    const inputs = this.form.querySelectorAll('input,select,textarea');
    for (let i = 0; i < inputs.length; i++) {
      if (!inputs[i].checkValidity()) {
        inputs[i]./*REVIEW*/focus();
        validationBubble.show(inputs[i], inputs[i].validationMessage);
        break;
      }
    }
  }

  /** @override */
  onBlur(unusedEvent) {
    validationBubble.hide();
  }

  /** @override */
  onInput(event) {
    if (event.target.checkValidity()) {
      event.target.removeAttribute('aria-invalid');
      validationBubble.hide();
    } else {
      event.target.setAttribute('aria-invalid', 'true');
      validationBubble.show(event.target, event.target.validationMessage);
    }
  }
}


class AbstractCustomValidator extends FormValidator {

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
    const inputs = this.form.querySelectorAll('input,select,textarea');
    for (let i = 0; i < inputs.length; i++) {
      this.hideValidationFor(inputs[i]);
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

    return document.querySelector(
        `[visible-when-invalid=${invalidType}][validation-for=${input.id}]`);
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
  }

  /**
   * @param {!Element} input
   * @return {boolean} Whether a validation was visible and was successfully hidden.
   */
  hideValidationFor(input) {
    const visibleValidation = this.getVisibleValidationFor(input);
    if (!visibleValidation) {
      return false;
    }

    input.removeAttribute('aria-invalid');
    visibleValidation.classList.remove('visible');
    return true;
  }

  /**
   * @param {!Element} input
   * @return {?Element}
   */
  getVisibleValidationFor(input) {
    if (!input.id) {
      return null;
    }
    return document.querySelector(
        `[visible-when-invalid][validation-for=${input.id}].visible`);;
  }

  /**
   * Whether an input should validate after an interaction.
   * @param {!Element} input
   * @return {boolean}
   */
  shouldValidateOnInteraction(input) {
    return !!this.getVisibleValidationFor(input);
  }

  /**
   * @param {!Event} event
   */
  onInteraction(event) {
    const input = /** @type {!Element} */ (event.target);
    const shouldValidate = this.shouldValidateOnInteraction(input);
    this.hideValidationFor(input);
    if (shouldValidate && !event.target.checkValidity()) {
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


class ShowFirstOnSubmitValidator extends AbstractCustomValidator {

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

}


class ShowAllOnSubmitValidator extends AbstractCustomValidator {

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
}


class AsYouGoValidator extends AbstractCustomValidator {
  /** @override */
  shouldValidateOnInteraction(unusedInput) {
    return true;
  }
}


/**
 * Returns the form validator instance.
 *
 * TODO(#5000): Consider allowing multiple custom validators to be registered to a form.
 *     This allows for example a form to have as-you-go AND show-all-on-submit
 *     validators instead of having to stick with one.
 *
 * TODO(#5004): Consider setting a form-level class to indicate that the form was blocked
 *    from submission after being invalid (like .amp-form-submit-invalid).
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
 * @param {!Document} doc
 * @return {boolean}
 */
function isReportValiditySupported(doc) {
  if (reportValiditySupported === undefined) {
    reportValiditySupported = !!doc.createElement('form').reportValidity;
  }
  return reportValiditySupported;
}


/**
 * Returns invalid error type on the input.
 * @param {!HTMLInputElement|!HTMLSelectElement|!HTMLTextAreaElement} input
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
