/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {IframeTransport, getIframeTransportScriptUrl} from './iframe-transport';
import {Services} from '../../../src/services';
import {
  assertHttpsUrl,
  checkCorsUrl,
  parseUrlDeprecated,
} from '../../../src/url';
import {createPixel} from '../../../src/pixel';
import {dev, user} from '../../../src/log';
import {getAmpAdResourceId} from '../../../src/ad-helper';
import {getTopWindow} from '../../../src/service';
import {loadPromise} from '../../../src/event-helper';
import {removeElement} from '../../../src/dom';
import {toggle} from '../../../src/style';

/** @const {string} */
const TAG_ = 'amp-analytics/transport';

/**
 * Transport defines the ways how the analytics pings are going to be sent.
 */
export class Transport {

  /**
   * @param {!Window} win
   * @param {!JsonObject} options
   */
  constructor(win, options = /** @type {!JsonObject} */({})) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!JsonObject} */
    this.options_ = options;

    /** @private {string|undefined} */
    this.referrerPolicy_ = /** @type {string|undefined} */ (this.options_['referrerPolicy']);

    // no-referrer is only supported in image transport
    if (this.referrerPolicy_ === 'no-referrer') {
      this.options_['beacon'] = false;
      this.options_['xhrpost'] = false;
    }

    /** @private {?IframeTransport} */
    this.iframeTransport_ = null;
  }

  /**
   * @param {string} request
   */
  sendRequest(request) {
    if (this.options_['iframe']) {
      if (!this.iframeTransport_) {
        dev().error(TAG_, 'iframe transport was inadvertently deleted');
        return;
      }
      this.iframeTransport_.sendRequest(request);
      return;
    }

    assertHttpsUrl(request, 'amp-analytics request');
    checkCorsUrl(request);

    if (this.options_['beacon'] &&
        Transport.sendRequestUsingBeacon(this.win_, request)) {
      return;
    }
    if (this.options_['xhrpost'] &&
        Transport.sendRequestUsingXhr(this.win_, request)) {
      return;
    }
    const image = this.options_['image'];
    if (image) {
      const suppressWarnings = (typeof image == 'object' &&
      image['suppressWarnings']);
      Transport.sendRequestUsingImage(
          this.win_, request, suppressWarnings,
          /** @type {string|undefined} */ (this.referrerPolicy_));
      return;
    }
    user().warn(TAG_, 'Failed to send request', request, this.options_);
  }

  /**
   * amp-analytics will create an iframe for vendors in
   * extensions/amp-analytics/0.1/vendors.js who have transport/iframe defined.
   * This is limited to MRC-accreddited vendors. The frame is removed if the
   * user navigates/swipes away from the page, and is recreated if the user
   * navigates back to the page.
   *
   * @param {!Window} win
   * @param {!Element} element
   * @param {!../../../src/preconnect.Preconnect|undefined} opt_preconnect
   */
  maybeInitIframeTransport(win, element, opt_preconnect) {
    if (!this.options_['iframe'] || this.iframeTransport_) {
      return;
    }
    if (opt_preconnect) {
      opt_preconnect.preload(getIframeTransportScriptUrl(win), 'script');
    }

    const type = element.getAttribute('type');
    const ampAdResourceId = user().assertString(
        getAmpAdResourceId(element, getTopWindow(win)),
        'No friendly amp-ad ancestor element was found ' +
        'for amp-analytics tag with iframe transport.');

    this.iframeTransport_ = new IframeTransport(
        win, type, this.options_, ampAdResourceId);
  }

  /**
   * Deletes iframe transport.
   */
  deleteIframeTransport() {
    if (this.iframeTransport_) {
      this.iframeTransport_.detach();
      this.iframeTransport_ = null;
    }
  }

  /**
   * Sends a ping request using an iframe, that is removed 5 seconds after
   * it is loaded.
   * This is not available as a standard transport, but rather used for
   * specific, whitelisted requests.
   * Note that this is unrelated to the cross-domain iframe use case above in
   * sendRequestUsingCrossDomainIframe()
   * @param {string} request The request URL.
   */
  sendRequestUsingIframe(request) {
    assertHttpsUrl(request, 'amp-analytics request');
    user().assert(
        parseUrlDeprecated(request).origin !=
        parseUrlDeprecated(this.win_.location.href).origin,
        'Origin of iframe request must not be equal to the document origin.' +
        ' See https://github.com/ampproject/' +
        ' amphtml/blob/master/spec/amp-iframe-origin-policy.md for details.');

    /** @const {!Element} */
    const iframe = this.win_.document.createElement('iframe');
    toggle(iframe, false);
    iframe.onload = iframe.onerror = () => {
      Services.timerFor(this.win_).delay(() => {
        removeElement(iframe);
      }, 5000);
    };

    iframe.setAttribute('amp-analytics', '');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.src = request;
    this.win_.document.body.appendChild(iframe);
  }

  /**
   * @param {!Window} win
   * @param {string} request
   * @param {boolean} suppressWarnings
   * @param {string|undefined} referrerPolicy
   */
  static sendRequestUsingImage(win, request, suppressWarnings, referrerPolicy) {
    const image = createPixel(win, request, referrerPolicy);
    loadPromise(image).then(() => {
      dev().fine(TAG_, 'Sent image request', request);
    }).catch(() => {
      if (!suppressWarnings) {
        user().warn(TAG_, 'Response unparseable or failed to send image ' +
            'request', request);
      }
    });
  }

  /**
   * @param {!Window} win
   * @param {string} request
   * @return {boolean} True if this browser supports navigator.sendBeacon.
   */
  static sendRequestUsingBeacon(win, request) {
    if (!win.navigator.sendBeacon) {
      return false;
    }
    const result = win.navigator.sendBeacon(request, '');
    if (result) {
      dev().fine(TAG_, 'Sent beacon request', request);
    }
    return result;
  }

  /**
   * @param {!Window} win
   * @param {string} request
   * @return {boolean} True if this browser supports cross-domain XHR.
   */
  static sendRequestUsingXhr(win, request) {
    if (!win.XMLHttpRequest) {
      return false;
    }
    /** @const {XMLHttpRequest} */
    const xhr = new win.XMLHttpRequest();
    if (!('withCredentials' in xhr)) {
      return false; // Looks like XHR level 1 - CORS is not supported.
    }
    xhr.open('POST', request, true);
    xhr.withCredentials = true;

    // Prevent pre-flight HEAD request.
    xhr.setRequestHeader('Content-Type', 'text/plain');

    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
        dev().fine(TAG_, 'Sent XHR request', request);
      }
    };

    xhr.send('');
    return true;
  }
}
