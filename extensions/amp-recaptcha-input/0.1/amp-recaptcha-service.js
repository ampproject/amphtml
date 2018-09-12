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

import {Deferred} from '../../../src/utils/promise';
import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getIframe} from '../../../src/3p-frame';
import {getService, registerServiceBuilder} from '../../../src/service';
import {listenFor, postMessage} from '../../../src/iframe-helper';
import {loadPromise} from '../../../src/event-helper';
import {removeElement} from '../../../src/dom';

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

/** @const {string} */
const MESSAGE_TAG = 'amp-recaptcha-';

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
   * @param {!Element} element
   * @return {Promise}
   */
  register(element) {
    this.registeredElementCount_++;
    if (!this.iframeLoadPromise_) {
      this.initialize_(element);
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
          MESSAGE_TAG + 'action',
          message,
          '*',
          true);
    });
    return executePromise.promise;
  }

  /**
   * Function to create our recaptcha boostrap iframe.
   * @param {!Element} element
   * @private
   */
  initialize_(element) {

    /* the third parameter 'recaptcha' ties it to the 3p/recaptcha.js */
    this.iframe_ = getIframe(this.win_, element, 'recaptcha');

    this.unlisteners_ = [
      this.listenIframe_(
          MESSAGE_TAG + 'ready', this.recaptchaApiReady_.resolve
      ),
      this.listenIframe_(
          MESSAGE_TAG + 'token', this.tokenMessageHandler_.bind(this)
      ),
      this.listenIframe_(
          MESSAGE_TAG + 'error', this.errorMessageHandler_.bind(this)
      ),
    ];
    this.executeMap_ = {};

    this.iframe_.classList.add('i-amphtml-recaptcha-iframe');
    this.body_.appendChild(this.iframe_);
    this.iframeLoadPromise_ = loadPromise(this.iframe_);
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

