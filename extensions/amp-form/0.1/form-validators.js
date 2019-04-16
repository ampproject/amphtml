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
import {FormEvents} from './form-events';
import {Services} from '../../../src/services';
import {ValidationBubble} from './validation-bubble';
import {createCustomEvent} from '../../../src/event-helper';
import {dev, devAssert} from '../../../src/log';
import {iterateCursor} from '../../../src/dom';
import {toWin} from '../../../src/types';

/** @const @private {string} */
const VALIDATION_CACHE_PREFIX = '__AMP_VALIDATION_';

/** @const @private {string} */
const VISIBLE_VALIDATION_CACHE = '__AMP_VISIBLE_VALIDATION';

/**
 * Validation user message for non-standard pattern mismatch errors.
 * Note this isn't localized but custom validation can be used instead.
 * @const @private {string}
 */
const CUSTOM_PATTERN_ERROR = 'Please match the requested format.';


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
  InteractAndSubmit: 'interact-and-submit',
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
    this.ampdoc = Services.ampdoc(form);

    /** @const @protected {!../../../src/service/resources-impl.Resources} */
    this.resources = Services.resourcesForDoc(form);

    /** @protected @const {!Document|!ShadowRoot} */
    this.root = this.ampdoc.getRootNode();

    /**
     * Tribool indicating last known validity of form.
     * @private {boolean|null}
     */
    this.formValidity_ = null;
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

  /** @return {!NodeList} */
  inputs() {
    return this.form.querySelectorAll('input,select,textarea');
  }

  /**
   * Wraps `checkValidity` on input elements to support `pattern` attribute on
   * <textarea> which is not supported in HTML5.
   * @param {!Element} input
   * @return {boolean}
   * @protected
   */
  checkInputValidity(input) {
    if (input.tagName === 'TEXTAREA' && input.hasAttribute('pattern')) {
      // FormVerifier also uses setCustomValidity() to signal verification
      // errors. Make sure we only override pattern errors here.
      if (input.checkValidity()
          || input.validationMessage === CUSTOM_PATTERN_ERROR) {
        const pattern = input.getAttribute('pattern');
        const re = new RegExp(`^${pattern}$`, 'm');
        const valid = re.test(input.value);
        input.setCustomValidity(valid ? '' : CUSTOM_PATTERN_ERROR);
      }
    }
    return input.checkValidity();
  }

  /**
   * Wraps `checkValidity` on form elements to support `pattern` attribute on
   * <textarea> which is not supported in HTML5.
   * @param {!HTMLFormElement} form
   * @return {boolean}
   * @protected
   */
  checkFormValidity(form) {
    this.checkTextAreaValidityInForm_(form);
    return form.checkValidity();
  }

  /**
   * Wraps `reportValidity` on form elements to support `pattern` attribute on
   * <textarea> which is not supported in HTML5.
   * @param {!HTMLFormElement} form
   * @return {boolean}
   * @protected
   */
  reportFormValidity(form) {
    this.checkTextAreaValidityInForm_(form);
    return form.reportValidity();
  }

  /**
   * @param {!HTMLFormElement} form
   * @private
   */
  checkTextAreaValidityInForm_(form) {
    iterateCursor(form.elements, element => {
      if (element.tagName == 'TEXTAREA') {
        this.checkInputValidity(element);
      }
    });
  }

  /**
   * Fires a valid/invalid event from the form if its validity state
   * has changed since the last invocation of this function.
   * @visibleForTesting
   */
  fireValidityEventIfNecessary() {
    const previousValidity = this.formValidity_;
    this.formValidity_ = this.checkFormValidity(this.form);
    if (previousValidity !== this.formValidity_) {
      const win = toWin(this.form.ownerDocument.defaultView);
      const type = this.formValidity_ ? FormEvents.VALID : FormEvents.INVALID;
      const event = createCustomEvent(win, type, null, {bubbles: true});
      this.form.dispatchEvent(event);
    }
  }
}


/** @private visible for testing */
export class DefaultValidator extends FormValidator {

  /** @override */
  report() {
    this.reportFormValidity(this.form);
    this.fireValidityEventIfNecessary();
  }
}


/** @private visible for testing */
export class PolyfillDefaultValidator extends FormValidator {

  /**
   * Creates an instance of PolyfillDefaultValidator.
   * @param {!HTMLFormElement} form
   */
  constructor(form) {
    super(form);
    const bubbleId = `i-amphtml-validation-bubble-${validationBubbleCount++}`;
    /** @private @const {!./validation-bubble.ValidationBubble} */
    this.validationBubble_ = new ValidationBubble(this.ampdoc, bubbleId);
  }

  /** @override */
  report() {
    const inputs = this.inputs();
    for (let i = 0; i < inputs.length; i++) {
      if (!this.checkInputValidity(inputs[i])) {
        inputs[i]./*REVIEW*/focus();
        this.validationBubble_.show(inputs[i], inputs[i].validationMessage);
        break;
      }
    }

    this.fireValidityEventIfNecessary();
  }

  /** @override */
  onBlur(e) {
    // NOTE: IE11 focuses the submit button after submitting a form.
    // Then amp-form focuses the first field with an error, which causes the
    // submit button to blur. So we need to disregard the submit button blur.
    if (e.target.type == 'submit') {
      return;
    }
    this.validationBubble_.hide();
  }

  /** @override */
  onInput(event) {
    const input = dev().assertElement(event.target);
    if (!this.validationBubble_.isActiveOn(input)) {
      return;
    }

    if (this.checkInputValidity(input)) {
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

  /**
   * Creates an instance of AbstractCustomValidator.
   * @param {!HTMLFormElement} form
   */
  constructor(form) {
    super(form);
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
    const inputs = this.inputs();
    for (let i = 0; i < inputs.length; i++) {
      this.hideValidationFor(dev().assertElement(inputs[i]));
    }
  }

  /**
   * @param {!Element} input
   * @param {string=} invalidType
   * @return {?Element}
   */
  getValidationFor(input, invalidType) {
    if (!input.id) {
      return null;
    }
    // <textarea> only supports `pattern` matching. But, it's implemented via
    // setCustomValidity(), which results in the 'customError' validity state.
    if (input.tagName === 'TEXTAREA') {
      devAssert(invalidType === 'customError');
      invalidType = 'patternMismatch';
    }
    const property = VALIDATION_CACHE_PREFIX + invalidType;
    if (!(property in input)) {
      const selector = `[visible-when-invalid=${invalidType}]`
          + `[validation-for=${input.id}]`;
      input[property] = this.root.querySelector(selector);
    }
    return input[property];
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
    input[VISIBLE_VALIDATION_CACHE] = validation;

    this.resources.mutateElement(input,
        () => input.setAttribute('aria-invalid', 'true'));
    this.resources.mutateElement(validation,
        () => validation.classList.add('visible'));
  }

  /**
   * @param {!Element} input
   */
  hideValidationFor(input) {
    const visibleValidation = this.getVisibleValidationFor(input);
    if (!visibleValidation) {
      return;
    }
    delete input[VISIBLE_VALIDATION_CACHE];

    this.resources.mutateElement(input,
        () => input.removeAttribute('aria-invalid'));
    this.resources.mutateElement(visibleValidation,
        () => visibleValidation.classList.remove('visible'));
  }

  /**
   * @param {!Element} input
   * @return {?Element}
   */
  getVisibleValidationFor(input) {
    return input[VISIBLE_VALIDATION_CACHE];
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
    const shouldValidate =
        !!input.checkValidity && this.shouldValidateOnInteraction(input);

    this.hideValidationFor(input);
    if (shouldValidate && !this.checkInputValidity(input)) {
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
    const inputs = this.inputs();
    for (let i = 0; i < inputs.length; i++) {
      if (!this.checkInputValidity(inputs[i])) {
        this.reportInput(inputs[i]);
        inputs[i]./*REVIEW*/focus();
        break;
      }
    }

    this.fireValidityEventIfNecessary();
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
    const inputs = this.inputs();
    for (let i = 0; i < inputs.length; i++) {
      if (!this.checkInputValidity(inputs[i])) {
        firstInvalidInput = firstInvalidInput || inputs[i];
        this.reportInput(inputs[i]);
      }
    }

    if (firstInvalidInput) {
      firstInvalidInput./*REVIEW*/focus();
    }

    this.fireValidityEventIfNecessary();
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

  /** @override */
  onInteraction(event) {
    super.onInteraction(event);
    this.fireValidityEventIfNecessary();
  }
}


/** @private visible for testing */
export class InteractAndSubmitValidator extends ShowAllOnSubmitValidator {
  /** @override */
  shouldValidateOnInteraction(unusedInput) {
    return true;
  }

  /** @override */
  onInteraction(event) {
    super.onInteraction(event);
    this.fireValidityEventIfNecessary();
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
    case CustomValidationTypes.InteractAndSubmit:
      return new InteractAndSubmitValidator(form);
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
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
 * @param {!Element} input
 * @return {?string}
 */
function getInvalidType(input) {
  // 'badInput' takes precedence over others.
  const validityTypes = ['badInput'];
  for (const invalidType in input.validity) {
    // add other types after
    if (!validityTypes.includes(invalidType)) {
      validityTypes.push(invalidType);
    }
  }
  // Finding error type with value true
  const response = validityTypes.filter(type =>
    input.validity[type] === true);
  return response.length ? response[0] : null;
}
