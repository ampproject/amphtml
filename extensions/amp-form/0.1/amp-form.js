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

import {isExperimentOn} from '../../../src/experiments';
import {getService} from '../../../src/service';
import {assertHttpsUrl} from '../../../src/url';
import {user, rethrowAsync} from '../../../src/log';
import {onDocumentReady} from '../../../src/document-ready';
import {xhrFor} from '../../../src/xhr';
import {toArray} from '../../../src/types';
import {startsWith} from '../../../src/string';
import {templatesFor} from '../../../src/template';
import {
  removeElement,
  childElementByAttr,
  ancestorElementsByTag,
} from '../../../src/dom';
import {installStyles} from '../../../src/styles';
import {CSS} from '../../../build/amp-form-0.1.css';
import {ValidationBubble} from './validation-bubble';
import {vsyncFor} from '../../../src/vsync';
import {actionServiceForDoc} from '../../../src/action';
import {urls} from '../../../src/config';

/** @type {string} */
const TAG = 'amp-form';


/** @const @enum {string} */
const FormState_ = {
  SUBMITTING: 'submitting',
  SUBMIT_ERROR: 'submit-error',
  SUBMIT_SUCCESS: 'submit-success',
};


/** @const @enum {string} */
const UserValidityState = {
  NONE: 'none',
  USER_VALID: 'valid',
  USER_INVALID: 'invalid',
};


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


export class AmpForm {

  /**
   * Adds functionality to the passed form element and listens to submit event.
   * @param {!HTMLFormElement} element
   */
  constructor(element) {
    /** @const @private {!Window} */
    this.win_ = element.ownerDocument.defaultView;

    /** @const @private {!HTMLFormElement} */
    this.form_ = element;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(this.win_);

    /** @const @private {!Templates} */
    this.templates_ = templatesFor(this.win_);

    /** @const @private {!Xhr} */
    this.xhr_ = xhrFor(this.win_);

    /** @const @private {!../../../src/service/action-impl.Action} */
    this.actions_ = actionServiceForDoc(this.win_.document.documentElement);

    /** @const @private {string} */
    this.method_ = this.form_.getAttribute('method') || 'GET';

    /** @const @private {string} */
    this.target_ = this.form_.getAttribute('target');

    /** @const @private {?string} */
    this.xhrAction_ = this.form_.getAttribute('action-xhr');
    if (this.xhrAction_) {
      assertHttpsUrl(this.xhrAction_, this.form_, 'action-xhr');
      user().assert(!startsWith(this.xhrAction_, urls.cdn),
          'form action-xhr should not be on cdn.ampproject.org: %s',
          this.form_);
    }

    /** @const @private {boolean} */
    this.shouldValidate_ = !this.form_.hasAttribute('novalidate');
    // Need to disable browser validation in order to allow us to take full
    // control of this. This allows us to trigger validation APIs and reporting
    // when we need to.
    this.form_.setAttribute('novalidate', '');
    if (!this.shouldValidate_) {
      this.form_.setAttribute('amp-novalidate', '');
    }
    this.form_.classList.add('-amp-form');

    const submitButtons = this.form_.querySelectorAll('input[type=submit]');
    user().assert(submitButtons && submitButtons.length > 0,
        'form requires at least one <input type=submit>: %s', this.form_);

    /** @const @private {!Array<!Element>} */
    this.submitButtons_ = toArray(submitButtons);

    /** @private {?string} */
    this.state_ = null;

    this.installSubmitHandler_();
  }

  /** @private */
  installSubmitHandler_() {
    this.form_.addEventListener('submit', e => this.handleSubmit_(e), true);
    const inputs = this.form_.querySelectorAll('input,select,textarea');
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('blur', onInputInteraction_);
      inputs[i].addEventListener('input', onInputInteraction_);
    }
  }

  /**
   * Note on stopImmediatePropagation usage here, it is important to emulate native
   * browser submit event blocking. Otherwise any other submit listeners would get the
   * event.
   *
   * For example, action service shouldn't trigger 'submit' event if form is actually
   * invalid. stopImmediatePropagation allows us to make sure we don't trigger it
   *
   *
   * @param {!Event} e
   * @private
   */
  handleSubmit_(e) {
    if (this.state_ == FormState_.SUBMITTING) {
      e.stopImmediatePropagation();
      return;
    }

    // Validity checking should always occur, novalidate only circumvent
    // reporting and blocking submission on non-valid forms.
    const isValid = checkUserValidityOnSubmission(this.form_);
    if (this.shouldValidate_ && !isValid) {
      e.stopImmediatePropagation();
      // TODO(#3776): Use .mutate method when it supports passing state.
      this.vsync_.run({
        measure: undefined,
        mutate: reportValidity,
      }, {form: this.form_});
      return;
    }

    if (this.xhrAction_) {
      e.preventDefault();
      this.cleanupRenderedTemplate_();
      this.setState_(FormState_.SUBMITTING);
      this.xhr_.fetchJson(this.xhrAction_, {
        body: new FormData(this.form_),
        method: this.method_,
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      }).then(response => {
        this.actions_.trigger(this.form_, 'submit-success', null);
        this.setState_(FormState_.SUBMIT_SUCCESS);
        this.renderTemplate_(response || {});
      }).catch(error => {
        this.actions_.trigger(this.form_, 'submit-error', null);
        this.setState_(FormState_.SUBMIT_ERROR);
        this.renderTemplate_(error.responseJson || {});
        rethrowAsync('Form submission failed:', error);
      });
    } else if (this.target_ == '_top' && this.method_ == 'POST') {
      this.cleanupRenderedTemplate_();
      this.setState_(FormState_.SUBMITTING);
    }
  }

  /**
   * Adds proper classes for the state passed.
   * @param {string} newState
   * @private
   */
  setState_(newState) {
    const previousState = this.state_;
    this.form_.classList.remove(`amp-form-${previousState}`);
    this.form_.classList.add(`amp-form-${newState}`);
    this.state_ = newState;
    this.submitButtons_.forEach(button => {
      if (newState == FormState_.SUBMITTING) {
        button.setAttribute('disabled', '');
      } else {
        button.removeAttribute('disabled');
      }
    });
  }

  /**
   * @param {!Object=} data
   * @private
   */
  renderTemplate_(data = {}) {
    const container = this.form_.querySelector(`[${this.state_}]`);
    if (container) {
      return this.templates_.findAndRenderTemplate(container, data)
          .then(rendered => {
            rendered.setAttribute('i-amp-rendered', '');
            container.appendChild(rendered);
          });
    }
  }

  /**
   * @private
   */
  cleanupRenderedTemplate_() {
    const container = this.form_.querySelector(`[${this.state_}]`);
    if (!container) {
      return;
    }
    const previousRender = childElementByAttr(container, 'i-amp-rendered');
    if (previousRender) {
      removeElement(previousRender);
    }
  }
}


/**
 * Reports validity of the form passed through state object.
 * @param {!Object} state
 */
function reportValidity(state) {
  reportFormValidity(state.form);
}


/**
 * Reports validity for the first invalid input - if any.
 * @param {!HTMLFormElement} form
 */
function reportFormValidity(form) {
  const inputs = form.querySelectorAll('input,select,textarea');
  for (let i = 0; i < inputs.length; i++) {
    if (!inputs[i].checkValidity()) {
      reportInputValidity(inputs[i]);
      break;
    }
  }
}


/**
 * Revalidates the currently focused input after a change.
 * @param {!KeyboardEvent} event
 */
function onInvalidInputKeyUp_(event) {
  if (event.target.checkValidity()) {
    validationBubble.hide();
  } else {
    validationBubble.show(event.target, event.target.validationMessage);
  }
}


/**
 * Hides validation bubble and removes listeners on the invalid input.
 * @param {!Event} event
 */
function onInvalidInputBlur_(event) {
  validationBubble.hide();
  event.target.removeEventListener('blur', onInvalidInputBlur_);
  event.target.removeEventListener('keyup', onInvalidInputKeyUp_);
}


/**
 * Focuses and reports the invalid message of the input in a message bubble.
 * @param {!HTMLInputElement} input
 */
function reportInputValidity(input) {
  if (isReportValiditySupported(input.ownerDocument)) {
    input.reportValidity();
  } else {
    input./*OK*/focus();

    // Remove any previous listeners on the same input. This avoids adding many
    // listeners on the same element when the user submit pressing Enter or any
    // other method to submit the form without the element losing focus.
    input.removeEventListener('blur', onInvalidInputBlur_);
    input.removeEventListener('keyup', onInvalidInputKeyUp_);

    input.addEventListener('keyup', onInvalidInputKeyUp_);
    input.addEventListener('blur', onInvalidInputBlur_);
    validationBubble.show(input, input.validationMessage);
  }
}


/**
 * Checks user validity for all inputs, fieldsets and the form.
 * @param {!HTMLFormElement} form
 * @return {boolean} Whether the form is currently valid or not.
 */
function checkUserValidityOnSubmission(form) {
  const inputs = form.querySelectorAll('input,select,textarea,fieldset');
  for (let i = 0; i < inputs.length; i++) {
    checkUserValidity(inputs[i]);
  }
  return checkUserValidity(form);
}


/**
 * Returns the user validity state of the element.
 * @param {!HTMLInputElement|!HTMLFormElement|!HTMLFieldSetElement} element
 * @return {string}
 */
function getUserValidityStateFor(element) {
  if (element.classList.contains('user-valid')) {
    return UserValidityState.USER_VALID;
  } else if (element.classList.contains('user-invalid')) {
    return UserValidityState.USER_INVALID;
  }

  return UserValidityState.NONE;
}


/**
 * Checks user validity which applies .user-valid and .user-invalid AFTER the user
 * interacts with the input by moving away from the input (blur) or by changing its
 * value (input).
 *
 * See :user-invalid spec for more details:
 *   https://drafts.csswg.org/selectors-4/#user-pseudos
 *
 * The specs are still not fully specified. The current solution tries to follow a common
 * sense approach for when to apply these classes. As the specs gets clearer, we should
 * strive to match it as much as possible.
 *
 * TODO(#4317): Follow up on ancestor propagation behavior and understand the future
 *              specs for the :user-valid/:user-inavlid.
 *
 * @param {!HTMLInputElement|!HTMLFormElement|!HTMLFieldSetElement} element
 * @param {boolean=} propagate Whether to propagate the user validity to ancestors.
 * @returns {boolean} Whether the element is valid or not.
 */
function checkUserValidity(element, propagate = false) {
  let shouldPropagate = false;
  const previousValidityState = getUserValidityStateFor(element);
  const isCurrentlyValid = element.checkValidity && element.checkValidity();
  if (previousValidityState != UserValidityState.USER_VALID &&
      isCurrentlyValid) {
    element.classList.add('user-valid');
    element.classList.remove('user-invalid');
    // Don't propagate user-valid unless it was marked invalid before.
    shouldPropagate = previousValidityState == UserValidityState.USER_INVALID;
  } else if (previousValidityState != UserValidityState.USER_INVALID &&
      !isCurrentlyValid) {
    element.classList.add('user-invalid');
    element.classList.remove('user-valid');
    // Always propagate an invalid state change. One invalid input field is
    // guaranteed to make the fieldset and form invalid as well.
    shouldPropagate = true;
  }

  if (propagate && shouldPropagate) {
    // Propagate user validity to ancestor fieldsets.
    const ancestors = ancestorElementsByTag(element, 'fieldset');
    for (let i = 0; i < ancestors.length; i++) {
      checkUserValidity(ancestors[i]);
    }
    // Also update the form user validity.
    if (element.form) {
      checkUserValidity(element.form);
    }
  }

  return isCurrentlyValid;
}


/**
 * Responds to user interaction with an input by checking user validity of the input
 * and possibly its input-related ancestors (e.g. feildset, form).
 * @param {!Event} e
 * @private visible for testing.
 */
export function onInputInteraction_(e) {
  const input = e.target;
  checkUserValidity(input, /* propagate */ true);
}


/**
 * Installs submission handler on all forms in the document.
 * @param {!Window} win
 */
function installSubmissionHandlers(win) {
  onDocumentReady(win.document, doc => {
    toArray(doc.forms).forEach(form => {
      new AmpForm(form);
    });
  });
}


/**
 * @param {!Window} win
 * @private visible for testing.
 */
export function installAmpForm(win) {
  return getService(win, 'amp-form', () => {
    if (isExperimentOn(win, TAG)) {
      installStyles(win.document, CSS, () => {
        validationBubble = new ValidationBubble(win);
        installSubmissionHandlers(win);
      });
    }
    return {};
  });
}

installAmpForm(AMP.win);
