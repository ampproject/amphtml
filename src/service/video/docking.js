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
const REVERT_TO_INLINE_RATIO = 0.9;

/** @enum */
export const RelativeX = {LEFT: 0, RIGHT: 1};

/** @enum */
export const RelativeY = {TOP: 0, BOTTOM: 1};

/** @enum */
export const Direction = {UP: 1, DOWN: -1};


/**
 * @typedef
 * {!../../video-interface.VideoInterface|!../../base-element.BaseElement}
 */
let VideoOrBaseElementDef;


/**
 * @struct @typedef {{
 *  video: !VideoOrBaseElementDef,
 *  posX: !RelativeX,
 *  posY: !RelativeY,
 *  step: number,
 * }}
 */
let DockedDef;


/**
 * @struct @typedef {{
 *   container: !Element,
 *   dismissButton: !Element,
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


/**
 * @param {!Element} element
 * @return {!Element}
 * @restricted
 */
function getInternalElementFor(element) {
  return dev().assertElement(element.querySelector('video, iframe'));
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
      new Timeout(this.ampdoc_.win, () =>
        this.hideControls_(/* respectSticky */ true)));

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
          <div class="amp-docked-video-controls" hidden>
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
            <div class="amp-docked-video-button-group
                amp-docked-video-dismiss-group">
              <div role="button" ref="dismissButton"
                  class="amp-docked-video-dismiss"></div>
            </div>
          </div>`)));

    /** @private {?VideoOrBaseElementDef} */
    this.lastDismissed_ = null;

    /** @private {?RelativeY} */
    this.lastDismissedPosY_ = null;

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

    /** @private {boolean} */
    this.stickyControls_ = false;

    /** @private @const {!function()} */
    // Lazily invoked.
    this.install_ = once(() => {
      // It would be nice if the viewport service provided scroll direction
      // and speed.
      this.viewport_.onScroll(
          throttle(ampdoc.win, () => this.updateScroll_(), 100));

      this.installStyles_();
    });
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

  /** @param {!VideoOrBaseElementDef} video */
  register(video) {
    const {element} = video;
    const fidelity = PositionObserverFidelity.HIGH;

    this.install_();

    this.getPositionObserver_().observe(element, fidelity,
        throttle(this.ampdoc_.win, () => this.onPositionChange_(video), 40));
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
      this.drag_(/** @type {!TouchEvent} */ (e)));

    listen(element, 'mousedown', e =>
      this.drag_(/** @type {!TouchEvent} */ (e)));

    return element;
  }

  /**
   * @param {!Element} container
   * @return {!ControlsDef}
   * @private
   */
  installControls_(container) {
    const controls = htmlRefs(container);

    const {
      dismissButton,
      playButton,
      pauseButton,
      unmuteButton,
      muteButton,
      fullscreenButton,
    } = controls;

    Object.assign(controls, {container});

    listen(dismissButton, 'click', () => this.dismissOnTap_());
    listen(playButton, 'click', () =>
      this.getDockedVideo_().play(/* auto */ false));
    listen(pauseButton, 'click', () => this.getDockedVideo_().pause());
    listen(muteButton, 'click', () => this.getDockedVideo_().mute());
    listen(unmuteButton, 'click', () => this.getDockedVideo_().unmute());
    listen(fullscreenButton, 'click', () => this.enterFullscreen_());

    listen(container, 'mouseup', () =>
      this.hideControlsOnTimeout_(CONTROLS_TIMEOUT_AFTER_IX));

    this.addDragListeners_(container);

    return /** @type {!ControlsDef} */ (controls);
  }

  /** @private */
  dismissOnTap_() {
    this.undock_(this.getDockedVideo_());
  }

  /**
   * @return {!VideoOrBaseElementDef}
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
   * @param {!VideoOrBaseElementDef} video
   * @private
   */
  onPositionChange_(video) {
    if (this.ignoreDueToSize_(video) ||
        this.ignoreDueToDocked_(video) ||
        this.undockBecauseVisible_(video) ||
        this.ignoreDueToNotPlayingManually_(video)) {
      return;
    }

    const posY = this.maybeGetRelativeY_(video);
    if (posY === null) {
      return;
    }

    this.dock_(video, this.getRelativeX_(), posY);
  }

  /**
   * @param  {!VideoOrBaseElementDef} video
   * @return {boolean}
   */
  undockBecauseVisible_(video, ratio = 1) {
    if (!this.currentlyDocked_ || !this.isVisible_(video.element, ratio)) {
      return false;
    }
    this.undock_(video);
    return true;
  }

  /**
   * @param  {!VideoOrBaseElementDef} video
   * @return {boolean}
   */
  ignoreDueToNotPlayingManually_(video) {
    return !this.currentlyDocked_ &&
        this.manager_.getPlayingState(video) != PlayingStates.PLAYING_MANUAL;
  }

  /**
   * @param  {!VideoOrBaseElementDef} video
   * @return {boolean}
   */
  ignoreDueToDocked_(video) {
    return !!this.currentlyDocked_ && !this.isCurrentlyDocked_(video);
  }

  /**
   * @param  {!VideoOrBaseElementDef} video
   * @return {boolean}
   */
  ignoreDueToSize_(video) {
    const {width, height} = video.getLayoutBox();
    const aspectRatio = width / height;
    if (aspectRatio < 1) { // ignore portrait
      return true;
    }
    if (this.getAreaWidth_() < MIN_VIEWPORT_WIDTH) {
      return true;
    }
    return false;
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
   * @param {!VideoOrBaseElementDef} video
   * @return {?RelativeY}
   * @private
   */
  maybeGetRelativeY_(video) {
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
   * @return {boolean}
   * @private
   */
  isPlaying_() {
    const video = this.getDockedVideo_();
    return this.manager_.getPlayingState(video) != PlayingStates.PAUSED;
  }

  /** @private */
  dismiss_(dirX = 0, dirY = 0) {
    // TODO(alanorozco): Docking can no longer happen, so clean up.
    const video = this.getDockedVideo_();
    const {posY} = this.currentlyDocked_;
    video.pause();
    this.lastDismissed_ = video;
    this.lastDismissedPosY_ = posY;
    this.undock_(video, dirX, dirY);
  }

  /**
   * @return {boolean}
   * @private
   */
  currentPositionMatchesScroll_() {
    if (!this.currentlyDocked_) {
      return false;
    }
    return this.positionMatchesScroll_(this.currentlyDocked_.posY);
  }

  /**
   * @param {!RelativeY} posY
   * @return {boolean}
   * @private
   */
  positionMatchesScroll_(posY) {
    const direction = this.scrollDirection_;
    return (
      posY == RelativeY.TOP && direction == Direction.UP ||
      posY == RelativeY.BOTTOM && direction == Direction.DOWN);
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {!RelativeX} posX
   * @param {!RelativeY} posY
   * @param {boolean=} finalize
   * @private
   */
  dock_(video, posX, posY, finalize = false) {
    const {element} = video;

    if (this.ignoreDueToTransitionEnd_() ||
        this.ignoreDueToDismissal_(video)) {
      return;
    }

    const step = this.calculateStep_(element, finalize);

    const {x, y, scale} = this.getDims_(video, posX, posY, step);

    video.hideControls();

    this.placeAt_(video, x, y, scale, step);

    this.setCurrentlyDocked_(video, posX, posY, step);

    this.getDockingTimeout_().trigger(DOCKING_TIMEOUT, video);
  }

  /**
   * @param  {!VideoOrBaseElementDef} video
   * @return {boolean}
   * @private
   */
  ignoreDueToDismissal_(video) {
    if (this.lastDismissed_ != video || this.lastDismissedPosY_ !== null &&
        !this.positionMatchesScroll_(this.lastDismissedPosY_)) {
      return false;
    }
    if (!this.isVisible_(video.element, 0)) {
      this.resetDismissed_();
    }
    return true;
  }

  /** @private */
  resetDismissed_() {
    this.lastDismissed_ = null;
    this.lastDismissedPosY_ = null;
  }

  /**
   * Prevents jump when the transition was timed out before user finished
   * scrolling component out of view.
   * @return {boolean}
   */
  ignoreDueToTransitionEnd_() {
    return this.hasTransitionCompleted_(1 - FLOAT_TOLERANCE) &&
        this.currentPositionMatchesScroll_();
  }

  /**
   * @param {!AmpElement} element
   * @param {boolean=} finalize
   * @return {number}
   * @private
   */
  calculateStep_(element, finalize = false) {
    if (finalize || this.isScrollingQuickly_()) {
      return 1;
    }
    const {intersectionRatio} = element.getIntersectionChangeEntry();
    return (1 - intersectionRatio);
  }

  /**
   * @return {boolean}
   * @private
   */
  isScrollingQuickly_() {
    return this.lastScrollDelta_ > 100;
  }

  /**
   * @param {number} step
   * @return {number}
   */
  calculateTransitionDuration_(step) {
    const maxAutoTransitionDurationMs = 800;
    if (!this.currentlyDocked_) {
      // Don't animate first frame. Browsers sometimes behave weirdly and use
      // a stale transform value, thus causing it to visually jump.
      return 0;
    }
    const remaining = Math.abs(step - this.currentlyDocked_.step);
    return remaining * maxAutoTransitionDurationMs;
  }

  alreadyPlacedAt_(x, y, scale) {
    return this.placedAt_ &&
        this.placedAt_.x == x &&
        this.placedAt_.y == y &&
        this.placedAt_.scale == scale;
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {number} x
   * @param {number} y
   * @param {number} scale
   * @param {number} step in [0..1]
   * @private
   */
  placeAt_(video, x, y, scale, step, optTransitionDurationMs = null) {
    if (this.alreadyPlacedAt_(x, y, scale)) {
      return;
    }

    const transitionDurationMs = optTransitionDurationMs ?
      dev().assertNumber(optTransitionDurationMs) :
      this.calculateTransitionDuration_(step);

    const {width, height} = video.getLayoutBox();

    this.placedAt_ = {x, y, scale};

    const transitionTiming =
        // Auto-transitions are supposed to smooth-out PositionObserver
        // frequency, so it makes sense to use 'linear'. When the transition
        // duration is otherwise set, 'ease-out' looks much nicer.
        transitionDurationMs > 100 ? 'ease-out' : 'linear';

    const positioningStyles = {
      'width': px(width),
      'height': px(height),
      'transform': transform(x, y, scale),
      'transition-duration': `${transitionDurationMs}ms`,
      'transition-timing-function': transitionTiming,
    };

    const internalElement = getInternalElementFor(video.element);
    const shadowLayer = this.getShadowLayer_();
    const overlay = this.getOverlay_();
    const controls = this.getControls_().container;

    video.mutateElement(() => {
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
   * @param {!VideoOrBaseElementDef} video
   * @return {boolean}
   */
  isCurrentlyDocked_(video) {
    return !!this.currentlyDocked_ && this.currentlyDocked_.video == video;
  }

  /**
   * @param {!VideoOrBaseElementDef} video
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
    this.stickyControls_ = false;
    swap(playButton, pauseButton);
  }

  /** @private */
  onPause_() {
    const {pauseButton, playButton} = this.getControls_();
    this.stickyControls_ = true;
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
   * @param {!VideoOrBaseElementDef} video
   * @private
   */
  onDockingTimeout_(video) {
    if (this.ignoreDueToDocked_(video) ||
        this.undockBecauseVisible_(video, REVERT_TO_INLINE_RATIO) ||
        !this.currentlyDocked_) {
      return;
    }

    const currentlyDocked = dev().assert(this.currentlyDocked_);
    const {posX, posY} = currentlyDocked;

    this.dock_(video, posX, posY, /* finalize */ true);
  }

  /**
   * @param {!AmpElement} element
   * @param {number=} minRatio
   * @return {boolean}
   */
  isVisible_(element, minRatio = 1) {
    const {intersectionRatio} = element.getIntersectionChangeEntry();
    return intersectionRatio > (minRatio - FLOAT_TOLERANCE);
  }

  /**
   * @return {boolean}
   * @private
   */
  hasTransitionCompleted_(amount = 1) {
    return !!this.currentlyDocked_ && this.currentlyDocked_.step >= amount;
  }

  /**
   * @param {!MouseEvent|!TouchEvent} e
   * @private
   */
  drag_(e) {
    if (!this.currentlyDocked_) {
      return;
    }

    // Don't allow dragging videos that are too early in their transition phase.
    // This allows the user to keep scrolling while touching the inline/almost
    // inline video area.
    if (!this.hasTransitionCompleted_(0.75)) {
      return;
    }

    const {x, y} = pointerCoords(e);

    const offset = {x: 0, y: 0};

    const onDragMove = e => this.onDragMove_(e, x, y, offset);
    const onDragEnd = () => this.onDragEnd_(unlisteners, offset);

    const root = this.ampdoc_.getRootNode();
    const unlisteners = [
      listen(root, 'touchmove', onDragMove),
      listen(root, 'mousemove', onDragMove),
      listenOnce(root, 'touchend', onDragEnd),
      listenOnce(root, 'mouseup', onDragEnd),
    ];

    this.viewport_.disableScroll();
  }

  /**
   * @param {!MouseEvent|!TouchEvent} e
   * @param {number} startX
   * @param {number} startY
   * @param {{x: number, y: number}} offset
   * @private
   */
  onDragMove_(e, startX, startY, offset) {
    const {x, y} = pointerCoords(e);
    offset.x = x - startX;
    offset.y = y - startY;
    this.offset_(offset.x, offset.y);
  }

  /**
   * @param {!Array<!UnlistenDef>} unlisteners
   * @param {{x: number, y: number}} offset
   * @private
   */
  onDragEnd_(unlisteners, offset) {
    unlisteners.forEach(unlisten => unlisten.call());

    this.viewport_.resetScroll();

    if (this.dismissOnDragEnd_(offset.x, offset.y)) {
      return;
    }
    this.snapToCorner_(offset.x, offset.y);
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
    const {width, height} = video.getLayoutBox();
    const {x, y, scale} = this.getDims_(video, posX, posY, step);

    const centerX = x + offsetX + (width * scale / 2);
    const centerY = y + offsetY + (height * scale / 2);

    return {centerX, centerY};
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

    this.placeAt_(video, x, y, scale, step, /* optTransitionDurationMs */ 200);

    return false;
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {!RelativeX} posX
   * @param {!RelativeY} posY
   * @return {{x: number, y: number, targetWidth: number, targetHeight: number}}
   */
  getTargetArea_(video, posX, posY) {
    const {width, height} = video.getLayoutBox();
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
   * @param {!VideoOrBaseElementDef} video
   * @param {!RelativeX} posX
   * @param {!RelativeY} posY
   * @param {number} step in [0..1]
   * @return {{x: number, y: number, scale: number}}
   */
  getDims_(video, posX, posY, step) {
    const {left, width, height} = video.getLayoutBox();
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
   * @param {!VideoOrBaseElementDef} video
   * @private
   */
  undock_(video, dismissDirX = 0, dismissDirY = 0) {
    const internalElement = getInternalElementFor(video.element);
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
   * @param {!VideoOrBaseElementDef} video
   * @private
   */
  resetUndocked_(video) {
    const internalElement = getInternalElementFor(video.element);

    video.mutateElement(() => {
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
  hideControls_(respectSticky = false) {
    if (respectSticky && this.stickyControls_) {
      return;
    }
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
}
