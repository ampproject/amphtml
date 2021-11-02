import {
  WEB_ANIMATION_PLAY_STATE_ENUM, // eslint-disable-line no-unused-vars
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
   * @return {!WEB_ANIMATION_PLAY_STATE_ENUM}
   */
  getPlayState() {}

  /**
   * @param {function(!WEB_ANIMATION_PLAY_STATE_ENUM)} unusedHandler
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
   * @param {bool} unusedPauseOnError
   */
  finish(unusedPauseOnError = false) {}

  /**
   */
  cancel() {}
}
