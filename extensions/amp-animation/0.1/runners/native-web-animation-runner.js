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
import {Observable} from '../../../../src/observable';
import {
  WebAnimationDef,
  WebAnimationPlayState,
  WebAnimationSelectorDef,
  WebAnimationSubtargetDef,
  WebAnimationTimingDef,
  WebCompAnimationDef,
  WebKeyframeAnimationDef,
  WebKeyframesDef,
  WebMultiAnimationDef,
  WebSwitchAnimationDef,
} from '../web-animation-types';
import {
  assertDoesNotContainDisplay,
  setStyles,
} from '../../../../src/style';
import {devAssert} from '../../../../src/log';
import {getTotalDuration} from './utils';

/**
 */
export class NativeWebAnimationRunner extends AnimationRunner {

  /**
   * @param {!Array<!../web-animation-types.InternalWebAnimationRequestDef>} requests
   */
  constructor(requests) {
    super(requests);

    /** @protected {?Array<!Animation>} */
    this.players_ = null;

    /** @private {number} */
    this.runningCount_ = 0;

    /** @private {!WebAnimationPlayState} */
    this.playState_ = WebAnimationPlayState.IDLE;

    /** @private {!Observable} */
    this.playStateChangedObservable_ = new Observable();
  }

  /**
   * @override
   * @return {!WebAnimationPlayState}
   */
  getPlayState() {
    return this.playState_;
  }

  /**
   * @override
   * @param {function(!WebAnimationPlayState)} handler
   * @return {!UnlistenDef}
   */
  onPlayStateChanged(handler) {
    return this.playStateChangedObservable_.add(handler);
  }

  /**
   * @override
   * Initializes the players but does not change the state.
   */
  init() {
    devAssert(!this.players_);
    this.players_ = this.requests_.map(request => {
      // Apply vars.
      if (request.vars) {
        setStyles(request.target,
            assertDoesNotContainDisplay(request.vars));
      }
      const player = request.target.animate(
          request.keyframes, request.timing);
      player.pause();
      return player;
    });
    this.runningCount_ = this.players_.length;
    this.players_.forEach(player => {
      player.onfinish = () => {
        this.runningCount_--;
        if (this.runningCount_ == 0) {
          this.setPlayState_(WebAnimationPlayState.FINISHED);
        }
      };
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
    this.resume();
  }

  /**
   * @override
   */
  pause() {
    devAssert(this.players_);
    this.setPlayState_(WebAnimationPlayState.PAUSED);
    this.players_.forEach(player => {
      if (player.playState == WebAnimationPlayState.RUNNING) {
        player.pause();
      }
    });
  }

  /**
   * @override
   */
  resume() {
    devAssert(this.players_);
    const oldRunnerPlayState = this.playState_;
    if (oldRunnerPlayState == WebAnimationPlayState.RUNNING) {
      return;
    }
    this.setPlayState_(WebAnimationPlayState.RUNNING);
    this.runningCount_ = 0;
    this.players_.forEach(player => {
      if (oldRunnerPlayState != WebAnimationPlayState.PAUSED ||
          player.playState == WebAnimationPlayState.PAUSED) {
        player.play();
        this.runningCount_++;
      }
    });
  }

  /**
   * @override
   */
  reverse() {
    devAssert(this.players_);
    // TODO(nainar) there is no reverse call on WorkletAnimation
    this.players_.forEach(player => {
      player.reverse();
    });
  }

  /**
   * @override
   * @param {time} time
   */
  seekTo(time) {
    devAssert(this.players_);
    this.setPlayState_(WebAnimationPlayState.PAUSED);
    this.players_.forEach(player => {
      player.pause();
      player.currentTime = time;
    });
  }

  /**
   * @override
   * Seeks to a relative position within the animation timeline given a
   * percentage (0 to 1 number).
   * @param {number} percent between 0 and 1
   */
  seekToPercent(percent) {
    devAssert(percent >= 0 && percent <= 1);
    const totalDuration = this.getTotalDuration_();
    const time = totalDuration * percent;
    this.seekTo(time);
  }

  /**
   * @override
   */
  finish() {
    if (!this.players_) {
      return;
    }
    const players = this.players_;
    this.players_ = null;
    this.setPlayState_(WebAnimationPlayState.FINISHED);
    players.forEach(player => {
      player.finish();
    });
  }

  /**
   * @override
   */
  cancel() {
    if (!this.players_) {
      return;
    }
    this.setPlayState_(WebAnimationPlayState.IDLE);
    this.players_.forEach(player => {
      player.cancel();
    });
  }

  /**
   * @param {!WebAnimationPlayState} playState
   * @private
   */
  setPlayState_(playState) {
    if (this.playState_ != playState) {
      this.playState_ = playState;
      this.playStateChangedObservable_.fire(this.playState_);
    }
  }

  /**
   * @return {number} total duration in milliseconds.
   * @throws {Error} If timeline is infinite.
   */
  getTotalDuration_() {
    return getTotalDuration(this.requests_);
  }

}
