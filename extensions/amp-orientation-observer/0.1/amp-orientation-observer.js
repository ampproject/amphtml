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

import {Observable} from '../../../src/observable';
import {Services} from '../../../src/services';
import {throttle} from '../../../src/utils/rate-limit';
import {user} from '../../../src/log';

const TAG = 'amp-orientation-observer';

/** @const */
const MIN_EVENT_INTERVAL_IN_MS = 100;

export class AmpOrientationObserver extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const */
    this.ampdoc_ = Services.ampdoc(this.element);

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {?Observable} */
    this.deviceOrientationObservable_ = null;

    /** @private {Array<number>} */
    this.alphaRange_ = [0, 360];

    /** @private {Array<number>} */
    this.betaRange_ = [-180, 180];

    /** @private {Array<number>} */
    this.gammaRange_ = [-90, 90];

    /** @private {number} */
    this.alphaValue_ = 0;

    /** @private {number} */
    this.betaValue_ = 0;

    /** @private {number} */
    this.gammaValue_ = 0;

    console.log(`${TAG}.${name} created`);

  }

  /** @override */
  buildCallback() {
    // Since this is a functional component and not visual,
    // layoutCallback is meaningless. We delay the heavy work until
    // we become visible.
    this.action_ = Services.actionServiceForDoc(this.element);
    const viewer = Services.viewerForDoc(this.ampdoc_);
    viewer.whenFirstVisible().then(this.init_.bind(this));

    console.log(`${TAG}.${name} buildCallback`);
  }

  /**
   * @private
   */
  init_() {
    this.parseAttributes_();

    user().assert(this.win.DeviceOrientationEvent, 
      'The current browser doesn\'t support the `window.DeviceOrientationEvent`');

    if (!this.deviceOrientationObservable_) {
      this.deviceOrientationObservable_ = new Observable();
      const listener = throttle(this.ampdoc_.win, event => {
        this.deviceOrientationObservable_.fire(event);
      }, MIN_EVENT_INTERVAL_IN_MS);
      this.win.addEventListener('deviceorientation', listener, true);
    }
    return this.deviceOrientationObservable_.add(() => {
      this.deviceOrientationHandler_(event);
    });

    console.log(`${TAG}.${name} init`);
  }

  /**
   * @private
   */
  parseAttributes_() {
    const alphaRange = this.element.getAttribute('alpha-range');
    const betaRange = this.element.getAttribute('beta-range');
    const gammaRange = this.element.getAttribute('gamma-range');
    if (alphaRange) {
      const range = alphaRange.trim().split(' ');
      this.alphaRange_ = [parseInt(range[0]), parseInt(range[1])];
    }
    if (betaRange) {
      const range = betaRange.trim().split(' ');
      this.betaRange_ = [parseInt(range[0]), parseInt(range[1])];
    }
    if (gammaRange) {
      const range = gammaRange.trim().split(' ');
      this.gammaRange_ = [parseInt(range[0]), parseInt(range[1])];
    }
  }

  /**
   * @param element {!Event}
   * @private
   */
  deviceOrientationHandler_(event) {
    if (event instanceof DeviceOrientationEvent) {
      this.alphaPosition_ = event.alpha;
      this.betaPosition_ = event.beta;
      this.gammaPosition_ = event.gamma;
    }
  }

  /**
   * Dispatches the `alpha` event to signify change in the device orientation
   * along alpha axis.
   * @private
   */
  triggerAlpha_() {
    const name = 'alpha';
    const percentValue = this.alphaRange_[0] < 0 ?
      (this.alphaPosition_ - this.alphaRange_[0]) :
      this.alphaPosition_;
    const event = createCustomEvent(this.win, `${TAG}.${name}`, {
      angle: parseFloat(this.alphaPosition_).toFixed(2),
      percent: percentValue / (this.alphaRange_[1] - this.alphaRange_[0])
    });
    this.action_.trigger(this.element, name, event, ActionTrust.LOW);
  }

  /**
   * Dispatches the `beta` event to signify change in the device orientation
   * along beta axis.
   * @private
   */
  triggerBeta_() {
    const name = 'beta';
    const percentValue = this.betaRange_[0] < 0 ?
      (this.betaPosition_ - this.betaRange_[0]) :
      this.betaPosition_;
    const event = createCustomEvent(this.win, `${TAG}.${name}`, {
      angle: parseFloat(this.betaPosition_).toFixed(2),
      percent: percentValue / (this.betaRange_[1] - this.betaRange_[0])
    });
    this.action_.trigger(this.element, name, event, ActionTrust.LOW);
  }

  /**
   * Dispatches the `gamma` event to signify change in the device orientation
   * along gamma axis.
   * @private
   */
  triggerGamma_() {
    const name = 'gamma';
    const percentValue = this.gammaRange_[0] < 0 ?
      (this.gammaPosition_ - this.gammaRange_[0]) :
      this.gammaPosition_;
    const event = createCustomEvent(this.win, `${TAG}.${name}`, {
      angle: parseFloat(this.gammaPosition_).toFixed(2),
      percent: percentValue / (this.gammaRange_[1] - this.gammaRange_[0])
    });
    this.action_.trigger(this.element, name, event, ActionTrust.LOW);
  }

  /**
   * Whether the current browser is Firefox.
   * Firefox does not handle the angles the same way, so on some axes the
   * direction is reversed.
   * @param ua {string}
   * @return {boolean}
   */
  isFirefox(ua) {
    return /Firefox/i.test(ua);
  }

}
AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpOrientationObserver);
});
