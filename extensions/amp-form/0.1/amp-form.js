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

import {ActionTrust} from '../../../src/action-constants';
import {AmpEvents} from '../../../src/amp-events';
import {AmpFormTextarea} from './amp-form-textarea';
import {
  AsyncInputAttributes,
  AsyncInputClasses,
} from '../../../src/async-input';
import {CSS} from '../../../build/amp-form-0.1.css';
import {Deferred, tryResolve} from '../../../src/utils/promise';
import {
  FORM_VERIFY_OPTOUT,
  FORM_VERIFY_PARAM,
  getFormVerifier,
} from './form-verifiers';
import {FormEvents} from './form-events';
import {FormSubmitService} from './form-submit-service';
import {SOURCE_ORIGIN_PARAM, addParamsToUrl} from '../../../src/url';
import {Services} from '../../../src/services';
import {SsrTemplateHelper} from '../../../src/ssr-template-helper';
import {
  ancestorElementsByTag,
  childElementByAttr,
  createElementWithAttributes,
  iterateCursor,
  removeElement,
  tryFocus,
} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {createFormDataWrapper} from '../../../src/form-data-wrapper';
import {deepMerge, dict} from '../../../src/utils/object';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {escapeCssSelectorIdent} from '../../../src/css';
import {
  formOrNullForElement,
  getFormAsObject,
  setFormForElement,
} from '../../../src/form';
import {getFormValidator, isCheckValiditySupported} from './form-validators';
import {getMode} from '../../../src/mode';
import {
  getViewerAuthTokenIfAvailable,
  setupAMPCors,
  setupInit,
  setupInput,
} from '../../../src/utils/xhr-utils';
import {installFormProxy} from './form-proxy';
import {installStylesForDoc} from '../../../src/style-installer';
import {toArray, toWin} from '../../../src/types';
import {triggerAnalyticsEvent} from '../../../src/analytics';

/** @const {string} */
const TAG = 'amp-form';

/**
 * A list of external dependencies that can be included in forms.
 * @const {!Array<string>}
 */
const EXTERNAL_DEPS = ['amp-selector'];

/** @const @enum {string} */
const FormState = {
  INITIAL: 'initial',
  VERIFYING: 'verifying',
  VERIFY_ERROR: 'verify-error',
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

/**
 * Time to wait for services / async input before throwing an error.
 * @private @const {number}
 */
const SUBMIT_TIMEOUT = 10000;

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

    /** @const @private {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesFor(this.win_);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.win_);

    /** @const @private {!../../../src/service/action-impl.ActionService} */
    this.actions_ = Services.actionServiceForDoc(this.form_);

    /** @const @private {!../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(this.form_);

    /** @const @private {!../../../src/service/viewer-impl.Viewer}  */
    this.viewer_ = Services.viewerForDoc(this.form_);

    /**
     * @const {!../../../src/ssr-template-helper.SsrTemplateHelper}
     * @private
     */
    this.ssrTemplateHelper_ = new SsrTemplateHelper(
      TAG,
      this.viewer_,
      this.templates_
    );

    /** @const @private {string} */
    this.method_ = (this.form_.getAttribute('method') || 'GET').toUpperCase();

    /** @const @private {string} */
    this.target_ = this.form_.getAttribute('target');

    /** @private {?string} */
    this.xhrAction_ = this.getXhrUrl_('action-xhr');

    /** @const @private {?string} */
    this.xhrVerify_ = this.getXhrUrl_('verify-xhr');

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

    /** @private {!FormState} */
    this.state_ = FormState.INITIAL;

    const inputs = this.form_.elements;
    for (let i = 0; i < inputs.length; i++) {
      const {name} = inputs[i];
      userAssert(
        name != SOURCE_ORIGIN_PARAM && name != FORM_VERIFY_PARAM,
        'Illegal input name, %s found: %s',
        name,
        inputs[i]
      );
    }

    /** @const @private {!./form-validators.FormValidator} */
    this.validator_ = getFormValidator(this.form_);

    /** @const @private {!./form-verifiers.FormVerifier} */
    this.verifier_ = getFormVerifier(this.form_, () => this.handleXhrVerify_());

    this.actions_.installActionHandler(
      this.form_,
      this.actionHandler_.bind(this)
    );
    this.installEventHandlers_();
    this.installInputMasking_();

    /** @private {?Promise} */
    this.xhrSubmitPromise_ = null;

    /** @private {?Promise} */
    this.renderTemplatePromise_ = null;

    /** @private {./form-submit-service.FormSubmitService} */
    this.formSubmitService_ = Services.formSubmitForDoc(element);
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
      const urlService = Services.urlForDoc(this.form_);
      urlService.assertHttpsUrl(url, this.form_, attribute);
      userAssert(
        !urlService.isProxyOrigin(url),
        'form %s should not be on AMP CDN: %s',
        attribute,
        this.form_
      );
    }
    return url;
  }

  /**
   * Builds fetch request data for amp-form elements.
   * @param {string} url
   * @param {string} method
   * @param {!Object<string, string>=} opt_extraFields
   * @param {!Array<string>=} opt_fieldBlacklist
   * @return {!Promise<!FetchRequestDef>}
   */
  requestForFormFetch(url, method, opt_extraFields, opt_fieldBlacklist) {
    let xhrUrl, body;
    const isHeadOrGet = method == 'GET' || method == 'HEAD';
    if (isHeadOrGet) {
      this.assertNoSensitiveFields_();
      const values = this.getFormAsObject_();
      if (opt_fieldBlacklist) {
        opt_fieldBlacklist.forEach(name => {
          delete values[name];
        });
      }

      if (opt_extraFields) {
        deepMerge(values, opt_extraFields);
      }
      xhrUrl = addParamsToUrl(url, values);
    } else {
      xhrUrl = url;
      body = createFormDataWrapper(this.win_, this.form_);
      if (opt_fieldBlacklist) {
        opt_fieldBlacklist.forEach(name => {
          body.delete(name);
        });
      }

      for (const key in opt_extraFields) {
        body.append(key, opt_extraFields[key]);
      }
    }

    /** @type {!FetchRequestDef}*/
    const request = {
      xhrUrl,
      fetchOpt: dict({
        'body': body,
        'method': method,
        'credentials': 'include',
        'headers': dict({'Accept': 'application/json'}),
      }),
    };

    return getViewerAuthTokenIfAvailable(this.form_).then(token => {
      if (token) {
        userAssert(
          request.fetchOpt['method'] == 'POST',
          'Cannot attach auth token with GET request.'
        );
        body.append('ampViewerAuthToken', token);
      }
      return request;
    });
  }

  /**
   * Setter to change cached action-xhr.
   * @param {string} url
   */
  setXhrAction(url) {
    this.xhrAction_ = url;
  }

  /**
   * Handle actions that require at least high trust.
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @private
   */
  actionHandler_(invocation) {
    if (!invocation.satisfiesTrust(ActionTrust.HIGH)) {
      return null;
    }
    if (invocation.method == 'submit') {
      return this.whenDependenciesReady_().then(() => {
        return this.handleSubmitAction_(invocation);
      });
    } else if (invocation.method === 'clear') {
      this.handleClearAction_();
    }
    return null;
  }

  /**
   * Returns a promise that will be resolved when all dependencies used inside
   * the form tag are loaded and built (e.g. amp-selector) or 2 seconds timeout
   * - whichever is first.
   * @return {!Promise}
   * @private
   */
  whenDependenciesReady_() {
    if (this.dependenciesPromise_) {
      return this.dependenciesPromise_;
    }
    const depElements = this.form_./*OK*/ querySelectorAll(
      EXTERNAL_DEPS.join(',')
    );
    // Wait for an element to be built to make sure it is ready.
    const promises = toArray(depElements).map(el => el.whenBuilt());
    return (this.dependenciesPromise_ = this.waitOnPromisesOrTimeout_(
      promises,
      2000
    ));
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
      'submit',
      this.handleSubmitEvent_.bind(this),
      true
    );

    this.form_.addEventListener(
      'blur',
      e => {
        checkUserValidityAfterInteraction_(dev().assertElement(e.target));
        this.validator_.onBlur(e);
      },
      true
    );

    //  Form verification is not supported when SSRing templates is enabled.
    if (!this.ssrTemplateHelper_.isSupported()) {
      this.form_.addEventListener('change', e => {
        this.verifier_.onCommit().then(({updatedElements, errors}) => {
          updatedElements.forEach(checkUserValidityAfterInteraction_);
          // Tell the validation to reveal any input.validationMessage added
          // by the form verifier.
          this.validator_.onBlur(e);

          // Only make the verify XHR if the user hasn't pressed submit.
          if (this.state_ === FormState.VERIFYING) {
            if (errors.length) {
              this.setState_(FormState.VERIFY_ERROR);
              this.renderTemplate_(dict({'verifyErrors': errors})).then(() => {
                this.triggerAction_(FormEvents.VERIFY_ERROR, errors);
              });
            } else {
              this.setState_(FormState.INITIAL);
            }
          }
        });
      });
    }

    this.form_.addEventListener('input', e => {
      checkUserValidityAfterInteraction_(dev().assertElement(e.target));
      this.validator_.onInput(e);
    });
  }

  /** @private */
  installInputMasking_() {
    Services.inputmaskServiceForDocOrNull(this.form_).then(inputmaskService => {
      if (inputmaskService) {
        inputmaskService.install();
      }
    });
  }

  /**
   * Triggers 'amp-form-submit' event in 'amp-analytics' and
   * generates variables for form fields to be accessible in analytics
   *
   * @param {string} eventType
   * @private
   */
  triggerFormSubmitInAnalytics_(eventType) {
    this.assertSsrTemplate_(false, 'Form analytics not supported');
    const formDataForAnalytics = dict({});
    const formObject = this.getFormAsObject_();

    for (const k in formObject) {
      if (Object.prototype.hasOwnProperty.call(formObject, k)) {
        formDataForAnalytics['formFields[' + k + ']'] = formObject[k].join(',');
      }
    }
    formDataForAnalytics['formId'] = this.form_.id;

    this.analyticsEvent_(eventType, formDataForAnalytics);
  }

  /**
   * Handles submissions through action service invocations.
   *   e.g. <img on=tap:form.submit>
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @return {!Promise}
   * @private
   */
  handleSubmitAction_(invocation) {
    if (this.state_ == FormState.SUBMITTING || !this.checkValidity_()) {
      return Promise.resolve(null);
    }
    // `submit` has the same trust level as the AMP Action that caused it.
    return this.submit_(invocation.trust, null);
  }

  /**
   * Handles clearing the form through action service invocations.
   * @private
   */
  handleClearAction_() {
    this.form_.reset();
    this.setState_(FormState.INITIAL);
    this.form_.classList.remove('user-valid');
    this.form_.classList.remove('user-invalid');

    const validityElements = this.form_.querySelectorAll(
      '.user-valid, .user-invalid'
    );
    iterateCursor(validityElements, element => {
      element.classList.remove('user-valid');
      element.classList.remove('user-invalid');
    });

    const messageElements = this.form_.querySelectorAll(
      '.visible[validation-for]'
    );
    iterateCursor(messageElements, element => {
      element.classList.remove('visible');
    });

    removeValidityStateClasses(this.form_);
  }

  /**
   * Note on stopImmediatePropagation usage here, it is important to emulate
   * native browser submit event blocking. Otherwise any other submit listeners
   * would get the event.
   *
   * For example, action service shouldn't trigger 'submit' event if form is
   * actually invalid. stopImmediatePropagation allows us to make sure we don't
   * trigger it.
   *
   * This prevents the default submission event in any of following cases:
   *   - The form is still finishing a previous submission.
   *   - The form is invalid.
   *   - Handling an XHR submission.
   *   - It's a non-XHR POST submission (unsupported).
   *
   * @param {!Event} event
   * @return {!Promise}
   * @private
   */
  handleSubmitEvent_(event) {
    if (this.state_ == FormState.SUBMITTING || !this.checkValidity_()) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return Promise.resolve(null);
    }

    if (this.xhrAction_ || this.method_ == 'POST') {
      event.preventDefault();
    }

    // Submits caused by user input have high trust.
    return this.submit_(ActionTrust.HIGH, event);
  }

  /**
   * Helper method that actual handles the different cases (post, get, xhr...).
   * @param {ActionTrust} trust
   * @param {?Event} event
   * @return {!Promise}
   * @private
   */
  submit_(trust, event) {
    try {
      const event = {
        form: this.form_,
        actionXhrMutator: this.setXhrAction.bind(this),
      };
      this.formSubmitService_.fire(event);
    } catch (e) {
      dev().error(TAG, 'Form submit service failed: %s', e);
    }

    // Get our special fields
    const varSubsFields = this.getVarSubsFields_();
    const asyncInputs = this.form_.getElementsByClassName(
      AsyncInputClasses.ASYNC_INPUT
    );

    // Do any assertions we may need to do
    // For NonXhrGET
    // That way we can determine if
    // we can submit synchronously
    if (!this.xhrAction_ && this.method_ == 'GET') {
      this.assertSsrTemplate_(false, 'Non-XHR GETs not supported.');
      this.assertNoSensitiveFields_();

      // If we have no async inputs, we can just submit synchronously
      if (asyncInputs.length === 0) {
        for (let i = 0; i < varSubsFields.length; i++) {
          this.urlReplacement_.expandInputValueSync(varSubsFields[i]);
        }

        /**
         * If the submit was called with an event, then we shouldn't
         * manually submit the form
         */
        const shouldSubmitFormElement = !event;

        this.handleNonXhrGet_(shouldSubmitFormElement);
        return Promise.resolve();
      }

      if (event) {
        event.preventDefault();
      }
    }

    // Set ourselves to the SUBMITTING State
    this.setState_(FormState.SUBMITTING);

    // Promises to run before submitting the form
    const presubmitPromises = [];
    presubmitPromises.push(this.doVarSubs_(varSubsFields));
    iterateCursor(asyncInputs, asyncInput => {
      presubmitPromises.push(this.getValueForAsyncInput_(asyncInput));
    });

    return this.waitOnPromisesOrTimeout_(
      presubmitPromises,
      SUBMIT_TIMEOUT
    ).then(
      () => this.handlePresubmitSuccess_(trust),
      error => {
        const detail = dict();
        if (error && error.message) {
          detail['error'] = error.message;
        }
        return this.handleSubmitFailure_(error, detail);
      }
    );
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
   * Handle successful presubmit tasks
   * @param {!ActionTrust} trust
   * @return {!Promise}
   */
  handlePresubmitSuccess_(trust) {
    if (this.xhrAction_) {
      return this.handleXhrSubmit_(trust);
    } else if (this.method_ == 'POST') {
      this.handleNonXhrPost_();
    } else if (this.method_ == 'GET') {
      this.handleNonXhrGet_(/* shouldSubmitFormElement */ true);
    }
    return Promise.resolve();
  }

  /**
   * Send the verify request and control the VERIFYING state.
   * @return {!Promise}
   * @private
   */
  handleXhrVerify_() {
    if (this.state_ === FormState.SUBMITTING) {
      return Promise.resolve();
    }
    this.setState_(FormState.VERIFYING);
    this.triggerAction_(FormEvents.VERIFY, null);

    return this.doVarSubs_(this.getVarSubsFields_()).then(() =>
      this.doVerifyXhr_()
    );
  }

  /**
   * @private
   * @param {ActionTrust} trust
   * @return {!Promise}
   */
  handleXhrSubmit_(trust) {
    let p;
    if (this.ssrTemplateHelper_.isSupported()) {
      p = this.handleSsrTemplate_(trust);
    } else {
      this.submittingWithTrust_(trust);
      p = this.doActionXhr_().then(
        response => this.handleXhrSubmitSuccess_(response),
        error => this.handleXhrSubmitFailure_(error)
      );
    }
    if (getMode().test) {
      this.xhrSubmitPromise_ = p;
    }
    return p;
  }

  /**
   * Handles the server side proxying and then rendering of the template.
   * @param {ActionTrust} trust
   * @return {!Promise}
   * @private
   */
  handleSsrTemplate_(trust) {
    let request;
    // Render template for the form submitting state.
    const values = this.getFormAsObject_();
    return this.renderTemplate_(values)
      .then(() =>
        this.actions_.trigger(
          this.form_,
          FormEvents.SUBMIT,
          /* event */ null,
          trust
        )
      )
      .then(() =>
        this.requestForFormFetch(
          dev().assertString(this.xhrAction_),
          this.method_
        )
      )
      .then(formRequest => {
        request = formRequest;
        request.fetchOpt = setupInit(request.fetchOpt);
        request.fetchOpt = setupAMPCors(
          this.win_,
          request.xhrUrl,
          request.fetchOpt
        );
        request.xhrUrl = setupInput(
          this.win_,
          request.xhrUrl,
          request.fetchOpt
        );
        return this.ssrTemplateHelper_.fetchAndRenderTemplate(
          this.form_,
          request,
          this.templatesForSsr_()
        );
      })
      .then(
        response => this.handleSsrTemplateSuccess_(response, request),
        error => {
          const detail = dict();
          if (error && error.message) {
            detail['error'] = error.message;
          }
          return this.handleSubmitFailure_(error, detail);
        }
      );
  }

  /**
   * If present, finds and returns the success and error response templates.
   * Note that we do not render the submitting state template and only
   * deal with submit-success or submit-error.
   * @return {!../../../src/ssr-template-helper.SsrTemplateDef}
   * @private
   */
  templatesForSsr_() {
    let successTemplate;
    const successContainer = this.form_.querySelector('[submit-success]');
    if (successContainer) {
      successTemplate = this.templates_.maybeFindTemplate(successContainer);
    }

    let errorTemplate;
    const errorContainer = this.form_.querySelector('[submit-error]');
    if (errorContainer) {
      errorTemplate = this.templates_.maybeFindTemplate(errorContainer);
    }
    return {successTemplate, errorTemplate};
  }

  /**
   * Transition the form to the submit success state.
   * @param {!JsonObject} response
   * @param {!FetchRequestDef} request
   * @return {!Promise}
   * @private
   */
  handleSsrTemplateSuccess_(response, request) {
    // Construct the fetch response to reuse the methods in-place for
    // amp CORs validation.
    this.ssrTemplateHelper_.verifySsrResponse(this.win_, response, request);
    return this.handleSubmitSuccess_(tryResolve(() => response));
  }

  /**
   * Triggers the analytics and renders any template for submitting state.
   * @param {ActionTrust} trust
   */
  submittingWithTrust_(trust) {
    this.triggerFormSubmitInAnalytics_('amp-form-submit');
    // After variable substitution
    const values = this.getFormAsObject_();
    // At the form submitting state, we want to display any template
    // messages with the submitting attribute.
    this.renderTemplate_(values).then(() => {
      this.actions_.trigger(
        this.form_,
        FormEvents.SUBMIT,
        /* event */ null,
        trust
      );
    });
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
        this.urlReplacement_.expandInputValueAsync(varSubsFields[i])
      );
    }
    return this.waitOnPromisesOrTimeout_(varSubPromises, 100);
  }

  /**
   * Call getValue() on Async Input elements, and
   * Create hidden inputs containing their returned values
   * @param {!Element} asyncInput
   * @return {!Promise}
   * @private
   */
  getValueForAsyncInput_(asyncInput) {
    return asyncInput
      .getImpl()
      .then(implementation => implementation.getValue())
      .then(value => {
        const name = asyncInput.getAttribute(AsyncInputAttributes.NAME);
        let input = this.form_.querySelector(
          `input[name=${escapeCssSelectorIdent(name)}]`
        );
        if (!input) {
          input = createElementWithAttributes(
            this.win_.document,
            'input',
            dict({
              'name': asyncInput.getAttribute(AsyncInputAttributes.NAME),
              'hidden': 'true',
            })
          );
        }
        input.setAttribute('value', value);
        this.form_.appendChild(input);
      });
  }

  /**
   * Send a request to the form's action endpoint.
   * @return {!Promise<!Response>}
   * @private
   */
  doActionXhr_() {
    return this.doXhr_(dev().assertString(this.xhrAction_), this.method_);
  }

  /**
   * Send a request to the form's verify endpoint.
   * @return {!Promise<!Response>}
   * @private
   */
  doVerifyXhr_() {
    const noVerifyFields = toArray(
      this.form_.querySelectorAll(
        `[${escapeCssSelectorIdent(FORM_VERIFY_OPTOUT)}]`
      )
    );
    const blacklist = noVerifyFields.map(field => field.name || field.id);

    return this.doXhr_(
      dev().assertString(this.xhrVerify_),
      this.method_,
      /**opt_extraFields*/ {[FORM_VERIFY_PARAM]: true},
      /**opt_fieldBlacklist*/ blacklist
    );
  }

  /**
   * Send a request to a form endpoint.
   * @param {string} url
   * @param {string} method
   * @param {!Object<string, string>=} opt_extraFields
   * @param {!Array<string>=} opt_fieldBlacklist
   * @return {!Promise<!Response>}
   * @private
   */
  doXhr_(url, method, opt_extraFields, opt_fieldBlacklist) {
    this.assertSsrTemplate_(false, 'XHRs should be proxied.');
    return this.requestForFormFetch(
      url,
      method,
      opt_extraFields,
      opt_fieldBlacklist
    ).then(request => this.xhr_.fetch(request.xhrUrl, request.fetchOpt));
  }

  /**
   * @param {!Response} response
   * @return {!Promise}
   * @private
   */
  handleXhrSubmitSuccess_(response) {
    const json = /** @type {!Promise<!JsonObject>} */ (response.json());
    return this.handleSubmitSuccess_(json).then(() => {
      this.triggerFormSubmitInAnalytics_('amp-form-submit-success');
      this.maybeHandleRedirect_(response);
    });
  }

  /**
   * Transition the form to the submit success state.
   * @param {!Promise<!JsonObject>} jsonPromise
   * @return {!Promise}
   * @private visible for testing
   */
  handleSubmitSuccess_(jsonPromise) {
    return jsonPromise.then(
      json => {
        this.setState_(FormState.SUBMIT_SUCCESS);
        this.renderTemplate_(json || {}).then(() => {
          this.triggerAction_(FormEvents.SUBMIT_SUCCESS, json);
        });
      },
      error => {
        user().error(TAG, 'Failed to parse response JSON: %s', error);
      }
    );
  }

  /**
   * @param {*} e
   * @return {!Promise}
   * @private
   */
  handleXhrSubmitFailure_(e) {
    let promise;
    if (e && e.response) {
      const error = /** @type {!Error} */ (e);
      promise = error.response.json().catch(() => null);
    } else {
      promise = Promise.resolve(null);
    }
    return promise.then(responseJson => {
      this.triggerFormSubmitInAnalytics_('amp-form-submit-error');
      this.handleSubmitFailure_(e, responseJson);
      this.maybeHandleRedirect_(e.response);
    });
  }

  /**
   * Transition the form the the submit error state.
   * @param {*} error
   * @param {!JsonObject} json
   * @return {!Promise}
   * @private
   */
  handleSubmitFailure_(error, json) {
    this.setState_(FormState.SUBMIT_ERROR);
    user().error(TAG, 'Form submission failed: %s', error);
    return tryResolve(() => {
      this.renderTemplate_(json).then(() => {
        this.triggerAction_(FormEvents.SUBMIT_ERROR, json);
      });
    });
  }

  /** @private */
  handleNonXhrPost_() {
    // non-XHR POST requests are not supported.
    userAssert(
      false,
      'Only XHR based (via action-xhr attribute) submissions are supported ' +
        'for POST requests. %s',
      this.form_
    );
  }

  /**
   * Triggers Submit Analytics,
   * and Form Element submit if passed by param.
   * shouldSubmitFormElement should ONLY be true
   * If the submit event.preventDefault was called
   * @param {boolean} shouldSubmitFormElement
   */
  handleNonXhrGet_(shouldSubmitFormElement) {
    this.triggerFormSubmitInAnalytics_('amp-form-submit');
    if (shouldSubmitFormElement) {
      this.form_.submit();
    }
    this.setState_(FormState.INITIAL);
  }

  /**
   * Asserts that SSR support is the same as value.
   * @param {boolean} value
   * @param {string} msg
   * @private
   */
  assertSsrTemplate_(value, msg) {
    const supported = this.ssrTemplateHelper_.isSupported();
    userAssert(
      supported === value,
      '[amp-form]: viewerRenderTemplate | %s',
      msg
    );
  }

  /**
   * Fail if there are password or file fields present when the function
   * is called.
   * @private
   */
  assertNoSensitiveFields_() {
    const fields = this.form_.querySelectorAll(
      'input[type=password],input[type=file]'
    );
    userAssert(
      fields.length == 0,
      'input[type=password] or input[type=file] ' +
        'may only appear in form[method=post]'
    );
  }

  /**
   * @return {boolean} False if the form is invalid.
   * @private
   */
  checkValidity_() {
    if (isCheckValiditySupported(this.win_.document)) {
      // Validity checking should always occur, novalidate only circumvent
      // reporting and blocking submission on non-valid forms.
      const isValid = checkUserValidityOnSubmission(this.form_);
      if (this.shouldValidate_) {
        this.validator_.report();
        return isValid;
      }
    }
    return true;
  }

  /**
   * Handles response redirect throught the AMP-Redirect-To response header.
   * Not applicable if viewer can render templates.
   * @param {?Response} response
   * @private
   */
  maybeHandleRedirect_(response) {
    this.assertSsrTemplate_(false, 'Redirects not supported.');
    if (!response || !response.headers) {
      return;
    }
    const redirectTo = response.headers.get(REDIRECT_TO_HEADER);
    if (redirectTo) {
      userAssert(
        this.target_ != '_blank',
        'Redirecting to target=_blank using AMP-Redirect-To is currently ' +
          'not supported, use target=_top instead. %s',
        this.form_
      );
      try {
        const urlService = Services.urlForDoc(this.form_);
        urlService.assertAbsoluteHttpOrHttpsUrl(redirectTo);
        urlService.assertHttpsUrl(redirectTo, 'AMP-Redirect-To', 'Url');
      } catch (e) {
        userAssert(
          false,
          'The `AMP-Redirect-To` header value must be an ' +
            'absolute URL starting with https://. Found %s',
          redirectTo
        );
      }
      const navigator = Services.navigationForDoc(this.form_);
      navigator.navigateTo(this.win_, redirectTo, REDIRECT_TO_HEADER);
    }
  }

  /**
   * Triggers either a submit-success or submit-error action with response data.
   * @param {!FormEvents} name
   * @param {?JsonObject|!Array<{message: string, name: string}>} detail
   * @private
   */
  triggerAction_(name, detail) {
    const event = createCustomEvent(
      this.win_,
      `${TAG}.${name}`,
      dict({'response': detail})
    );
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
    return Promise.race([Promise.all(promises), this.timer_.promise(timeout)]);
  }

  /**
   * @param {string} eventType
   * @param {!JsonObject=} opt_vars A map of vars and their values.
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
   * @param {!FormState} newState
   * @private
   */
  setState_(newState) {
    const previousState = this.state_;
    this.form_.classList.remove(`amp-form-${previousState}`);
    this.form_.classList.add(`amp-form-${newState}`);
    this.cleanupRenderedTemplate_(previousState);
    this.state_ = newState;
  }

  /**
   * Renders a template based on the form state and its presence in the form.
   * @param {!JsonObject} data
   * @return {!Promise}
   * @private
   */
  renderTemplate_(data) {
    const container = this.form_./*OK*/ querySelector(`[${this.state_}]`);
    let p = Promise.resolve();
    if (container) {
      const messageId = `rendered-message-${this.id_}`;
      container.setAttribute('role', 'alert');
      container.setAttribute('aria-labeledby', messageId);
      container.setAttribute('aria-live', 'assertive');
      if (this.templates_.hasTemplate(container)) {
        p = this.ssrTemplateHelper_
          .renderTemplate(devAssert(container), data)
          .then(rendered => {
            rendered.id = messageId;
            rendered.setAttribute('i-amphtml-rendered', '');
            return this.resources_.mutateElement(
              dev().assertElement(container),
              () => {
                container.appendChild(rendered);
                const renderedEvent = createCustomEvent(
                  this.win_,
                  AmpEvents.DOM_UPDATE,
                  /* detail */ null,
                  {bubbles: true}
                );
                container.dispatchEvent(renderedEvent);
              }
            );
          });
      } else {
        // TODO(vializ): This is to let AMP know that the AMP elements inside
        // this container are now visible so they get scheduled for layout.
        // This will be unnecessary when the AMP Layers implementation is
        // complete.
        this.resources_.mutateElement(container, () => {});
      }
    }

    if (getMode().test) {
      this.renderTemplatePromise_ = p;
    }

    return p;
  }

  /**
   * Removes the template for the passed state.
   * @param {!FormState} state
   * @private
   */
  cleanupRenderedTemplate_(state) {
    const container = this.form_./*OK*/ querySelector(`[${state}]`);
    if (!container) {
      return;
    }
    const previousRender = childElementByAttr(container, 'i-amphtml-rendered');
    if (previousRender) {
      removeElement(previousRender);
    }
  }

  /**
   * Returns a promise that resolves when tempalte render finishes. The promise
   * will be null if the template render has not started.
   * @visibleForTesting
   */
  renderTemplatePromiseForTesting() {
    return this.renderTemplatePromise_;
  }

  /**
   * Returns a promise that resolves when xhr submit finishes. The promise
   * will be null if xhr submit has not started.
   * @visibleForTesting
   */
  xhrSubmitPromiseForTesting() {
    return this.xhrSubmitPromise_;
  }
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
 * Removes all validity classes from elements in the given form.
 * @param {!Element} form
 */
function removeValidityStateClasses(form) {
  const dummyInput = document.createElement('input');
  for (const validityState in dummyInput.validity) {
    const elements = form.querySelectorAll(
      `.${escapeCssSelectorIdent(validityState)}`
    );
    iterateCursor(elements, element => {
      dev()
        .assertElement(element)
        .classList.remove(validityState);
    });
  }
}

/**
 * Checks user validity which applies .user-valid and .user-invalid AFTER the
 * user interacts with the input by moving away from the input (blur) or by
 * changing its value (input).
 *
 * See :user-invalid spec for more details:
 *   https://drafts.csswg.org/selectors-4/#user-pseudos
 *
 * The specs are still not fully specified. The current solution tries to follow
 * a common sense approach for when to apply these classes. As the specs gets
 * clearer, we should strive to match it as much as possible.
 *
 * @param {!Element} element
 * @param {boolean=} propagate Whether to propagate the user validity to
 * ancestors.
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
  if (
    previousValidityState != UserValidityState.USER_VALID &&
    isCurrentlyValid
  ) {
    element.classList.add('user-valid');
    element.classList.remove('user-invalid');
    // Don't propagate user-valid unless it was marked invalid before.
    shouldPropagate = previousValidityState == UserValidityState.USER_INVALID;
  } else if (
    previousValidityState != UserValidityState.USER_INVALID &&
    !isCurrentlyValid
  ) {
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
 * Responds to user interaction with an input by checking user validity of the
 * input and possibly its input-related ancestors (e.g. feildset, form).
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
    this.whenInitialized_ = this.installStyles_(ampdoc).then(() =>
      this.installHandlers_(ampdoc)
    );

    // Dispatch a test-only event for integration tests.
    if (getMode().test) {
      this.whenInitialized_.then(() => {
        const {win} = ampdoc;
        const event = createCustomEvent(win, FormEvents.SERVICE_INIT, null, {
          bubbles: true,
        });
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
    const deferred = new Deferred();
    installStylesForDoc(ampdoc, CSS, deferred.resolve, false, TAG);
    return deferred.promise;
  }

  /**
   * Install the event handlers
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Promise}
   * @private
   */
  installHandlers_(ampdoc) {
    return ampdoc.whenReady().then(() => {
      const root = ampdoc.getRootNode();

      this.installSubmissionHandlers_(root.querySelectorAll('form'));
      AmpFormTextarea.install(ampdoc);
      this.installGlobalEventListener_(root);
    });
  }

  /**
   * Install submission handler on all forms in the document.
   * @param {?IArrayLike<T>} forms
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
  AMP.registerServiceForDoc('form-submit-service', FormSubmitService);
  AMP.registerServiceForDoc(TAG, AmpFormService);
});
