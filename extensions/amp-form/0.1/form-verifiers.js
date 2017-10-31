/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {LastAddedResolver} from '../../../src/utils/promise';
import {iterateCursor} from '../../../src/dom';
import {user} from '../../../src/log';

export const FORM_VERIFY_PARAM = '__amp_form_verify';


/**
 * @typedef {{
 *    name:string,
 *    message:string
 *  }}
 */
let VerificationErrorDef;


/**
 * Construct the correct form verifier based on whether
 * a config block is present.
 * @param {!HTMLFormElement} form
 * @param {function():Promise<!../../../src/service/xhr-impl.FetchResponse>} xhr
 */
export function getFormVerifier(form, xhr) {
  if (form.hasAttribute('verify-xhr')) {
    return new AsyncVerifier(form, xhr);
  } else {
    return new DefaultVerifier(form);
  }
}

/**
 * An interface for a form verifier. Implementations could check for duplicate
 * usernames on a remote server, check against an in-memory cache to verify
 * data in ways not possible with standard form validation, or check
 * values against sets of data too large to fit in browser memory
 * e.g. ensuring zip codes match with cities.
 * @visibleForTesting
 * @abstract
 */
export class FormVerifier {
  /**
   * @param {!HTMLFormElement} form
   */
  constructor(form) {
    /** @protected @const */
    this.form_ = form;
  }

  /**
   * Called when the user has fully set a value to be verified,
   * e.g. the input's 'change' event
   * @return {!Promise<!Array<!Element>>}
   */
  onCommit() {
    this.clearVerificationErrors_();
    if (this.isDirty_()) {
      return this.verify_();
    } else {
      return Promise.resolve([]);
    }
  }

  /**
   * Sends the verify request if any group is ready to verify.
   * @return {!Promise<!Array<!Element>>} The list of elements whose state
   *    must change
   * @protected
   */
  verify_() {
    return Promise.resolve([]);
  }

  /**
   * Checks if the form has been changed from its initial state.
   * @return {boolean}
   * @private
   */
  isDirty_() {
    const elements = this.form_.elements;
    for (let i = 0; i < elements.length; i++) {
      const field = elements[i];
      if (field.disabled) {
        continue;
      }
      switch (field.type) {
        case 'select-multiple':
        case 'select-one':
          const options = field.options;
          for (let j = 0; j < options.length; j++) {
            if (options[j].selected !== options[j].defaultSelected) {
              return true;
            }
          }
          break;
        case 'checkbox':
        case 'radio':
          if (field.checked !== field.defaultChecked) {
            return true;
          }
          break;
        default:
          if (field.value !== field.defaultValue) {
            return true;
          }
          break;
      }
    }
    return false;
  }

  /**
   * Removes all custom verification errors from the elements.
   * @private
   */
  clearVerificationErrors_() {
    const elements = this.form_.elements;
    if (elements) {
      iterateCursor(elements, e => {
        e.setCustomValidity('');
      });
    }
  }
}

/**
 * A no-op verifier.
 * @visibleForTesting
 */
export class DefaultVerifier extends FormVerifier { }

/**
 * A verifier that verifies values via an XHR
 * @visibleForTesting
 */
export class AsyncVerifier extends FormVerifier {
  /**
   * @param {!HTMLFormElement} form
   * @param {function():Promise<!../../../src/service/xhr-impl.FetchResponse>} xhr
   */
  constructor(form, xhr) {
    super(form);

    /** @protected @const*/
    this.doXhr_ = xhr;

    /** @protected {?LastAddedResolver} */
    this.xhrResolver_ = null;

    /** @private {!Array<!VerificationErrorDef>} */
    this.previousErrors_ = [];
  }

  /** @override */
  verify_() {
    const xhrConsumeErrors = this.doXhr_().then(() => {
      return [];
    }, error => {
      return getResponseErrorData_(/** @type {!Error} */(error));
    });

    return this.addToResolver_(xhrConsumeErrors)
        .then(errors => this.applyErrors_(errors));
  }

  /**
   * Prevent race conditions from XHRs that arrive out of order by resolving
   * only the most recently initiated XHR.
   * TODO(cvializ): Replace this when the Fetch API adds cancelable fetches.
   * @param {!Promise} promise
   * @return {!Promise} The resolver result promise
   */
  addToResolver_(promise) {
    if (!this.xhrResolver_) {
      this.xhrResolver_ = new LastAddedResolver();
      const cleanup = () => this.xhrResolver_ = null;
      this.xhrResolver_.then(cleanup, cleanup);
    }
    return this.xhrResolver_.add(promise);
  }

  /**
   * Set errors on elements that failed verification, and clear any
   * verification state for elements that passed verification.
   * @param {!Array<!VerificationErrorDef>} errors
   * @return {!Array<!Element>} Updated elements e.g. elements with new errors,
   *    and elements that previously had errors but were fixed. The form will
   *    update their user-valid/user-invalid state.
   * @private
   */
  applyErrors_(errors) {
    const errorElements = [];

    const previousErrors = this.previousErrors_;
    this.previousErrors_ = errors;

    // Set the error message on each element that caused an error.
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      const name = user().assertString(error.name,
          'Verification errors must have a name property');
      const message = user().assertString(error.message,
          'Verification errors must have a message property');
      // If multiple elements share the same name, the first should be selected.
      // This matches the behavior of HTML5 validation, e.g. with radio buttons.
      const element = user().assertElement(
          this.form_./*OK*/querySelector(`[name="${name}"]`),
          'Verification error name property must match a field name');

      // Only put verification errors on elements that are client-side valid.
      // This prevents errors from appearing on elements that have not been
      // filled out yet.
      if (element.checkValidity()) {
        element.setCustomValidity(message);
        errorElements.push(element);
      }
    }

    // Create a list of form elements that had an error, but are now fixed.
    const isFixed = previousError => errors.every(
        error => previousError.name !== error.name);
    const fixedElements = previousErrors.filter(isFixed)
        .map(e => this.form_./*OK*/querySelector(`[name="${e.name}"]`));

    return errorElements.concat(fixedElements);
  }
}

/**
 * @param {!Error} error
 * @return {!Promise<!Array<VerificationErrorDef>>}
 * @private
 */
function getResponseErrorData_(error) {
  const {response} = error;
  if (!response) {
    return Promise.resolve([]);
  }

  return response.json().then(
      json => json.verifyErrors || [],
      () => []);
}
