import {Observable} from '#core/data-structures/observable';
import {assertDoesNotContainDisplay, setStyles} from '#core/dom/style';

import {devAssert} from '#utils/log';

import {AnimationRunner} from './animation-runner';
import {getTotalDuration} from './utils';

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
    this.players_ = this.requests_.map((request) => {
      // Apply vars.
      if (request.vars) {
        setStyles(request.target, assertDoesNotContainDisplay(request.vars));
      }
      const player = request.target.animate(
        /** @type {!Array<Object>} */ (request.keyframes),
        /** @type {KeyframeAnimationOptions} */ (request.timing)
      );
      player.pause();
      return player;
    });
    this.runningCount_ = this.players_.length;
    this.players_.forEach((player) => {
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
    this.players_.forEach((player) => {
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
    this.players_.forEach((player) => {
      /**
       * TODO(gharbiw):
       * The playState on Safari and Edge sometimes gets stuck on
       * the PENDING state (particularly when the animation's visibility
       * gets toggled) so we add an exception to play even if the state
       * is PENDING. Need to investigate why this happens, fix it and
       * remove the exception below.
       */
      if (
        oldRunnerPlayState != WebAnimationPlayState.PAUSED ||
        player.playState == WebAnimationPlayState.PAUSED ||
        player.playState == WebAnimationPlayState.PENDING
      ) {
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
    this.players_.forEach((player) => {
      player.reverse();
    });
  }

  /**
   * @override
   * @param {time} time
   */
  seekTo(time) {
    if (!this.players_) {
      return;
    }
    this.setPlayState_(WebAnimationPlayState.PAUSED);
    this.players_.forEach((player) => {
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
  finish(pauseOnError = false) {
    if (!this.players_) {
      return;
    }
    const players = this.players_;
    this.players_ = null;
    this.setPlayState_(WebAnimationPlayState.FINISHED);
    players.forEach((player) => {
      if (pauseOnError) {
        try {
          // Will fail if animation is infinite, in that case we pause it.
          player.finish();
        } catch (error) {
          player.pause();
        }
      } else {
        player.finish();
      }
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
    this.players_.forEach((player) => {
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
