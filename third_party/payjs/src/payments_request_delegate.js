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

/**
 * @fileoverview Description of this file.
 */

import {Constants} from './constants.js';
import {PaymentsClientDelegateInterface} from './payments_client_delegate_interface.js';

/**
 * An implementation of PaymentsClientDelegateInterface that leverages payment
 * request.
 * @implements {PaymentsClientDelegateInterface}
 */
export class PaymentsRequestDelegate {
  /**
   * @param {string} environment
   */
  constructor(environment) {
    this.environment_ = environment;

    /** @private {?function(!Promise<!PaymentData>)} */
    this.callback_ = null;
  }

  /** @override */
  onResult(callback) {
    this.callback_ = callback;
  }

  /** @override */
  isReadyToPay(isReadyToPayRequest) {
    /** @type{!PaymentRequest} */
    const paymentRequest = this.createPaymentRequest_(isReadyToPayRequest);
    return new Promise((resolve, reject) => {
      paymentRequest.canMakePayment()
          .then((/** @type {boolean} */ result) => {
            window.sessionStorage.setItem(
                Constants.IS_READY_TO_PAY_RESULT_KEY, result.toString());
            resolve({'result': result});
          })
          .catch(function(err) {
            if (window.sessionStorage.getItem(
                    Constants.IS_READY_TO_PAY_RESULT_KEY)) {
              resolve({
                'result': window.sessionStorage.getItem(
                              Constants.IS_READY_TO_PAY_RESULT_KEY) == 'true'
              });
            } else {
              resolve({'result': false});
            }
          });
    });
  }

  /** @override */
  prefetchPaymentData(paymentDataRequest) {
    // Creating PaymentRequest instance will call
    // Gcore isReadyToPay internally which will prefetch tempaltes.
    this.createPaymentRequest_(
        paymentDataRequest, this.environment_,
        paymentDataRequest.transactionInfo.currencyCode,
        paymentDataRequest.transactionInfo.totalPrice);
  }

  /** @override */
  loadPaymentData(paymentDataRequest) {
    this.loadPaymentDataThroughPaymentRequest_(paymentDataRequest);
  }

  /**
   * Create PaymentRequest instance.
   *
   * @param {!IsReadyToPayRequest|!PaymentDataRequest} request The necessary information to check if user is
   *     ready to pay or to support a payment from merchants.
   * @param {?string=} environment (optional)
   * @param {?string=} currencyCode (optional)
   * @param {?string=} totalPrice (optional)
   * @return {!PaymentRequest} PaymentRequest instance.
   * @private
   */
  createPaymentRequest_(request, environment, currencyCode, totalPrice) {
    let data = {};
    if (request) {
      data = Object.assign({}, request);
    }
    // If its a payment data request delete transaction info otherwise we don't
    // care.
    delete data['transactionInfo'];

    // Only set the apiVersion if the merchant doesn't set it.
    if (!data['apiVersion']) {
      data['apiVersion'] = 1;
    }
    if (environment && environment == Constants.Environment.TEST) {
      data['environment'] = environment;
    }

    const supportedInstruments = [{
      'supportedMethods': ['https://google.com/pay'],
      'data': data,
    }];

    const details = {
      'total': {
        'label': 'Estimated Total Price',
        'amount': {
          // currency and value are required fields in PaymentRequest, but these
          // fields will never be used since PaymentRequest UI is skipped when
          // we're the only payment method, so default to some value to by pass
          // this requirement.
          'currency': currencyCode || 'USD',
          'value': totalPrice || '0',
        }
      }
    };

    return new PaymentRequest(supportedInstruments, details);
  }

  /**
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @private
   */
  loadPaymentDataThroughPaymentRequest_(paymentDataRequest) {
    const paymentRequest = this.createPaymentRequest_(
        paymentDataRequest, this.environment_,
        paymentDataRequest.transactionInfo.currencyCode,
        paymentDataRequest.transactionInfo.totalPrice);
    this.callback_(
        /** @type{!Promise<!PaymentData>} */
        (paymentRequest.show()
             .then(
                 /**
                  * @param {!PaymentResponse} paymentResponse
                  * @return {!PaymentData}
                  */
                 (paymentResponse) => {
                   // Should be called to dismiss any remaining UI
                   paymentResponse.complete('success');
                   return paymentResponse.details;
                 })
             .catch(function(err) {
               err['statusCode'] = Constants.ResponseStatus.CANCELED;
               throw err;
             })));
  }
}

