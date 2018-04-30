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
import {PlayingStates, VideoEvents} from '../../video-interface';
import {
  PositionInViewportEntryDef, // eslint-disable-line no-unused-vars
  PositionObserverFidelity,
} from '../position-observer/position-observer-worker';
import {
  PositionObserver, // eslint-disable-line no-unused-vars
} from '../position-observer/position-observer-impl';
import {Services} from '../../services';
import {asBaseElement} from '../../video-interface';
// Source for this constant is css/video-docking.css
import {cssText} from '../../../build/video-docking.css.js';
import {dev} from '../../log';
import {getServiceForDoc} from '../../service';
import {htmlFor, htmlRefs} from '../../static-template';
import {
  installPositionObserverServiceForDoc,
} from '../position-observer/position-observer-impl';
import {installStylesForDoc} from '../../style-installer';
import {isRTL} from '../../dom';
import {listen, listenOnce} from '../../event-helper';
import {mapRange} from '../../utils/math';
import {once} from '../../utils/function';
import {px, resetStyles, setImportantStyles, translate} from '../../style';
import {throttle} from '../../utils/rate-limit';


/** @private @const {number} */
const MARGIN_MAX = 30;

/** @private {number} */
const MARGIN_AREA_WIDTH_PERC = 0.04;

/** @private @const {number} */
const MIN_WIDTH = 240;

/** @private @const {number} */
const MIN_VIEWPORT_WIDTH = 320;

/** @private @const {number} */
const DOCKING_TIMEOUT = 800;

/** @private @const {number} */
const CONTROLS_TIMEOUT = 1600;

/** @private @const {number} */
const CONTROLS_TIMEOUT_AFTER_IX = 800;

/** @private @const {number} */
const FLOAT_TOLERANCE = 0.02;

/** @private @const {string} */
const BASE_CLASS_NAME = 'i-amphtml-docked';

/** @private @const {number} */
const REVERT_TO_INLINE_RATIO = 0.95;

/** @private @enum */
const RelativeX = {LEFT: 0, RIGHT: 1};

/** @private @enum */
const RelativeY = {TOP: 0, BOTTOM: 1};

/** @private @enum */
const Direction = {UP: 1, DOWN: -1};


/**
 * @struct @typedef {{
 *  video: !../../video-interface.VideoInterface,
 *  posX: !RelativeX,
 *  posY: !RelativeY,
 *  step: number,
 * }}
 */
let DockedDef;


/**
 * @struct @typedef {{
 *   container: !Element,
 *   playButton: !Element,
 *   pauseButton: !Element,
 *   muteButton: !Element,
 *   unmuteButton: !Element,
 *   fullscreenButton: !Element,
 * }}
 */
let ControlsDef;


/** @private @const {function(number, number, number): string} */
const transform = (x, y, scale) => `translate(${x}px, ${y}px) scale(${scale})`;


/**
 * @param {!Element} a
 * @param {!Element} b
 * @private
 */
function swap(a, b) {
  a.setAttribute('hidden', '');
  b.removeAttribute('hidden');
}


/**
 * @param {!MouseEvent|!TouchEvent} e
 * @return {{x: number, y: number}}
 * @private
 */
function pointerCoords(e) {
  const coords = (e.touches) ? e.touches[0] : e;
  return {
    x: dev().assertNumber(('x' in coords) ? coords.x : coords.clientX),
    y: dev().assertNumber(('y' in coords) ? coords.y : coords.clientY),
  };
}


/**
 * Maps an interpolation step in [0..1] to its position in a range.
 * @param {number} step
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function mapStep(step, min, max) {
  return mapRange(step, 0, 1, min, max);
}


/**
 * Order layers across the z-axis. First element passed in will be at the very
 * bottom of list, last element will be at the very top.
 * @param {...!Element} layers
 */
function orderLayers(...layers) {
  // This the z-index of <amp-sidebar> minus 1.
  const zIndex = 2147483646;
  for (let i = 0; i < layers.length; i++) {
    const offsetZ = -(layers.length - i);
    setImportantStyles(layers[i], {'z-index': (zIndex + offsetZ).toString()});
  }
}


/** Timeout that can be postponed, repeated or cancelled. */
class Timeout {
  /**
   * @param {!Window} win
   * @param {!Function} handler
   */
  constructor(win, handler) {
    /** @private @const {!../timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private @const {!Function} */
    this.handler_ = handler;

    /** @private {?number|?string} */
    this.id_ = null;
  }

  /**
   * @param {number} time
   * @param {...*} args
   */
  trigger(time, ...args) {
    this.cancel();
    this.id_ = this.timer_.delay(() => this.handler_.apply(null, args), time);
  }

  /** @public */
  cancel() {
    if (this.id_ !== null) {
      this.timer_.cancel(this.id_);
    }
  }
}


/**
 * Manages docking (a.k.a. minimize to corner) for videos that satisfy the
 * {@see ../../video-interface.VideoInterface}.
 */
export class VideoDocking {

  /** @param {!../ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc, manager) {

    /** @private @const {!../ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.manager_ = manager;

    /** @private @const {!../viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {?DockedDef} */
    this.currentlyDocked_ = null;

    /** @private @const {function():!Timeout} */
    this.getDockingTimeout_ = once(() =>
      new Timeout(this.ampdoc_.win, video => this.onDockingTimeout_(video)));

    /** @private @const {function():!Timeout} */
    this.getControlsTimeout_ = once(() =>
      new Timeout(this.ampdoc_.win, () => this.hideControls_()));

    /** @private {!RelativeX} */
    // Overriden when user drags the video to a corner.
    // Y-corner is determined based on scroll direction.
    this.preferredCornerX_ =
        isRTL(this.getDoc_()) ? RelativeX.LEFT : RelativeX.RIGHT;


    /**
     * Returns an element representing a shadow under the docked video.
     * Alternatively, we could use box-shadow on the video element, but in
     * order to animate it without jank we have to use an opacity transition.
     * A separate layer also has the added benefit that authors can override its
     * box-shadow value or any other styling without handling the transition
     * themselves.
     * @private @const {function():!Element}
     */
    this.getShadowLayer_ = once(() => this.append_(
        htmlFor(this.getDoc_())`
          <div class="amp-docked-video-shadow" hidden></div>`));

    /**
     * Returns an overlay to be used to capture different user events.
     * @private @const {function():!Element}
     */
    this.getOverlay_ = once(() => this.append_(this.installOverlay_(
        htmlFor(this.getDoc_())`
          <div class="i-amphtml-docked-video-overlay" hidden></div>`)));

    /** @private @const {function():!ControlsDef} */
    this.getControls_ = once(() => this.installControls_(this.append_(
    // This currently bloats the resulting binary with
    // 1. some whitespace and 2. duplicate declarations of equal strings.
    // Upcoming fixes: #14657, #14658.
    // TODO(alanorozco): Cleanup markup for readability once fixes land.
        htmlFor(this.getDoc_())`
          <div class="amp-docked-video-controls" ref="container" hidden>
            <div class="amp-docked-video-button-group">
              <div role="button" ref="playButton"
                  class="amp-docked-video-play"></div>
              <div role="button" ref="pauseButton"
                  class="amp-docked-video-pause"></div>
            </div>
            <div class="amp-docked-video-button-group">
              <div role="button" ref="muteButton"
                class="amp-docked-video-mute"></div>
              <div role="button" ref="unmuteButton"
                  class="amp-docked-video-unmute"></div>
            </div>
            <div class="amp-docked-video-button-group">
              <div role="button" ref="fullscreenButton"
                  class="amp-docked-video-fullscreen"></div>
            </div>
          </div>`)));

    /** @private {boolean} */
    // Dismissal is final.
    this.dismissed_ = false;

    /** @private {boolean} */
    this.playingBeforeNudge_ = false;

    /**
     * Stack of videos that have been nudged out of view.
     * @private {?Array<!../../video-interface.VideoInterface>}
     */
    this.nudged_ = null;

    /**
     * Unlisteners for the currently minimized video.
     * @private {!Array<!UnlistenDef>}
     */
    this.videoUnlisteners_ = [];

    /**
     * Memoizes x, y and scale to prevent useless mutations.
     * @private {?{x: number, y: number, scale: number}}
     */
    this.placedAt_ = null;

    /** @private {?Direction} */
    this.scrollDirection_ = null;

    /** @private {number} */
    this.lastScrollTop_ = this.viewport_.getScrollTop();

    /** @private {number} */
    this.lastScrollDelta_ = 0;

    // It would be nice if the viewport service provided scroll direction
    // and speed.
    this.viewport_.onScroll(
        throttle(ampdoc.win, () => this.updateScroll_(), 100));

    this.installStyles_();
  }

  /** @private */
  installStyles_() {
    installStylesForDoc(
        this.ampdoc_,
        cssText,
        /* callback */ null,
        /* opt_isRuntimeCss */ false,
        /* opt_ext */ 'amp-video-docking');
  }

  /** @param {!../../video-interface.VideoInterface} video */
  register(video) {
    const {element} = video;
    const fidelity = PositionObserverFidelity.HIGH;

    this.getPositionObserver_().observe(element, fidelity, () => {
      this.onPositionChange_(video);
    });
  }

  /** @private */
  updateScroll_() {
    const scrollTop = this.viewport_.getScrollTop();
    const scrollDirection = scrollTop > this.lastScrollTop_ ?
      Direction.UP :
      Direction.DOWN;
    this.lastScrollDelta_ = Math.abs(this.lastScrollTop_ - scrollTop);
    this.scrollDirection_ = scrollDirection;
    this.lastScrollTop_ = scrollTop;
  }

  /**
   * @return {!Document}
   * @private
   */
  getDoc_() {
    return /** @type {!Document} */ (this.ampdoc_.getRootNode());
  }

  /**
   * @param {!Element} element
   * @return {!Element}
   * @private
   */
  append_(element) {
    const root = this.getDoc_().body || this.getDoc_();
    return dev().assertElement(root.appendChild(element));
  }

  /**
   * @param {!Element} overlay
   * * @return {!Element}
   * @private
   */
  installOverlay_(overlay) {
    return this.showControlsOnTap_(this.addDragListeners_(overlay));
  }

  /** @private */
  enterFullscreen_() {
    const video = this.getDockedVideo_();
    video.fullscreenEnter();
    video.play(/* auto */ false);
    video.unmute();
  }

  /**
   * @param {!Element} element
   * @return {!Element}
   * @private
   */
  showControlsOnTap_(element) {
    listen(element, 'click', () => {
      const video = this.getDockedVideo_();
      const {
        container,
        playButton,
        pauseButton,
        muteButton,
        unmuteButton,
      } = this.getControls_();
      const overlay = this.getOverlay_();

      container.removeAttribute('hidden');
      container.classList.add('amp-docked-video-controls-shown');
      overlay.classList.add('amp-docked-video-controls-bg');

      if (this.isPlaying_()) {
        swap(playButton, pauseButton);
      } else {
        swap(pauseButton, playButton);
      }

      const isMuted = this.manager_.isMuted(video);
      if (isMuted) {
        swap(muteButton, unmuteButton);
      } else {
        swap(unmuteButton, muteButton);
      }

      this.hideControlsOnTimeout_();
    });
    return element;
  }

  /**
   * @param {!Element} element
   * @return {!Element}
   * @private
   */
  addDragListeners_(element) {
    listen(element, 'touchstart', e =>
      this.startDragging_(/** @type {!TouchEvent} */ (e)));

    listen(element, 'mousedown', e =>
      this.startDragging_(/** @type {!TouchEvent} */ (e)));

    return element;
  }

  /**
   * @param {!Element} element
   * @return {!ControlsDef}
   * @private
   */
  installControls_(element) {
    const controls = htmlRefs(element);

    const {
      container,
      playButton,
      pauseButton,
      unmuteButton,
      muteButton,
      fullscreenButton,
    } = controls;

    listen(playButton, 'click', () =>
      this.getDockedVideo_().play(/* auto */ false));
    listen(pauseButton, 'click', () => this.getDockedVideo_().pause());
    listen(muteButton, 'click', () => this.getDockedVideo_().mute());
    listen(unmuteButton, 'click', () => this.getDockedVideo_().unmute());
    listen(fullscreenButton, 'click', () => this.enterFullscreen_());

    listen(container, 'click', () =>
      this.hideControlsOnTimeout_(CONTROLS_TIMEOUT_AFTER_IX));

    this.addDragListeners_(container);

    return /** @type {!ControlsDef} */ (controls);
  }

  /**
   * @return {!../../video-interface.VideoInterface}
   * @private
   */
  getDockedVideo_() {
    return dev().assert(this.currentlyDocked_).video;
  }

  /**
   * @return {!PositionObserver}
   * @private
   */
  getPositionObserver_() {
    installPositionObserverServiceForDoc(this.ampdoc_);

    // No getter in services.js.
    return /** @type {!PositionObserver} */ (
      getServiceForDoc(this.ampdoc_, 'position-observer'));
  }

  /**
   * Reconciliates the state of a docked or potentially dockable video when
   * its position changes.
   * @param {!../../video-interface.VideoInterface} video
   * @private
   */
  onPositionChange_(video) {
    if (this.dismissed_) {
      // Docking can no longer happen.
      return;
    }

    if (this.getAreaWidth_() < MIN_VIEWPORT_WIDTH) {
      return;
    }

    const {element} = video;
    const intersectionChangeEntry = element.getIntersectionChangeEntry();

    const {intersectionRatio} = intersectionChangeEntry;
    if (intersectionRatio < FLOAT_TOLERANCE &&
        !this.isCurrentlyDocked_(video)) {
      // TODO(alanorozco): Transition in cases where the element went out
      // of view too quickly.
      return;
    }

    if (this.isCurrentlyDocked_(video) &&
        this.isVisible_(element)) {
      this.undock_(video);
      return;
    }

    const isPlayingManually =
        this.manager_.getPlayingState(video) == PlayingStates.PLAYING_MANUAL;
    if (!isPlayingManually && !this.isCurrentlyDocked_(video)) {
      return;
    }

    const {intersectionRect} = intersectionChangeEntry;
    if (this.currentlyDocked_ &&
        !this.isCurrentlyDocked_(video) &&
        this.nudgeWith_(intersectionRect)) {
      return;
    }

    const posY = this.getRelativeY_(video);
    if (posY === null ||
        this.currentlyDocked_ && posY !== this.currentlyDocked_.posY) {
      return;
    }

    if (this.currentlyDocked_ && !this.isCurrentlyDocked_(video)) {
      // TODO(alanorozco): Handle swap case.
      this.undock_(this.currentlyDocked_.video);
    }

    const posX = this.getRelativeX_();
    this.dock_(video, posX, posY);
  }

  /**
   * @return {number}
   * @private
   */
  getTopEdge_() {
    return 0;
  }

  /**
   * @return {number}
   * @private
   */
  getBottomEdge_() {
    return this.viewport_.getSize().height;
  }

  /**
   * @return {number}
   * @private
   */
  getLeftEdge_() {
    return 0;
  }

  /**
   * @return {number}
   * @private
   */
  getRightEdge_() {
    return this.viewport_.getSize().width;
  }

  /**
   * @param {!../../video-interface.VideoInterface} video
   * @return {?RelativeY}
   * @private
   */
  getRelativeY_(video) {
    if (this.isCurrentlyDocked_(video)) {
      return dev().assert(this.currentlyDocked_).posY;
    }
    const {element} = video;
    const {top, bottom} = element.getIntersectionChangeEntry().intersectionRect;
    if (top <= this.getTopEdge_() &&
        this.scrollDirection_ == Direction.UP) {
      return RelativeY.TOP;
    }
    if (bottom >= this.getBottomEdge_() &&
        this.scrollDirection_ == Direction.DOWN) {
      return RelativeY.BOTTOM;
    }
    return null;
  }

  /**
   * @return {!RelativeX}
   * @private
   */
  getRelativeX_() {
    return this.preferredCornerX_;
  }

  /**
   * @return {number}
   * @private
   */
  getMargin_() {
    return Math.min(MARGIN_MAX, MARGIN_AREA_WIDTH_PERC * this.getAreaWidth_());
  }

  /**
   * @return {number}
   * @private
   */
  getAreaWidth_() {
    return this.getRightEdge_() - this.getLeftEdge_();
  }

  /**
   * Nudge with a given box if it pushes the docked video's boundaries.
   * @param {{top: number, bottom: number, right: number, left: number}} box
   * @return {boolean} Whether the docked video was nudged by the given box.
   */
  nudgeWith_(box) {
    if (!this.intersectsWithDocked_(box)) {
      return this.resetAfterNudge_();
    }

    const {top, bottom} = box;
    const {video, posX, posY} = this.currentlyDocked_;

    let {targetHeight} = this.getTargetArea_(video, posX, posY);

    targetHeight += this.getMargin_() * 2;

    const topThreshold = this.getTopEdge_() + targetHeight;
    if (posY == RelativeY.TOP &&
        top <= topThreshold &&
        top > this.getTopEdge_()) {
      return this.nudge_(top - topThreshold);
    }

    const bottomThreshold = this.getBottomEdge_() - targetHeight;
    if (posY == RelativeY.BOTTOM &&
        bottom >= bottomThreshold &&
        bottom < this.getBottomEdge_()) {
      return this.nudge_(bottom - bottomThreshold);
    }

    return this.resetAfterNudge_();
  }

  /**
   * @param {number} offsetY
   * @return {boolean}
   */
  nudge_(offsetY) {
    this.playingBeforeNudge_ = this.playingBeforeNudge_ || this.isPlaying_();

    const video = this.getDockedVideo_();
    video.pause();

    this.nudged_ = this.nudged_ || [];

    if (this.nudged_.length < 1 ||
        this.nudged_[this.nudged_.length - 1] != video) {
      this.nudged_.push(video);
    }

    this.hideControls_();
    this.offset_(/* x */ 0, offsetY);

    asBaseElement(video).mutateElement(() => {
      this.getOverlay_().classList.add('amp-docked-video-nudged');
    });

    return true;
  }

  /**
   * @private
   * @return {boolean} For the convenience of `nudge_()`.
   */
  // TODO(alanorozco): Re-dock
  resetAfterNudge_() {
    if (!this.getOverlay_().classList.contains('amp-docked-video-nudged')) {
      return false;
    }
    const video = this.getDockedVideo_();
    if (this.playingBeforeNudge_) {
      video.play(/* auto */ false);
    }
    this.offset_(0, 0);
    this.nudged_.pop();
    this.playingBeforeNudge_ = false;
    asBaseElement(video).mutateElement(() => {
      this.getOverlay_().classList.remove('amp-docked-video-nudged');
    });
    return false;
  }

  /**
   * @return {boolean}
   * @private
   */
  isPlaying_() {
    const video = this.getDockedVideo_();
    return this.manager_.getPlayingState(video) != PlayingStates.PAUSED;
  }

  /**
   * @return {boolean}
   * @private
   */
  intersectsWithDocked_(box) {
    if (!this.currentlyDocked_) {
      return false;
    }
    const {video, posX, posY} = this.currentlyDocked_;
    const {x, y, targetWidth, targetHeight} =
        this.getTargetArea_(video, posX, posY);

    const bottom = y + targetHeight + this.getMargin_();
    const right = x + targetWidth + this.getMargin_();

    return !(box.left > right
        || box.right < x
        || box.top > bottom
        || box.bottom < y);
  }

  /** @private */
  dismiss_(dirX = 0, dirY = 0) {
    // TODO(alanorozco): Docking can no longer happen, so clean up.
    const video = this.getDockedVideo_();
    video.pause();
    this.undock_(video, dirX, dirY);
    this.dismissed_ = true;
  }

  /**
   * @return {boolean}
   * @private
   */
  currentPositionMatchesScroll_() {
    const currentPosY = this.currentlyDocked_.posY;
    const direction = this.scrollDirection_;
    return (
      currentPosY == RelativeY.TOP && direction == Direction.UP ||
      currentPosY == RelativeY.BOTTOM && direction == Direction.DOWN);
  }

  /**
   * @param {!../../video-interface.VideoInterface} video
   * @param {!RelativeX} posX
   * @param {!RelativeY} posY
   * @param {?number=} optTransitionDurationMs
   * @param {boolean=} finalize
   * @private
   */
  dock_(video, posX, posY, optTransitionDurationMs = null, finalize = false) {
    const {element} = video;

    const reachedEndOfTransition =
      this.isCurrentlyDocked_(video) &&
      this.currentPositionMatchesScroll_() &&
      this.currentlyDocked_.step >= (1 - FLOAT_TOLERANCE);
    if (reachedEndOfTransition) {
      return;
    }

    // Assume/jump to 1 when scrolling quickly to avoid rescale when inline,
    // otherwise calculate based on visible height.
    // TODO(alanorozco): Interpolate when jumping
    const scrollingQuickly = this.lastScrollDelta_ > 100;
    const {intersectionRatio} = element.getIntersectionChangeEntry();
    const step = finalize || scrollingQuickly ? 1 : 1 - intersectionRatio;

    const {x, y, scale} = this.getDims_(video, posX, posY, step);

    video.hideControls();

    this.placeAt_(video, x, y, scale, step, optTransitionDurationMs);

    this.setCurrentlyDocked_(video, posX, posY, step);

    this.getDockingTimeout_().trigger(DOCKING_TIMEOUT, video);
  }

  /**
   * @param {!../../video-interface.VideoInterface} video
   * @param {number} x
   * @param {number} y
   * @param {number} scale
   * @param {number} step in [0..1]
   * @param {?number=} optTransitionDurationMs
   * @private
   */
  placeAt_(video, x, y, scale, step, optTransitionDurationMs = null) {
    const maxAutoTransitionDurationMs = 500;
    const hasSetTransitionDuration = optTransitionDurationMs !== null;
    const transitionDurationMs =
      hasSetTransitionDuration ?
        dev().assertNumber(optTransitionDurationMs) :
        // If transition duration is unset, calculate it from the difference
        // with the previously executed docking step.
        (this.isCurrentlyDocked_(video) ?
          (Math.abs(step - this.currentlyDocked_.step) *
            maxAutoTransitionDurationMs) :
          0);

    if (this.placedAt_ &&
        this.placedAt_.x == x &&
        this.placedAt_.y == y &&
        this.placedAt_.scale == scale) {
      return;
    }

    const {width, height} = this.getLayoutBox_(video);

    this.placedAt_ = {x, y, scale};

    const transitionTiming =
        // Auto-transitions are supposed to smooth-out PositionObserver
        // frequency, so it makes sense to use 'linear'. When the transition
        // duration is otherwise set, 'ease-out' looks much nicer.
        hasSetTransitionDuration ? 'ease-out' : 'linear';

    const positioningStyles = {
      'width': px(width),
      'height': px(height),
      'transform': transform(x, y, scale),
      'transition-duration': `${transitionDurationMs}ms`,
      'transition-timing-function': transitionTiming,
    };

    const internalElement = this.getInternalElementFor_(video.element);
    const shadowLayer = this.getShadowLayer_();
    const overlay = this.getOverlay_();
    const controls = this.getControls_().container;

    asBaseElement(video).mutateElement(() => {
      internalElement.classList.add(BASE_CLASS_NAME);
      shadowLayer.removeAttribute('hidden');
      overlay.removeAttribute('hidden');
      overlay.classList.remove('amp-docked-video-nudged');
      orderLayers(shadowLayer, internalElement, overlay, controls);
      setImportantStyles(shadowLayer, {
        'opacity': step,
      });
      setImportantStyles(controls, {
        'transform': translate(x, y),
        'width': px(width * scale),
        'height': px(height * scale),
      });
      setImportantStyles(internalElement, positioningStyles);
      setImportantStyles(shadowLayer, positioningStyles);
      setImportantStyles(overlay, positioningStyles);
    });
  }

  /**
   * @param {!../../video-interface.VideoInterface} video
   * @return {boolean}
   */
  isCurrentlyDocked_(video) {
    return !!this.currentlyDocked_ && this.currentlyDocked_.video == video;
  }

  /**
   * @param {!../../video-interface.VideoInterface} video
   * @param {!RelativeX} posX
   * @param {!RelativeY} posY
   * @param {number} step
   */
  setCurrentlyDocked_(video, posX, posY, step) {
    if (!this.isCurrentlyDocked_(video)) {
      this.updateControlsBasedOn_(video.element);
    }

    this.currentlyDocked_ = {video, posX, posY, step};
  }

  /**
   * @param {!Element} video
   * @private
   */
  updateControlsBasedOn_(video) {
    while (this.videoUnlisteners_.length) {
      this.videoUnlisteners_.pop().call();
    }
    this.videoUnlisteners_ = [
      listen(video, VideoEvents.PLAYING, () => this.onPlay_()),
      listen(video, VideoEvents.PAUSE, () => this.onPause_()),
      listen(video, VideoEvents.MUTED, () => this.onMute_()),
      listen(video, VideoEvents.UNMUTED, () => this.onUnmute_()),
    ];
  }

  /** @private */
  onPlay_() {
    const {playButton, pauseButton} = this.getControls_();
    swap(playButton, pauseButton);
  }

  /** @private */
  onPause_() {
    const {pauseButton, playButton} = this.getControls_();
    swap(pauseButton, playButton);
  }

  /** @private */
  onMute_() {
    const {muteButton, unmuteButton} = this.getControls_();
    swap(muteButton, unmuteButton);
  }

  /** @private */
  onUnmute_() {
    const {unmuteButton, muteButton} = this.getControls_();
    swap(unmuteButton, muteButton);
  }

  /**
   * @param {number} offsetX
   * @param {number} offsetY
   * @private
   */
  offset_(offsetX, offsetY) {
    const video = this.getDockedVideo_();
    const {posX, posY} = this.currentlyDocked_;

    const step = 1;
    const {x, y, scale} = this.getDims_(video, posX, posY, step);

    this.placeAt_(video, x + offsetX, y + offsetY, scale, step,
        /* transitionDurationMs */ 0);
  }

  /**
   * @param {!../../video-interface.VideoInterface} video
   * @private
   */
  onDockingTimeout_(video) {
    const {element} = video;
    const internalElement = this.getInternalElementFor_(element);
    const isStillDocked = internalElement.classList.contains(BASE_CLASS_NAME);
    if (!isStillDocked) {
      return;
    }

    if (this.currentlyDocked_ && !this.isCurrentlyDocked_(video)) {
      return;
    }

    if (this.isVisible_(element, REVERT_TO_INLINE_RATIO) &&
        this.isCurrentlyDocked_(video)) {
      this.undock_(this.currentlyDocked_.video);
      return;
    }

    const currentlyDocked = dev().assert(this.currentlyDocked_);
    const {step, posX, posY} = currentlyDocked;
    const minTransitionTimeMs = 100;
    const maxTransitionTimeMs = 500;
    const transitionTimeMs =
        mapStep(step, maxTransitionTimeMs, minTransitionTimeMs);

    this.dock_(video, posX, posY, transitionTimeMs, /* finalize */ true);
  }

  /**
   * @param {!AmpElement} element
   * @param {number=} minRatio
   * @return {boolean}
   */
  isVisible_(element, minRatio = 1) {
    const {intersectionRatio} = element.getIntersectionChangeEntry();
    return intersectionRatio >= (minRatio - FLOAT_TOLERANCE);
  }

  /**
   * @param {!MouseEvent|!TouchEvent} e
   * @private
   */
  startDragging_(e) {
    if (!this.currentlyDocked_) {
      return;
    }
    const {x, y} = pointerCoords(e);
    const startX = x;
    const startY = y;

    let offsetX = 0;
    let offsetY = 0;

    const onDrag = e => {
      e.preventDefault();
      e.stopPropagation();
      const {x, y} = pointerCoords(e);
      offsetX = x - startX;
      offsetY = y - startY;
      this.offset_(offsetX, offsetY);
    };

    const onDragEnd = () => {
      unlisteners.forEach(unlisten => unlisten.call());

      this.viewport_.resetScroll();

      if (this.dismissOnDragEnd_(offsetX, offsetY)) {
        return;
      }
      this.snapToCorner_(offsetX, offsetY);
    };

    const root = this.ampdoc_.getRootNode();
    const unlisteners = [
      listen(root, 'touchmove', onDrag),
      listen(root, 'mousemove', onDrag),
      listenOnce(root, 'touchend', onDragEnd),
      listenOnce(root, 'mouseup', onDragEnd),
    ];

    this.viewport_.disableScroll();
  }

  /**
   * @param {number} offsetX
   * @param {number} offsetY
   * @private
   */
  dismissOnDragEnd_(offsetX, offsetY) {
    // TODO: Use topEdge/bottomEdge
    const {vw, vh} = this.getViewportSize_();
    const {centerX, centerY} = this.getCenter_(offsetX, offsetY);

    const dismissToleranceFromCenterPx = 20;

    if (centerX >= (vw - dismissToleranceFromCenterPx) ||
        centerX <= dismissToleranceFromCenterPx ||
        centerY >= (vh - dismissToleranceFromCenterPx) ||
        centerY <= dismissToleranceFromCenterPx) {
      this.dismiss_();
      return true;
    }
    return false;
  }

  /**
   * Gets the center of the currently docked video, offset by (x, y).
   * @param {number} offsetX
   * @param {number} offsetY
   * @return {{centerX: number, centerY: number}}
   * @private
   */
  getCenter_(offsetX, offsetY) {
    const {posX, posY, step} = this.currentlyDocked_;
    const video = this.getDockedVideo_();
    const {width, height} = this.getLayoutBox_(video);
    const {x, y, scale} = this.getDims_(video, posX, posY, step);

    const centerX = x + offsetX + (width * scale / 2);
    const centerY = y + offsetY + (height * scale / 2);

    return {centerX, centerY};
  }

  /**
   * @param {!../../video-interface.VideoInterface=} opt_video
   * @return {!../../layout-rect.LayoutRectDef}
   */
  getLayoutBox_(opt_video) {
    const video =
      asBaseElement(opt_video ?
        dev().assert(opt_video) :
        this.getDockedVideo_());
    return video.getLayoutBox();
  }

  /**
   * @param {number} offsetX
   * @param {number} offsetY
   * @private
   */
  snapToCorner_(offsetX, offsetY) {
    const video = this.getDockedVideo_();
    const {step} = this.currentlyDocked_;

    const {centerX, centerY} = this.getCenter_(offsetX, offsetY);

    let minDistance = null;
    let closestCornerX = null;
    let closestCornerY = null;

    [RelativeX.LEFT, RelativeX.RIGHT].forEach(posX => {
      [RelativeY.TOP, RelativeY.BOTTOM].forEach(posY => {
        const cornerX = posX == RelativeX.LEFT ?
          this.getLeftEdge_() :
          this.getRightEdge_();
        const cornerY = posY == RelativeY.TOP ?
          this.getTopEdge_() :
          this.getBottomEdge_();
        const distance = Math.sqrt(
            Math.pow(cornerX - centerX, 2) +
            Math.pow(cornerY - centerY, 2));
        if (minDistance === null ||
            distance < minDistance) {
          minDistance = distance;
          closestCornerY = posY;
          closestCornerX = posX;
        }
      });
    });

    this.currentlyDocked_.posX = closestCornerX;
    this.currentlyDocked_.posY = closestCornerY;

    this.preferredCornerX_ = closestCornerX;

    const {x, y, scale} =
        this.getDims_(video, closestCornerX, closestCornerY, step);

    this.placeAt_(video, x, y, scale, step, 100);

    return false;
  }

  /**
   * @param {!../../video-interface.VideoInterface} video
   * @param {!RelativeX} posX
   * @param {!RelativeY} posY
   * @return {{x: number, y: number, targetWidth: number, targetHeight: number}}
   */
  getTargetArea_(video, posX, posY) {
    const {width, height} = this.getLayoutBox_(video);
    const margin = this.getMargin_();
    const aspectRatio = width / height;
    const targetWidth = Math.max(MIN_WIDTH, this.getAreaWidth_() * 0.25);
    const targetHeight = targetWidth / aspectRatio;

    const x =
      (posX == RelativeX.RIGHT ?
        this.getRightEdge_() - margin - targetWidth :
        this.getLeftEdge_() + margin);

    const y =
      (posY == RelativeY.TOP ?
        this.getTopEdge_() + margin :
        this.getBottomEdge_() - margin - targetHeight);

    return {x, y, targetWidth, targetHeight};
  }

  /**
   * @param {!../../video-interface.VideoInterface} video
   * @param {!RelativeX} posX
   * @param {!RelativeY} posY
   * @param {number} step in [0..1]
   * @return {{x: number, y: number, scale: number}}
   */
  getDims_(video, posX, posY, step) {
    const {left, width, height} = this.getLayoutBox_(video);
    const {x, y, targetWidth} = this.getTargetArea_(video, posX, posY);
    const currentX = mapStep(step, left, x);
    const currentWidth = mapStep(step, width, targetWidth);
    const initialY = posY == RelativeY.TOP ?
      this.getTopEdge_() :
      this.getBottomEdge_() - height;
    const currentY = mapStep(step, initialY, y);
    const scale = currentWidth / width;

    return {x: currentX, y: currentY, scale};
  }

  /**
   * @return {{vw: number, vh: number}}
   * @private
   */
  // Using `vw` and `vh` to disambiguate with `width` and `height` when
  // destructuring.
  getViewportSize_() {
    const viewportSize = this.viewport_.getSize();
    const vw = viewportSize.width;
    const vh = viewportSize.height;
    return {vw, vh};
  }

  /**
   * @param {!../../video-interface.VideoInterface} video
   * @private
   */
  undock_(video, dismissDirX = 0, dismissDirY = 0) {
    const internalElement = this.getInternalElementFor_(video.element);
    if (!internalElement.classList.contains('i-amphtml-docked')) {
      return;
    }
    // TODO(alanorozco): animate dismissal
    if (dismissDirX != 0) {
      this.resetUndocked_(video);
      return;
    }
    if (dismissDirY != 0) {
      this.resetUndocked_(video);
      return;
    }
    this.resetUndocked_(video);
  }

  /**
   * @param {!../../video-interface.VideoInterface} video
   * @private
   */
  resetUndocked_(video) {
    const internalElement = this.getInternalElementFor_(video.element);

    asBaseElement(video).mutateElement(() => {
      this.hideControls_();
      video.showControls();
      this.placedAt_ = null;
      internalElement.classList.remove(BASE_CLASS_NAME);
      const shadowLayer = this.getShadowLayer_();
      const overlay = this.getOverlay_();
      const stylesToReset = [
        'transform',
        'transition',
        'width',
        'height',
        'margin',
        'z-index',
        'opacity',
      ];
      shadowLayer.setAttribute('hidden', '');
      overlay.setAttribute('hidden', '');
      resetStyles(internalElement, stylesToReset);
      resetStyles(shadowLayer, stylesToReset);
      resetStyles(overlay, stylesToReset);
      this.currentlyDocked_ = null;
    });
  }

  /** @private */
  hideControls_() {
    const {container} = this.getControls_();
    const overlay = this.getOverlay_();
    overlay.classList.remove('amp-docked-video-controls-bg');
    container.classList.remove('amp-docked-video-controls-shown');
  }

  /**
   * @param {number=} time
   * @private
   */
  hideControlsOnTimeout_(time = CONTROLS_TIMEOUT) {
    this.getControlsTimeout_().trigger(time);
  }

  /** @private */
  getInternalElementFor_(element) {
    return element.querySelector('video, iframe');
  }
}
