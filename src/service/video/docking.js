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
import {ActionTrust} from '../../action-constants';
import {
  PlayingStates,
  VideoAttributes,
  VideoEvents,
} from '../../video-interface';
import {
  PositionObserver, // eslint-disable-line no-unused-vars
  installPositionObserverServiceForDoc,
} from '../position-observer/position-observer-impl';
import {
  PositionObserverFidelity,
} from '../position-observer/position-observer-worker';
import {Services} from '../../services';
import {closestBySelector, isRTL, removeElement} from '../../dom';
import {createCustomEvent, listen, listenOnce} from '../../event-helper';
// Source for this constant is css/video-docking.css:
import {cssText} from '../../../build/video-docking.css.js';
import {dev, user} from '../../log';
import {dict} from '../../utils/object';
import {getInternalVideoElementFor} from '../../utils/video';
import {getServiceForDoc} from '../../service';
import {htmlFor, htmlRefs} from '../../static-template';
import {installStylesForDoc} from '../../style-installer';
import {isFiniteNumber} from '../../types';
import {mapRange} from '../../utils/math';
import {moveLayoutRect} from '../../layout-rect';
import {once} from '../../utils/function';
import {
  px,
  resetStyles,
  setImportantStyles,
  toggle,
  translate,
} from '../../style';


/** @private @const {number} */
const MARGIN_MAX = 30;

/** @private {number} */
const MARGIN_AREA_WIDTH_PERC = 0.04;

/** @private @const {number} */
const MIN_WIDTH = 180;

/** @private @const {number} */
const MIN_VIEWPORT_WIDTH = 320;

/** @private @const {number} */
const DOCKING_TIMEOUT = 200;

/** @private @const {number} */
const CONTROLS_TIMEOUT = 1600;

/** @private @const {number} */
const CONTROLS_TIMEOUT_AFTER_IX = 1000;

/** @private @const {number} */
const FLOAT_TOLERANCE = 0.02;

/** @private @const {string} */
const BASE_CLASS_NAME = 'i-amphtml-video-docked';

/** @private @const {number} */
const REVERT_TO_INLINE_RATIO = 0.7;

/** @enum */
export const RelativeX = {LEFT: 0, RIGHT: 1};

/** @enum */
export const RelativeY = {TOP: 0, BOTTOM: 1};

/** @enum */
export const Direction = {UP: 1, DOWN: -1};

/** @enum {string} */
export const Actions = {DOCK: 'dock', UNDOCK: 'undock'};


/**
 * @struct @typedef {{
 *   video: !../../video-interface.VideoOrBaseElementDef,
 *   target: !DockTargetDef,
 *   step: number,
 *   triggeredDock: boolean,
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
 *   dismissContainer: !Element,
 * }}
 */
let ControlsDef;


/** @typedef {{posX: !RelativeX, posY: !RelativeY}|!Element} */
let DockTargetDef;

/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   targetWidth: number,
 *   targetHeight: number,
 *   initialY: number
 * }}
 */
let TargetAreaDef;


/**
 * @param {number} x
 * @param {number} y
 * @param {number} scale
 * @return {string}
 */
const transform = (x, y, scale) => `translate(${x}px, ${y}px) scale(${scale})`;


/**
 * @param {!Element} a
 * @param {!Element} b
 * @private
 */
function swap(a, b) {
  toggle(a, false);
  toggle(b, true);
}


/**
 * @param {!Window} win
 * @param {function(...*)} fn
 * @return {function(...*)}
 */
function throttleByAnimationFrame(win, fn) {
  let running = false;
  return (...args) => {
    if (running) {
      return;
    }
    running = true;
    win.requestAnimationFrame(() => {
      fn.apply(null, args);
      running = false;
    });
  };
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
 * @param {!Element} element
 * @restricted
 */
function complainAboutPortrait(element) {
  // Constant named `TAG` per lint rules.
  const TAG = element.tagName.toUpperCase();
  const attr = VideoAttributes.DOCK;
  user().error(TAG,
      `Minimize-to-corner (\`${attr}\`) does not support portrait video.`,
      element);
}


// Function should ideally be in `dom.js`, but moving it causes a bunch of ads
// tests to fail, for some reason.
// TODO(alanorozco): Move.
/**
 * @param {!Object} obj
 * @return {boolean}
 */
export function isElement(obj) {
  return obj.nodeType == /* ELEMENT */ 1;
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
      this.id_ = null;
    }
  }

  /** @return {boolean} */
  isWaiting() {
    return this.id_ !== null;
  }
}


/**
 * Manages docking (a.k.a. minimize to corner) for videos that satisfy the
 * {@see ../../video-interface.VideoInterface}.
 */
export class VideoDocking {

  /**
   * @param {!../ampdoc-impl.AmpDoc} ampdoc
   * @param {!../video-service-interface.VideoServiceInterface} manager
   */
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
    this.getDockingTimeout_ = this.lazyTimeout_(video =>
      this.onDockingTimeout_(
          /** @type {!../../video-interface.VideoOrBaseElementDef} */ (video)));

    /** @private @const {function():!Timeout} */
    this.getHideControlsTimeout_ = this.lazyTimeout_(() =>
      this.hideControls_(/* respectSticky */ true));

    /** @private @const {function():!Timeout} */
    this.getUndockingTimeout_ = this.lazyTimeout_(video =>
      this.undock_(
          /** @type {!../../video-interface.VideoOrBaseElementDef} */ (video)));

    /** @private {!RelativeX} */
    // Overriden when user drags the video to a corner.
    // Y-corner is determined based on scroll direction.
    this.preferredCornerX_ =
        isRTL(this.getDoc_()) ? RelativeX.LEFT : RelativeX.RIGHT;

    /**
     * Returns an element representing a shadow under the docked video.
     * Alternatively, we could use box-shadow on the video element, but in
     * order to animate it without jank we have to use an opacity transition.
     * A separate layer also has the 1d benefit that authors can override its
     * box-shadow value or any other styling without handling the transition
     * themselves.
     * @private @const {function():!Element}
     */
    this.getShadowLayer_ = once(() => this.append_(htmlFor(this.getDoc_())`
      <div class="amp-video-docked-shadow" hidden></div>`));

    /**
     * Returns an overlay to be used to capture different user events.
     * @private @const {function():!Element}
     */
    this.getOverlay_ = once(() => this.installOverlay_(htmlFor(this.getDoc_())`
      <div class="i-amphtml-video-docked-overlay" hidden></div>`));

    /** @private @const {function():!ControlsDef} */
    this.getControls_ = once(() => this.installControls_(
        // This currently bloats the resulting binary with
        // 1. some whitespace and 2. duplicate declarations of equal strings.
        // Upcoming fixes: #14657, #14658.
        // TODO(alanorozco): Cleanup markup for readability once fixes land.
        htmlFor(this.getDoc_())`
          <div class="amp-video-docked-controls" hidden>
            <div class="amp-video-docked-main-button-group">
              <div class="amp-video-docked-button-group">
                <div role="button" ref="playButton"
                    class="amp-video-docked-play"></div>
                <div role="button" ref="pauseButton"
                    class="amp-video-docked-pause"></div>
              </div>
              <div class="amp-video-docked-button-group">
                <div role="button" ref="muteButton"
                    class="amp-video-docked-mute"></div>
                <div role="button" ref="unmuteButton"
                    class="amp-video-docked-unmute">
                </div>
              </div>
              <div class="amp-video-docked-button-group">
                <div role="button" ref="fullscreenButton"
                    class="amp-video-docked-fullscreen">
                </div>
              </div>
            </div>
            <div class="amp-video-docked-button-dismiss-group"
                ref="dismissContainer">
              <div role="button" ref="dismissButton"
                  class="amp-video-docked-dismiss"></div>
            </div>
          </div>`));

    /** @private {?../../video-interface.VideoOrBaseElementDef} */
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

    /** @private {?{width: number, height: number}} */
    this.sizedAt_ = null;

    /** @private {?Direction} */
    this.scrollDirection_ = null;

    /** @private {number} */
    this.lastScrollTop_ = this.viewport_.getScrollTop();

    /** @private {boolean} */
    this.stickyControls_ = false;

    /** @private {boolean} */
    this.isDragging_ = false;

    /** @private {!Array<!../../video-interface.VideoOrBaseElementDef>} */
    this.observed_ = [];

    /** @private @const {!function()} */
    // Lazily invoked.
    this.install_ = once(() => {
      this.viewport_.onScroll(
          throttleByAnimationFrame(this.ampdoc_.win,
              () => this.updateScroll_()));

      this.viewport_.onResize(() => this.updateAllOnResize_());

      this.installStyles_();
    });

    /** @private @const {function():?Element} */
    this.getSlot_ = once(() => this.querySlot_());

    /** @private */
    this.hideControlsOnTapOutsideOnce_ =
        once(() => this.hideControlsOnTapOutside_());
  }

  /**
   * @return {?Element}
   * @private
   */
  querySlot_() {
    const root = this.ampdoc_.getRootNode();

    // For consistency always honor the dock attribute on the first el in page.
    const video = root.querySelector('[dock]');

    dev().assertElement(video);

    user().assert(video.signals().get(VideoEvents.REGISTERED),
        '`dock` attribute can only be set on video components.');

    const slotSelector = video.getAttribute('dock').trim();

    if (slotSelector == '') {
      return null;
    }

    const el = root.querySelector(slotSelector);

    if (el) {
      user().assert(el.tagName.toLowerCase() == 'amp-layout',
          'Dock slot must be an <amp-layout> element.');
    }

    return el;
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

  /**
   * @param {function(...*)} fn
   * @return {function():!Timeout}
   * @private
   */
  lazyTimeout_(fn) {
    return once(() => new Timeout(this.ampdoc_.win, fn));
  }

  /** @private */
  updateAllOnResize_() {
    this.observed_.forEach(video => this.updateOnResize_(video));
  }

  /** @param {!../../video-interface.VideoOrBaseElementDef} video */
  register(video) {
    this.install_();

    const {element} = video;
    const fidelity = PositionObserverFidelity.HIGH;
    this.getPositionObserver_().observe(element, fidelity,
        () => this.updateOnPositionChange_(video));
    this.observed_.push(video);
  }

  /** @private */
  updateScroll_() {
    const scrollTop = this.viewport_.getScrollTop();
    const scrollDirection = scrollTop > this.lastScrollTop_ ?
      Direction.UP :
      Direction.DOWN;
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
    this.append_(overlay);
    return this.showControlsOnTap_(this.addDragListeners_(overlay));
  }

  /** @private */
  enterFullscreen_() {
    const video = this.getDockedVideo_();
    video.fullscreenEnter();
  }

  /**
   * @param {!Element} element
   * @return {!Element}
   * @private
   */
  showControlsOnTap_(element) {
    listen(element, 'mouseup', () => {
      if (this.isDragging_) {
        return;
      }
      const video = this.getDockedVideo_();
      const {
        container,
        playButton,
        pauseButton,
        muteButton,
        unmuteButton,
      } = this.getControls_();
      const overlay = this.getOverlay_();

      toggle(container, true);
      container.classList.add('amp-video-docked-controls-shown');
      overlay.classList.add('amp-video-docked-controls-bg');

      if (this.isPlaying_()) {
        swap(playButton, pauseButton);
      } else {
        swap(pauseButton, playButton);
      }

      if (this.manager_.isMuted(
          /** @type {!../../video-interface.VideoInterface} */ (video))) {
        swap(muteButton, unmuteButton);
      } else {
        swap(unmuteButton, muteButton);
      }

      this.hideControlsOnTimeout_();
    });
    return element;
  }

  /** @private */
  hideControlsOnTapOutside_() {
    listen(this.ampdoc_.getRootNode(), 'mousedown', e => {
      if (!this.currentlyDocked_) {
        return;
      }
      if (this.isControlsEventTarget_(dev().assertElement(e.target))) {
        return;
      }
      this.hideControls_(/* respectSticky */ true);
    });
  }

  /**
   * @param {!Element} element
   * @return {!Element}
   * @private
   */
  addDragListeners_(element) {
    const handler = e => this.drag_(/** @type {!TouchEvent} */(e));

    listen(element, 'touchstart', handler);
    listen(element, 'mousedown', handler);

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

    this.listenWhenNotDragging_(dismissButton, 'click', () => {
      this.dismissOnTap_();
    });

    this.listenWhenNotDragging_(playButton, 'click', () => {
      this.getDockedVideo_().play(/* auto */ false);
    });

    this.listenWhenNotDragging_(pauseButton, 'click', () => {
      this.getDockedVideo_().pause();
    });

    this.listenWhenNotDragging_(muteButton, 'click', () => {
      this.getDockedVideo_().mute();
    });

    this.listenWhenNotDragging_(unmuteButton, 'click', () => {
      this.getDockedVideo_().unmute();
    });

    this.listenWhenNotDragging_(fullscreenButton, 'click', () => {
      this.enterFullscreen_();
    });

    listen(container, 'mouseup', () =>
      this.hideControlsOnTimeout_(CONTROLS_TIMEOUT_AFTER_IX));

    this.addDragListeners_(container);
    this.append_(container);

    return /** @type {!ControlsDef} */ (controls);
  }

  /**
   * @param {!Element} element
   * @param {string} eventType
   * @param {function(!Event)} handler
   */
  listenWhenNotDragging_(element, eventType, handler) {
    listen(element, eventType, e => {
      if (this.isDragging_) {
        return;
      }
      handler(e);
    });
  }

  /** @private */
  dismissOnTap_() {
    this.undock_(this.getDockedVideo_());
  }

  /**
   * @return {!../../video-interface.VideoOrBaseElementDef}
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
   * Reconciles the state of a docked or potentially dockable video when
   * the viewport/position changes.
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @return {?DockTargetDef}
   * @private
   */
  getTargetFor_(video) {
    if (this.isDragging_ ||
        this.ignoreDueToSize_(video) ||
        this.ignoreBecauseAnotherDocked_(video) ||
        this.ignoreDueToNotPlayingManually_(video) ||
        this.undockBecauseVisible_(video)) {
      return null;
    }
    if (this.canUpdateFromSlot_(video)) {
      return this.getSlot_();
    }
    const posY = this.maybeGetRelativeY_(video);
    if (posY === null) {
      return posY;
    }
    return {posY, posX: this.getRelativeX_()};
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @return {boolean}
   * @private
   */
  canUpdateFromSlot_(video) {
    if (!this.slotHasDimensions_()) {
      return false;
    }
    const relativeY = this.getSlotRelativeY_();
    const {element} = video;
    const {top, bottom} = element.getIntersectionChangeEntry().intersectionRect;
    const {top: slotTop, height: slotHeight} = this.getFixedSlotLayoutBox_();
    const slotBottom = this.viewport_.getSize().height - slotHeight - slotTop;
    if (relativeY == RelativeY.TOP) {
      return top <= slotTop;
    }
    return bottom >= slotBottom;
  }

  /**
   * @return {!../../layout-rect.LayoutRectDef}
   * @private
   */
  getFixedSlotLayoutBox_() {
    const rect = dev().assertElement(this.getSlot_()).getLayoutBox();
    const dy = -this.viewport_.getScrollTop();
    return moveLayoutRect(rect, /* dx */ 0, dy);
  }

  /**
   * @return {boolean}
   * @private
   */
  slotHasDimensions_() {
    const el = this.getSlot_();
    if (!el) {
      return false;
    }
    const {width, height} = this.getFixedSlotLayoutBox_();
    return width > 0 && height > 0;
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @private
   */
  updateOnResize_(video) {
    const target = this.getTargetFor_(video);
    if (!target) {
      return;
    }
    this.dock_(video, target);
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @private
   */
  updateOnPositionChange_(video) {
    const target = this.getTargetFor_(video);
    if (!target) {
      return;
    }
    this.dockOnPositionChange_(video, target);
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @param {number=} ratio
   * @param {number=} timeout
   * @return {boolean}
   */
  undockBecauseVisible_(video, ratio = 1, timeout = 40) {
    const {element} = video;
    if (this.currentlyDocked_ && this.isVisible_(element, ratio)) {
      if (!this.getUndockingTimeout_().isWaiting()) {
        this.getUndockingTimeout_().trigger(timeout, video);
      }
      return true;
    }
    this.getUndockingTimeout_().cancel();
    return false;
  }

  /**
   * @param  {!../../video-interface.VideoOrBaseElementDef} video
   * @return {boolean}
   */
  ignoreDueToNotPlayingManually_(video) {
    return !this.currentlyDocked_ && !this.isPlaying_(video);
  }

  /**
   * @param  {!../../video-interface.VideoOrBaseElementDef} video
   * @return {boolean}
   */
  ignoreBecauseAnotherDocked_(video) {
    return !!this.currentlyDocked_ && !this.isCurrentlyDocked_(video);
  }

  /**
   * @param  {!../../video-interface.VideoOrBaseElementDef} video
   * @return {boolean}
   */
  ignoreDueToSize_(video) {
    const {width, height} = video.getLayoutBox();
    if ((width / height) < 1) {
      complainAboutPortrait(video.element);
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
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @return {?RelativeY}
   * @private
   */
  maybeGetRelativeY_(video) {
    if (this.slotHasDimensions_()) {
      return null;
    }
    if (this.isCurrentlyDocked_(video)) {
      const {posY} = dev().assert(this.currentlyDocked_).target;
      return /** @type {!RelativeY} */ (dev().assertNumber(posY));
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
   * @param {?../../video-interface.VideoOrBaseElementDef} optVideo
   * @return {boolean}
   * @private
   */
  isPlaying_(optVideo = null) {
    const video = /** @type {!../../video-interface.VideoInterface} */ (
      optVideo || this.getDockedVideo_());
    return this.manager_.getPlayingState(video) == PlayingStates.PLAYING_MANUAL;
  }

  /**
   * @param {number} dirX
   * @param {number} dirY
   * @private
   */
  dismiss_(dirX = 0, dirY = 0) {
    const video = this.getDockedVideo_();
    const {posY} = this.currentlyDocked_.target;
    video.pause();
    this.lastDismissed_ = video;
    this.lastDismissedPosY_ = posY || null;
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
    if (this.isDockedToSlot_()) {
      return this.positionMatchesScroll_(this.getSlotRelativeY_());
    }
    if (this.currentlyDocked_.target.posY == null) {
      return false;
    }
    return this.positionMatchesScroll_(this.currentlyDocked_.target.posY);
  }

  /**
   * @return {!RelativeY}
   * @private
   */
  getSlotRelativeY_() {
    const {top, height} = this.getFixedSlotLayoutBox_();
    const vh = this.viewport_.getSize().height;
    const bottom = vh - height - top;
    return bottom > top ? RelativeY.TOP : RelativeY.BOTTOM;
  }

  /**
   * @param {!RelativeY} posY
   * @return {boolean}
   * @private
   */
  positionMatchesScroll_(posY) {
    const direction = this.scrollDirection_;
    return (
      (posY == RelativeY.TOP && direction == Direction.UP) ||
      (posY == RelativeY.BOTTOM && direction == Direction.DOWN));
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @private
   */
  dockOnPositionChange_(video, target) {
    if (this.ignoreDueToDismissal_(video)) {
      return;
    }

    const step = this.calculateStep_(video.element, target);
    if (this.ignoreDueToTransitionEnd_(step)) {
      return;
    }

    this.dock_(video, target, step);

    this.getDockingTimeout_().trigger(DOCKING_TIMEOUT, video);
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @param {?number=} opt_step
   * @private
   */
  dock_(video, target, opt_step = null) {
    const step =
      isFiniteNumber(opt_step) ?
        dev().assertNumber(opt_step) :
        this.calculateStep_(video.element, target);

    if (step < 0.01) {
      return;
    }

    if (step >= REVERT_TO_INLINE_RATIO &&
        this.currentlyDocked_ &&
        !this.currentlyDocked_.triggeredDock) {
      this.trigger_(video, Actions.DOCK);
      this.currentlyDocked_.triggeredDock = true;
    }

    // Component background is now visible, so hide the poster for the Android
    // workaround so authors can style the component container as they like.
    // (see `AmpVideo#createPosterForAndroidBug_`).
    this.removePosterForAndroidBug_(video.element);

    const {x, y, scale} = this.getDims_(video, target, step);
    video.hideControls();
    this.placeAt_(video, x, y, scale, step);
    this.setCurrentlyDocked_(video, target, step);
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @param {!Actions} action
   * @private
   */
  trigger_(video, action) {
    const trust = ActionTrust.LOW;
    const event = createCustomEvent(this.ampdoc_.win,
        /** @type {string} */ (action), /* detail */ dict({}));
    const actions = Services.actionServiceForDoc(this.ampdoc_);
    actions.trigger(video.element, action, event, trust);
  }

  /**
   * @param  {!../../video-interface.VideoOrBaseElementDef} video
   * @return {boolean}
   * @private
   */
  ignoreDueToDismissal_(video) {
    if (this.lastDismissed_ != video) {
      return false;
    }
    if (this.lastDismissedPosY_ !== null &&
        !this.positionMatchesScroll_(this.lastDismissedPosY_)) {
      return false;
    }
    if (this.isVisible_(video.element, FLOAT_TOLERANCE)) {
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
   * @param {number} step
   * @return {boolean}
   */
  ignoreDueToTransitionEnd_(step) {
    return this.hasTransitionCompleted_(step) &&
        this.currentPositionMatchesScroll_();
  }

  /**
   * @param {!AmpElement} element
   * @param {!DockTargetDef} target
   * @return {number}
   * @private
   */
  calculateStep_(element, target) {
    // Aggressively reduce ratio to prevent covering vertical space.
    const ratio = this.calculateIntersectionRatio_(element, target);
    return 1 - Math.pow(ratio, 3);
  }

  /**
   * @param {!AmpElement} element
   * @param {?DockTargetDef=} target
   * @return {number}
   * @private
   */
  calculateIntersectionRatio_(element, target = null) {
    if (target == null || !isElement(target)) {
      return element.getIntersectionChangeEntry().intersectionRatio;
    }

    const {top, bottom, height} = element.getLayoutBox();
    const {top: slotTop, bottom: slotBottom} = this.getSlot_().getLayoutBox();

    if (this.getSlotRelativeY_() == RelativeY.TOP) {
      return (bottom - Math.max(top, slotTop)) / height;
    } else {
      return (slotBottom - top) / height;
    }
  }

  /**
   * @param {number} step
   * @return {number}
   */
  calculateTransitionDuration_(step) {
    const maxAutoTransitionDurationMs = 500;
    if (!this.currentlyDocked_) {
      // Don't animate first frame. Browsers sometimes behave weirdly and use
      // a stale transform value, thus causing it to visually jump.
      return 0;
    }
    const remaining = Math.abs(step - this.currentlyDocked_.step);
    return remaining * maxAutoTransitionDurationMs;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} scale
   * @return {boolean}
   */
  alreadyPlacedAt_(x, y, scale) {
    return !!this.placedAt_ &&
        this.placedAt_.x == x &&
        this.placedAt_.y == y &&
        this.placedAt_.scale == scale;
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @param {number} x
   * @param {number} y
   * @param {number} scale
   * @param {number} step in [0..1]
   * @param {?number} optTransitionDurationMs
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
        // duration is otherwise larger, 'ease-in' looks much nicer.
        transitionDurationMs > 200 ? 'ease-in' : 'linear';

    const internalElement = getInternalVideoElementFor(video.element);
    const shadowLayer = this.getShadowLayer_();
    const overlay = this.getOverlay_();
    const {
      container: controls,
      dismissContainer,
    } = this.getControls_();

    video.mutateElement(() => {
      internalElement.classList.add(BASE_CLASS_NAME);
      toggle(shadowLayer, true);
      toggle(overlay, true);
      const els = [internalElement, shadowLayer, overlay];
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        setImportantStyles(el, {
          'transform': transform(x, y, scale),
          'transition-duration': `${transitionDurationMs}ms`,
          'transition-timing-function': transitionTiming,
        });
        if (this.boxNeedsSizing_(width, height)) {
          // Setting explicit dimensions is needed to match the video's aspect
          // ratio. However, we only do this once to prevent jank in subsequent
          // frames.
          setImportantStyles(el, {
            'width': px(width),
            'height': px(height),
          });
        }
      }
      setImportantStyles(shadowLayer, {
        'opacity': step,
      });
      const halfScale = scale / 2;
      const centerX = x + (width * halfScale);
      const centerY = y + (height * halfScale);
      setImportantStyles(controls, {
        'transform': translate(centerX, centerY),
      });
      const dismissMargin = 8;
      const dismissWidth = 40;
      const dismissX = width * halfScale - dismissMargin - dismissWidth;
      const dismissY = -(height * halfScale - dismissMargin - dismissWidth);
      setImportantStyles(dismissContainer, {
        'transform': translate(dismissX, dismissY),
      });
    });
  }

  /**
   * @param  {number} width
   * @param  {number} height
   * @return {boolean}
   * @private
   */
  boxNeedsSizing_(width, height) {
    const needsSizing =
        !this.sizedAt_ ||
        this.sizedAt_.width != width ||
        this.sizedAt_.height != height;
    if (needsSizing) {
      this.sizedAt_ = {width, height};
    }
    return needsSizing;
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @return {boolean}
   */
  isCurrentlyDocked_(video) {
    return !!this.currentlyDocked_ && this.currentlyDocked_.video == video;
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @param {number} step
   */
  setCurrentlyDocked_(video, target, step) {
    if (!this.isCurrentlyDocked_(video)) {
      this.updateControlsBasedOn_(video.element);
    }

    const {triggeredDock} = this.currentlyDocked_ || {triggeredDock: false};
    this.currentlyDocked_ = {video, target, step, triggeredDock};

    this.hideControlsOnTapOutsideOnce_();
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
    const {target} = this.currentlyDocked_;

    const step = 1;

    const {x, y, scale} = this.getDims_(video, target, step);
    this.placeAt_(video, x + offsetX, y + offsetY, scale, step,
        /* transitionDurationMs */ 0);
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @private
   */
  onDockingTimeout_(video) {
    if (this.isDragging_ ||
        this.ignoreBecauseAnotherDocked_(video) ||
        !this.currentlyDocked_ ||
        (!this.currentPositionMatchesScroll_() &&
            this.undockBecauseVisible_(
                video, REVERT_TO_INLINE_RATIO, /* timeout */ 50))) {
      return;
    }
    const {target} = dev().assert(this.currentlyDocked_);
    this.dock_(video, target, /* step */ 1);
  }

  /**
   * @param {!AmpElement} element
   * @param {number=} minRatio
   * @return {boolean}
   */
  isVisible_(element, minRatio = 1) {
    const target = this.slotHasDimensions_() ? this.getSlot_() : null;
    const intersectionRatio = this.calculateIntersectionRatio_(element, target);
    return intersectionRatio > (minRatio - FLOAT_TOLERANCE);
  }

  /**
   * @param {number} amount
   * @return {boolean}
   * @private
   */
  hasTransitionCompleted_(amount = 1) {
    return !!this.currentlyDocked_ &&
        this.currentlyDocked_.step >= (amount - FLOAT_TOLERANCE);
  }

  /**
   * @param {!MouseEvent|!TouchEvent} e
   * @private
   */
  drag_(e) {
    if (!this.currentlyDocked_) {
      return;
    }

    if (this.isDockedToSlot_()) {
      return;
    }

    // Don't allow dragging videos that are too early in their transition phase.
    // This allows the user to keep scrolling while touching the inline/almost
    // inline video area.
    if (!this.hasTransitionCompleted_(0.75)) {
      return;
    }

    const {x: initialX, y: initialY} = pointerCoords(e);

    const offset = {x: 0, y: 0};
    const {posX: currentPosX, posY: currentPosY} = this.currentlyDocked_.target;

    const onDragMove = throttleByAnimationFrame(this.ampdoc_.win,
        e => this.onDragMove_(
            /** @type {!TouchEvent|!MouseEvent} */ (e),
            currentPosX, currentPosY, initialX, initialY, offset));

    const onDragEnd = () => this.onDragEnd_(unlisteners, offset);

    const root = this.ampdoc_.getRootNode();
    const unlisteners = [
      this.disableScroll_(),
      this.disableUserSelect_(),
      this.workaroundWebkitDragAndScrollIssue_(),
      listen(root, 'touchmove', onDragMove),
      listen(root, 'mousemove', onDragMove),
      listenOnce(root, 'touchend', onDragEnd),
      listenOnce(root, 'mouseup', onDragEnd),
    ];
  }

  /**
   * @return {boolean}
   * @private
   */
  isDockedToSlot_() {
    if (!this.currentlyDocked_) {
      return false;
    }
    return isElement(this.currentlyDocked_.target);
  }

  /**
   * @return {!UnlistenDef}
   * @private
   */
  disableUserSelect_() {
    const docEl = dev().assertElement(this.getDoc_().documentElement);
    const disabledClassName = 'i-amphtml-select-disabled';
    docEl.classList.add(disabledClassName);
    return () => docEl.classList.remove(disabledClassName);
  }

  /**
   * @return {!UnlistenDef}
   * @private
   */
  disableScroll_() {
    this.viewport_.disableScroll();
    return this.viewport_.resetScroll.bind(this.viewport_);
  }

  /**
   * @param {!MouseEvent|!TouchEvent} e
   * @param {!RelativeX} startPosX
   * @param {!RelativeY} startPosY
   * @param {number} startX
   * @param {number} startY
   * @param {{x: number, y: number}} offset
   * @private
   */
  onDragMove_(e, startPosX, startPosY, startX, startY, offset) {
    const {posX, posY} = this.currentlyDocked_.target;
    if (posX !== startPosX || posY !== startPosY) {
      // stale event
      return;
    }

    const {x, y} = pointerCoords(e);
    offset.x = x - startX;
    offset.y = y - startY;

    // Prevents dragging misfires.
    const offsetDist = Math.sqrt(Math.pow(offset.x, 2) + Math.pow(offset.y, 2));
    if (offsetDist <= 10) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    this.hideControls_();
    this.isDragging_ = true;
    this.offset_(offset.x, offset.y);
    this.updateDismissalAreaStyling_(offset.x, offset.y);
  }

  /**
   * @param {number} offsetX
   * @param {number} offsetY
   * @private
   */
  updateDismissalAreaStyling_(offsetX, offsetY) {
    const video = this.getDockedVideo_();
    const {element} = video;
    const internalElement = getInternalVideoElementFor(element);
    const inDismissalArea = this.inDismissalArea_(offsetX, offsetY);

    video.mutateElement(() => {
      const className = 'amp-video-docked-almost-dismissed';
      internalElement.classList.toggle(className, inDismissalArea);
      this.getOverlay_().classList.toggle(className, inDismissalArea);
    });
  }

  /**
   * Works around https://bugs.webkit.org/show_bug.cgi?id=184250
   * @return {!UnlistenDef}
   * @private
   */
  workaroundWebkitDragAndScrollIssue_() {
    const {win} = this.ampdoc_;
    if (!Services.platformFor(win).isIos()) {
      return () => { /* NOOP */ };
    }
    const handler = e => e.preventDefault();
    win.addEventListener('touchmove', handler, {passive: false});
    return () => win.removeEventListener('touchmove', handler);
  }

  /**
   * @param {!Array<!UnlistenDef>} unlisteners
   * @param {{x: number, y: number}} offset
   * @private
   */
  onDragEnd_(unlisteners, offset) {
    unlisteners.forEach(unlisten => unlisten.call());

    this.isDragging_ = false;

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
    const inDimissalArea = this.inDismissalArea_(offsetX, offsetY);
    if (inDimissalArea) {
      this.dismiss_();
    }
    return inDimissalArea;
  }

  /**
   * @param {number} offsetX
   * @param {number} offsetY
   * @return {boolean}
   */
  inDismissalArea_(offsetX, offsetY) {
    // TODO: Use topEdge/bottomEdge
    const dismissToleranceFromCenterPx = 20;
    const {width: vw, height: vh} = this.viewport_.getSize();
    const {centerX, centerY} = this.getCenter_(offsetX, offsetY);
    return centerX >= (vw - dismissToleranceFromCenterPx) ||
        centerX <= dismissToleranceFromCenterPx ||
        centerY >= (vh - dismissToleranceFromCenterPx) ||
        centerY <= dismissToleranceFromCenterPx;
  }

  /**
   * Gets the center of the currently docked video, offset by (x, y).
   * @param {number} offsetX
   * @param {number} offsetY
   * @return {{centerX: number, centerY: number}}
   * @private
   */
  getCenter_(offsetX, offsetY) {
    const {target, step} = this.currentlyDocked_;
    const video = this.getDockedVideo_();
    const {width, height} = video.getLayoutBox();
    const {x, y, scale} = this.getDims_(video, target, step);

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

    const target = {
      posX: closestCornerX,
      posY: closestCornerY,
    };

    this.currentlyDocked_.target = target;

    this.preferredCornerX_ = closestCornerX;

    const {x, y, scale} = this.getDims_(video, target, step);

    this.placeAt_(video, x, y, scale, step, /* optTransitionDurationMs */ 200);
  }

  /**
   * @param {!Element} target
   * @return {boolean}
   * @private
   */
  isControlsEventTarget_(target) {
    return !!closestBySelector(target, '.amp-video-docked-controls');
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @return {!TargetAreaDef}
   * @private
   */
  getTargetArea_(video, target) {
    return isElement(target) ?
      this.getTargetAreaFromSlot_(video, dev().assertElement(target)) :
      this.getTargetAreaFromPos_(video, target.posX, target.posY);
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @param {!RelativeX} posX
   * @param {!RelativeY} posY
   * @return {!TargetAreaDef}
   * @private
   */
  getTargetAreaFromPos_(video, posX, posY) {
    const {width, height} = video.getLayoutBox();
    const margin = this.getMargin_();
    const aspectRatio = width / height;
    const targetWidth = Math.max(MIN_WIDTH, this.getAreaWidth_() * 0.3);
    const targetHeight = targetWidth / aspectRatio;

    const x =
      (posX == RelativeX.RIGHT ?
        this.getRightEdge_() - margin - targetWidth :
        this.getLeftEdge_() + margin);

    const y =
      (posY == RelativeY.TOP ?
        this.getTopEdge_() + margin :
        this.getBottomEdge_() - margin - targetHeight);

    const initialY = this.calculateInitialY_(
        posY, this.getTopEdge_(), this.getBottomEdge_(), height);

    return {x, y, targetWidth, targetHeight, initialY};
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @param {!AmpElement} slot
   * @return {!TargetAreaDef}
   * @private
   */
  getTargetAreaFromSlot_(video, slot) {
    const {
      width: naturalWidth,
      height: naturalHeight,
    } = video.getLayoutBox();

    const {
      width: slotWidth,
      height: slotHeight,
      left,
    } = slot.getLayoutBox();

    const {top, bottom} = this.getFixedSlotLayoutBox_();

    const slotAspect = slotWidth / slotHeight;
    const naturalAspect = naturalWidth / naturalHeight;

    let x, y, scale;

    if (naturalAspect > slotAspect) {
      scale = slotWidth / naturalWidth;
      y = top + (slotHeight / 2) - (naturalHeight * scale / 2);
      x = left;
    } else {
      scale = slotHeight / naturalHeight;
      x = left + (slotWidth / 2) - (naturalWidth * scale / 2);
      y = top;
    }

    const initialY = this.calculateInitialY_(
        this.getSlotRelativeY_(), top, bottom, naturalHeight);

    const targetWidth = naturalWidth * scale;
    const targetHeight = naturalHeight * scale;

    return {x, y, targetWidth, targetHeight, initialY};
  }

  /**
   * @param {!RelativeY} pos
   * @param {number} targetTop
   * @param {number} targetBottom
   * @param {number} naturalHeight
   * @return {number}
   */
  calculateInitialY_(pos, targetTop, targetBottom, naturalHeight) {
    return pos == RelativeY.TOP ? targetTop : targetBottom - naturalHeight;
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @param {number} step in [0..1]
   * @return {{x: number, y: number, scale: number}}
   */
  getDims_(video, target, step) {
    const {left, width} = video.getLayoutBox();
    const {x, y, targetWidth, initialY} = this.getTargetArea_(video, target);
    const currentX = mapStep(step, left, x);
    const currentWidth = mapStep(step, width, targetWidth);
    const currentY = mapStep(step, initialY, y);
    const scale = currentWidth / width;
    return {x: currentX, y: currentY, scale};
  }

  /**
   * @param {!../../video-interface.VideoOrBaseElementDef} video
   * @param {number=} unusedDismissDirX
   * @param {number=} unusedDismissDirY
   * @private
   */
  undock_(video, unusedDismissDirX = 0, unusedDismissDirY = 0) {
    // TODO(alanorozco): animate dismissal
    const internalElement = getInternalVideoElementFor(video.element);

    this.trigger_(video, Actions.UNDOCK);

    video.mutateElement(() => {
      this.hideControls_();
      video.showControls();
      this.placedAt_ = null;
      this.sizedAt_ = null;
      internalElement.classList.remove(BASE_CLASS_NAME);
      const shadowLayer = this.getShadowLayer_();
      const overlay = this.getOverlay_();
      const almostDismissed = 'amp-video-docked-almost-dismissed';
      internalElement.classList.remove(almostDismissed);
      overlay.classList.remove(almostDismissed);
      toggle(shadowLayer, false);
      toggle(overlay, false);
      const els = [internalElement, shadowLayer, overlay];
      for (let i = 0; i < els.length; i++) {
        resetStyles(els[i], [
          'transform',
          'transition',
          'width',
          'height',
          'opacity',
        ]);
      }
      this.currentlyDocked_ = null;
    });
  }

  /**
   * @param {boolean=} respectSticky
   * @private
   */
  hideControls_(respectSticky = false) {
    if (respectSticky && this.stickyControls_) {
      return;
    }
    const {container} = this.getControls_();
    const overlay = this.getOverlay_();
    overlay.classList.remove('amp-video-docked-controls-bg');
    container.classList.remove('amp-video-docked-controls-shown');
  }

  /**
   * @param {number=} time
   * @private
   */
  hideControlsOnTimeout_(time = CONTROLS_TIMEOUT) {
    this.getHideControlsTimeout_().trigger(time);
  }

  /**
   * @param {!Element} parent
   * @private
   */
  removePosterForAndroidBug_(parent) {
    const el = parent.querySelector('.i-amphtml-android-poster-bug');
    if (!el) {
      return;
    }
    removeElement(el);
  }
}
