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
import {removeElement, childElementByAttr} from '../../../src/dom';
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

/** @type {?./validation-bubble.ValidationBubble|undefined} */
let validationBubble;

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
      user.assert(!startsWith(this.xhrAction_, urls.cdn),
          'form action-xhr should not be on cdn.ampproject.org: %s',
          this.form_);
    }

    const submitButtons = this.form_.querySelectorAll('input[type=submit]');
    user.assert(submitButtons && submitButtons.length > 0,
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

    const shouldValidate = !this.form_.hasAttribute('novalidate');
    const isInvalid = shouldValidate &&
        this.form_.checkValidity && !this.form_.checkValidity();
    if (isInvalid) {
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


/**
 * Installs submission handler on all forms in the document.
 * @param {!Window} win
 */
function installSubmissionHandlers(win) {
  onDocumentReady(win.document, () => {
    toArray(win.document.forms).forEach(form => {
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
