/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {ActionTrust} from '../../action-constants';
import {
  AsyncInputAttributes,
  AsyncInputClasses,
} from '../../../src/async-input';
import {
  PaymentsClient,
  createButtonHelper,
} from '../../../third_party/aog-payjs/payjs';
import {Services} from '../../services';
import {createCustomEvent} from '../../event-helper';
import {getServiceForDoc} from '../../service';
import {isJsonScriptTag} from '../../dom';
import {map} from '../../utils/object';
import {parseUrlDeprecated} from '../../url';
import {setStyles} from '../../style';
import {tryParseJson} from '../../json';
import {user, userAssert} from '../../log';

/* Types for Google Payment APIs. */
/**
 * Configuration for _Pay with Google_ AMP tags. This configuration should be
 * provided in JSON format in a <script> tag inside the relevant _Pay with
 * Google_ tag.
 *
 * @typedef {{
 *   merchantId: (?string|undefined),
 *   allowedPaymentMethods: (?Array<string>|undefined),
 *   paymentMethodTokenizationParameters: ?PaymentMethodTokenizationParameters,
 *   cardRequirements: ?CardRequirements,
 *   phoneNumberRequired: (?boolean|undefined),
 *   emailRequired: (?boolean|undefined),
 *   shippingAddressRequired: (?boolean|undefined),
 *   shippingAddressRequirements: ?ShippingAddressRequirements,
 *   transactionInfo: ?TransactionInfo,
 *   swg: ?SwgParameters,
 * }}
 *
 * @property {string} merchantId The obfuscated merchant gaia id.
 * @property {Array<string>} allowedPaymentMethods The allowedPaymentMethods can
 *     be 'CARD' or 'TOKENIZED_CARD'.
 * @property {PaymentMethodTokenizationParameters}
 *     paymentMethodTokenizationParameters.
 * @property {CardRequirements} cardRequirements.
 * @property {boolean} phoneNumberRequired.
 * @property {boolean} emailRequired.
 * @property {boolean} phoneNumberRequired.
 * @property {boolean} shippingAddressRequired.
 * @property {ShippingAddressRequirements} shippingAddressRequirements.
 * @property {TransactionInfo} transactionInfo
 * @property {SwgParameters} swg
 */
let PaymentDataRequestDef;
/**
 * Response returned by loadPaymentData.
 *
 * @typedef {{
 *   paymentMethodToken: !PaymentMethodToken,
 *   cardInfo: !CardInfo,
 *   shippingAddress: (?UserAddress|undefined),
 *   email: (?string|undefined),
 * }}
 *
 * @property {PaymentMethodToken} paymentMethodToken Chargeable token.
 * @property {CardInfo} cardInfo Information about the selected card.
 * @property {UserAddress} Shipping address, if shippingAddressRequired was set
 *     to true in the PaymentDataRequest.
 * @property {email} Email address, if emailRequired was set to true in the
 *     PaymentDataRequest.
 */
export let PaymentData;
/**
 * Request object of isReadyToPay.
 *
 * @typedef {{
 *   allowedPaymentMethods: (?Array<string>|undefined),
 * }}
 *
 * @property {Array<string>} allowedPaymentMethods The allowedPaymentMethods can
 *     be 'CARD' or 'TOKENIZED_CARD'.
 */
export let IsReadyToPayRequest;

/** @const {string} */
const TAG = 'amp-payment-google-integration';

/** @const {string} */
const SERVICE_TAG = 'payment-google-inline';

/** @const {number} */
const GOOGLE_PAY_LOG_INLINE_PAYMENT_WIDGET_INITIALIZE = 4;

/** @const {number} */
const GOOGLE_PAY_TYPE_AMP_INLINE = 8;

/** @const {string} */
const IS_TEST_MODE_ = 'is-test-mode';

/** @const {string} */
const RENDER_ONLY_IF_PAYMENT_METHOD_PRESENT_ATTRIBUTE_ =
  'render_only_if_payment_method_present';

/** @const {string} */
const PAYMENT_READY_STATUS_CHANGED = 'paymentReadyStatusChanged';

/** @const {string} */
const ON_PAYMENT_SUBMIT_ERROR = 'onPaymentSubmitError';

/** @const {string} */
const LOAD_PAYMENT_DATA_EVENT_NAME = 'loadPaymentData';

export class AmpPaymentGoogleIntegration {
  /**
   * @param {!../../service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    // Common
    // Initialize services. Note that accessing the viewer service in the
    // constructor throws an error in unit tests, so it is set in buildCallback.
    /** @private @const {!../viewer-impl.Viewer} */
    this.viewer_ = null;
    /** @private {?PaymentsClient} */
    this.client_ = null;
    /** @private {boolean} */
    this.existingPaymentMethodRequired_;
    /** @private {boolean} */
    this.shouldUseTestOverride_ = false;
    /** @const @private */
    this.ampdoc_ = ampdoc;
    /** @private {?AmpElement} */
    this.activeElement_ = null;

    // Iframe
    /** @private {?../../service/action-impl.ActionService} */
    this.actions_ = null;
    this.iframe_ = null;
    /** @private {string} */
    this.iframeOrigin_ = '';
    /** @private {function()|null} */
    this.iframeReadyResolver_ = null;
    /** @private {function()|null} */
    this.iframeReadyRejector_ = null;
    /** @private {Promise} */
    this.iframeReadyPromise_ = new Promise((resolve, reject) => {
      this.iframeReadyResolver_ = resolve;
      this.iframeReadyRejector_ = reject;
    });
    /** @private {number} */
    this.iframeInitializeLatency_ = Date.now();
    /** @private {boolean} */
    this.iframeRenderWithBottomSheet_ = false;

    // Button
    /** @private {function()|null} */
    this.buttonReadyResolver_ = null;
    /** @private {Promise} */
    this.buttonReadyPromise_ = new Promise((resolve, reject) => {
      this.buttonReadyResolver_ = resolve;
      this.buttonReadyRejector_ = reject;
    });
  }

  /**
   * @param {!AmpElement} element
   */
  startInlinePayment(element) {
    this.activeElement_ = element;
    if (this.viewer_) {
      // No need to initialize payment client again.
      this.renderInlinePayment_(/* iframeSrc= */ '');
      return;
    }
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);
    this.actions_ = Services.actionServiceForDoc(element);
    this.iframeService_ = getServiceForDoc(
      this.ampdoc_.win.document,
      SERVICE_TAG
    );
    this.viewer_
      .whenFirstVisible()
      .then(() => this.initializePaymentClient_())
      .then(
        () => {
          return this.isReadyToPay_();
        },
        error => {
          user().error('Initialize payment client failed with error: ' + error);
          return Promise.reject(error);
        }
      )
      .then(response => {
        if (response['result']) {
          return this.viewer_.sendMessageAwaitResponse(
            'getInlinePaymentIframeUrl',
            this.getPaymentDataRequest_()
          );
        } else {
          // Unblock layoutCallback.
          this.iframeReadyRejector_('Google Pay is not supported');
        }
      })
      .then(data => this.renderInlinePayment_(data));
  }

  /**
   * @param {!AmpElement} element
   * @return {!Promise}
   */
  startGpayButton(element) {
    this.activeElement_ = element;
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);
    this.actions_ = Services.actionServiceForDoc(element);
    const renderIfPaymentMethodRequired = this.activeElement_.getAttribute(
      RENDER_ONLY_IF_PAYMENT_METHOD_PRESENT_ATTRIBUTE_
    );
    this.existingPaymentMethodRequired_ = renderIfPaymentMethodRequired
      ? renderIfPaymentMethodRequired.toLowerCase() == 'true'
      : false;
    return this.viewer_
      .whenFirstVisible()
      .then(() => this.viewer_.isTrustedViewer())
      .then(isTrustedViewer => {
        if (isTrustedViewer) {
          return this.initializePaymentClientWithViewer_();
        } else {
          return this.initializePaymentClientLocally_();
        }
      });
  }

  /**
   * @return {Promise}
   */
  whenInlineWidgetReady() {
    return this.iframeReadyPromise_;
  }

  /**
   * @return {Promise}
   */
  whenButtonReady() {
    return this.buttonReadyPromise_;
  }

  /**
   * @return {Promise}
   */
  initializePaymentClientWithViewer_() {
    return this.initializePaymentClient_()
      .then(
        () => this.isReadyToPay_(),
        error => {
          this.rejectButtonReadiness_(error);
        }
      )
      .then(
        response => {
          if (response['result']) {
            const {paymentMethodPresent} = response;
            if (paymentMethodPresent || !this.existingPaymentMethodRequired_) {
              this.renderButton_(() => this.onClickButton_());
            } else {
              this.resolveButtonReadiness_();
            }
          } else {
            const errorMessage = 'Google Pay is not supported';
            this.rejectButtonReadiness_(errorMessage);
          }
        },
        error => {
          this.rejectButtonReadiness_(error);
        }
      );
  }

  /**
   * @return {Promise}
   */
  initializePaymentClientLocally_() {
    // not in Google Viewer, use Google Payments Client directly
    this.localInitializePaymentClient_();
    return this.localIsReadyToPay_().then(response => {
      if (response['result']) {
        const {paymentMethodPresent} = response;
        if (paymentMethodPresent || !this.existingPaymentMethodRequired_) {
          this.renderButton_(() => this.localOnClickButton_());
        } else {
          this.resolveButtonReadiness_();
        }
      } else {
        const errorMessage = 'Google Pay is not supported';
        this.rejectButtonReadiness_(errorMessage);
      }
    });
  }

  /**
   * Render the google pay button with specified on click function.
   *
   * @param {function(): void} onClickFunc on click function of the google pay
   *     button
   * @private
   */
  renderButton_(onClickFunc) {
    this.activeElement_.appendChild(
      createButtonHelper({
        onClick: onClickFunc,
      })
    );
    this.resolveButtonReadiness_();
  }

  /**
   * @private
   */
  resolveButtonReadiness_() {
    if (this.buttonReadyResolver_) {
      this.buttonReadyResolver_();
      this.buttonReadyResolver_ = null;
    }
  }

  /**
   * Render the google pay button with specified on click function.
   *
   * @param {?Object} error
   * @private
   */
  rejectButtonReadiness_(error) {
    if (this.buttonReadyRejector_) {
      this.buttonReadyRejector_(error);
      this.buttonReadyRejector_ = null;
    }
    throw new Error(error);
  }

  /**
   * Request payment data, which contains necessary information to
   * complete a payment, and trigger the load payment data event.
   *
   * @private
   */
  onClickButton_() {
    this.viewer_
      .sendMessageAwaitResponse(
        'loadPaymentData',
        this.getPaymentDataRequest_()
      )
      .then(data => this.triggerAction_(data));
  }

  /**
   * Request payment data, which contains necessary information to
   * complete a payment on local payments client and trigger the load
   * payment data event.
   *
   * @private
   */
  localOnClickButton_() {
    this.client_
      .loadPaymentData(this.getPaymentDataRequest_())
      .then(data => this.triggerAction_(data));
  }

  /**
   * Trigger load payment data event with the given payment data
   *
   * @param {!PaymentData} paymentData payment data from load payment data
   *     function
   * @private
   */
  triggerAction_(paymentData) {
    const name = LOAD_PAYMENT_DATA_EVENT_NAME;
    const event = createCustomEvent(
      this.ampdoc_.win,
      `${TAG}.${name}`,
      paymentData
    );
    this.actions_.trigger(this.activeElement_, name, event, ActionTrust.HIGH);
  }

  /**
   * Render the inline widget.
   * @param {string} iframeSrc The source of the iframe hosting the inline
   *     widget.
   * @private
   */
  renderInlinePayment_(iframeSrc) {
    if (this.iframe_) {
      this.activeElement_.appendChild(this.iframe_);
    } else if (iframeSrc) {
      this.ampdoc_.win.addEventListener('message', event =>
        this.onMessage_(event)
      );
      this.iframe_ = this.ampdoc_.win.document.createElement('iframe');
      this.iframe_.src = iframeSrc;
      this.iframe_.classList.add('google-pay-iframe');
      this.activeElement_.appendChild(this.iframe_);
      this.iframeOrigin_ = parseUrlDeprecated(iframeSrc).origin;
    }
    // only need to assert name attribute exists
    userAssert(
      this.activeElement_.getAttribute(AsyncInputAttributes.NAME),
      'The %s attribute is required for <amp-google-payment-inline-async> %s',
      AsyncInputAttributes.NAME,
      this.activeElement_
    );
    this.activeElement_.classList.add(AsyncInputClasses.ASYNC_INPUT);
  }

  /**
   * Handler for messages from the iframe. This handler is for requests sent
   * from the iframe to the AMP page; the @link {AmpPaymentGoogleInlineService}
   * handles messages which are responses to requests sent by the AMP page.
   *
   * @param {!Event} event
   * @private
   */
  onMessage_(event) {
    if (event.data.message === 'loadPaymentData') {
      this.viewer_
        .sendMessageAwaitResponse('loadPaymentData', event.data.data)
        .then(
          data => {
            this.iframeService_.sendIframeMessage(
              this.iframe_,
              this.iframeOrigin_,
              'loadPaymentData',
              data
            );
          },
          error => {
            if (error && error.cause && error.cause.errorCode !== 'CANCELED') {
              user().error(
                TAG,
                'Error while calling loadPaymentData: ' + error
              );
            } else {
              user().info(TAG, 'User cancelled loadPaymentData call');
            }
          }
        );
    } else if (event.data.message === 'paymentReadyStatusChanged') {
      if (this.iframeReadyResolver_) {
        this.iframeReadyResolver_();
        this.iframeReadyResolver_ = null;
        this.sendLogDataMessage_({
          'eventType': GOOGLE_PAY_LOG_INLINE_PAYMENT_WIDGET_INITIALIZE,
          'clientLatencyStartMs': this.iframeInitializeLatency_,
          'buyFlowMode': GOOGLE_PAY_TYPE_AMP_INLINE,
        });
      }
      const name = PAYMENT_READY_STATUS_CHANGED;
      const customEvent = createCustomEvent(
        this.ampdoc_.win,
        `payment-google-inline.${name}`,
        event.data.data
      );
      this.actions_.trigger(
        this.activeElement_,
        name,
        customEvent,
        ActionTrust.HIGH
      );
    } else if (event.data.message === 'prefetchPaymentData') {
      this.viewer_.sendMessage(
        'prefetchPaymentData',
        this.getPaymentDataRequest_()
      );
    } else if (event.data.message === 'resize') {
      this.resizeIframe_(event.data.data);
    } else if (event.data.message === 'validateViewer') {
      this.viewer_.isTrustedViewer().then(result => {
        this.iframeService_.sendIframeMessage(
          this.iframe_,
          this.iframeOrigin_,
          'validateViewerReply',
          {'result': result}
        );
      });
    } else if (event.data.message === 'logPaymentData') {
      this.sendLogDataMessage_(event.data.data);
    } else if (event.data.message === 'useIframeContainer') {
      this.iframeRenderWithBottomSheet_ = true;
      this.activeElement_.classList.add(
        AsyncInputClasses.ASYNC_REQUIRED_ACTION
      );
    }
  }

  /**
   * @return {!Promise}
   */
  populatePaymentToken() {
    if (this.iframeRenderWithBottomSheet_) {
      return this.viewer_
        .sendMessageAwaitResponse(
          'loadPaymentData',
          this.getPaymentDataRequest_()
        )
        .then(
          data => Promise.resolve(JSON.stringify(data)),
          error => {
            this.triggerOnPaymentSubmitErrorEvent_(error);
            user().error(TAG, 'Error on submission: ' + error);
            return Promise.reject(
              'loadPaymentData bottom sheet ' +
                'cancelled by the user or errored out.'
            );
          }
        );
    } else {
      // If the payment token is not yet present, then we need to fetch it
      // before submitting the form. This will happen if the user decides to use
      // the default instrument shown in the inline widget.
      return this.iframeService_
        .sendIframeMessageAwaitResponse(
          this.iframe_,
          this.iframeOrigin_,
          'getSelectedPaymentData'
        )
        .then(
          data => Promise.resolve(JSON.stringify(data)),
          error => {
            this.triggerOnPaymentSubmitErrorEvent_(error);
            user().error(TAG, 'Error on submission: ' + error);
            return Promise.reject('Error when fetching payment method token.');
          }
        );
    }
  }

  /**
   * Triggers the onPaymentSubmitError event listener
   *
   * @param {!Error} error
   * @private
   */
  triggerOnPaymentSubmitErrorEvent_(error) {
    const name = ON_PAYMENT_SUBMIT_ERROR;
    const customEvent = createCustomEvent(
      this.ampdoc_.win,
      `payment-google-inline.${name}`,
      this.getOnPaymentSubmitErrorDetails_(error)
    );
    this.actions_.trigger(
      this.activeElement_,
      name,
      customEvent,
      ActionTrust.HIGH
    );
  }

  /**
   * Constructs the error detail data for onPaymentSubmitError
   *
   * @param {!Error} error
   * @return {JSONObject} error
   * @private
   */
  getOnPaymentSubmitErrorDetails_(error) {
    if (error.statusCode == 'DEVELOPER_ERROR') {
      return {statusCode: error.statusCode, statusMessage: error.statusMessage};
    }
    return {statusCode: error.statusCode};
  }

  /**
   * @param {!Object} resizeRequest
   * @private
   */
  resizeIframe_(resizeRequest) {
    setStyles(this.iframe_, {
      height: resizeRequest['frameHeight'] + 'px',
    });
    setStyles(this.activeElement_, {
      height: resizeRequest['frameHeight'] + 'px',
    });
  }

  /**
   * @param {!Object} data
   * @private
   */
  sendLogDataMessage_(data) {
    this.viewer_.sendMessage('logPaymentData', data);
  }

  /**
   * @private
   * @return {?PaymentDataRequestDef|undefined}
   */
  getPaymentDataRequest_() {
    const scripts = this.activeElement_.getElementsByTagName('script');
    if (scripts.length > 2 || scripts.length < 1) {
      user().error(
        TAG,
        'Should contain 1 or 2 <script> child with JSON config.'
      );
      return;
    }
    let paymentDataRequest;
    let paymentDataRequestTestOverride;
    for (let i = 0; i < scripts.length; i++) {
      const scriptEl = scripts[i];
      if (!isJsonScriptTag(scriptEl)) {
        user().error(
          TAG,
          'PaymentDataRequest should be in a <script> tag with ' +
            'type="application/json".'
        );
        return;
      }
      const json = tryParseJson(scriptEl.textContent, e => {
        user().error(
          TAG,
          'Failed to parse PaymentDataRequest. Is it valid JSON?',
          e
        );
        return;
      });
      if (scriptEl.getAttribute('name') === 'test-override') {
        paymentDataRequestTestOverride = json;
      } else {
        paymentDataRequest = json;
      }
    }
    if (!paymentDataRequest) {
      user().error(TAG, 'PaymentDataRequest not found');
      return;
    }
    if (this.shouldUseTestOverride_ && paymentDataRequestTestOverride) {
      // Override paymentDataRequest with paymentDataRequestTestOverride if test
      // mode
      paymentDataRequest = Object.assign(
        paymentDataRequest,
        paymentDataRequestTestOverride
      );
    }
    return paymentDataRequest;
  }

  /**
   * @private
   * @return {!Promise<(JsonObject|undefined)>} the response promise
   */
  initializePaymentClient_() {
    const isTestMode = this.isTestMode_();
    return this.viewer_
      .sendMessageAwaitResponse('initializePaymentClient', {isTestMode})
      .then(result => {
        if (result) {
          this.shouldUseTestOverride_ = result['shouldUseTestOverride'];
          return result;
        }
      });
  }

  /**
   * Initialize a local PaymentsClient object. Initial development will use a
   * TEST environment returning dummy payment methods suitable for referencing
   * the structure of a payment response. A selected payment method is not
   * capable of a transaction.
   *
   * @private
   */
  localInitializePaymentClient_() {
    const isTestMode = this.isTestMode_();
    let options;
    if (isTestMode) {
      options = {'environment': 'TEST'};
      this.shouldUseTestOverride_ = true;
    } else {
      options = {'environment': 'PRODUCTION'};
      this.shouldUseTestOverride_ = false;
    }
    this.client_ = new PaymentsClient(options);
  }

  /**
   * @return {boolean} if is in test mode
   * @protected
   */
  isTestMode_() {
    const testModeAttr = this.activeElement_.getAttribute(IS_TEST_MODE_);
    return testModeAttr ? testModeAttr.toLowerCase() == 'true' : false;
  }

  /**
   * @private
   * @return {!Promise<(boolean|undefined)>} the response promise will contain
   * the boolean result and error message
   */
  isReadyToPay_() {
    const paymentDataRequest = this.getPaymentDataRequest_();
    paymentDataRequest.existingPaymentMethodRequired = this.existingPaymentMethodRequired_;
    return this.viewer_.sendMessageAwaitResponse(
      'isReadyToPay',
      paymentDataRequest
    );
  }

  /**
   * Check in local payments client that if the user can make payments
   * using the Payment API. Will return if the Google Pay API is supported
   * by the current browser for the specified payment methods.
   *
   * @return {!Promise<(boolean|undefined)>} the response promise will contain
   * the boolean result and error message
   * @private
   */
  localIsReadyToPay_() {
    const paymentDataRequest = this.getPaymentDataRequest_();
    return this.client_.isReadyToPay(paymentDataRequest);
  }
}

// Iframe service
/**
 * Container for data about a postMessage request sent to an iframe. The data is
 * used to match incoming messages (responses) to the requests that prompted
 * them.
 *
 * @typedef {{
 *   resolve: !Function,
 *   reject: !Function,
 *   origin: string,
 *   messageName: string,
 * }}
 *
 * @property {!Function} resolve A function which will be called to resolve the
 *     promise for the request.
 * @property {string} origin The origin of the frame to which this request was
 *     sent. This is used to check that the response comes from the same frame.
 * @property {string} messageName The name of the request message. Should match
 *     the name of the response message.
 */
let MessageRequestDataDef;

/**
 * Handles messaging with iframe. This can be mocked in tests.
 */
export class AmpPaymentGoogleInlineService {
  /** @constructor */
  constructor() {
    // /** @private {Map<number, MessageRequestDataDef>} */
    this.requestData_ = map();
    /** @private {number} */
    this.nextMessageId_ = 0;
    const service = this;
    self.addEventListener('message', event => {
      const request = service.requestData_[event.data.messageId];
      if (
        request &&
        event.origin === request.origin &&
        event.data.message === request.messageName
      ) {
        if (event.data.error) {
          request.reject(event.data.error);
        } else {
          request.resolve(event.data.data);
        }
      }
    });
  }

  /**
   * Send a message to the widget iframe and return a promise which will be
   * fulfilled with the response to the message.
   *
   * Note that in order for responses to be processed correctly, the iframe
   * receiving the request must return the messageId in the 'messageId' field of
   * the response payload.
   *
   * @param {HTMLIFrameElement} iframe
   * @param {string} iframeOrigin
   * @param {string} messageName
   * @param {!Object} [messagePayload]
   * @return {!Promise}
   */
  sendIframeMessageAwaitResponse(
    iframe,
    iframeOrigin,
    messageName,
    messagePayload
  ) {
    const messageId = this.nextMessageId_++;
    const promise = new Promise((resolve, reject) => {
      this.requestData_[messageId] = {
        resolve,
        reject,
        messageName,
        origin: iframeOrigin,
      };
    });
    this.sendIframeMessageWithId_(
      iframe,
      iframeOrigin,
      messageName,
      messageId,
      messagePayload
    );
    return promise;
  }

  /**
   * Send a message to the widget iframe without waiting for a response.
   *
   * @param {HTMLIFrameElement} iframe
   * @param {string} iframeOrigin
   * @param {string} messageName
   * @param {!Object} [messagePayload]
   */
  sendIframeMessage(iframe, iframeOrigin, messageName, messagePayload) {
    this.sendIframeMessageInternal_(
      iframe,
      iframeOrigin,
      {
        message: messageName,
      },
      messagePayload
    );
  }

  /**
   * Send a message to the widget iframe without waiting for a response.
   *
   * @param {HTMLIFrameElement} iframe
   * @param {string} iframeOrigin
   * @param {string} messageName
   * @param {number} messageId
   * @param {!Object} [messagePayload]
   * @private
   */
  sendIframeMessageWithId_(
    iframe,
    iframeOrigin,
    messageName,
    messageId,
    messagePayload
  ) {
    this.sendIframeMessageInternal_(
      iframe,
      iframeOrigin,
      {
        message: messageName,
        messageId,
      },
      messagePayload
    );
  }

  /**
   * Send a message to the widget iframe without waiting for a response.
   *
   * @param {HTMLIFrameElement} iframe
   * @param {string} iframeOrigin
   * @param {{ message: string, messageId: ?number }} message
   * @param {!Object} [messagePayload]
   * @private
   */
  sendIframeMessageInternal_(iframe, iframeOrigin, message, messagePayload) {
    if (messagePayload) {
      message.data = messagePayload;
    }
    iframe.contentWindow.postMessage(message, iframeOrigin);
  }
}
