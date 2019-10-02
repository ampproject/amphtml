/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

import {Constants} from './constants.js';
import {PaymentsClientDelegateInterface} from './payments_client_delegate_interface.js';
import {PaymentsRequestDelegate} from './payments_request_delegate.js';
import {PaymentsWebActivityDelegate} from './payments_web_activity_delegate.js';
import uuid from '../third_party/random_uuid/Random.uuid.js';
import {PayFrameHelper, PostMessageEventType, PublicErrorCode} from './pay_frame_helper.js';
import {chromeSupportsPaymentRequest, doesMerchantSupportOnlyTokenizedCards, validatePaymentOptions, validateIsReadyToPayRequest, validatePaymentDataRequest, validateSecureContext} from './validator.js';
import {createButtonHelper} from './button.js';

const TRUSTED_DOMAINS = [
  'actions.google.com',
  'amp-actions.sandbox.google.com',
  'amp-actions-staging.sandbox.google.com',
  'amp-actions-autopush.sandbox.google.com',
  'payments.developers.google.com',
  'payments.google.com',
];

/**
 * The client for interacting with the Google Payment APIs.
 * <p>
 * The async refers to the fact that this client supports redirects
 * when using webactivties.
 * <p>
 * If you are using this be sure that this is what you want.
 * <p>
 * In almost all cases PaymentsClient is the better client to use because
 * it exposes a promises based api which is easier to deal with.
 * @final
 */
export class PaymentsAsyncClient {
  /**
   * @param {PaymentOptions} paymentOptions
   * @param {function(!Promise<!PaymentData>)} onPaymentResponse
   * @param {boolean=} opt_useIframe
   */
  constructor(paymentOptions, onPaymentResponse, opt_useIframe) {
    this.onPaymentResponse_ = onPaymentResponse;

    validatePaymentOptions(paymentOptions);

    /** @private {?number} */
    this.loadPaymentDataApiStartTimeMs_ = null;

    /** @private @const {string} */
    this.environment_ =
        paymentOptions.environment || Constants.Environment.TEST;

    /** @const @private {string} */
    this.googleTransactionId_ =
        this.createGoogleTransactionId_(this.environment_);

    /** @private @const {?PaymentsClientDelegateInterface} */
    this.webActivityDelegate_ = new PaymentsWebActivityDelegate(
        this.environment_, this.googleTransactionId_, opt_useIframe);

    // TODO: Remove the temporary hack that disable payments
    // request for inline flow.
    /** @private @const {?PaymentsClientDelegateInterface} */
    this.delegate_ = chromeSupportsPaymentRequest() && !opt_useIframe ?
        new PaymentsRequestDelegate(this.environment_) :
        this.webActivityDelegate_;

    this.webActivityDelegate_.onResult(this.onResult_.bind(this));
    this.delegate_.onResult(this.onResult_.bind(this));

    PayFrameHelper.load(this.environment_);
    PayFrameHelper.setGoogleTransactionId(this.googleTransactionId_);

    window.addEventListener(
        'message', event => this.handleMessageEvent_(event));
  }

  /**
   * Check whether the user can make payments using the Payment API.
   *
   * @param {!IsReadyToPayRequest} isReadyToPayRequest
   * @return {!Promise} The promise will contain the boolean result and error
   *     message when possible.
   * @export
   */
  isReadyToPay(isReadyToPayRequest) {
    /** @type {?string} */
    const errorMessage = validateSecureContext() ||
        validateIsReadyToPayRequest(isReadyToPayRequest);
    if (errorMessage) {
      return new Promise((resolve, reject) => {
        PaymentsAsyncClient.logDevErrorToConsole_('isReadyToPay', errorMessage);
        PayFrameHelper.postMessage({
          'eventType': PostMessageEventType.LOG_IS_READY_TO_PAY_API,
          'error': PublicErrorCode.DEVELOPER_ERROR,
        });
        reject({
          'statusCode': Constants.ResponseStatus.DEVELOPER_ERROR,
          'statusMessage': errorMessage
        });
      });
    }
    const startTimeMs = Date.now();
    const webPromise =
        this.webActivityDelegate_.isReadyToPay(isReadyToPayRequest)
            .then(response => {
              PayFrameHelper.postMessage({
                'eventType': PostMessageEventType.LOG_IS_READY_TO_PAY_API,
                'clientLatencyStartMs': startTimeMs,
                'isReadyToPayApiResult': response['result'],
              });
              return response;
            });

    if (chromeSupportsPaymentRequest()) {
      // If the merchant supports only Tokenized cards then just rely on
      // delegate to give us the result.
      // This will need to change once b/78519188 is fixed.
      const nativePromise = this.delegate_.isReadyToPay(
          isReadyToPayRequest);
      if (doesMerchantSupportOnlyTokenizedCards(isReadyToPayRequest)) {
        return nativePromise;
      }
      // Return webIsReadyToPay only if delegateIsReadyToPay has been executed.
      return nativePromise.then(() => webPromise);
    }
    return webPromise;
  }

  /**
   * Prefetch paymentData to speed up loadPaymentData call. Note the provided
   * paymentDataRequest should exactly be the same as provided in
   * loadPaymentData to make the loadPaymentData call fast since current
   * web flow prefetching is based on the full request parameters.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @export
   */
  prefetchPaymentData(paymentDataRequest) {
    /** @type {?string} */
    const errorMessage = validateSecureContext() ||
        validatePaymentDataRequest(paymentDataRequest);
    if (errorMessage) {
      PaymentsAsyncClient.logDevErrorToConsole_(
          'prefetchPaymentData', errorMessage);
      return;
    }
    if (chromeSupportsPaymentRequest()) {
      this.delegate_.prefetchPaymentData(paymentDataRequest);
    } else {
      // For non chrome supports always use the hosting page.
      this.webActivityDelegate_.prefetchPaymentData(paymentDataRequest);
    }
  }

  /**
   * Request PaymentData, which contains necessary infomartion to complete a
   * payment.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @export
   */
  loadPaymentData(paymentDataRequest) {
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_BUTTON_CLICK,
    });
    const errorMessage = validateSecureContext() ||
        validatePaymentDataRequest(paymentDataRequest);
    if (errorMessage) {
      this.onPaymentResponse_(new Promise((resolve, reject) => {
        PayFrameHelper.postMessage({
          'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
          'error': PublicErrorCode.DEVELOPER_ERROR,
        });
        PaymentsAsyncClient.logDevErrorToConsole_(
            'loadPaymentData', errorMessage);
        reject({
          'statusCode': Constants.ResponseStatus.DEVELOPER_ERROR,
          'statusMessage': errorMessage
        });
      }));
      return;
    }

    const paymentRequestUnavailable = window.sessionStorage.getItem(
        Constants.IS_READY_TO_PAY_RESULT_KEY) === 'false';
    this.loadPaymentDataApiStartTimeMs_ = Date.now();
    if (paymentDataRequest.swg || paymentRequestUnavailable) {
      // For SWG and clients where canMakePayment returns false, always use
      // hosting page.
      this.webActivityDelegate_.loadPaymentData(paymentDataRequest);
    } else {
      this.delegate_.loadPaymentData(paymentDataRequest);
    }
  }

  /**
   * Log developer error to console.
   *
   * @param {string} apiName
   * @param {?string} errorMessage
   * @private
   */
  static logDevErrorToConsole_(apiName, errorMessage) {
    console.error('DEVELOPER_ERROR in ' + apiName + ' : ' + errorMessage);
  }

  /**
   * Return a <div> element containing a Google Pay payment button.
   *
   * @param {ButtonOptions=} options
   * @return {!Element}
   * @export
   */
  createButton(options = {}) {
    let button = createButtonHelper(options);
    // Only log if button was created successfully
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_RENDER_BUTTON,
    });
    return button;
  }

  /**
   * @param {!Event} e postMessage event from the AMP page.
   * @private
   */
  handleMessageEvent_(e) {
    if (this.isInTrustedDomain_()) {
      // Only handles the event right now if loaded in trusted domain.
      if (e.data['name'] === 'logPaymentData') {
        PayFrameHelper.postMessage(e.data['data']);
      }
    }
  }

  /**
   * @private
   * @return {boolean}
   */
  isInTrustedDomain_() {
    return TRUSTED_DOMAINS.indexOf(window.location.hostname) != -1;
  }

  /**
   * Called when load payment data result is returned. This triggers the payment
   * response callback passed to the client.
   *
   * @private
   */
  onResult_(response) {
    response
        .then(result => {
          PayFrameHelper.postMessage({
            'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
            'clientLatencyStartMs': this.loadPaymentDataApiStartTimeMs_,
          });
        })
        .catch(result => {
          if (result['errorCode']) {
            PayFrameHelper.postMessage({
              'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
              'error': /** @type {!PublicErrorCode} */ (result['errorCode']),
            });
          } else {
            // If user closes window we don't get a error code
            PayFrameHelper.postMessage({
              'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
              'error': PublicErrorCode.BUYER_CANCEL,
            });
          }
        });
    this.onPaymentResponse_(response);
  }

  /**
   * Returns a google transaction id.
   *
   * @param {string} environment
   * @return {string}
   * @private
   */
  createGoogleTransactionId_(environment) {
    return uuid.uuidFast() + '.' + environment;
  }
}

