import {ActionTrust_Enum} from '#core/constants/action-constants';
import {AmpEvents_Enum} from '#core/constants/amp-events';
import {
  AsyncInputAttributes_Enum,
  AsyncInputClasses_Enum,
} from '#core/constants/async-input';
import {Keys_Enum} from '#core/constants/key-codes';
import {Deferred, tryResolve} from '#core/data-structures/promise';
import {isAmp4Email} from '#core/document/format';
import {
  createElementWithAttributes,
  iterateCursor,
  removeElement,
  tryFocus,
} from '#core/dom';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {
  formOrNullForElement,
  getFormAsObject,
  setFormForElement,
} from '#core/dom/form';
import {ancestorElementsByTag, childElementByAttr} from '#core/dom/query';
import {isArray, toArray} from '#core/types/array';
import {deepMerge} from '#core/types/object';
import {tryParseJson} from '#core/types/object/json';
import {parseQueryString} from '#core/types/string/url';
import {toWin} from '#core/window';

import {Services} from '#service';

import {triggerAnalyticsEvent} from '#utils/analytics';
import {createCustomEvent} from '#utils/event-helper';
import {dev, devAssert, user, userAssert} from '#utils/log';
import {setupAMPCors, setupInit, setupInput} from '#utils/xhr-utils';

import {AmpFormTextarea} from './amp-form-textarea';
import {FormDirtiness} from './form-dirtiness';
import {FormEvents} from './form-events';
import {installFormProxy} from './form-proxy';
import {FormSubmitService} from './form-submit-service';
import {getFormValidator, isCheckValiditySupported} from './form-validators';
import {
  FORM_VERIFY_OPTOUT,
  FORM_VERIFY_PARAM,
  getFormVerifier,
} from './form-verifiers';

import {CSS} from '../../../build/amp-form-0.1.css';
import {createFormDataWrapper} from '../../../src/form-data-wrapper';
import {getMode} from '../../../src/mode';
import {SsrTemplateHelper} from '../../../src/ssr-template-helper';
import {installStylesForDoc} from '../../../src/style-installer';
import {
  SOURCE_ORIGIN_PARAM,
  addParamsToUrl,
  isProxyOrigin,
  serializeQueryString,
} from '../../../src/url';

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

    /** @private @const {?Document} */
    this.doc_ = element.ownerDocument;

    /** @const @private {!Window} */
    this.win_ = toWin(this.doc_.defaultView);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.win_);

    /** @const @private {!HTMLFormElement} */
    this.form_ = element;

    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc}  */
    this.ampdoc_ = Services.ampdoc(this.form_);

    /** @private {?Promise} */
    this.dependenciesPromise_ = null;

    /** @const @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacement_ = Services.urlReplacementsForDoc(this.ampdoc_);

    /** @const @private {!../../../src/service/template-impl.Templates} */
    this.templates_ = Services.templatesForDoc(this.ampdoc_);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.win_);

    /** @const @private {!../../../src/service/action-impl.ActionService} */
    this.actions_ = Services.actionServiceForDoc(this.ampdoc_);

    /** @const @private {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(this.ampdoc_);

    /** @const @private {!../../../src/service/viewer-interface.ViewerInterface}  */
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);

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

    /** @const @private {?string} */
    this.encType_ = this.getEncType_('enctype');

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

    /** @const @private {!./form-dirtiness.FormDirtiness} */
    this.dirtinessHandler_ = new FormDirtiness(this.form_, this.win_);

    /** @const @private {!./form-validators.FormValidator} */
    this.validator_ = getFormValidator(this.form_);

    /** @const @private {!./form-verifiers.FormVerifier} */
    this.verifier_ = getFormVerifier(this.form_, () => this.handleXhrVerify_());

    /** If the element is in an email document, allow its `clear` and `submit` actions. */
    this.actions_.addToAllowlist('FORM', ['clear', 'submit'], ['email']);
    this.actions_.installActionHandler(
      this.form_,
      this.actionHandler_.bind(this)
    );
    this.installEventHandlers_();
    this.installInputMasking_();
    this.maybeInitializeFromUrl_();

    /** @private {?Promise} */
    this.xhrSubmitPromise_ = null;

    /** @private {?Promise} */
    this.renderTemplatePromise_ = null;

    /** @private {?./form-submit-service.FormSubmitService} */
    this.formSubmitService_ = null;
    Services.formSubmitForDoc(element).then((service) => {
      this.formSubmitService_ = service;
    });

    /** @private */
    this.isAmp4Email_ = this.doc_ && isAmp4Email(this.doc_);
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
      const urlService = Services.urlForDoc(this.ampdoc_);
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
   * Gets and validates an attribute for form request encoding type.
   * @param {string} attribute
   * @return {?string}
   * @private
   */
  getEncType_(attribute) {
    const encType = this.form_.getAttribute(attribute);
    if (
      encType === 'application/x-www-form-urlencoded' ||
      encType === 'multipart/form-data'
    ) {
      return encType;
    } else if (encType !== null) {
      user().warn(
        TAG,
        `Unexpected enctype: ${encType}. Defaulting to 'multipart/form-data'.`
      );
    }
    return 'multipart/form-data';
  }

  /**
   * @return {string|undefined} the value of the form's xssi-prefix attribute.
   */
  getXssiPrefix() {
    return this.form_.getAttribute('xssi-prefix');
  }

  /**
   * Builds fetch request data for amp-form elements.
   * @param {string} url
   * @param {string} method
   * @param {!{[key: string]: string}=} opt_extraFields
   * @param {!Array<string>=} opt_fieldDenylist
   * @return {!FetchRequestDef}
   */
  requestForFormFetch(url, method, opt_extraFields, opt_fieldDenylist) {
    let xhrUrl, body;
    let headers = {'Accept': 'application/json'};
    const isHeadOrGet = method == 'GET' || method == 'HEAD';
    if (isHeadOrGet) {
      this.assertNoSensitiveFields_();
      const values = this.getFormAsObject_();
      if (opt_fieldDenylist) {
        opt_fieldDenylist.forEach((name) => delete values[name]);
      }

      if (opt_extraFields) {
        deepMerge(values, opt_extraFields);
      }
      xhrUrl = addParamsToUrl(url, values);
    } else {
      xhrUrl = url;
      if (this.encType_ === 'application/x-www-form-urlencoded') {
        body = serializeQueryString(this.getFormAsObject_());
        headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        };
      } else {
        // default case: encType_ is 'multipart/form-data'
        devAssert(this.encType_ === 'multipart/form-data');
        body = createFormDataWrapper(this.win_, this.form_);
      }
      if (opt_fieldDenylist) {
        opt_fieldDenylist.forEach((name) => body.delete(name));
      }

      for (const key in opt_extraFields) {
        body.append(key, opt_extraFields[key]);
      }
    }

    /** @type {!FetchRequestDef}*/
    const request = {
      xhrUrl,
      fetchOpt: {
        'body': body,
        'method': method,
        'credentials': 'include',
        'headers': headers,
      },
    };
    return request;
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
    if (!invocation.satisfiesTrust(ActionTrust_Enum.DEFAULT)) {
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
    const promises = toArray(depElements).map((el) => el.build());
    return (this.dependenciesPromise_ = this.waitOnPromisesOrTimeout_(
      promises,
      2000
    ));
  }

  /** @private */
  installEventHandlers_() {
    this.ampdoc_.whenNextVisible().then(() => {
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
      (e) => {
        checkUserValidityAfterInteraction_(dev().assertElement(e.target));
        this.validator_.onBlur(e);
      },
      true
    );

    this.form_.addEventListener(
      AmpEvents_Enum.FORM_VALUE_CHANGE,
      (e) => {
        checkUserValidityAfterInteraction_(dev().assertElement(e.target));
        this.validator_.onInput(e);
      },
      true
    );

    //  Form verification is not supported when SSRing templates is enabled.
    if (!this.ssrTemplateHelper_.isEnabled()) {
      this.form_.addEventListener('change', (e) => {
        this.verifier_.onCommit().then((updatedErrors) => {
          const {errors, updatedElements} = updatedErrors;
          updatedElements.forEach(checkUserValidityAfterInteraction_);
          // Tell the validation to reveal any input.validationMessage added
          // by the form verifier.
          this.validator_.onBlur(e);

          // Only make the verify XHR if the user hasn't pressed submit.
          if (this.state_ === FormState.VERIFYING) {
            if (errors.length) {
              this.setState_(FormState.VERIFY_ERROR);
              this.renderTemplate_({'verifyErrors': errors}).then(() => {
                this.triggerAction_(
                  FormEvents.VERIFY_ERROR,
                  errors,
                  ActionTrust_Enum.DEFAULT // DEFAULT because async after gesture.
                );
              });
            } else {
              this.setState_(FormState.INITIAL);
            }
          }
        });
      });
    }

    this.form_.addEventListener('input', (e) => {
      checkUserValidityAfterInteraction_(dev().assertElement(e.target));
      this.validator_.onInput(e);
    });
  }

  /** @private */
  installInputMasking_() {
    Services.inputmaskServiceForDocOrNull(this.ampdoc_).then(
      (inputmaskService) => {
        if (inputmaskService) {
          inputmaskService.install();
        }
      }
    );
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
    const formDataForAnalytics = {};
    const formObject = this.getFormAsObject_();

    for (const k in formObject) {
      if (Object.prototype.hasOwnProperty.call(formObject, k)) {
        formDataForAnalytics['formFields[' + k + ']'] = formObject[k].join(',');
      }
    }
    formDataForAnalytics['formId'] = this.form_.id;

    try {
      this.analyticsEvent_(eventType, formDataForAnalytics);
    } catch (err) {
      dev().error(TAG, 'Sending analytics failed:', err);
    }
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
    // "submit" has the same trust level as the action that caused it.
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
    validityElements.forEach((element) => {
      element.classList.remove('user-valid');
      element.classList.remove('user-invalid');
    });

    const messageElements = this.form_.querySelectorAll(
      '.visible[validation-for]'
    );
    messageElements.forEach((element) => {
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
    return this.submit_(ActionTrust_Enum.HIGH, event);
  }

  /**
   * Helper method that actual handles the different cases (post, get, xhr...).
   * @param {ActionTrust_Enum} trust
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
      devAssert(this.formSubmitService_).fire(event);
    } catch (e) {
      dev().error(TAG, 'Form submit service failed: %s', e);
    }

    // Get our special fields
    const varSubsFields = this.getVarSubsFields_();
    const asyncInputs = this.form_.getElementsByClassName(
      AsyncInputClasses_Enum.ASYNC_INPUT
    );

    this.dirtinessHandler_.onSubmitting();

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
        this.dirtinessHandler_.onSubmitSuccess();
        return Promise.resolve();
      }

      if (event) {
        event.preventDefault();
      }
    }

    // Set ourselves to the SUBMITTING State
    this.setState_(FormState.SUBMITTING);

    // Promises to run before submit without timeout.
    const requiredActionPromises = [];
    // Promises to run before submitting the form
    const presubmitPromises = [];
    presubmitPromises.push(this.doVarSubs_(varSubsFields));
    iterateCursor(asyncInputs, (asyncInput) => {
      const asyncCall = this.getValueForAsyncInput_(asyncInput);
      if (
        asyncInput.classList.contains(
          AsyncInputClasses_Enum.ASYNC_REQUIRED_ACTION
        )
      ) {
        requiredActionPromises.push(asyncCall);
      } else {
        presubmitPromises.push(asyncCall);
      }
    });

    return Promise.all(requiredActionPromises).then(
      () => {
        return this.waitOnPromisesOrTimeout_(
          presubmitPromises,
          SUBMIT_TIMEOUT
        ).then(
          () => this.handlePresubmitSuccess_(trust),
          (error) => this.handlePresubmitError_(error, trust)
        );
      },
      (error) => this.handlePresubmitError_(error, trust)
    );
  }

  /**
   * Handle form error for presubmit async calls.
   * @param {*} error
   * @param {!ActionTrust_Enum} trust
   * @return {Promise}
   * @private
   */
  handlePresubmitError_(error, trust) {
    const detail = {};
    if (error && error.message) {
      detail['error'] = error.message;
    }
    return this.handleSubmitFailure_(error, detail, trust);
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
   * @param {!ActionTrust_Enum} trust
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
    this.triggerAction_(
      FormEvents.VERIFY,
      /* detail */ null,
      ActionTrust_Enum.HIGH
    );

    return this.doVarSubs_(this.getVarSubsFields_()).then(() =>
      this.doVerifyXhr_()
    );
  }

  /**
   * @param {ActionTrust_Enum} trust
   * @return {!Promise}
   * @private
   */
  handleXhrSubmit_(trust) {
    let p;
    if (this.ssrTemplateHelper_.isEnabled()) {
      p = this.handleSsrTemplate_(trust);
    } else {
      this.submittingWithTrust_(trust);
      p = this.doActionXhr_().then(
        (response) => this.handleXhrSubmitSuccess_(response, trust),
        (error) => this.handleXhrSubmitFailure_(error, trust)
      );
    }
    if (getMode().test) {
      this.xhrSubmitPromise_ = p;
    }
    return p;
  }

  /**
   * Handles the server side proxying and then rendering of the template.
   * @param {ActionTrust_Enum} trust
   * @return {!Promise}
   * @private
   */
  handleSsrTemplate_(trust) {
    // Render template for the form submitting state.
    const values = this.getFormAsObject_();
    return this.renderTemplate_(values)
      .then(() => {
        return this.actions_.trigger(
          this.form_,
          FormEvents.SUBMIT,
          /* event */ null,
          trust
        );
      })
      .then(() => {
        const request = this.requestForFormFetch(
          dev().assertString(this.xhrAction_),
          this.method_
        );
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
        return this.ssrTemplateHelper_.ssr(
          this.form_,
          request,
          this.templatesForSsr_()
        );
      })
      .then(
        (response) => this.handleSsrTemplateResponse_(response, trust),
        (error) => {
          const detail = {};
          if (error && error.message) {
            detail['error'] = error.message;
          }
          return this.handleSubmitFailure_(error, detail, trust);
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
   * Transition the form to the submit-success or submit-error state depending on the response status.
   * @param {!JsonObject} response
   * @param {!ActionTrust_Enum} trust
   * @return {!Promise}
   * @private
   */
  handleSsrTemplateResponse_(response, trust) {
    const init = response['init'];
    // response['body'] is serialized as a string in the response.
    const body = tryParseJson(response['body'], (error) =>
      user().error(TAG, 'Failed to parse response JSON: %s', error)
    );
    if (init) {
      const status = init['status'];
      if (status >= 300) {
        /** HTTP status codes of 300+ mean redirects and errors. */
        return this.handleSubmitFailure_(status, response, trust, body);
      }
    }
    return this.handleSubmitSuccess_(response, trust, body);
  }

  /**
   * Triggers the analytics and renders any template for submitting state.
   * @param {ActionTrust_Enum} trust
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
      .then((implementation) => implementation.getValue())
      .then((value) => {
        const name = asyncInput.getAttribute(AsyncInputAttributes_Enum.NAME);
        let input = this.form_.querySelector(
          `input[name=${escapeCssSelectorIdent(name)}]`
        );
        if (!input) {
          input = createElementWithAttributes(this.win_.document, 'input', {
            'name': asyncInput.getAttribute(AsyncInputAttributes_Enum.NAME),
            'hidden': 'true',
          });
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
    const denylist = noVerifyFields.map((field) => field.name || field.id);

    return this.doXhr_(
      dev().assertString(this.xhrVerify_),
      this.method_,
      /**opt_extraFields*/ {[FORM_VERIFY_PARAM]: true},
      /**opt_fieldDenylist*/ denylist
    );
  }

  /**
   * Send a request to a form endpoint.
   * @param {string} url
   * @param {string} method
   * @param {!{[key: string]: string}=} opt_extraFields
   * @param {!Array<string>=} opt_fieldDenylist
   * @return {!Promise<!Response>}
   * @private
   */
  doXhr_(url, method, opt_extraFields, opt_fieldDenylist) {
    this.assertSsrTemplate_(false, 'XHRs should be proxied.');
    const request = this.requestForFormFetch(
      url,
      method,
      opt_extraFields,
      opt_fieldDenylist
    );
    return this.xhr_.fetch(request.xhrUrl, request.fetchOpt);
  }

  /**
   * Returns the action trust for submit-success and submit-error events.
   * @param {!ActionTrust_Enum} incomingTrust
   * @return {!ActionTrust_Enum}
   * @private
   */
  trustForSubmitResponse_(incomingTrust) {
    // Degrade trust across form submission.
    return /** @type {!ActionTrust_Enum} */ (incomingTrust - 1);
  }

  /**
   * @param {!Response} response
   * @param {!ActionTrust_Enum} incomingTrust Trust of the originating submit action.
   * @return {!Promise}
   * @private
   */
  handleXhrSubmitSuccess_(response, incomingTrust) {
    return this.xhr_
      .xssiJson(response, this.getXssiPrefix())
      .then(
        (json) =>
          this.handleSubmitSuccess_(
            /** @type {!JsonObject} */ (json),
            incomingTrust
          ),
        (error) => user().error(TAG, 'Failed to parse response JSON: %s', error)
      )
      .then(() => {
        this.triggerFormSubmitInAnalytics_('amp-form-submit-success');
        this.maybeHandleRedirect_(response);
      });
  }

  /**
   * Transition the form to the submit success state.
   * @param {!JsonObject} result
   * @param {!ActionTrust_Enum} incomingTrust Trust of the originating submit action.
   * @param {?JsonObject=} opt_eventData
   * @return {!Promise}
   * @private
   */
  handleSubmitSuccess_(result, incomingTrust, opt_eventData) {
    this.setState_(FormState.SUBMIT_SUCCESS);
    // TODO: Investigate if `tryResolve()` can be removed here.
    return tryResolve(() => {
      this.renderTemplate_(result || {}).then(() => {
        const outgoingTrust = this.trustForSubmitResponse_(incomingTrust);
        this.triggerAction_(
          FormEvents.SUBMIT_SUCCESS,
          opt_eventData === undefined ? result : opt_eventData,
          outgoingTrust
        );
        this.dirtinessHandler_.onSubmitSuccess();
      });
    });
  }

  /**
   * @param {*} e
   * @param {!ActionTrust_Enum} incomingTrust Trust of the originating submit action.
   * @return {!Promise}
   * @private
   */
  handleXhrSubmitFailure_(e, incomingTrust) {
    let promise;
    if (e && e.response) {
      const error = /** @type {!Error} */ (e);
      promise = this.xhr_
        .xssiJson(error.response, this.getXssiPrefix())
        .catch(() => null);
    } else {
      promise = Promise.resolve(null);
    }
    return promise.then((responseJson) => {
      this.handleSubmitFailure_(e, responseJson, incomingTrust);
      this.triggerFormSubmitInAnalytics_('amp-form-submit-error');
      this.maybeHandleRedirect_(e.response);
    });
  }

  /**
   * Transition the form the the submit error state.
   * @param {*} error
   * @param {!JsonObject} json
   * @param {!ActionTrust_Enum} incomingTrust
   * @param {?JsonObject=} opt_eventData
   * @return {!Promise}
   * @private
   */
  handleSubmitFailure_(error, json, incomingTrust, opt_eventData) {
    this.setState_(FormState.SUBMIT_ERROR);
    user().error(TAG, 'Form submission failed: %s', error);
    // TODO: Investigate if `tryResolve()` can be removed here.
    return tryResolve(() => {
      this.renderTemplate_(json).then(() => {
        const outgoingTrust = this.trustForSubmitResponse_(incomingTrust);
        this.triggerAction_(
          FormEvents.SUBMIT_ERROR,
          opt_eventData === undefined ? json : opt_eventData,
          outgoingTrust
        );
        this.dirtinessHandler_.onSubmitError();
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
    const supported = this.ssrTemplateHelper_.isEnabled();
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
        !this.isAmp4Email_,
        'Redirects not supported in AMP4Email.',
        this.form_
      );
      userAssert(
        this.target_ != '_blank',
        'Redirecting to target=_blank using AMP-Redirect-To is currently ' +
          'not supported, use target=_top instead. %s',
        this.form_
      );
      try {
        const urlService = Services.urlForDoc(this.ampdoc_);
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
      const navigator = Services.navigationForDoc(this.ampdoc_);
      navigator.navigateTo(this.win_, redirectTo, REDIRECT_TO_HEADER);
    }
  }

  /**
   * Triggers an action e.g. submit success/error with response data.
   * @param {!FormEvents} name
   * @param {?JsonObject|!Array<{message: string, name: string}>} detail
   * @param {!ActionTrust_Enum} trust
   * @private
   */
  triggerAction_(name, detail, trust) {
    const event = createCustomEvent(this.win_, `${TAG}.${name}`, {
      'response': detail,
    });
    this.actions_.trigger(this.form_, name, event, trust);
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
    if (isArray(data)) {
      data = {};
      user().warn(
        TAG,
        `Unexpected data type: ${data}. Expected non JSON array.`
      );
    }
    const container = this.form_./*OK*/ querySelector(`[${this.state_}]`);
    let p = Promise.resolve();
    if (container) {
      const messageId = `rendered-message-${this.id_}`;
      container.setAttribute('role', 'alert');
      container.setAttribute('aria-labeledby', messageId);
      container.setAttribute('aria-live', 'assertive');
      if (this.templates_.hasTemplate(container)) {
        p = this.ssrTemplateHelper_
          .applySsrOrCsrTemplate(devAssert(container), data)
          .then((rendered) => {
            // TODO(#29566): Simplify section appending rendered contents to DOM.
            let renderContainer;
            if (isArray(rendered)) {
              if (rendered.length === 1) {
                renderContainer = rendered[0];
              } else {
                renderContainer = document.createElement('div');
                rendered.forEach((child) => renderContainer.appendChild(child));
              }
            } else {
              renderContainer = rendered;
            }
            renderContainer.id = messageId;
            renderContainer.setAttribute('i-amphtml-rendered', '');
            return this.mutator_.mutateElement(
              dev().assertElement(container),
              () => {
                container.appendChild(dev().assertElement(renderContainer));
                const renderedEvent = createCustomEvent(
                  this.win_,
                  AmpEvents_Enum.DOM_UPDATE,
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
        this.mutator_.mutateElement(container, () => {});
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
   * Initialize form fields from query parameter values if attribute
   * 'data-initialize-from-url' is present on the form and attribute
   * 'data-allow-initialization' is present on the field.
   * @private
   */
  maybeInitializeFromUrl_() {
    if (
      isProxyOrigin(this.win_.location) ||
      !this.form_.hasAttribute('data-initialize-from-url')
    ) {
      return;
    }

    const valueTags = ['SELECT', 'TEXTAREA'];
    const valueInputTypes = [
      'color',
      'date',
      'datetime-local',
      'email',
      'hidden',
      'month',
      'number',
      'range',
      'search',
      'tel',
      'text',
      'time',
      'url',
      'week',
    ];
    const checkedInputTypes = ['checkbox', 'radio'];

    const maybeFillField = (field, name) => {
      // Do not interfere with form fields that utilize variable substitutions.
      // These fields are populated at time of form submission.
      if (field.hasAttribute('data-amp-replace')) {
        return;
      }
      // Form fields must be allowlisted
      if (!field.hasAttribute('data-allow-initialization')) {
        return;
      }

      const value = queryParams[name] || '';
      const type = field.getAttribute('type') || 'text';
      const tag = field.tagName;

      if (tag === 'INPUT') {
        if (valueInputTypes.includes(type.toLocaleLowerCase())) {
          if (field.value !== value) {
            field.value = value;
          }
        } else if (checkedInputTypes.includes(type)) {
          const checked = field.value === value;
          if (field.checked !== checked) {
            field.checked = checked;
          }
        }
      } else if (valueTags.includes(tag)) {
        if (field.value !== value) {
          field.value = value;
        }
      }
    };

    const queryParams = parseQueryString(this.win_.location.search);
    Object.keys(queryParams).forEach((key) => {
      // Typecast since Closure is missing NodeList union type in HTMLFormElement.elements.
      const formControls = /** @type {(!Element|!NodeList)} */ (
        this.form_.elements[key]
      );
      if (!formControls) {
        return;
      }

      if (formControls.nodeType === Node.ELEMENT_NODE) {
        const field = dev().assertElement(formControls);
        maybeFillField(field, key);
      } else if (formControls.length) {
        const fields = /** @type {!NodeList} */ (formControls);
        fields.forEach((field) => maybeFillField(field, key));
      }
    });
  }

  /**
   * Returns a promise that resolves when tempalte render finishes. The promise
   * will be null if the template render has not started.
   * @visibleForTesting
   * @return {*} TODO(#23582): Specify return type
   */
  renderTemplatePromiseForTesting() {
    return this.renderTemplatePromise_;
  }

  /**
   * Returns a promise that resolves when xhr submit finishes. The promise
   * will be null if xhr submit has not started.
   * @visibleForTesting
   * @return {*} TODO(#23582): Specify return type
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
  elements.forEach((element) => checkUserValidity(element));
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
    elements.forEach((element) => {
      dev().assertElement(element).classList.remove(validityState);
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
 * @private
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
      this.installDomUpdateEventListener_(root);
      this.installFormSubmissionShortcutForTextarea_(root);
    });
  }

  /**
   * Install submission handler on all forms in the document.
   * @param {NodeList} forms
   * @private
   */
  installSubmissionHandlers_(forms) {
    if (!forms) {
      return;
    }

    forms.forEach((form, index) => {
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
  installDomUpdateEventListener_(doc) {
    doc.addEventListener(AmpEvents_Enum.DOM_UPDATE, () => {
      this.installSubmissionHandlers_(doc.querySelectorAll('form'));
    });
  }

  /**
   * Listen for Ctrl/Cmd + Enter in textarea elements
   * to trigger form submission when relevant.
   * @param {!Document|!ShadowRoot} doc
   */
  installFormSubmissionShortcutForTextarea_(doc) {
    doc.addEventListener('keydown', (e) => {
      if (
        e.defaultPrevented ||
        e.key != Keys_Enum.ENTER ||
        !(e.ctrlKey || e.metaKey) ||
        e.target.tagName !== 'TEXTAREA'
      ) {
        return;
      }
      const {form} = e.target;
      const ampForm = form ? formOrNullForElement(form) : null;
      if (!ampForm) {
        return;
      }
      ampForm.handleSubmitEvent_(e);
      e.preventDefault();
    });
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerServiceForDoc('form-submit-service', FormSubmitService);
  AMP.registerServiceForDoc(TAG, AmpFormService);
});
