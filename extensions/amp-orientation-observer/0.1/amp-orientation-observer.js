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

import {ActionTrust} from '../../../src/action-constants';
import {Services} from '../../../src/services';
import {createCustomEvent} from '../../../src/event-helper';
import {user} from '../../../src/log';

const TAG = 'amp-orientation-observer';

export class AmpOrientationObserver extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const */
    this.ampdoc_ = Services.ampdoc(this.element);

    /** @private {?../../../src/service/action-impl.ActionService} */
    this.action_ = null;

    /** @private {Array<number>} */
    this.alphaRange_ = [0, 360];

    /** @private {Array<number>} */
    this.betaRange_ = [-180, 180];

    /** @private {Array<number>} */
    this.gammaRange_ = [-90, 90];

    /** @private {number} */
    this.alphaValue_ = 180; // Set to the neutral resting position

    /** @private {number} */
    this.betaValue_ = 0; // Set to the neutral resting position

    /** @private {number} */
    this.gammaValue_ = 0; // Set to the neutral resting position
  }

  /** @override */
  buildCallback() {
    // Since this is a functional component and not visual,
    // layoutCallback is meaningless. We delay the heavy work until
    // we become visible.
    this.action_ = Services.actionServiceForDoc(this.element);
    const viewer = Services.viewerForDoc(this.ampdoc_);
    viewer.whenFirstVisible().then(this.init_.bind(this));
  }

  /**
   * @private
   */
  init_() {
    this.parseAttributes_();

    user().assert(this.win.DeviceOrientationEvent,
        'The current browser doesn\'t support the ' +
      '`window.DeviceOrientationEvent`');
    this.win.addEventListener('deviceorientation', event => {
      this.deviceOrientationHandler_(event);
    }, true);
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
      this.alphaRange_ = [parseInt(range[0], 2), parseInt(range[1], 2)];
    }
    if (betaRange) {
      const range = betaRange.trim().split(' ');
      this.betaRange_ = [parseInt(range[0], 2), parseInt(range[1], 2)];
    }
    if (gammaRange) {
      const range = gammaRange.trim().split(' ');
      this.gammaRange_ = [parseInt(range[0], 2), parseInt(range[1], 2)];
    }
  }

  /**
   * @param event {!Event}
   * @private
   */
  deviceOrientationHandler_(event) {
    if (event instanceof DeviceOrientationEvent) {
      if (event.alpha !== this.alphaValue_) {
        this.alphaValue_ = event.alpha;
        this.triggerAlpha_();
      }
      if (event.beta !== this.betaValue_) {
        this.betaValue_ = event.beta;
        this.triggerBeta_();
      }
      if (event.gamma !== this.gammaValue_) {
        this.gammaValue_ = event.gamma;
        this.triggerGamma_();
      }
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
      (this.alphaValue_ - this.alphaRange_[0]) :
      this.alphaValue_;
    const event = createCustomEvent(this.win, `${TAG}.${name}`, {
      angle: this.alphaValue_,
      percent: percentValue / (this.alphaRange_[1] - this.alphaRange_[0]),
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
      (this.betaValue_ - this.betaRange_[0]) :
      this.betaValue_;
    const eventValue = {
      angle: this.betaValue_,
      percent: percentValue / (this.betaRange_[1] - this.betaRange_[0]),
    };
    const event = createCustomEvent(this.win, `${TAG}.${name}`, eventValue);
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
      (this.gammaValue_ - this.gammaRange_[0]) :
      this.gammaValue_;
    const event = createCustomEvent(this.win, `${TAG}.${name}`, {
      angle: this.gammaValue_,
      percent: percentValue / (this.gammaRange_[1] - this.gammaRange_[0]),
    });
    this.action_.trigger(this.element, name, event, ActionTrust.LOW);
  }
}
AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpOrientationObserver);
});
