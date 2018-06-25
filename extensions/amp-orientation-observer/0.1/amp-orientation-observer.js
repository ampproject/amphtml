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
import {dashToCamelCase} from '../../../src/string';
import {user} from '../../../src/log';

const TAG = 'amp-orientation-observer';
const DEVICE_REST_ORIENTATION_VALUES = {
  alpha: 180,
  beta: 0,
  gamma: 0,
};

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
    this.alphaValue_ = DEVICE_REST_ORIENTATION_VALUES['alpha'];

    /** @private {number} */
    this.betaValue_ = DEVICE_REST_ORIENTATION_VALUES['beta'];

    /** @private {number} */
    this.gammaValue_ = DEVICE_REST_ORIENTATION_VALUES['gamma'];
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
    user().assert(this.win.DeviceOrientationEvent,
        'The current browser doesn\'t support the ' +
      '`window.DeviceOrientationEvent`');

    for (const range in ['alpha-range', 'beta-range', 'gamma-range']) {
      this.parseAttributes_(range);
    }
    this.win.addEventListener('deviceorientation', event => {
      this.deviceOrientationHandler_(event);
    }, true);
  }

  /**
   * @private {string} range
   */
  parseAttributes_(range) {
    const providedRange = this.element.getAttribute(range);
    if (providedRange) {
      const rangeArray = providedRange.trim().split(' ');
      this[dashToCamelCase(range) + '_'] =
        [parseInt(rangeArray[0], 10), parseInt(rangeArray[1], 10)];
    }
  }

  /**
   * @param {!Event} event
   * @private
   */
  deviceOrientationHandler_(event) {
    if (event instanceof DeviceOrientationEvent) {
      if (event.alpha !== this.alphaValue_) {
        this.alphaValue_ = event.alpha;
        this.triggerEvent_('alpha');
      }
      if (event.beta !== this.betaValue_) {
        this.betaValue_ = event.beta;
        this.triggerEvent_('beta');
      }
      if (event.gamma !== this.gammaValue_) {
        this.gammaValue_ = event.gamma;
        this.triggerEvent_('gamma');
      }
    }
  }

  /**
   * Dispatches the event to signify change in the device orientation
   * along alpha axis.
   * @private {string} eventName
   * @private
   */
  triggerEvent_(eventName) {
    const percentValue = this[eventName + 'Range_'][0] < 0 ?
      (this[eventName + 'Value_'] - this[eventName + 'Range_'][0]) :
      this[eventName + 'Value_'];
    const event = createCustomEvent(this.win, `${TAG}.${eventName}`, {
      angle: this[eventName + 'Value_'],
      percent: percentValue /
        (this[eventName + 'Range_'][1] - this[eventName + 'Range_'][0]),
    });
    this.action_.trigger(this.element, name, event, ActionTrust.LOW);
  }
}
AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpOrientationObserver);
});
