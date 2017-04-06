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

import {installFormProxy} from './form-proxy';
import {triggerAnalyticsEvent} from '../../../src/analytics';
import {createCustomEvent} from '../../../src/event-helper';
import {installStylesForShadowRoot} from '../../../src/shadow-embed';
import {documentInfoForDoc} from '../../../src/services';
import {iterateCursor} from '../../../src/dom';
import {setFormForElement} from '../../../src/form';
import {
  assertAbsoluteHttpOrHttpsUrl,
  assertHttpsUrl,
  addParamsToUrl,
  SOURCE_ORIGIN_PARAM,
  isProxyOrigin,
  parseUrl,
} from '../../../src/url';
import {dev, user, rethrowAsync} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {xhrFor} from '../../../src/services';
import {toArray} from '../../../src/types';
import {templatesFor} from '../../../src/services';
import {
  removeElement,
  childElementByAttr,
  ancestorElementsByTag,
} from '../../../src/dom';
import {installStyles} from '../../../src/style-installer';
import {CSS} from '../../../build/amp-form-0.1.css';
import {vsyncFor} from '../../../src/services';
import {actionServiceForDoc} from '../../../src/services';
import {timerFor} from '../../../src/services';
import {urlReplacementsForDoc} from '../../../src/services';
import {resourcesForDoc} from '../../../src/services';
import {
  getFormValidator,
  isCheckValiditySupported,
} from './form-validators';


/** @type {string} */
const TAG = 'amp-form';


/**
 * A list of external dependencies that can be included in forms.
 * @type {!Array<string>}
 */
const EXTERNAL_DEPS = [
  'amp-selector',
];


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


/** @private @const {string} */
const REDIRECT_TO_HEADER = 'AMP-Redirect-To';


export class AmpForm {

  /**
   * Adds functionality to the passed form element and listens to submit event.
   * @param {!HTMLFormElement} element
   * @param {string} id
   */
  constructor(element, id) {
    //TODO(dvoytenko, #7063): Remove the try catch.
    try {
      installFormProxy(element);
    } catch (e) {
      dev().error(TAG, 'form proxy failed to install', e);
    }

    setFormForElement(element, this);

    /** @private @const {string} */
    this.id_ = id;

    /** @const @private {!Window} */
    this.win_ = element.ownerDocument.defaultView;

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = timerFor(this.win_);

    /** @const @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacement_ = urlReplacementsForDoc(element);

    /** @private {?Promise} */
    this.dependenciesPromise_ = null;

    /** @const @private {!HTMLFormElement} */
    this.form_ = element;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(this.win_);

    /** @const @private {!../../../src/service/template-impl.Templates} */
    this.templates_ = templatesFor(this.win_);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = xhrFor(this.win_);

    /** @const @private {!../../../src/service/action-impl.ActionService} */
    this.actions_ = actionServiceForDoc(this.form_);

    /** @const @private {!../../../src/service/resources-impl.Resources} */
    this.resources_ = resourcesForDoc(this.form_);

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

    /**
     * Indicates that the action will submit to canonical or not.
     * @private {boolean|undefined}
     */
    this.isCanonicalAction_ = undefined;

    /** @const @private {boolean} */
    this.shouldValidate_ = !this.form_.hasAttribute('novalidate');
    // Need to disable browser validation in order to allow us to take full
    // control of this. This allows us to trigger validation APIs and reporting
    // when we need to.
    this.form_.setAttribute('novalidate', '');
    if (!this.shouldValidate_) {
      this.form_.setAttribute('amp-novalidate', '');
    }
    this.form_.classList.add('i-amphtml-form');

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

    /** @private {?Promise} */
    this.xhrSubmitPromise_ = null;
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  actionHandler_(invocation) {
    if (invocation.method == 'submit') {
      this.whenDependenciesReady_().then(this.handleSubmitAction_.bind(this));
    }
  }

  /**
   * Returns a promise that will be resolved when all dependencies used inside the form
   * tag are loaded and built (e.g. amp-selector) or 2 seconds timeout - whichever is first.
   * @return {!Promise}
   * @private
   */
  whenDependenciesReady_() {
    if (this.dependenciesPromise_) {
      return this.dependenciesPromise_;
    }
    const depElements = this.form_./*OK*/querySelectorAll(
        EXTERNAL_DEPS.join(','));
    // Wait for an element to be built to make sure it is ready.
    const depPromises = toArray(depElements).map(el => el.whenBuilt());
    return this.dependenciesPromise_ = Promise.race(
        [Promise.all(depPromises), this.timer_.promise(2000)]);
  }

  /** @private */
  installEventHandlers_() {
    this.form_.addEventListener(
        'submit', this.handleSubmitEvent_.bind(this), true);
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
   * Triggers 'amp-form-submit' event in 'amp-analytics' and
   * generates variables for form fields to be accessible in analytics
   *
   * @private
   */
  triggerFormSubmitInAnalytics_() {
    const formDataForAnalytics = {};
    const formObject = this.getFormAsObject_();

    for (const k in formObject) {
      if (formObject.hasOwnProperty(k)) {
        formDataForAnalytics['formFields[' + k + ']'] = formObject[k].join(',');
      }
    }
    formDataForAnalytics['formId'] = this.form_.id;

    this.analyticsEvent_('amp-form-submit', formDataForAnalytics);
  }

  /**
   * Handles submissions through action service invocations.
   *   e.g. <img on=tap:form.submit>
   * @private
   */
  handleSubmitAction_() {
    if (this.state_ == FormState_.SUBMITTING || !this.checkValidity_()) {
      return;
    }
    this.submit_();
    if (this.method_ == 'GET' && !this.xhrAction_) {
      // Trigger the actual submit of GET non-XHR.
      this.form_.submit();
    }
  }

  /**
   * Note on stopImmediatePropagation usage here, it is important to emulate native
   * browser submit event blocking. Otherwise any other submit listeners would get the
   * event.
   *
   * For example, action service shouldn't trigger 'submit' event if form is actually
   * invalid. stopImmediatePropagation allows us to make sure we don't trigger it.
   *
   * This prevents the default submission event in any of following cases:
   *   - The form is still finishing a previous submission.
   *   - The form is invalid.
   *   - Handling an XHR submission.
   *   - It's a non-XHR POST submission (unsupported).
   *
   * @param {!Event} event
   * @private
   */
  handleSubmitEvent_(event) {
    if (this.state_ == FormState_.SUBMITTING || !this.checkValidity_()) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }
    if (this.xhrAction_ || this.method_ == 'POST') {
      event.preventDefault();
    }
    this.submit_();
  }

  /**
   * A helper method that actual handles the for different cases (post, get, xhr...).
   * @private
   */
  submit_() {
    let varSubsFields = [];
    // Only allow variable substitutions for inputs if the form action origin
    // is the canonical origin.
    // TODO(mkhatib, #7168): Consider relaxing this.
    if (this.isSubmittingToCanonical_()) {
      // Fields that support var substitutions.
      varSubsFields = this.form_.querySelectorAll(
          '[type="hidden"][data-amp-replace]');
    } else {
      user().warn(TAG, 'Variable substitutions disabled for non-canonical ' +
          'origin submit action: %s', this.form_);
    }

    if (this.xhrAction_) {
      this.handleXhrSubmit_(varSubsFields);
    } else if (this.method_ == 'POST') {
      this.handleNonXhrPost_();
    } else if (this.method_ == 'GET') {
      this.handleNonXhrGet_(varSubsFields);
    }
  }

  /**
   * Checks whether the submissions are going to go through to the canonical origin
   * or not.
   * @private
   */
  isSubmittingToCanonical_() {
    if (this.isCanonicalAction_ !== undefined) {
      return this.isCanonicalAction_;
    }

    const docInfo = documentInfoForDoc(this.form_);
    const canonicalOrigin = parseUrl(docInfo.canonicalUrl).origin;
    const url = this.xhrAction_ || this.form_.getAttribute('action');
    return this.isCanonicalAction_ = parseUrl(url).origin == canonicalOrigin;
  }

  /**
   * @param {IArrayLike<!HTMLInputElement>} varSubsFields
   * @private
   */
  handleXhrSubmit_(varSubsFields) {
    this.cleanupRenderedTemplate_();
    this.setState_(FormState_.SUBMITTING);
    const isHeadOrGet = this.method_ == 'GET' || this.method_ == 'HEAD';
    const varSubPromises = [];
    for (let i = 0; i < varSubsFields.length; i++) {
      varSubPromises.push(
          this.urlReplacement_.expandInputValueAsync(varSubsFields[i]));
    }

    // Wait until all variables have been substituted or 100ms timeout.
    const p = this.waitOnPromisesOrTimeout_(varSubPromises, 100).then(() => {
      this.triggerFormSubmitInAnalytics_();

      let xhrUrl, body;
      if (isHeadOrGet) {
        xhrUrl = addParamsToUrl(
            dev().assertString(this.xhrAction_), this.getFormAsObject_());
      } else {
        xhrUrl = this.xhrAction_;
        body = new FormData(this.form_);
      }
      this.actions_.trigger(this.form_, 'submit', /*event*/ null);
      return this.xhr_.fetch(dev().assertString(xhrUrl), {
        body,
        method: this.method_,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      }).then(response => {
        return response.json().then(json => {
          this.triggerAction_(/* success */ true, json);
          this.analyticsEvent_('amp-form-submit-success');
          this.setState_(FormState_.SUBMIT_SUCCESS);
          this.renderTemplate_(json || {});
          this.maybeHandleRedirect_(
              /** @type {../../../src/service/xhr-impl.FetchResponse} */ (
                  response));
        }, error => {
          rethrowAsync('Failed to parse response JSON:', error);
        });
      }, error => {
        this.triggerAction_(
            /* success */ false, error ? error.responseJson : null);
        this.analyticsEvent_('amp-form-submit-error');
        this.setState_(FormState_.SUBMIT_ERROR);
        this.renderTemplate_(error.responseJson || {});
        this.maybeHandleRedirect_(
            /** @type {../../../src/service/xhr-impl.FetchResponse} */ (
                error));
        rethrowAsync('Form submission failed:', error);
      });
    });
    if (getMode().test) {
      this.xhrSubmitPromise_ = p;
    }
  }

  /** @private */
  handleNonXhrPost_() {
    // non-XHR POST requests are not supported.
    user().assert(false,
        'Only XHR based (via action-xhr attribute) submissions are support ' +
        'for POST requests. %s',
        this.form_);
  }

  /**
   * Executes variable substitutions on the passed fields.
   * @param {IArrayLike<!HTMLInputElement>} varSubsFields
   * @private
   */
  handleNonXhrGet_(varSubsFields) {
    // Non-xhr GET requests replacement should happen synchronously.
    for (let i = 0; i < varSubsFields.length; i++) {
      this.urlReplacement_.expandInputValueSync(varSubsFields[i]);
    }
    this.triggerFormSubmitInAnalytics_();
  }

  /**
   * @private
   * @return {boolean} False if the form is invalid.
   */
  checkValidity_() {
    if (isCheckValiditySupported(this.win_.document)) {
      // Validity checking should always occur, novalidate only circumvent
      // reporting and blocking submission on non-valid forms.
      const isValid = checkUserValidityOnSubmission(this.form_);
      if (this.shouldValidate_ && !isValid) {
        // TODO(#3776): Use .mutate method when it supports passing state.
        this.vsync_.run({
          measure: undefined,
          mutate: reportValidity,
        }, {
          validator: this.validator_,
        });
        return false;
      }
    }
    return true;
  }

  /**
   * Handles response redirect throught the AMP-Redirect-To response header.
   * @param {../../../src/service/xhr-impl.FetchResponse} response
   * @private
   */
  maybeHandleRedirect_(response) {
    if (!response.headers) {
      return;
    }
    const redirectTo = response.headers.get(REDIRECT_TO_HEADER);
    if (redirectTo) {
      user().assert(this.target_ != '_blank',
          'Redirecting to target=_blank using AMP-Redirect-To is currently ' +
          'not supported, use target=_top instead. %s', this.form_);
      try {
        assertAbsoluteHttpOrHttpsUrl(redirectTo);
        assertHttpsUrl(redirectTo, 'AMP-Redirect-To', 'Url');
      } catch (e) {
        user().assert(false, 'The `AMP-Redirect-To` header value must be an ' +
            'absolute URL starting with https://. Found %s', redirectTo);
      }
      this.win_.top.location.href = redirectTo;
    }
  }

  /**
   * Triggers either a submit-success or submit-error action with response data.
   * @param {boolean} success
   * @param {?JSONType} json
   * @private
   */
  triggerAction_(success, json) {
    const name = success ? FormState_.SUBMIT_SUCCESS : FormState_.SUBMIT_ERROR;
    const event =
        createCustomEvent(this.win_, `${TAG}.${name}`, {response: json});
    this.actions_.trigger(this.form_, name, event);
  }

  /**
   * Returns a race promise between resolving all promises or timing out.
   * @param {!Array<!Promise>} promises
   * @param {number} timeout
   * @return {!Promise}
   * @private
   */
  waitOnPromisesOrTimeout_(promises, timeout) {
    return Promise.race(
        [Promise.all(promises), this.timer_.promise(timeout)]);
  }

  /**
   * @param {string} eventType
   * @param {!Object<string, string>=} opt_vars A map of vars and their values.
   * @private
   */
  analyticsEvent_(eventType, opt_vars) {
    triggerAnalyticsEvent(this.form_, eventType, opt_vars);
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
    const container = this.form_./*OK*/querySelector(`[${this.state_}]`);
    if (container) {
      const messageId = `rendered-message-${this.id_}`;
      container.setAttribute('role', 'alert');
      container.setAttribute('aria-labeledby', messageId);
      container.setAttribute('aria-live', 'assertive');

      if (this.templates_.hasTemplate(container)) {
        this.templates_.findAndRenderTemplate(container, data)
            .then(rendered => {
              rendered.id = messageId;
              rendered.setAttribute('i-amphtml-rendered', '');
              container.appendChild(rendered);
            });
      } else {
        // TODO(vializ): This is to let AMP know that the AMP elements inside
        // this container are now visible so they get scheduled for layout.
        // This will be unnecessary when the AMP Layers implementation is
        // complete. We call mutateElement here and not where the template is
        // made visible so that we don't do redundant layout work when a
        // template is rendered too.
        this.resources_.mutateElement(container, () => {});
      }
    }
  }

  /**
   * @private
   */
  cleanupRenderedTemplate_() {
    const container = this.form_./*OK*/querySelector(`[${this.state_}]`);
    if (!container) {
      return;
    }
    const previousRender = childElementByAttr(container, 'i-amphtml-rendered');
    if (previousRender) {
      removeElement(previousRender);
    }
  }

  /**
   * @return {Array<!Element>}
   * @public
   */
  getDynamicElementContainers() {
    const dynamicElements = [];
    const successDiv =
        this.form_./*OK*/querySelector(`[${FormState_.SUBMIT_SUCCESS}]`);
    const errorDiv =
        this.form_./*OK*/querySelector(`[${FormState_.SUBMIT_ERROR}]`);
    if (successDiv) {
      dynamicElements.push(successDiv);
    }
    if (errorDiv) {
      dynamicElements.push(errorDiv);
    }
    return dynamicElements;
  }

  /**
   * Returns a promise that resolves when xhr submit finishes. the promise
   * will be null if xhr submit has not started.
   * @visibleForTesting
   */
  xhrSubmitPromiseForTesting() {
    return this.xhrSubmitPromise_;
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
 * @return {boolean} Whether the element is valid or not.
 */
function checkUserValidity(element, propagate = false) {
  // TODO(mkhatib, #6930): Implement basic validation for custom inputs like
  // amp-selector.
  // If this is not a field type with checkValidity don't do anything.
  if (!element.checkValidity) {
    return true;
  }
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
 * Bootstraps the amp-form elements
 */
export class AmpFormService {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    this.installStyles_(ampdoc).then(() => this.installHandlers_(ampdoc));
  }

  /**
   * Install the amp-form CSS
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Promise}
   * @private
   */
  installStyles_(ampdoc) {
    return new Promise(resolve => {
      if (ampdoc.isSingleDoc()) {
        const root = /** @type {!Document} */ (ampdoc.getRootNode());
        installStyles(root, CSS, resolve);
      } else {
        const root = /** @type {!ShadowRoot} */ (ampdoc.getRootNode());
        installStylesForShadowRoot(root, CSS);
        resolve();
      }
    });
  }

  /**
   * Install the event handlers
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Promise}
   * @private
   */
  installHandlers_(ampdoc) {
    return ampdoc.whenReady().then(() => {
      this.installSubmissionHandlers_(
          ampdoc.getRootNode().querySelectorAll('form'));
      this.installGlobalEventListener_(ampdoc.getRootNode());
    });
  }

  /**
   * Install submission handler on all forms in the document.
   * @param {?IArrayLike<T>} forms
   * @previousValidityState
   * @template T
   * @private
   */
  installSubmissionHandlers_(forms) {
    if (!forms) {
      return;
    }

    iterateCursor(forms, (form, index) => {
      if (!form.classList.contains('i-amphtml-form')) {
        new AmpForm(form, `amp-form-${index}`);
      }
    });
  }

  /**
   * Listen for DOM updated messages sent to the document.
   * @param {!Document|!ShadowRoot} doc
   * @private
   */
  installGlobalEventListener_(doc) {
    doc.addEventListener('amp:dom-update', () => {
      this.installSubmissionHandlers_(doc.querySelectorAll('form'));
    });
  }
}


AMP.registerServiceForDoc(TAG, AmpFormService);
