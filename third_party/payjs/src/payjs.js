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

import {PaymentsAsyncClient} from './payjs_async.js';

/**
 * The client for interacting with the Google Pay APIs.
 * @final
 */
export class PaymentsClient {
  /**
   * @param {PaymentOptions=} paymentOptions
   * @param {boolean=} opt_useIframe
   */
  constructor(paymentOptions = {}, opt_useIframe) {
    /** @private @const {!PaymentsAsyncClient} */
    this.asyncClient_ = new PaymentsAsyncClient(
        paymentOptions, this.payComplete_.bind(this), opt_useIframe);

    /** @private {?function(!Promise<!PaymentData>)} */
    this.pending_ = null;
  }

  /**
   * @param {!Promise<!PaymentData>} response
   * @private
   */
  payComplete_(response) {
    this.pending_(response);
  }

  /**
   * Check whether the user can make payments using the Pay API.
   *
   * @param {!IsReadyToPayRequest} isReadyToPayRequest
   * @return {!Promise} The promise will contain the boolean result and error
   *     message when possible.
   * @export
   */
  isReadyToPay(isReadyToPayRequest) {
    return this.asyncClient_.isReadyToPay(isReadyToPayRequest);
  }

  /**
   * Prefetch paymentData to speed up loadPaymentData call. Note the provided
   * paymentDataRequest should exactly be the same as provided in
   * loadPaymentData to make the loadPaymentData call fast.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @export
   */
  prefetchPaymentData(paymentDataRequest) {
    this.asyncClient_.prefetchPaymentData(paymentDataRequest);
  }

  /**
   * Request PaymentData, which contains necessary infomartion to complete a
   * payment.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @return {!Promise<!PaymentData>}
   * @export
   */
  loadPaymentData(paymentDataRequest) {
    /** @type {!Promise<!PaymentData>} */
    const promise = new Promise(resolve => {
      if (this.pending_) {
        throw new Error('This method can only be called one at a time.');
      }
      this.pending_ = resolve;
      this.asyncClient_.loadPaymentData(paymentDataRequest);
    });

    return promise.then(
        (result) => {
          this.pending_ = null;
          return result;
        },
        error => {
          this.pending_ = null;
          throw error;
        });
  }

  /**
   * Return a <div> element containing Google Pay payment button.
   *
   * @param {ButtonOptions=} options
   * @return {!Element}
   * @export
   */
  createButton(options={}) {
    return this.asyncClient_.createButton(options);
  }
}

