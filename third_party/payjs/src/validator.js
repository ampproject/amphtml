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

/**
 * @return {boolean} true if this version of Chrome supports PaymentRequest.
 */
export function chromeSupportsPaymentRequest() {
  // Opera uses chrome as rendering engine and sends almost the exact same
  // user agent as chrome thereby fooling us on android.
  const isOpera = window.navigator.userAgent.indexOf('OPR/') != -1;
  if (isOpera) {
    return false;
  }
  const androidPlatform = window.navigator.userAgent.match(/Android/i);
  const chromeVersion = window.navigator.userAgent.match(/Chrome\/([0-9]+)\./i);
  return androidPlatform != null && 'PaymentRequest' in window &&
      // Make sure skipping PaymentRequest UI when only one PaymentMethod is
      // supported (starts on Google Chrome 59).
      window.navigator.vendor == 'Google Inc.' && chromeVersion != null &&
      Number(chromeVersion[1]) >= 59;
}

/**
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 *
 * @return {boolean} true if the merchant only supports tokenized cards.
 */
export function doesMerchantSupportOnlyTokenizedCards(isReadyToPayRequest) {
  return isReadyToPayRequest.allowedPaymentMethods.length == 1 &&
      isReadyToPayRequest.allowedPaymentMethods[0] ==
      Constants.PaymentMethod.TOKENIZED_CARD;
}

/**
 * Validate if is secure context. Returns null if context is secure, otherwise
 * return error message.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
 *
 * @return {?string} null if current context is secure, otherwise return error
 * message.
 */
export function validateSecureContext() {
  if (window.location.hostname.endsWith(Constants.TRUSTED_DOMAIN)) {
    // This is for local development.
    return null;
  }
  if (window.isSecureContext === undefined) {
    // Browser not support isSecureContext, figure out a way to validate this
    // for the unsupported browser.
    return null;
  }
  return window.isSecureContext ?
      null :
      'Google Pay APIs should be called in secure context!';
}

/**
 * Validate PaymentOptions.
 *
 * @param {!PaymentOptions} paymentOptions
 */
export function validatePaymentOptions(paymentOptions) {
  if (paymentOptions.environment &&
      !Object.values(Constants.Environment)
           .includes(paymentOptions.environment)) {
    throw new Error(
        'Parameter environment in PaymentOptions can optionally be set to ' +
        'PRODUCTION, otherwise it defaults to TEST.');
  }
}

/**
 * Validate IsReadyToPayRequest.
 *
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 * @return {?string} errorMessage if the request is invalid.
 */
export function validateIsReadyToPayRequest(isReadyToPayRequest) {
  if (!isReadyToPayRequest) {
    return 'isReadyToPayRequest must be set!';
  } else if (
      !isReadyToPayRequest.allowedPaymentMethods ||
      !Array.isArray(isReadyToPayRequest.allowedPaymentMethods) ||
      isReadyToPayRequest.allowedPaymentMethods.length == 0 ||
      !isReadyToPayRequest.allowedPaymentMethods.every(isPaymentMethodValid)) {
    return 'allowedPaymentMethods must be set to an array containing \'CARD\' ' +
        'and/or \'TOKENIZED_CARD\'!';
  }
  return null;
}

/**
 * Validate the payment method.
 *
 * @param {string} paymentMethod
 * @return {boolean} if the current payment method is valid.
 */
export function isPaymentMethodValid(paymentMethod) {
  return Object.values(Constants.PaymentMethod).includes(paymentMethod);
}

/**
 * Validate PaymentDataRequest.
 *
 * @param {!PaymentDataRequest} paymentDataRequest
 * @return {?string} errorMessage if the request is invalid.
 */
export function validatePaymentDataRequest(paymentDataRequest) {
  if (!paymentDataRequest) {
    return 'paymentDataRequest must be set!';
  }
  if (paymentDataRequest.swg) {
    return validatePaymentDataRequestForSwg(paymentDataRequest.swg);
  } else if (!paymentDataRequest.transactionInfo) {
    return 'transactionInfo must be set!';
  } else if (!paymentDataRequest.transactionInfo.currencyCode) {
    return 'currencyCode in transactionInfo must be set!';
  } else if (
      !paymentDataRequest.transactionInfo.totalPriceStatus ||
      !Object.values(Constants.TotalPriceStatus)
           .includes(paymentDataRequest.transactionInfo.totalPriceStatus)) {
    return 'totalPriceStatus in transactionInfo must be set to one of' +
        ' NOT_CURRENTLY_KNOWN, ESTIMATED or FINAL!';
  } else if (
      paymentDataRequest.transactionInfo.totalPriceStatus !==
          'NOT_CURRENTLY_KNOWN' &&
      !paymentDataRequest.transactionInfo.totalPrice) {
    return 'totalPrice in transactionInfo must be set when' +
        ' totalPriceStatus is ESTIMATED or FINAL!';
  }
  return null;
}

/**
 * Validate parameters for swg.
 *
 * @param {?SwgParameters} swgParameters
 * @return {?string} errorMessage if the request is invalid.
 */
function validatePaymentDataRequestForSwg(swgParameters) {
  if (!swgParameters) {
    return 'Swg parameters must be provided';
  }
  if (!swgParameters.skuId || !swgParameters.publicationId) {
    return 'Both skuId and publicationId must be provided';
  }
  return null;
}

