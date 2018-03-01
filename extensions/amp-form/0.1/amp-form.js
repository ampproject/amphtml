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

import {ActionTrust} from '../../../src/action-trust';
import {AmpEvents} from '../../../src/amp-events';
import {CSS} from '../../../build/amp-form-0.1.css';
import {
  FORM_VERIFY_PARAM,
  getFormVerifier,
} from './form-verifiers';
import {FormDataWrapper} from '../../../src/form-data-wrapper';
import {FormEvents} from './form-events';
import {
  SOURCE_ORIGIN_PARAM,
  addParamsToUrl,
  assertAbsoluteHttpOrHttpsUrl,
  assertHttpsUrl,
  isProxyOrigin,
} from '../../../src/url';
import {Services} from '../../../src/services';
import {
  ancestorElementsByTag,
  childElementByAttr,
  removeElement,
} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {deepMerge} from '../../../src/utils/object';
import {dev, user} from '../../../src/log';
import {
  formOrNullForElement,
  getFormAsObject,
  setFormForElement,
} from '../../../src/form';
import {
  getFormValidator,
  isCheckValiditySupported,
} from './form-validators';
import {getMode} from '../../../src/mode';
import {installFormProxy} from './form-proxy';
import {installStylesForDoc} from '../../../src/style-installer';
import {
  iterateCursor,
  tryFocus,
} from '../../../src/dom';
import {toArray, toWin} from '../../../src/types';
import {triggerAnalyticsEvent} from '../../../src/analytics';

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
  INITIAL: 'initial',
  VERIFYING: 'verifying',
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
    this.win_ = toWin(element.ownerDocument.defaultView);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @const @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacement_ = Services.urlReplacementsForDoc(element);

    /** @private {?Promise} */
    this.dependenciesPromise_ = null;

    /** @const @private {!HTMLFormElement} */
    this.form_ = element;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);

    /** @const @private {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win_);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.win_);

    /** @const @private {!../../../src/service/action-impl.ActionService} */
    this.actions_ = Services.actionServiceForDoc(this.form_);

    /** @const @private {!../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(this.form_);

    /** @const @private */
    this.viewer_ = Services.viewerForDoc(this.form_);

    /** @const @private {string} */
    this.method_ = (this.form_.getAttribute('method') || 'GET').toUpperCase();

    /** @const @private {string} */
    this.target_ = this.form_.getAttribute('target');

    /** @const @private {?string} */
    this.xhrAction_ = this.getXhrUrl_('action-xhr');

    /** @const @private {?string} */
    this.xhrVerify_ = this.getXhrUrl_('verify-xhr');

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

    /** @private {!FormState_} */
    this.state_ = FormState_.INITIAL;

    const inputs = this.form_.elements;
    for (let i = 0; i < inputs.length; i++) {
      const name = inputs[i].name;
      user().assert(name != SOURCE_ORIGIN_PARAM && name != FORM_VERIFY_PARAM,
          'Illegal input name, %s found: %s', name, inputs[i]);
    }

    /** @const @private {!./form-validators.FormValidator} */
    this.validator_ = getFormValidator(this.form_);

    /** @const @private {!./form-verifiers.FormVerifier} */
    this.verifier_ = getFormVerifier(
        this.form_, () => this.handleXhrVerify_());

    this.actions_.installActionHandler(
        this.form_, this.actionHandler_.bind(this), ActionTrust.HIGH);
    this.installEventHandlers_();

    /** @private {?Promise} */
    this.xhrSubmitPromise_ = null;

    /** @private {?Promise} */
    this.renderTemplatePromise_ = null;
  }

  /**
   * Gets and validates an attribute for form request URLs.
   * @param {string} attribute
   * @return {?string}
   * @private
   */
  getXhrUrl_(attribute) {
    const url = this.form_.getAttribute(attribute);
    if (url) {
      assertHttpsUrl(url, this.form_, attribute);
      user().assert(!isProxyOrigin(url),
          `form ${attribute} should not be on AMP CDN: %s`,
          this.form_);
    }
    return url;
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @private
   */
  actionHandler_(invocation) {
    if (invocation.method == 'submit') {
      this.whenDependenciesReady_().then(() => {
        this.handleSubmitAction_(invocation);
      });
    }
    return null;
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
    const promises = toArray(depElements).map(el => el.whenBuilt());
    return this.dependenciesPromise_ = this.waitOnPromisesOrTimeout_(promises,
        2000);
  }

  /** @private */
  installEventHandlers_() {
    this.viewer_.whenNextVisible().then(() => {
      const autofocus = this.form_.querySelector('[autofocus]');
      if (autofocus) {
        tryFocus(autofocus);
      }
    });

    this.form_.addEventListener(
        'submit', this.handleSubmitEvent_.bind(this), true);

    this.form_.addEventListener('blur', e => {
      checkUserValidityAfterInteraction_(dev().assertElement(e.target));
      this.validator_.onBlur(e);
    }, true);

    const afterVerifierCommit = () => {
      // Move from the VERIFYING state back to INITIAL
      if (this.state_ === FormState_.VERIFYING) {
        this.setState_(FormState_.INITIAL);
      }
    };
    this.form_.addEventListener('change', e => {
      this.verifier_.onCommit()
          .then(updatedElements => {
            updatedElements.forEach(checkUserValidityAfterInteraction_);
            this.validator_.onBlur(e);
          }, () => {
            checkUserValidityAfterInteraction_(dev().assertElement(e.target));
          })
          .then(afterVerifierCommit, afterVerifierCommit);
    });

    this.form_.addEventListener('input', e => {
      checkUserValidityAfterInteraction_(dev().assertElement(e.target));
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
      if (Object.prototype.hasOwnProperty.call(formObject, k)) {
        formDataForAnalytics['formFields[' + k + ']'] = formObject[k].join(',');
      }
    }
    formDataForAnalytics['formId'] = this.form_.id;

    this.analyticsEvent_('amp-form-submit', formDataForAnalytics);
  }

  /**
   * Handles submissions through action service invocations.
   *   e.g. <img on=tap:form.submit>
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @private
   */
  handleSubmitAction_(invocation) {
    if (this.state_ == FormState_.SUBMITTING || !this.checkValidity_()) {
      return;
    }
    // `submit` has the same trust level as the AMP Action that caused it.
    this.submit_(invocation.trust);
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
    // Submits caused by user input have high trust.
    this.submit_(ActionTrust.HIGH);
  }

  /**
   * Helper method that actual handles the different cases (post, get, xhr...).
   * @param {ActionTrust} trust
   * @private
   */
  submit_(trust) {
    const varSubsFields = this.getVarSubsFields_();
    if (this.xhrAction_) {
      this.handleXhrSubmit_(varSubsFields, trust);
    } else if (this.method_ == 'POST') {
      this.handleNonXhrPost_();
    } else if (this.method_ == 'GET') {
      this.handleNonXhrGet_(varSubsFields);
    }
  }

  /**
   * Get form fields that require variable substitutions
   * @return {!IArrayLike<!HTMLInputElement>}
   * @private
   */
  getVarSubsFields_() {
    // Fields that support var substitutions.
    return this.form_.querySelectorAll('[type="hidden"][data-amp-replace]');
  }

  /**
   * Send the verify request and control the VERIFYING state.
   * @return {!Promise}
   * @private
   */
  handleXhrVerify_() {
    if (this.state_ === FormState_.SUBMITTING) {
      return Promise.resolve();
    }
    this.setState_(FormState_.VERIFYING);

    return this.doVarSubs_(this.getVarSubsFields_())
        .then(() => this.doVerifyXhr_());
  }

  /**
   * @param {!IArrayLike<!HTMLInputElement>} varSubsFields
   * @param {ActionTrust} trust
   * @private
   */
  handleXhrSubmit_(varSubsFields, trust) {
    this.setState_(FormState_.SUBMITTING);

    const p = this.doVarSubs_(varSubsFields)
        .then(() => {
          this.triggerFormSubmitInAnalytics_();
          this.actions_.trigger(
              this.form_, 'submit', /* event */ null, trust);
          // After variable substitution
          const values = this.getFormAsObject_();
          this.renderTemplate_(values);
        })
        .then(() => this.doActionXhr_())
        .then(response => this.handleXhrSubmitSuccess_(response),
            error => {
              return this.handleXhrSubmitFailure_(/** @type {!Error} */(error));
            });

    if (getMode().test) {
      this.xhrSubmitPromise_ = p;
    }
  }

  /**
   * Perform asynchronous variable substitution on the fields that require it.
   * @param {!IArrayLike<!HTMLInputElement>} varSubsFields
   * @return {!Promise}
   * @private
   */
  doVarSubs_(varSubsFields) {
    const varSubPromises = [];
    for (let i = 0; i < varSubsFields.length; i++) {
      varSubPromises.push(
          this.urlReplacement_.expandInputValueAsync(varSubsFields[i]));
    }
    return this.waitOnPromisesOrTimeout_(varSubPromises, 100);
  }

  /**
   * Send a request to the form's action endpoint.
   * @return {!Promise<!../../../src/service/xhr-impl.FetchResponse>}
   * @private
   */
  doActionXhr_() {
    return this.doXhr_(dev().assertString(this.xhrAction_), this.method_);
  }

  /**
   * Send a request to the form's verify endpoint.
   * @return {!Promise<!../../../src/service/xhr-impl.FetchResponse>}
   * @private
   */
  doVerifyXhr_() {
    return this.doXhr_(dev().assertString(this.xhrVerify_), this.method_,
        {[FORM_VERIFY_PARAM]: true});
  }

  /**
   * Send a request to a form endpoint.
   * @param {string} url
   * @param {string} method
   * @param {!Object<string, string>=} opt_extraFields
   * @return {!Promise<!../../../src/service/xhr-impl.FetchResponse>}
   * @private
   */
  doXhr_(url, method, opt_extraFields) {
    let xhrUrl, body;
    const isHeadOrGet = method == 'GET' || method == 'HEAD';

    if (isHeadOrGet) {
      const values = this.getFormAsObject_();
      if (opt_extraFields) {
        deepMerge(values, opt_extraFields);
      }
      xhrUrl = addParamsToUrl(url, values);
    } else {
      xhrUrl = url;
      body = new FormDataWrapper(this.form_);
      for (const key in opt_extraFields) {
        body.append(key, opt_extraFields[key]);
      }
    }

    return this.xhr_.fetch(xhrUrl, {
      body,
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });
  }

  /**
   * Transition the form to the submit success state.
   * @param {!../../../src/service/xhr-impl.FetchResponse} response
   * @return {!Promise}
   * @private visible for testing
   */
  handleXhrSubmitSuccess_(response) {
    return response.json().then(json => {
      this.triggerAction_(/* success */ true, json);
      this.analyticsEvent_('amp-form-submit-success');
      this.setState_(FormState_.SUBMIT_SUCCESS);
      this.renderTemplate_(json || {});
      this.maybeHandleRedirect_(response);
    }, error => {
      user().error(TAG, `Failed to parse response JSON: ${error}`);
    });
  }

  /**
   * Transition the form the the submit error state.
   * @param {!Error} error
   * @private
   */
  handleXhrSubmitFailure_(error) {
    let promise;
    if (error && error.response) {
      promise = error.response.json().catch(() => null);
    } else {
      promise = Promise.resolve(null);
    }
    return promise.then(responseJson => {
      this.triggerAction_(/* success */ false, responseJson);
      this.analyticsEvent_('amp-form-submit-error');
      this.setState_(FormState_.SUBMIT_ERROR);
      this.renderTemplate_(responseJson || {});
      this.maybeHandleRedirect_(error.response);
      user().error(TAG, `Form submission failed: ${error}`);
    });
  }

  /** @private */
  handleNonXhrPost_() {
    // non-XHR POST requests are not supported.
    user().assert(false,
        'Only XHR based (via action-xhr attribute) submissions are supported ' +
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
      if (this.shouldValidate_) {
        this.vsync_.run({
          measure: undefined,
          mutate: reportValidity,
        }, {
          validator: this.validator_,
        });
        return isValid;
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
    if (!response || !response.headers) {
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
      const navigator = Services.navigationForDoc(this.form_);
      navigator.navigateTo(this.win_, redirectTo, REDIRECT_TO_HEADER);
    }
  }

  /**
   * Triggers either a submit-success or submit-error action with response data.
   * @param {boolean} success
   * @param {?JsonObject} json
   * @private
   */
  triggerAction_(success, json) {
    const name = success ? FormState_.SUBMIT_SUCCESS : FormState_.SUBMIT_ERROR;
    const event =
        createCustomEvent(this.win_, `${TAG}.${name}`, {response: json});
    this.actions_.trigger(this.form_, name, event, ActionTrust.HIGH);
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
   * @return {!JsonObject}
   * @private
   */
  getFormAsObject_() {
    return getFormAsObject(this.form_);
  }

  /**
   * Adds proper classes for the state passed.
   * @param {!FormState_} newState
   * @private
   */
  setState_(newState) {
    const previousState = this.state_;
    this.form_.classList.remove(`amp-form-${previousState}`);
    this.form_.classList.add(`amp-form-${newState}`);
    this.cleanupRenderedTemplate_(previousState);
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
   * @param {!JsonObject} data
   * @private
   */
  renderTemplate_(data) {
    const container = this.form_./*OK*/querySelector(`[${this.state_}]`);
    let p = null;
    if (container) {
      const messageId = `rendered-message-${this.id_}`;
      container.setAttribute('role', 'alert');
      container.setAttribute('aria-labeledby', messageId);
      container.setAttribute('aria-live', 'assertive');

      if (this.templates_.hasTemplate(container)) {
        p = this.templates_.findAndRenderTemplate(container, data)
            .then(rendered => {
              rendered.id = messageId;
              rendered.setAttribute('i-amphtml-rendered', '');
              container.appendChild(rendered);
              const renderedEvent = createCustomEvent(
                  this.win_,
                  AmpEvents.DOM_UPDATE,
                  /* detail */ null,
                  {bubbles: true});
              container.dispatchEvent(renderedEvent);
            });
      } else {
        // TODO(vializ): This is to let AMP know that the AMP elements inside
        // this container are now visible so they get scheduled for layout.
        // This will be unnecessary when the AMP Layers implementation is
        // complete. We call mutateElement here and not where the template is
        // made visible so that we don't do redundant layout work when a
        // template is rendered too.
        this.resources_.mutateElement(container, () => {});
        p = Promise.resolve();
      }
    }

    if (getMode().test) {
      this.renderTemplatePromise_ = p;
    }
  }

  /**
   * Removes the template for the passed state.
   * @param {!FormState_} state
   * @private
   */
  cleanupRenderedTemplate_(state) {
    const container = this.form_./*OK*/querySelector(`[${state}]`);
    if (!container) {
      return;
    }
    const previousRender = childElementByAttr(container, 'i-amphtml-rendered');
    if (previousRender) {
      removeElement(previousRender);
    }
  }

  /**
   * Returns a promise that resolves when xhr submit finishes. The promise
   * will be null if xhr submit has not started.
   * @visibleForTesting
   */
  xhrSubmitPromiseForTesting() {
    return this.xhrSubmitPromise_;
  }

  /**
   * Returns a promise that resolves when tempalte render finishes. The promise
   * will be null if the template render has not started.
   * @visibleForTesting
   */
  renderTemplatePromiseForTesting() {
    return this.renderTemplatePromise_;
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
  const elements = form.querySelectorAll('input,select,textarea,fieldset');
  iterateCursor(elements, element => checkUserValidity(element));
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
 * @param {!Element} input
 * @private visible for testing.
 */
export function checkUserValidityAfterInteraction_(input) {
  checkUserValidity(input, /* propagate */ true);
}


/**
 * Bootstraps the amp-form elements
 */
export class AmpFormService {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private {!Promise} */
    this.whenInitialized_ = this.installStyles_(ampdoc)
        .then(() => this.installHandlers_(ampdoc));

    // Dispatch a test-only event for integration tests.
    if (getMode().test) {
      this.whenInitialized_.then(() => {
        const win = ampdoc.win;
        const event = createCustomEvent(
            win, FormEvents.SERVICE_INIT, null, {bubbles: true});
        win.dispatchEvent(event);
      });
    }
  }

  /**
   * Returns a promise that resolves when all form implementations (if any)
   * have been upgraded.
   * @return {!Promise}
   */
  whenInitialized() {
    return this.whenInitialized_;
  }

  /**
   * Install the amp-form CSS
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Promise}
   * @private
   */
  installStyles_(ampdoc) {
    return new Promise(resolve => {
      installStylesForDoc(ampdoc, CSS, resolve, false, TAG);
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
      const existingAmpForm = formOrNullForElement(form);
      if (!existingAmpForm) {
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
    doc.addEventListener(AmpEvents.DOM_UPDATE, () => {
      this.installSubmissionHandlers_(doc.querySelectorAll('form'));
    });
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerServiceForDoc(TAG, AmpFormService);
});
