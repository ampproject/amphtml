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

import {getIframe} from '../../../src/3p-frame';
import {getService, registerServiceBuilder} from '../../../src/service';
import {loadPromise} from '../../../src/event-helper';
import {removeElement} from '../../../src/dom';

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
   * Function to create our recaptcha boostrap iframe.
   * @param {!Element} element
   * @private
   */
  initialize_(element) {

    /* the third parameter 'recaptcha' ties it to the 3p/recaptcha.js */
    this.iframe_ = getIframe(this.win_, element, 'recaptcha');

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
      this.iframe_ = null;
      this.iframeLoadPromise_ = null;
    }
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

