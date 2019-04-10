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
import {dict} from '../../../src/utils/object';
import {userAssert} from '../../../src/log';

const TAG = 'amp-orientation-observer';
const DEVICE_REST_ORIENTATION_ALPHA_VALUE = 180;
const DEVICE_REST_ORIENTATION_BETA_VALUE = 0;
const DEVICE_REST_ORIENTATION_GAMMA_VALUE = 0;
const DELTA_CONST = 0.1;

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
    this.alphaValue_ = DEVICE_REST_ORIENTATION_ALPHA_VALUE;

    /** @private {number} */
    this.betaValue_ = DEVICE_REST_ORIENTATION_BETA_VALUE;

    /** @private {number} */
    this.gammaValue_ = DEVICE_REST_ORIENTATION_GAMMA_VALUE;
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
    userAssert(this.win.DeviceOrientationEvent,
        'The current browser doesn\'t support the ' +
      '`window.DeviceOrientationEvent`');

    this.alphaRange_ = this.parseAttributes_('alpha-range', this.alphaRange_);
    this.betaRange_ = this.parseAttributes_('beta-range', this.betaRange_);
    this.gammaRange_ = this.parseAttributes_('gamma-range', this.gammaRange_);
    this.win.addEventListener('deviceorientation', event => {
      this.deviceOrientationHandler_(event);
    }, true);
  }

  /**
   * Parses the provided ranges
   * @param {string} rangeName
   * @param {Array} originalRange
   * @private
   */
  parseAttributes_(rangeName, originalRange) {
    const providedRange = this.element.getAttribute(rangeName);
    if (providedRange) {
      const rangeArray = providedRange.trim().split(' ');
      return [parseInt(rangeArray[0], 10), parseInt(rangeArray[1], 10)];
    }
    return originalRange;
  }

  /**
   * @param {!Event} event
   * @private
   */
  deviceOrientationHandler_(event) {
    if (event instanceof DeviceOrientationEvent) {
      if (Math.abs(event.alpha - this.alphaValue_) > DELTA_CONST) {
        this.alphaValue_ = /** @type {number} */ (event.alpha);
        this.triggerEvent_('alpha', this.alphaValue_, this.alphaRange_);
      }
      if (Math.abs(event.beta - this.betaValue_) > DELTA_CONST) {
        this.betaValue_ = /** @type {number} */ (event.beta);
        this.triggerEvent_('beta', this.betaValue_, this.betaRange_);
      }
      if (Math.abs(event.gamma - this.gammaValue_) > DELTA_CONST) {
        this.gammaValue_ = /** @type {number} */ (event.gamma);
        this.triggerEvent_('gamma', this.gammaValue_, this.gammaRange_);
      }
    }
  }

  /**
   * Dispatches the event to signify change in the device orientation
   * along alpha axis.
   * @param {string} eventName
   * @param {?number} eventValue
   * @param {Array} eventRange
   * @private
   */
  triggerEvent_(eventName, eventValue, eventRange) {
    const percentValue = eventRange[0] < 0 ?
      (eventValue.toFixed() - eventRange[0]) :
      eventValue.toFixed();
    const event = createCustomEvent(this.win, `${TAG}.${eventName}`, dict({
      'angle': eventValue.toFixed(),
      'percent': percentValue /
        (eventRange[1] - eventRange[0]),
    }));
    this.action_.trigger(this.element, eventName, event, ActionTrust.LOW);
  }
}
AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpOrientationObserver);
});
