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
import {clamp, sum} from '../../../src/utils/math';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {userAssert} from '../../../src/log';

const TAG = 'amp-orientation-observer';
const DEFAULT_REST_ALPHA = 180;
const DEFAULT_REST_BETA = 0;
const DEFAULT_REST_GAMMA = 0;
const DELTA_CONST = 0.1;
const DEFAULT_SMOOTHING_PTS = 4;

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
    this.alphaValue_ = DEFAULT_REST_ALPHA;

    /** @private {number} */
    this.betaValue_ = DEFAULT_REST_BETA;

    /** @private {number} */
    this.gammaValue_ = DEFAULT_REST_GAMMA;

    /** @private {number} */
    this.restAlphaValue_ = DEFAULT_REST_ALPHA;

    /** @private {number} */
    this.restBetaValue_ = DEFAULT_REST_BETA;

    /** @private {number} */
    this.restGammaValue_ = DEFAULT_REST_GAMMA;

    /** @private {Array} */
    this.alphaSmoothingPoints_ = [];

    /** @private {Array} */
    this.betaSmoothingPoints_ = [];

    /** @private {Array} */
    this.gammaSmoothingPoints_ = [];

    /** @private {?number} */
    this.smoothing_ = this.element.hasAttribute('smoothing')
      ? Number(this.element.getAttribute('smoothing')) || DEFAULT_SMOOTHING_PTS
      : null;
  }

  /** @override */
  buildCallback() {
    // Since this is a functional component and not visual,
    // layoutCallback is meaningless. We delay the heavy work until
    // we become visible.
    this.action_ = Services.actionServiceForDoc(this.element);
    this.ampdoc_.whenFirstVisible().then(this.init_.bind(this));
  }

  /**
   * @private
   */
  init_() {
    userAssert(
      this.win.DeviceOrientationEvent,
      "The current browser doesn't support the " +
        '`window.DeviceOrientationEvent`'
    );

    this.alphaRange_ = this.parseAttributes_('alpha-range', this.alphaRange_);
    this.betaRange_ = this.parseAttributes_('beta-range', this.betaRange_);
    this.gammaRange_ = this.parseAttributes_('gamma-range', this.gammaRange_);
    this.win.addEventListener(
      'deviceorientation',
      event => {
        this.deviceOrientationHandler_(event);
      },
      true
    );
  }

  /**
   * Parses the provided ranges
   * @param {string} rangeName
   * @param {Array} originalRange
   * @return {?Array<number>}
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
      const {screen} = this.win;

      const {alpha} = event;
      let {gamma, beta} = event;

      // Detect the implementation of orientation angle
      const angle =
        'orientation' in screen ? screen.orientation.angle : screen.orientation;

      // Reverse gamma/beta if the device is in landscape
      if (this.win.orientation == 90 || this.win.orientation == -90) {
        const tmp = gamma;
        gamma = beta;
        beta = tmp;
      }

      // Flip signs of the angles if the phone is in 'reverse landscape' or
      // 'reverse portrait'
      if (angle < 0) {
        gamma = -gamma;
        beta = -beta;
      }

      if (Math.abs(alpha - this.alphaValue_) > DELTA_CONST) {
        if (this.smoothing_) {
          this.alphaValue_ = this.smoothedAlphaValue_(
            /** @type {number} */ (alpha)
          );
        } else {
          this.alphaValue_ = /** @type {number} */ (alpha);
        }
        this.triggerEvent_('alpha', this.alphaValue_, this.alphaRange_);
      }
      if (Math.abs(beta - this.betaValue_) > DELTA_CONST) {
        if (this.smoothing_) {
          this.betaValue_ = this.smoothedBetaValue_(
            /** @type {number} */ (beta)
          );
        } else {
          this.betaValue_ = /** @type {number} */ (beta);
        }
        this.triggerEvent_('beta', this.betaValue_, this.betaRange_);
      }
      if (Math.abs(gamma - this.gammaValue_) > DELTA_CONST) {
        if (this.smoothing_) {
          this.gammaValue_ = this.smoothedGammaValue_(
            /** @type {number} */ (gamma)
          );
        } else {
          this.gammaValue_ = /** @type {number} */ (gamma);
        }
        this.triggerEvent_('gamma', this.gammaValue_, this.gammaRange_);
      }
    }
  }

  /**
   * Calculates a moving average over previous values of the alpha value
   * @param {number} alpha
   * @return {number}
   */
  smoothedAlphaValue_(alpha) {
    if (this.alphaSmoothingPoints_.length > this.smoothing_) {
      this.alphaSmoothingPoints_.shift();
    }
    this.alphaSmoothingPoints_.push(alpha);
    const avgAlpha = sum(this.alphaSmoothingPoints_) / this.smoothing_;
    if (
      this.alphaSmoothingPoints_.length > this.smoothing_ &&
      this.restAlphaValue_ == DEFAULT_REST_ALPHA
    ) {
      this.restAlphaValue_ = avgAlpha;
    }
    return avgAlpha - this.restAlphaValue_;
  }

  /**
   * Calculates a moving average over previous values of the beta value
   * @param {number} beta
   * @return {number}
   */
  smoothedBetaValue_(beta) {
    if (this.betaSmoothingPoints_.length > this.smoothing_) {
      this.betaSmoothingPoints_.shift();
    }
    this.betaSmoothingPoints_.push(beta);
    const avgBeta = sum(this.betaSmoothingPoints_) / this.smoothing_;
    if (
      this.betaSmoothingPoints_.length > this.smoothing_ &&
      this.restBetaValue_ == DEFAULT_REST_BETA
    ) {
      this.restBetaValue_ = avgBeta;
    }
    return avgBeta - this.restBetaValue_;
  }

  /**
   * Calculates a moving average over previous values of the gamma value
   * @param {number} gamma
   * @return {number}
   */
  smoothedGammaValue_(gamma) {
    if (this.gammaSmoothingPoints_.length > this.smoothing_) {
      this.gammaSmoothingPoints_.shift();
    }
    this.gammaSmoothingPoints_.push(gamma);
    const avgGamma = sum(this.betaSmoothingPoints_) / this.smoothing_;
    if (
      this.gammaSmoothingPoints_.length > this.smoothing_ &&
      this.restGammaValue_ == DEFAULT_REST_BETA
    ) {
      this.restGammaValue_ = avgGamma;
    }
    return avgGamma - this.restGammaValue_;
  }

  /**
   * Dispatches the event to signify change in the device orientation
   * along a certain axis.
   * @param {string} eventName
   * @param {number} eventValue
   * @param {Array} eventRange
   * @private
   */
  triggerEvent_(eventName, eventValue, eventRange) {
    const percentValue =
      eventRange[0] < 0
        ? eventValue.toFixed() - eventRange[0]
        : eventValue.toFixed();
    const event = createCustomEvent(
      this.win,
      `${TAG}.${eventName}`,
      dict({
        'angle': clamp(eventValue, eventRange[0], eventRange[1]).toFixed(),
        'percent': percentValue / (eventRange[1] - eventRange[0]),
      })
    );
    this.action_.trigger(this.element, eventName, event, ActionTrust.LOW);
  }
}
AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpOrientationObserver);
});
