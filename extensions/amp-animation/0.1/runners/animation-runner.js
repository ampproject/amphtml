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

import {
  WebAnimationPlayState, // eslint-disable-line no-unused-vars
} from '../web-animation-types';

/**
 */
export class AnimationRunner {
  /**
   * @param {!Array<!../web-animation-types.InternalWebAnimationRequestDef>} requests
   */
  constructor(requests) {
    /** @const @protected */
    this.requests_ = requests;
  }

  /**
   * @return {!WebAnimationPlayState}
   */
  getPlayState() {}

  /**
   * @param {function(!WebAnimationPlayState)} unusedHandler
   * @return {!UnlistenDef}
   */
  onPlayStateChanged(unusedHandler) {}

  /**
   * Initializes the players but does not change the state.
   */
  init() {}

  /**
   * Initializes the players if not already initialized,
   * and starts playing the animations.
   */
  start() {}

  /**
   */
  pause() {}

  /**
   */
  resume() {}

  /**
   */
  reverse() {}

  /**
   * @param {time} unusedTime
   */
  seekTo(unusedTime) {}

  /**
   * Seeks to a relative position within the animation timeline given a
   * percentage (0 to 1 number).
   * @param {number} unusedPercent between 0 and 1
   */
  seekToPercent(unusedPercent) {}

  /**
   */
  finish() {}

  /**
   */
  cancel() {}
}
