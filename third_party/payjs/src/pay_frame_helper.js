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
import {PostMessageService} from './post_message_service.js';

/**
 * Supported interactions between iframe and merchant page.
 *
 * @enum {number}
 */
// Next Id: 7
export const PostMessageEventType = {
  IS_READY_TO_PAY: 6,
  LOG_BUTTON_CLICK: 5,
  LOG_IS_READY_TO_PAY_API: 0,
  LOG_LOAD_PAYMENT_DATA_API: 1,
  LOG_RENDER_BUTTON: 2,
  LOG_INLINE_PAYMENT_WIDGET_INITIALIZE: 4,
  LOG_INLINE_PAYMENT_WIDGET_SUBMIT: 3,
};

/**
 * Types of buy flow activity modes.
 *
 * @enum {number}
 */
export const BuyFlowActivityMode = {
  UNKNOWN_MODE: 0,
  IFRAME: 1,
  POPUP: 2,
  REDIRECT: 3,
};

/**
 * Types of buy flow activity modes.
 *
 * @enum {number}
 */
export const PublicErrorCode = {
  UNKNOWN_ERROR_TYPE: 0,
  INTERNAL_ERROR: 1,
  DEVELOPER_ERROR: 2,
  BUYER_ACCOUNT_ERROR: 3,
  MERCHANT_ACCOUNT_ERROR: 4,
  UNSUPPORTED_API_VERSION: 5,
  BUYER_CANCEL: 6,
};

/**
 * Iframe used for logging and prefetching.
 *
 * @type {?Element}
 */
let iframe = null;

/** @type {?PostMessageService} */
let postMessageService = null;

/** @type {?string} */
let environment = null;

/** @type {?BuyFlowActivityMode} */
let buyFlowActivityMode = null;

/** @type {?string} */
let googleTransactionId = null;

/** @type {boolean} */
let iframeLoaded = false;

/** @type {!Array<!Object>} */
let buffer = [];

export class PayFrameHelper {
  /**
   * Creates a hidden iframe for logging and appends it to the top level
   * document.
   *
   * @param {string} env
   */
  static load(env) {
    if (iframe) {
      return;
    }
    environment = env;
    iframe = document.createElement('iframe');
    // Pass in origin because document.referrer inside iframe is empty in
    // certain cases
    iframe.src = PayFrameHelper.getIframeUrl_(window.location.origin);
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    iframe.onload = function() {
      PayFrameHelper.iframeLoaded();
    };
    document.body.appendChild(iframe);
    postMessageService = new PostMessageService(iframe.contentWindow);
  }

  /**
   * Posts a message to the iframe with the given data.
   *
   * @param {!Object} data
   */
  static postMessage(data) {
    if (!iframeLoaded) {
      buffer.push(data);
      return;
    }
    const postMessageData = Object.assign(
        {
          'buyFlowActivityMode': buyFlowActivityMode,
          'googleTransactionId': googleTransactionId,
        },
        data);
    postMessageService.postMessage(
        postMessageData, PayFrameHelper.getIframeOrigin_());
  }

  /**
   *
   * Sets the google transaction id.
   *
   * @param {string} id
   */
  static setGoogleTransactionId(id) {
    googleTransactionId = id;
  }

  /**
   *
   * Sets the activity mode.
   *
   * @param {!BuyFlowActivityMode} mode
   */
  static setBuyFlowActivityMode(mode) {
    buyFlowActivityMode = mode;
  }

  /**
   * Override postMessageService for testing.
   *
   * @param {!PostMessageService} messageService
   */
  static setPostMessageService(messageService) {
    postMessageService = messageService;
  }

  /**
   * Clears the singleton variables.
   */
  static reset() {
    iframe = null;
    buffer.length = 0;
    iframeLoaded = false;
  }

  /**
   * Sets whether the iframe has been loaded or not.
   *
   * @param {boolean} loaded
   */
  static setIframeLoaded(loaded) {
    iframeLoaded = loaded;
  }

  /**
   * Called whenever the iframe is loaded.
   */
  static iframeLoaded() {
    iframeLoaded = true;
    buffer.forEach(function(data) {
      PayFrameHelper.postMessage(data);
    });
  }

  /**
   * Returns the events that have been buffered.
   *
   * @return {!Array<!Object>}
   */
  static getBuffer() {
    return buffer;
  }

  /**
   * Mocks the iframe as an arbitrary html element instead of actually injecting
   * it for testing.
   */
  static injectIframeForTesting() {
    PayFrameHelper.reset();
    iframe = document.createElement('p');
    PayFrameHelper.iframeLoaded();
  }

  /**
   * Returns the payframe origin based on the environment.
   *
   * @return {string}
   * @private
   */
  static getIframeOrigin_() {
    return 'https://pay.' +
        (environment === Constants.Environment.SANDBOX ? 'sandbox.' : '') +
        'google.com';
  }

  /**
   * Returns the payframe URL based on the environment.
   *
   * @param {string} origin The origin that is opening the payframe.
   * @return {string}
   * @private
   */
  static getIframeUrl_(origin) {
    return PayFrameHelper.getIframeOrigin_() + '/gp/p/ui/payframe?origin=' +
        encodeURIComponent(window.location.origin);
  }
}

