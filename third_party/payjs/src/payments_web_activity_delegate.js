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
import {ActivityPorts, ActivityIframePort} from '../third_party/web_activities/activity-ports.js';
import {BuyFlowActivityMode, PayFrameHelper} from './pay_frame_helper.js';
import {doesMerchantSupportOnlyTokenizedCards} from './validator.js';
import {injectStyleSheet, injectIframe} from './element_injector.js';

const IFRAME_CLOSE_DURATION_IN_MS = 300;
const IFRAME_SHOW_UP_DURATION_IN_MS = 300;
const ERROR_PREFIX = 'Error: ';

/**
 * Supported browser user agent keys.
 *
 * @enum {string}
 */
const BrowserUserAgent = {
  CHROME: 'Chrome',
  FIREFOX: 'Firefox',
  SAFARI: 'Safari',
};


/**
 * Resizing payload including resize height and transition style.
 *
 * @typedef {{
 *   height: string,
 *   transition: string,
 * }}
 */
let ResizePayload;


/**
 * An implementation of PaymentsClientDelegateInterface that uses the custom
 * hosting page along with web activities to actually get to the hosting page.
 * @implements {PaymentsClientDelegateInterface}
 */
export class PaymentsWebActivityDelegate {
  /**
   * @param {string} environment
   * @param {string} googleTransactionId
   * @param {boolean=} opt_useIframe
   */
  constructor(environment, googleTransactionId, opt_useIframe) {
    this.environment_ = environment;
    /** @private @const {boolean} */
    this.useIframe_ = opt_useIframe || false;
    this.activities = new ActivityPorts(window);
    /** @private {?function(!Promise<!PaymentData>)} */
    this.callback_ = null;
    /**
     * @private {?{
     *             container: !Element,
     *             iframe:!HTMLIFrameElement,
     *             request:!PaymentDataRequest,
     *             dataPromise:?Promise<!PaymentData>}}
     */
    this.prefetchedObjects_ = null;
    /** @private {boolean} */
    this.shouldHandleResizing_ = false;
    /** @private {?ActivityIframePort} */
    this.port_ = null;
    /** @private {?function(!Promise<void>)} */
    this.dismissPromiseResolver_ = null;
    /** @const @private {string} */
    this.googleTransactionId_ = googleTransactionId;

    /**
     * @private {?ResizePayload}
     */
    this.savedResizePayload_ = null;

    PayFrameHelper.setGoogleTransactionId(this.googleTransactionId_);

    injectStyleSheet(Constants.IFRAME_STYLE);
  }

  /** @override */
  onResult(callback) {
    if (this.callback_) {
      return;
    }
    this.callback_ = callback;
    this.activities.onResult('request1', (port) => {
      // Only verified origins are allowed.
      callback(port.acceptResult().then(
          (result) => {
            const data = /** @type {!PaymentData} */ (result.data);
            if (data['redirectEncryptedCallbackData']) {
              PayFrameHelper.setBuyFlowActivityMode(
                  BuyFlowActivityMode.REDIRECT);
              return fetch(this.getDecryptionUrl_(), {
                       method: 'post',
                       credentials: 'include',
                       mode: 'cors',
                       body: data['redirectEncryptedCallbackData'],
                     })
                  .then((response) => {
                    return response.json();
                  });
            }
            return data;
          },
          (error) => {
            // TODO: Log the original and the inferred error to eye3.
            let originalError = error['message'];
            let inferredError = error['message'];
            try {
              // Try to parse the error message to a structured error, if it's
              // not possible, fallback to use the error message string.
              inferredError =
                  JSON.parse(originalError.substring(ERROR_PREFIX.length));
            } catch (e) {
            }
            if (inferredError['statusCode'] && [
                  'DEVELOPER_ERROR', 'MERCHANT_ACCOUNT_ERROR'
                ].indexOf(inferredError['statusCode']) == -1) {
              inferredError = {
                'statusCode': 'CANCELED',
              };
            }
            if (inferredError == 'AbortError') {
              inferredError = {
                'statusCode': 'CANCELED',
              };
            }
            console.log(
                'Google Pay request failed, error:\n' +
                JSON.stringify(inferredError));
            return Promise.reject(inferredError);
          }));
    });
  }

  /** @override */
  isReadyToPay(isReadyToPayRequest) {
    return new Promise((resolve, reject) => {
      if (doesMerchantSupportOnlyTokenizedCards(isReadyToPayRequest)) {
        resolve({'result': false});
        return;
      }
      const userAgent = window.navigator.userAgent;
      const isIosGsa = userAgent.indexOf('GSA/') > 0 &&
          userAgent.indexOf(BrowserUserAgent.SAFARI) > 0;
      if (isIosGsa) {
        resolve({'result': false});
        return;
      }
      const isFirefoxIos = userAgent.indexOf('FxiOS') > 0;
      if (isFirefoxIos) {
        resolve({'result': false});
        return;
      }
      const isEdge = userAgent.indexOf('Edge/') > 0;
      if (isEdge) {
        resolve({'result': false});
        return;
      }
      const isSupported = userAgent.indexOf(BrowserUserAgent.CHROME) > 0 ||
          userAgent.indexOf(BrowserUserAgent.FIREFOX) > 0 ||
          userAgent.indexOf(BrowserUserAgent.SAFARI) > 0;
      resolve({'result': isSupported});
    });
  }

  /** @override */
  prefetchPaymentData(paymentDataRequest) {
    // Only handles prefetch for iframe for now.
    if (!this.useIframe_) {
      return;
    }
    const containerAndFrame = this.injectIframe_();
    const paymentDataPromise = this.openIframe_(
        containerAndFrame['container'], containerAndFrame['iframe'],
        paymentDataRequest);
    this.prefetchedObjects_ = {
      'container': containerAndFrame['container'],
      'iframe': containerAndFrame['iframe'],
      'request': paymentDataRequest,
      'dataPromise': paymentDataPromise,
    };
  }

  /** @override */
  loadPaymentData(paymentDataRequest) {
    const internalParam = {
      'startTimeMs': Date.now(),
      'googleTransactionId': this.googleTransactionId_,
    };
    paymentDataRequest['i'] = paymentDataRequest['i'] ?
        Object.assign(internalParam, paymentDataRequest['i']) :
        internalParam;
    if (!paymentDataRequest.swg) {
      // Only set the apiVersion if the merchant is not setting it.
      if (!paymentDataRequest.apiVersion) {
        paymentDataRequest.apiVersion = 1;
      }
    }
    paymentDataRequest.environment = this.environment_;
    if (this.useIframe_) {
      PayFrameHelper.setBuyFlowActivityMode(BuyFlowActivityMode.IFRAME);
      // TODO: Compare the request with prefetched request.
      // goog.object.equals won't work as it doesn't do deep comparison.
      let containerAndFrame;
      let paymentDataPromise;
      if (this.prefetchedObjects_) {
        // Rendering prefetched frame and container.
        containerAndFrame = this.prefetchedObjects_;
        paymentDataPromise = this.prefetchedObjects_['dataPromise'];
        this.prefetchedObjects_ = null;
      } else {
        containerAndFrame = this.injectIframe_();
        paymentDataPromise = this.openIframe_(
            containerAndFrame['container'], containerAndFrame['iframe'],
            paymentDataRequest);
      }
      this.showContainerAndIframeWithAnimation_(
          containerAndFrame['container'], containerAndFrame['iframe']);
      const dismissPromise = new Promise(resolve => {
        this.dismissPromiseResolver_ = resolve;
      });
      this.callback_(Promise.race([paymentDataPromise, dismissPromise]));
      return;
    }
    PayFrameHelper.setBuyFlowActivityMode(
        paymentDataRequest['forceRedirect'] ? BuyFlowActivityMode.REDIRECT :
                                              BuyFlowActivityMode.POPUP);
    this.activities.open(
        'request1', this.getHostingPageUrl_(),
        this.getRenderMode_(paymentDataRequest), paymentDataRequest,
        {'width': 600, 'height': 600});
  }


  /**
   * Returns the render mode whether need to force redirect.
   *
   * @param {!PaymentDataRequest} paymentDataRequest
   * @return {string}
   * @private
   */
  getRenderMode_(paymentDataRequest) {
    return paymentDataRequest['forceRedirect'] ? '_top' : 'gp-js-popup';
  }

  /**
   * Returns the base path based on the environment.
   *
   * @private
   * @return {string} The base path
   */
  getBasePath_() {
    var baseDomain;
    if (this.environment_ == Constants.Environment.SANDBOX) {
      baseDomain = 'https://pay.sandbox.google.com';
    } else {
      baseDomain = 'https://pay.google.com';
    }
    return baseDomain + "/gp/p";
  }

  /**
   * Returns the decryption url to be used to decrypt the encrypted payload.
   *
   * @private
   * @return {string} The decryption url
   */
  getDecryptionUrl_() {
    return this.getBasePath_() + '/apis/buyflow/process';
  }

  /**
   * Returns the hosting page url.
   *
   * @private
   * @return {string} The hosting page url
   */
  getHostingPageUrl_() {
    return this.getBasePath_() + '/ui/pay';
  }

  /**
   * Returns the iframe pwg url to be used to be used for amp.
   *
   * @param {string} environment
   * @param {string} origin
   * @return {string} The iframe url
   */
  getIframeUrl(environment, origin) {
    // TODO: These should be compile time constants and not dependent
    // on the environment.
    let iframeUrl = `https://pay.google.com/gp/p/ui/pay?origin=${origin}`;
    if (environment == Constants.Environment.SANDBOX) {
      iframeUrl = `https://pay.sandbox.google.com/gp/p/ui/pay?origin=${origin}`;
    }
    return iframeUrl;
  }

  /**
   * Close iframe with animation.
   *
   * @param {!Element} container
   * @param {!HTMLIFrameElement} iframe
   * @private
   */
  removeIframeAndContainer_(container, iframe) {
    const transitionStyle = 'all ' + IFRAME_CLOSE_DURATION_IN_MS + 'ms ease 0s';
    this.setTransition_(iframe, transitionStyle);
    iframe.height = '0px';
    // TODO: This should be replaced by listening to TransitionEnd event
    setTimeout(() => {
      container.parentNode.removeChild(container);
    }, IFRAME_CLOSE_DURATION_IN_MS);
  }

  /**
   * @return {{container: !Element, iframe:!HTMLIFrameElement}}
   * @private
   */
  injectIframe_() {
    const containerAndFrame = injectIframe();
    const iframe = containerAndFrame['iframe'];
    const container = containerAndFrame['container'];
    container.addEventListener(
        'click', this.dismissIframe_.bind(this, containerAndFrame));
    // Hide iframe and disable resize at initialize.
    container.style.display = 'none';
    iframe.style.display = 'none';
    iframe.height = '0px';
    const transitionStyle =
        'all ' + IFRAME_SHOW_UP_DURATION_IN_MS + 'ms ease 0s';
    this.setTransition_(iframe, transitionStyle);
    this.shouldHandleResizing_ = false;
    return containerAndFrame;
  }

  /**
   * @param {{container: !Element, iframe:!HTMLIFrameElement}} containerAndFrame
   * @private
   */
  dismissIframe_(containerAndFrame) {
    // TODO: Think about whether this could be just hide instead of
    // disconnect and remove, the tricky part is how to handle the case where
    // payment data request is not the same.
    this.dismissPromiseResolver_(
        Promise.reject({'errorCode': 'CANCELED'}));
    this.removeIframeAndContainer_(
        containerAndFrame['container'], containerAndFrame['iframe']);
    this.port_.disconnect();
  }

  /**
   * @param {!Element} container
   * @param {!HTMLIFrameElement} iframe
   * @private
   */
  showContainerAndIframeWithAnimation_(container, iframe) {
    container.style.display = 'block';
    iframe.style.display = 'block';
    setTimeout(() => {
      // Hard code the apprx height here, it will be resize to expected height
      // later.
      iframe.height = '260px';
      // TODO: This should be handles properly by listening to
      // TransitionEnd event.
      setTimeout(() => {
        this.shouldHandleResizing_ = true;
        // TODO: Add browser test that catches this.
        if (this.savedResizePayload_) {
          this.setTransition_(iframe, this.savedResizePayload_['transition']);
          iframe.height = this.savedResizePayload_['height'];
          this.savedResizePayload_ = null;
        }
      }, IFRAME_SHOW_UP_DURATION_IN_MS);
    }, 1);
  }

  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {string} transitionStyle
   * @private
   */
  setTransition_(iframe, transitionStyle) {
    iframe.style.setProperty('transition', transitionStyle);
    // For safari.
    iframe.style.setProperty('-webkit-transition', transitionStyle);
  }

  /**
   * Use WebActivitiy to open iframe that's in given container.
   *
   * @param {!Element} container
   * @param {!HTMLIFrameElement} iframe
   * @param {!PaymentDataRequest} paymentDataRequest
   * @return {!Promise<!PaymentData>}
   * @private
   */
  openIframe_(container, iframe, paymentDataRequest) {
    if (!paymentDataRequest.swg) {
      if (!paymentDataRequest.apiVersion) {
        paymentDataRequest.apiVersion = 1;
      }
      paymentDataRequest.allowedPaymentMethods = [Constants.PaymentMethod.CARD];
    }
    paymentDataRequest.environment = this.environment_;
    const trustedUrl =
        this.getIframeUrl(this.environment_, window.location.origin);
    return this.activities.openIframe(iframe, trustedUrl, paymentDataRequest)
        .then(port => {
          // Handle custom resize message.
          this.port_ = port;
          port.onMessage(payload => {
            if (payload['type'] !== 'resize' || !this.shouldHandleResizing_) {
              // Save the resize event later after initial animation is finished
              this.savedResizePayload_ = {
                'height': payload['height'],
                'transition': payload['transition']
              };
              return;
            }
            this.setTransition_(iframe, payload['transition']);
            iframe.height = payload['height'];
          });
          return /** @type {!Promise<!Object>} */ (port.acceptResult());
        })
        .then(
            /**
             * @param {!Object} result
             * @return {!PaymentData}
             */
            result => {
              this.removeIframeAndContainer_(container, iframe);
              const data = /** @type {!PaymentData} */ (result['data']);
              return data;
            },
            error => {
              this.removeIframeAndContainer_(container, iframe);
              return Promise.reject(error);
            });
  }
}

