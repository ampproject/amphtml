/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
 * @fileoverview Service for recaptcha components
 * interacting with the 3p recaptcha bootstrap iframe
 */

import ampToolboxCacheUrl from
  '../../../third_party/amp-toolbox-cache-url/dist/amp-toolbox-cache-url.esm';

import {Deferred, tryResolve} from '../../../src/utils/promise';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  getDevelopmentBootstrapBaseUrl,
} from '../../../src/3p-frame';
import {getMode} from '../../../src/mode';
import {
  getService,
  registerServiceBuilder,
} from '../../../src/service';
import {
  isProxyOrigin,
} from '../../../src/url';
import {listenFor, postMessage} from '../../../src/iframe-helper';
import {loadPromise} from '../../../src/event-helper';
import {removeElement} from '../../../src/dom';
import {setStyle} from '../../../src/style';
import {urls} from '../../../src/config';

/**
 * @fileoverview
 * Service used by AMP recaptcha elements, to utilize
 * the recaptcha API that is within a bootstrap Iframe.
 *
 * Here are the following iframe messages using .postMessage()
 * used between the iframe and recaptcha service:
 * amp-recaptcha-ready / Service <- Iframe :
 *   Iframe and Recaptcha API are ready.
 * amp-recaptcha-action / Service -> Iframe :
 *   Execute and action using supplied data
 * amp-recaptcha-token / Service <- Iframe :
 *   Response to 'amp-recaptcha-action'. The token
 *   returned by the recaptcha API.
 * amp-recaptcha-error / Service <- Iframe :
 *   Response to 'amp-recaptcha-action'. Error
 *   From attempting to get a token from action.
 */

export class AmpRecaptchaService {

  /**
   * @param {!Window} window
   */
  constructor(window) {

    /** @const @private {!Window} */
    this.win_ = window;

    /** @const @private {!Element} */
    this.body_ = this.win_.document.body;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.iframeLoadPromise_ = null;

    /** @private {number} */
    this.registeredElementCount_ = 0;

    /** @private {!Deferred} */
    this.recaptchaApiReady_ = new Deferred();

    /** @private {Array} */
    this.unlisteners_ = [];

    /** @private {Object} */
    this.executeMap_ = {};
  }

  /**
   * Function to register as a dependant of the AmpRecaptcha serivce.
   * Used to create/destroy recaptcha boostrap iframe.
   * @param {string} sitekey
   * @return {Promise}
   */
  register(sitekey) {
    this.registeredElementCount_++;
    if (!this.iframeLoadPromise_) {
      this.iframeLoadPromise_ = this.initialize_(sitekey);
    }
    return this.iframeLoadPromise_;
  }

  /**
   * Function to unregister as a dependant of the AmpRecaptcha serivce.
   * Used to create/destroy recaptcha boostrap iframe.
   */
  unregister() {
    this.registeredElementCount_--;
    if (this.registeredElementCount_ <= 0) {
      this.dispose_();
    }
  }

  /**
   * Function to call .execute() on the recaptcha API within
   * our iframe, to dispatch recaptcha actions.
   * Takes in an element resource ID, sitekey, and the action to execute.
   * Returns a Promise that resolves the recaptcha token.
   * @param {number} resourceId
   * @param {string} sitekey
   * @param {string} action
   * @return {Promise}
   */
  execute(resourceId, sitekey, action) {
    if (!this.iframe_) {
      return Promise.reject(new Error(
          'An iframe is not created. You must register before executing'
      ));
    }

    const executePromise = new Deferred();
    const messageId = resourceId;
    this.executeMap_[messageId] = {
      resolve: executePromise.resolve,
      reject: executePromise.reject,
    };
    this.recaptchaApiReady_.promise.then(() => {

      const message = dict({
        'id': messageId,
        'sitekey': sitekey,
        'action': 'amp_' + action,
      });

      // Send the message
      postMessage(
          dev().assertElement(this.iframe_),
          'amp-recaptcha-action',
          message,
          '*',
          true);
    });
    return executePromise.promise;
  }

  /**
   * Function to create our recaptcha boostrap iframe.
   * Should be assigned to this.iframeLoadPromise_
   * @param {string} sitekey
   * @private
   */
  initialize_(sitekey) {
    return this.createRecaptchaFrame_(sitekey).then(iframe => {
      this.iframe_ = iframe;

      this.unlisteners_ = [
        this.listenIframe_(
            'amp-recaptcha-ready', () => this.recaptchaApiReady_.resolve()
        ),
        this.listenIframe_(
            'amp-recaptcha-token', this.tokenMessageHandler_.bind(this)
        ),
        this.listenIframe_(
            'amp-recaptcha-error', this.errorMessageHandler_.bind(this)
        ),
      ];
      this.executeMap_ = {};

      this.body_.appendChild(this.iframe_);
      return loadPromise(this.iframe_);
    });
  }

  /**
   * Function to dispose of our bootstrap iframe
   * @private
   */
  dispose_() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.unlisteners_.forEach(unlistener => unlistener());
      this.iframe_ = null;
      this.iframeLoadPromise_ = null;
      this.recaptchaApiReady_ = new Deferred();
      this.unlisteners_ = [];
      this.executeMap_ = {};
    }
  }

  /**
   * Function to create our bootstrap iframe.
   *
   * @param {string} sitekey
   * @return {!Promise<!Element>}
   * @private
   */
  createRecaptchaFrame_(sitekey) {

    const iframe = this.win_.document.createElement('iframe');

    return this.getRecaptchaFrameSrc_().then(recaptchaFrameSrc => {
      iframe.src = recaptchaFrameSrc;
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('data-amp-3p-sentinel', 'amp-recaptcha');
      iframe.setAttribute('name', JSON.stringify(dict({
        'sitekey': sitekey,
        'sentinel': 'amp-recaptcha',
      })));
      iframe.classList.add('i-amphtml-recaptcha-iframe');
      setStyle(iframe, 'border', 'none');
      /** @this {!Element} */
      iframe.onload = function() {
        // Chrome does not reflect the iframe readystate.
        this.readyState = 'complete';
      };

      return iframe;
    });
  }

  /**
   * Function to get our recaptcha iframe src
   *
   * This should take the current URL,
   * either in canonical (www.example.com),
   * or in cache (www-example-com.cdn.ampproject.org),
   * and get the curls subdomain (www-example-com)
   * To then create the iframe src:
   * https://www-example-com.recaptcha.my.cdn/rtv/recaptcha.html
   *
   * @return {!Promise<string>}
   * @private
   */
  getRecaptchaFrameSrc_() {
    if (getMode().localDev || getMode().test) {
      return tryResolve(() => {
        return getDevelopmentBootstrapBaseUrl(this.win_, 'recaptcha');
      });
    }

    // Need to have the curls subdomain match the original document url.
    // This is verified by the recaptcha frame to
    // verify the origin on its messages
    let curlsSubdomainPromise = undefined;
    if (isProxyOrigin(this.win_.location.href)) {
      curlsSubdomainPromise = tryResolve(() => {
        return this.win_.location.hostname.split('.')[0];
      });
    } else {
      curlsSubdomainPromise =
        ampToolboxCacheUrl.createCurlsSubdomain(this.win_.location.href);
    }

    return curlsSubdomainPromise.then(curlsSubdomain => {
      const recaptchaFrameSrc = 'https://' + curlsSubdomain +
        `.recaptcha.${urls.thirdPartyFrameHost}/$internalRuntimeVersion$/` +
        'recaptcha.html';
      return recaptchaFrameSrc;
    });
  }

  /**
   * Function to create a listener for our iframe
   * @param {string} evName
   * @param {Function} cb
   * @return {Function}
   * @private
   */
  listenIframe_(evName, cb) {
    return listenFor(
        dev().assertElement(this.iframe_),
        evName,
        cb,
        true);
  }

  /**
   * Function to handle token messages from the recaptcha iframe
   * @param {Object} data
   */
  tokenMessageHandler_(data) {
    this.executeMap_[data.id].resolve(data.token);
    delete this.executeMap_[data.id];
  }

  /**
   * Function to handle error messages from the recaptcha iframe
   * @param {Object} data
   */
  errorMessageHandler_(data) {
    this.executeMap_[data.id].reject(new Error(data.error));
    delete this.executeMap_[data.id];
  }
}

/**
 * @param {!Window} win
 */
export function installRecaptchaService(win) {
  registerServiceBuilder(win, 'amp-recaptcha', AmpRecaptchaService);
}

/**
 * @param {!Window} win
 * @return {!AmpRecaptchaService}
 */
export function recaptchaServiceFor(win) {
  return getService(win, 'amp-recaptcha');
}

