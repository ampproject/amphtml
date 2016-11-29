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

import {triggerAnalyticsEvent} from '../../../src/analytics';
import {getService} from '../../../src/service';
import {
  assertHttpsUrl,
  addParamsToUrl,
  SOURCE_ORIGIN_PARAM,
  isProxyOrigin,
} from '../../../src/url';
import {dev, user, rethrowAsync} from '../../../src/log';
import {onDocumentReady} from '../../../src/document-ready';
import {xhrFor} from '../../../src/xhr';
import {toArray} from '../../../src/types';
import {templatesFor} from '../../../src/template';
import {
  removeElement,
  childElementByAttr,
  ancestorElementsByTag,
} from '../../../src/dom';
import {installStyles} from '../../../src/style-installer';
import {CSS} from '../../../build/amp-form-0.1.css';
import {vsyncFor} from '../../../src/vsync';
import {actionServiceForDoc} from '../../../src/action';
import {getFormValidator} from './form-validators';

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


/** @typedef {!HTMLInputElement|!HTMLSelectElement|!HTMLTextAreaElement} */
let FormFieldDef;


export class AmpForm {

  /**
   * Adds functionality to the passed form element and listens to submit event.
   * @param {!HTMLFormElement} element
   * @param {string} id
   */
  constructor(element, id) {
    /** @private @const {string} */
    this.id_ = id;

    /** @const @private {!Window} */
    this.win_ = element.ownerDocument.defaultView;

    /** @const @private {!HTMLFormElement} */
    this.form_ = element;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(this.win_);

    /** @const @private {!../../../src/service/template-impl.Templates} */
    this.templates_ = templatesFor(this.win_);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = xhrFor(this.win_);

    /** @const @private {!../../../src/service/action-impl.ActionService} */
    this.actions_ = actionServiceForDoc(this.win_.document.documentElement);

    /** @const @private {string} */
    this.method_ = (this.form_.getAttribute('method') || 'GET').toUpperCase();

    /** @const @private {string} */
    this.target_ = this.form_.getAttribute('target');

    /** @const @private {?string} */
    this.xhrAction_ = this.form_.getAttribute('action-xhr');
    if (this.xhrAction_) {
      assertHttpsUrl(this.xhrAction_, this.form_, 'action-xhr');
      user().assert(!isProxyOrigin(this.xhrAction_),
          'form action-xhr should not be on AMP CDN: %s',
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

    const submitButtons = this.form_.querySelectorAll('[type="submit"]');
    /** @const @private {!Array<!Element>} */
    this.submitButtons_ = toArray(submitButtons);

    /** @private {?string} */
    this.state_ = null;

    const inputs = this.form_.elements;
    for (let i = 0; i < inputs.length; i++) {
      user().assert(!inputs[i].name ||
          inputs[i].name != SOURCE_ORIGIN_PARAM,
          'Illegal input name, %s found: %s', SOURCE_ORIGIN_PARAM, inputs[i]);
    }

    /** @const @private {!./form-validators.FormValidator} */
    this.validator_ = getFormValidator(this.form_);

    this.actions_.installActionHandler(
        this.form_, this.actionHandler_.bind(this));
    this.installEventHandlers_();
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  actionHandler_(invocation) {
    if (invocation.method == 'submit') {
      this.handleSubmit_();
    }
  }

  /** @private */
  installEventHandlers_() {
    this.form_.addEventListener('submit', e => this.handleSubmit_(e), true);
    this.form_.addEventListener('blur', e => {
      onInputInteraction_(e);
      this.validator_.onBlur(e);
    }, true);
    this.form_.addEventListener('input', e => {
      onInputInteraction_(e);
      this.validator_.onInput(e);
    });
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
   * @param {?Event=} opt_event
   * @private
   */
  handleSubmit_(opt_event) {
    if (this.state_ == FormState_.SUBMITTING) {
      if (opt_event) {
        opt_event.stopImmediatePropagation();
        opt_event.preventDefault();
      }
      return;
    }

    // Validity checking should always occur, novalidate only circumvent
    // reporting and blocking submission on non-valid forms.
    const isValid = checkUserValidityOnSubmission(this.form_);
    if (this.shouldValidate_ && !isValid) {
      if (opt_event) {
        opt_event.stopImmediatePropagation();
        opt_event.preventDefault();
      }
      // TODO(#3776): Use .mutate method when it supports passing state.
      this.vsync_.run({
        measure: undefined,
        mutate: reportValidity,
      }, {
        validator: this.validator_,
      });
      return;
    }

    if (this.xhrAction_) {
      if (opt_event) {
        opt_event.preventDefault();
      }
      this.cleanupRenderedTemplate_();
      this.setState_(FormState_.SUBMITTING);
      const isHeadOrGet = this.method_ == 'GET' || this.method_ == 'HEAD';
      let xhrUrl = this.xhrAction_;
      if (isHeadOrGet) {
        xhrUrl = addParamsToUrl(this.xhrAction_, this.getFormAsObject_());
      }
      this.xhr_.fetchJson(xhrUrl, {
        body: isHeadOrGet ? undefined : new FormData(this.form_),
        method: this.method_,
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
      }).then(response => {
        this.actions_.trigger(this.form_, 'submit-success', null);
        // TODO(mkhatib, #6032): Update docs to reflect analytics events.
        this.analyticsEvent_('amp-form-submit-success');
        this.setState_(FormState_.SUBMIT_SUCCESS);
        this.renderTemplate_(response || {});
      }).catch(error => {
        this.actions_.trigger(this.form_, 'submit-error', null);
        this.analyticsEvent_('amp-form-submit-error');
        this.setState_(FormState_.SUBMIT_ERROR);
        this.renderTemplate_(error.responseJson || {});
        rethrowAsync('Form submission failed:', error);
      });
    } else if (this.method_ == 'POST') {
      if (opt_event) {
        opt_event.preventDefault();
      }
      user().assert(false,
          'Only XHR based (via action-xhr attribute) submissions are support ' +
          'for POST requests. %s',
          this.form_);
    }
  }

  /**
   * @param {string} eventType
   * @param {!Object<string, string>=} opt_vars A map of vars and their values.
   * @private
   */
  analyticsEvent_(eventType, opt_vars) {
    triggerAnalyticsEvent(this.win_, eventType, opt_vars);
  }

  /**
   * Returns form data as an object.
   * @return {!Object}
   * @private
   */
  getFormAsObject_() {
    const data = {};
    const inputs = this.form_.elements;
    const submittableTagsRegex = /^(?:input|select|textarea)$/i;
    const unsubmittableTypesRegex = /^(?:button|image|file|reset)$/i;
    const checkableType = /^(?:checkbox|radio)$/i;
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (!input.name || isDisabled_(input) ||
          !submittableTagsRegex.test(input.tagName) ||
          unsubmittableTypesRegex.test(input.type) ||
          (checkableType.test(input.type) && !input.checked)) {
        continue;
      }

      if (data[input.name] === undefined) {
        data[input.name] = [];
      }
      data[input.name].push(input.value);
    }
    return data;
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
   * @param {!JSONType} data
   * @private
   */
  renderTemplate_(data) {
    const container = this.form_.querySelector(`[${this.state_}]`);
    if (container) {
      const messageId = `rendered-message-${this.id_}`;
      container.setAttribute('role', 'alert');
      container.setAttribute('aria-labeledby', messageId);
      container.setAttribute('aria-live', 'assertive');
      return this.templates_.findAndRenderTemplate(container, data)
          .then(rendered => {
            rendered.id = messageId;
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
  state.validator.report();
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
 * @param {!Element} element
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
 * Updates class names on the element to reflect the active invalid types on it.
 *
 * TODO(#5005): Maybe propagate the invalid type classes to parents of the input as well.
 *
 * @param {!Element} element
 */
function updateInvalidTypesClasses(element) {
  if (!element.validity) {
    return;
  }
  for (const validationType in element.validity) {
    element.classList.toggle(validationType, element.validity[validationType]);
  }
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
 * @param {!Element} element
 * @param {boolean=} propagate Whether to propagate the user validity to ancestors.
 * @returns {boolean} Whether the element is valid or not.
 */
function checkUserValidity(element, propagate = false) {
  let shouldPropagate = false;
  const previousValidityState = getUserValidityStateFor(element);
  const isCurrentlyValid = element.checkValidity();
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
  updateInvalidTypesClasses(element);

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
  const input = dev().assertElement(e.target);
  checkUserValidity(input, /* propagate */ true);
}


/**
 * Checks if a field is disabled.
 * @param {!Element} element
 * @private
 */
function isDisabled_(element) {
  if (element.disabled) {
    return true;
  }

  const ancestors = ancestorElementsByTag(element, 'fieldset');
  for (let i = 0; i < ancestors.length; i++) {
    if (ancestors[i].disabled) {
      return true;
    }
  }
  return false;
}


/**
 * Installs submission handler on all forms in the document.
 * @param {!Window} win
 */
function installSubmissionHandlers(win) {
  onDocumentReady(win.document, doc => {
    toArray(doc.forms).forEach((form, index) => {
      new AmpForm(form, `amp-form-${index}`);
    });
  });
}


/**
 * @param {!Window} win
 * @private visible for testing.
 */
export function installAmpForm(win) {
  return getService(win, TAG, () => {
    installStyles(win.document, CSS, () => {
      installSubmissionHandlers(win);
    });
    return {};
  });
}

installAmpForm(AMP.win);
