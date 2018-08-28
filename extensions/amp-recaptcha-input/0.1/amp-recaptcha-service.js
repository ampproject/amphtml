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
import {listenFor, postMessage} from '../../../src/iframe-helper';
import {loadPromise} from '../../../src/event-helper';

class AmpRecaptchaService {
  constructor() {
    
    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @const @private {!Array} */
    this.registeredElements = [];

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {!Deferred} */
    this.willBeReady_ = new Deferred();
  }
  
  /**
   * Function to register as a dependant of the AmpRecaptcha serivce.
   * Used to create/destroy recaptcha boostrap iframe.
   * @param {!AmpElement} element
   * @param {!Window} win
   */
  register(element, win) {
    this.registeredElement.push(element);
    if (!this.iframe_) {
      this.initialize_(element, win);
    }
  }

  /**
   * Function to unregister as a dependant of the AmpRecaptcha serivce.
   * Used to create/destroy recaptcha boostrap iframe.
   * @param {!AmpElement} element
   */
  unregister(element) {
    this.registeredElements.splice(
      this.registeredElements.indexOf(element),
      1
    );

    if (this.registeredElements.length <= 0) {
      this.dispose_();
    }
  }
  
  /**
   * Function to execute actions on the recaptcha bootstrap iframe
   * @param {!String} sitekey
   * @param {!String} action
   * @return {Promise}
   */
  execute(sitekey, action) {
    
  }
  
  /**
   * Function to create and load our recaptcha boostrap iframe.
   * @param {!AmpElement} element
   * @param {!Window} win
   * @return {Promise}
   * @private
   */
  initialize_(element, win) {

    /* the third parameter 'recaptcha' ties it to the 3p/recaptcha.js */
    this.iframe_ = getIframe(win, element, 'recaptcha');

    const listenIframe = (evName, cb) => listenFor(
      dev().assertElement(this.iframe_),
      evName,
      cb,
      true);

    const disposers = [
      listenIframe('ready', this.willBeReady_.resolve),
      listenIframe('token', this.handleTokenMessage_),
      listenIframe('error', this.handleErrorMessage_),
    ];
    this.unlistenMessage_ = () => disposers.forEach(d => d());

    element.appendChild(this.iframe_);
    return loadPromise(this.iframe_);
  }

  /**
   * Function to dispose of our bootstrap iframe
   * @private
   */
  dispose_() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;

      this.willBeReady_ = new Deferred();
    }

    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }
  }

  /**
   * Wraps postMessage for testing
   *
   * @param {string} type
   * @param {!JsonObject} message
   * @private
   */
  postMessage_(type, message) {
    postMessage(
      dev().assertElement(this.iframe_),
      type,
      message,
      '*',
      true);
  }

  /**
   * Function to handle token messages from the recaptcha bootstrap iframe.
   * @param {!Object} message
   */
  handleTokenMessage_(message) {
    // TODO: test this
    console.log(message);
  }

  /**
   * Function to handle token messages from the recaptcha bootstrap iframe.
   * @param {!Object} message
   */
  handleErrorMessage_(message) {
    // TODO: test this
    console.log(message);
  }
}

// Export a singleton.
export const AmpRecaptcha = new AmpRecaptchaService();
