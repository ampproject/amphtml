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

import {AnimationRunner} from './animation-runner';
import {Services} from '../../../../src/services';
import {
  assertDoesNotContainDisplay,
  px,
  setStyles,
} from '../../../../src/style';
import {dev} from '../../../../src/log';
import {getTotalDuration} from './utils';

const moduleName = 'amp-animation-worklet';
let workletModulePromise;

/**
 */
export class ScrollTimelineWorkletRunner extends AnimationRunner {
  /**
   * @param {!Window} win
   * @param {!Array<!../web-animation-types.InternalWebAnimationRequestDef>} requests
   * @param {!JsonObject} viewportData
   */
  constructor(win, requests, viewportData) {
    super(requests);

    /** @const @private */
    this.win_ = win;

    /** @protected {?Array<!WorkletAnimation>} */
    this.players_ = [];

    /** @private {number} */
    this.startScrollOffset_ = viewportData['start-scroll-offset'];

    /** @private {number} */
    this.endScrollOffset_ = viewportData['end-scroll-offset'];

    /** @private {number} */
    this.initialInViewPercent_ = viewportData['initial-inview-percent'];
  }

  /**
   * @override
   * Initializes the players but does not change the state.
   * @suppress {missingProperties}
   */
  init() {
    const {documentElement} = this.win_.document;
    const viewportService = Services.viewportForDoc(documentElement);
    const scrollSource = viewportService.getScrollingElement();

    const timeRange = getTotalDuration(this.requests_);
    const adjustedTimeRange = (1 - this.initialInViewPercent_) * timeRange;
    const initialElementOffset = this.initialInViewPercent_ * timeRange;

    this.requests_.map(request => {
      // Apply vars.
      if (request.vars) {
        setStyles(request.target, assertDoesNotContainDisplay(request.vars));
      }
      getOrAddWorkletModule(this.win_).then(
        () => {
          const scrollTimeline = new this.win_.ScrollTimeline({
            scrollSource,
            orientation: 'block',
            startScrollOffset: `${px(this.startScrollOffset_)}`,
            endScrollOffset: `${px(this.endScrollOffset_)}`,
            timeRange: adjustedTimeRange,
            fill: 'both',
          });
          const keyframeEffect = new KeyframeEffect(
            request.target,
            request.keyframes,
            request.timing
          );
          const player = new this.win_.WorkletAnimation(
            `${moduleName}`,
            [keyframeEffect],
            scrollTimeline,
            {
              'initial-element-offset': initialElementOffset,
            }
          );
          player.play();
          this.players_.push(player);
        },
        e => {
          dev().error('AMP-ANIMATION', e);
        }
      );
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
  const blob = `registerAnimator('${moduleName}', class {
    constructor(options = {
      'current-element-offset': 0
    }) {
      console/*OK*/.info('Using animationWorklet ScrollTimeline');
      this.initialElementOffset_ = options['initial-element-offset'];
    }
    animate(currentTime, effect) {
      if (currentTime == NaN) {
        return;
      }
      effect.localTime = currentTime + this.initialElementOffset_;
    }
  });
  `;

  workletModulePromise = win.CSS.animationWorklet.addModule(
    URL.createObjectURL(new Blob([blob], {type: 'text/javascript'}))
  );

  return workletModulePromise;
}
