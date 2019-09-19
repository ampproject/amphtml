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
 * @fileoverview Externs for PaymentsClient.
 * @externs
 */

/**
 * An object-literal namespace
 */
google.payments = {};
google.payments.api = {};

/**
 * The client for interacting with the Google Pay APIs.
 * @constructor
 * @see https://developers.google.com/pay/api/web/client-reference.
 */
google.payments.api.PaymentsClient = function(paymentOptions, opt_useIframe) {};

/**
 * @see https://developers.google.com/pay/api/web/client-reference#isReadyToPay
 */
google.payments.api.PaymentsClient.prototype.isReadyToPay = function() {};

/**
 * @see https://developers.google.com/pay/api/web/client-reference#loadPaymentData
 */
google.payments.api.PaymentsClient.prototype.loadPaymentData = function() {};

/**
 * @see https://developers.google.com/pay/api/web/client-reference#prefetchPaymentData
 */
google.payments.api.PaymentsClient.prototype.prefetchPaymentData =
    function() {};

