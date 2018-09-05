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
import {listenFor} from '../../../src/iframe-helper';
import {removeElement} from '../../../src/dom';

export class AmpRecaptchaService {

  /**
   * @param {!Window} window
   */
  constructor(window) {

    /** @private {!Window} */
    this.win_ = window;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {number} */
    this.registeredElementCount_ = 0;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {!Deferred} */
    this.willBeReady_ = new Deferred();
  }

  /**
   * Function to register as a dependant of the AmpRecaptcha serivce.
   * Used to create/destroy recaptcha boostrap iframe.
   * @param {!AMP.BaseElement} elementImpl
   * @return {Promise}
   */
  register(elementImpl) {
    this.registeredElementCount_++;
    if (!this.iframe_) {
      this.initialize_(elementImpl);
    }
    return elementImpl.loadPromise(this.iframe_);
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
   * @param {!AMP.BaseElement} elementImpl
   * @private
   */
  initialize_(elementImpl) {

    /* the third parameter 'recaptcha' ties it to the 3p/recaptcha.js */
    this.iframe_ = getIframe(this.win_, elementImpl.element, 'recaptcha');

    const listenIframe = (evName, cb) => listenFor(
        dev().assertElement(this.iframe_),
        evName,
        cb,
        true);

    const disposers = [
      listenIframe('ready', this.willBeReady_.resolve),
    ];
    this.unlistenMessage_ = () => disposers.forEach(d => d());

    elementImpl.element.appendChild(this.iframe_);
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

