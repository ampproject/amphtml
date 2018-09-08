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
import {getIframe} from '../../../src/3p-frame';
import {getService, registerServiceBuilder} from '../../../src/service';
import {listenFor, postMessage} from '../../../src/iframe-helper';
import {loadPromise} from '../../../src/event-helper';
import {removeElement} from '../../../src/dom';

/** @const {string} */
const TAG = 'RECAPTCHA-SERVICE';

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
   * Returns a Promise that resolves the recaptcha token.
   * @param {String} action
   * @return {Promise}
   */
  execute(action) {
    // TODO(torch2424): Find a way to know which message is for which Promise
    // Want to use an ID system, since we don't want a queue, we want to allow all requests to launch at once
    return new Promise((resolve, reject) => {
      if (!this.iframe_) {
        reject(new Error('An iframe is not created. You must register before executing'));
        return;
      }

      this.recaptchaApiReady_.then(() => {

        const message = dict({
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
    });
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
      this.listenIframe_(MESSAGE_TAG + 'ready', this.recaptchaApiReady_.resolve),
      this.listenIframe_(MESSAGE_TAG + 'token', this.tokenMessageHandler.bind(this)),
      this.listenIframe_(MESSAGE_TAG + 'error', this.tokenMessageHandler.bind(this))
    ];

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
    }
  }

  /**
   * Function to create a listener for our iframe
   * @param {String} evName
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
   * @param {Function} callback
   * @param {Object} data
   */
   tokenMessageHandler_(callback, data) {
    callback(data.token);
   }

  /**
   * Function to handle error messages from the recaptcha iframe
   * @param {Function} callback
   * @param {Object} data
   */
  errorMessageHandler_(data) {
    callback(new Error(data.error));
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

