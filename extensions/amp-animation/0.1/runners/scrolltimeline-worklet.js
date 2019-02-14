/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {BaseAnimationRunner} from './base';
import {Services} from '../../../../src/services';
import {
  assertDoesNotContainDisplay,
  setStyles,
} from '../../../../src/style';
import {dev} from '../../../../src/log';

const moduleName = 'amp-animation-worklet';
let workletModulePromise;

/**
 */
export class ScrollTimelineWorkletRunner extends BaseAnimationRunner {

  /**
   * @param {!Window} win
   * @param {!Array<!InternalWebAnimationRequestDef>} requests
   * @param {?Object=} viewportData
   */
  constructor(win, requests, viewportData) {
    super(requests);

    /** @const @private */
    this.win_ = win;

    /** @protected {?Array<!WorkletAnimation>} */
    this.players_ = [];

    /** @private {number} */
    this.topRatio_ = viewportData['top-ratio'];

    /** @private {number} */
    this.bottomRatio_ = viewportData['bottom-ratio'];

    /** @private {number} */
    this.topMargin_ = viewportData['top-margin'];

    /** @private {number} */
    this.bottomMargin_ =
      viewportData['bottom-margin'];
  }

  /**
  * @override
  * Initializes the players but does not change the state.
   */
  init() {
    this.requests_.map(request => {
      // Apply vars.
      if (request.vars) {
        setStyles(request.target,
            assertDoesNotContainDisplay(request.vars));
      }
      // TODO(nainar): This switches all animations to AnimationWorklet.
      // Limit only to Scroll based animations for now.
      getOrAddWorkletModule(this.win_).then(() => {
        const {documentElement} = this.win_.document;
        const viewportService = Services.viewportForDoc(documentElement);

        const scrollSource = viewportService.getScrollingElement();
        const elementRect = request.target./*OK*/getBoundingClientRect();
        const scrollTimeline = new this.win_.ScrollTimeline({
          scrollSource,
          orientation: 'block',
          timeRange: request.timing.duration,
          startScrollOffset: `${this.topMargin_}px`,
          endScrollOffset: `${this.bottomMargin_}px`,
          fill: request.timing.fill,
        });
        const keyframeEffect = new KeyframeEffect(request.target,
            request.keyframes, request.timing);
        const player = new this.win_.WorkletAnimation(`${moduleName}`,
            [keyframeEffect],
            scrollTimeline, {
              'time-range': request.timing.duration,
              'start-offset': this.topMargin_,
              'end-offset': this.bottomMargin_,
              'top-ratio': this.topRatio_,
              'bottom-ratio': this.bottomRatio_,
              'element-height': elementRect.height,
            });
        player.play();
        this.players_.push(player);
      }, e => {
        dev().error('AMP-ANIMATION', e);
      });
    });
  }

  /**
   * @override
   * Initializes the players if not already initialized,
   * and starts playing the animations.
   */
  start() {
    if (!this.players_) {
      this.init();
    }
  }

  /**
   * @override
   */
  cancel() {
    if (!this.players_) {
      return;
    }
    this.players_.forEach(player => {
      player.cancel();
    });
  }

}

/**
 * @param {!Window} win
 * @private
 */
function getOrAddWorkletModule(win) {
  if (workletModulePromise) {
    return workletModulePromise;
  }
  const blob =
 `registerAnimator('${moduleName}', class {
    constructor(options = {
      'time-range': 0,
      'start-offset': 0,
      'end-offset': 0,
      'top-ratio': 0,
      'bottom-ratio': 0,
      'element-height': 0,
    }) {
      console/*OK*/.info('Using animationWorklet ScrollTimeline');
      this.timeRange = options['time-range'];
      this.startOffset = options['start-offset'];
      this.endOffset = options['end-offset'];
      this.topRatio = options['top-ratio'];
      this.bottomRatio = options['bottom-ratio'];
      this.height = options['element-height'];
    }
    animate(currentTime, effect) {
      if (currentTime == NaN) {
        return;
      }
       // This function mirrors updateVisibility_ in amp-position-observer
      const currentScrollPos =
      ((currentTime / this.timeRange) *
      (this.endOffset - this.startOffset)) +
      this.startOffset;
      const halfViewport = (this.startOffset + this.endOffset) / 2;
      const relativePositionTop = currentScrollPos > halfViewport;
       const ratioToUse = relativePositionTop ?
      this.topRatio : this.bottomRatio;
      const offset = this.height * ratioToUse;
      let isVisible = false;
       if (relativePositionTop) {
        isVisible =
        currentScrollPos + this.height >= (this.startOffset + offset);
      } else {
        isVisible =
        currentScrollPos <= (this.endOffset - offset);
      }
      if (isVisible) {
        effect.localTime = currentTime;
      }
    }
  });
  `;

  workletModulePromise = win.CSS.animationWorklet.addModule(
      URL.createObjectURL(new Blob([blob],
          {type: 'text/javascript'})));

  return workletModulePromise;
}
