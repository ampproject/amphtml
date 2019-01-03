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
import {CSS} from '../../../build/amp-video-docking-0.1.css';
import {Controls} from './controls';
import {HtmlLiteralTagDef} from './html';
import {
  PlayingStates,
  VideoAttributes,
  VideoEvents,
  isDockable,
} from '../../../src/video-interface';
import {
  PositionObserver, // eslint-disable-line no-unused-vars
  installPositionObserverServiceForDoc,
} from '../../../src/service/position-observer/position-observer-impl';
import {
  PositionObserverFidelity,
} from '../../../src/service/position-observer/position-observer-worker';
import {Services} from '../../../src/services';
import {VideoDockingEvents} from './events';
import {applyBreakpointClassname} from './breakpoints';
import {
  childElementByTag,
  escapeCssSelectorIdent,
  isRTL,
  removeElement,
} from '../../../src/dom';
import {
  createCustomEvent,
  listen,
  listenOnce,
} from '../../../src/event-helper';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getInternalVideoElementFor} from '../../../src/utils/video';
import {getServiceForDoc} from '../../../src/service';
import {htmlFor} from '../../../src/static-template';
import {installStylesForDoc} from '../../../src/style-installer';
import {isExperimentOn} from '../../../src/experiments';
import {isFiniteNumber} from '../../../src/types';
import {mapRange} from '../../../src/utils/math';
import {moveLayoutRect} from '../../../src/layout-rect';
import {once} from '../../../src/utils/function';
import {
  px,
  resetStyles,
  setImportantStyles,
  setStyles,
  toggle,
} from '../../../src/style';


const TAG = 'amp-video-docking';


/** @private @const {number} */
const MARGIN_MAX = 30;

/** @private {number} */
const MARGIN_AREA_WIDTH_PERC = 0.04;

/** @private @const {number} */
const MIN_WIDTH = 180;

/** @private @const {number} */
const MIN_VIEWPORT_WIDTH = 320;

/** @private @const {number} */
const FLOAT_TOLERANCE = 0.02;

/** @private @const {string} */
const BASE_CLASS_NAME = 'i-amphtml-video-docked';

/** @visibleForTesting @const {number} */
export const REVERT_TO_INLINE_RATIO = 0.7;

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
 *   video: !../../../src/video-interface.VideoOrBaseElementDef,
 *   target: !DockTargetDef,
 *   step: number,
 * }}
 */
let DockedDef;


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
  user().error(TAG,
      'Minimize-to-corner (`dock`) does not support portrait video.',
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


/**
 * @param {!HtmlLiteralTagDef} html
 * @return {!Element}
 * @private
 */
const ShadowLayer = html =>
  html`<div class="amp-video-docked-shadow" hidden></div>`;


/**
 * @param {!HtmlLiteralTagDef} html
 * @return {!Element}
 * @private
 */
const PlaceholderBackground = html =>
  // First child of root should be poster layer. See `setPosterImage_`.
  html`<div class="amp-video-docked-placeholder-background">
    <div class="amp-video-docked-placeholder-background-poster">
    </div>
    <div class="amp-video-docked-placeholder-icon"></div>
  </div>`;


/**
 * @private @const {!Array<!./breakpoints.SyntheticBreakpointDef>}
 */
const PLACEHOLDER_ICON_BREAKPOINTS = [
  {
    className: 'amp-small',
    minWidth: 0,
  },
  {
    className: 'amp-large',
    minWidth: 420,
  },
];


const PLACEHOLDER_ICON_LARGE_WIDTH = 48;
const PLACEHOLDER_ICON_LARGE_MARGIN = 40;

const PLACEHOLDER_ICON_SMALL_WIDTH = 32;
const PLACEHOLDER_ICON_SMALL_MARGIN = 20;


/**
 * @param {!Element} element
 * @return {!../../../src/layout-rect.LayoutRectDef}
 */
function getIntersectionRect(element) {
  return /** @type {!../../../src/layout-rect.LayoutRectDef} */ (
    element.getIntersectionChangeEntry().intersectionRect);
}


/**
 * @param {!../../../src/layout-rect.LayoutRectDef} rect
 * @return {boolean}
 */
function isSizedLayoutRect({width, height}) {
  return width > 0 && height > 0;
}


/**
 * Manages docking (a.k.a. minimize to corner) for videos that satisfy the
 * {@see ../../../src/video-interface.VideoInterface}.
 * @visibleForTesting
 */
export class VideoDocking {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!PositionObserver=} opt_injectedPositionObserver
   */
  constructor(ampdoc, opt_injectedPositionObserver) {

    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.manager_ = once(() => Services.videoManagerForDoc(ampdoc));

    /**
     * @private
     * @const {!../../../src/service/viewport/viewport-impl.Viewport}
     */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private {?DockedDef} */
    this.currentlyDocked_ = null;

    /**
     * Overriden when user drags the video to a corner.
     * Y-corner is determined based on scroll direction.
     * @private {!RelativeX}
     */
    this.preferredCornerX_ =
        isRTL(this.getDoc_()) ? RelativeX.LEFT : RelativeX.RIGHT;

    const html = htmlFor(this.getDoc_());

    /**
     * Returns an element representing a shadow under the docked video.
     * Alternatively, we could use box-shadow on the video element, but in
     * order to animate it without jank we have to use an opacity transition.
     * A separate layer also has the added benefit that authors can override its
     * box-shadow value or any other styling without handling the transition
     * themselves.
     * @private @const {function():!Element}
     */
    this.getShadowLayer_ = once(() => this.append_(ShadowLayer(html)));

    /** @private @const {function():!Controls} */
    this.getControls_ = once(() => this.installControls_());

    /** @private @const {function():!Element} */
    this.getPlaceholderBackground_ =
          once(() => this.append_(PlaceholderBackground(html)));

    /** @private @const {function():!Element} */
    this.getPlaceholderIcon_ =
          once(() => dev().assertElement(
              this.getPlaceholderBackground_().lastElementChild));

    /** @private {?../../../src/video-interface.VideoOrBaseElementDef} */
    this.lastDismissed_ = null;

    /** @private {?RelativeY} */
    this.lastDismissedPosY_ = null;

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
    this.isDragging_ = false;

    /** @private {!Array<!../../../src/video-interface.VideoOrBaseElementDef>} */
    this.observed_ = [];

    /**
     * Lazily invoked.
     * @private @const {!function()}
     */
    this.install_ = once(() => {
      const ampdoc = this.ampdoc_;

      this.viewport_.onScroll(
          throttleByAnimationFrame(ampdoc.win, () => this.updateScroll_()));

      this.viewport_.onResize(() => this.updateAllOnResize_());

      installStylesForDoc(ampdoc, CSS, /* callback */ null,
          /* isRuntimeCss */ false, TAG);
    });

    /** @private @const {function():?Element} */
    this.getSlot_ = once(() => this.querySlot_());

    /** @private @const {?PositionObserver} */
    this.injectedPositionObserver_ = opt_injectedPositionObserver || null;

    /** @private {boolean} */
    this.isTransitioning_ = false;

    this.registerAll_();
  }

  /** @private */
  registerAll_() {
    const ampdoc = this.ampdoc_;

    const dockableSelector =
        `[${escapeCssSelectorIdent(VideoAttributes.DOCK)}]`;

    const dockableElements =
        ampdoc.getRootNode().querySelectorAll(dockableSelector);

    for (let i = 0; i < dockableElements.length; i++) {
      const element = dockableElements[i];
      if (element.signals &&
          element.signals().get(VideoEvents.REGISTERED)) {
        this.registerElement(element);
      }
    }

    listen(ampdoc.getBody(), VideoEvents.REGISTERED, e => {
      const target = dev().assertElement(e.target);
      if (isDockable(target)) {
        this.registerElement(target);
      }
    });
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

    userAssert(video.signals().get(VideoEvents.REGISTERED),
        '`dock` attribute can only be set on video components.');

    const slotSelector = video.getAttribute('dock').trim();

    if (slotSelector == '') {
      return null;
    }

    const el = root.querySelector(slotSelector);

    if (el) {
      userAssert(el.tagName.toLowerCase() == 'amp-layout',
          'Dock slot must be an <amp-layout> element.');
    }

    return el;
  }

  /** @private */
  updateAllOnResize_() {
    this.observed_.forEach(video => this.updateOnResize_(video));
  }

  /** @param {!../../../src/video-interface.VideoOrBaseElementDef} video */
  register(video) {
    userAssert(isExperimentOn(this.ampdoc_.win, 'video-dock'),
        '`video-dock` experiment must be on to use `dock`.');

    this.install_();

    const {element} = video;
    const fidelity = PositionObserverFidelity.HIGH;
    this.getPositionObserver_().observe(element, fidelity,
        () => this.updateOnPositionChange_(video));
    this.observed_.push(video);
  }

  /**
   * @param {!Element} element
   * @public
   */
  registerElement(element) {
    element.getImpl().then(video => this.register(video));
  }

  /** @private */
  updateScroll_() {
    const scrollTop = this.viewport_.getScrollTop();

    // debounce
    if (Math.abs(scrollTop - this.lastScrollTop_) < 5) {
      return;
    }

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
   * @return {!Controls}
   * @private
   */
  installControls_() {
    const controls = new Controls(this.ampdoc_);
    const {container, overlay} = controls;

    listen(container, VideoDockingEvents.DISMISS_ON_TAP, () => {
      this.dismissOnTap_();
    });

    this.addDragListeners_(container);
    this.addDragListeners_(overlay);

    this.append_(container);
    this.append_(overlay);

    return controls;
  }

  /** @private */
  dismissOnTap_() {
    this.getControls_().hide(/* respectSticky */ false, /* immediately */ true);
    this.undock_(this.getDockedVideo_());
  }

  /**
   * @return {!../../../src/video-interface.VideoOrBaseElementDef}
   * @private
   */
  getDockedVideo_() {
    return devAssert(this.currentlyDocked_).video;
  }

  /**
   * @return {!PositionObserver}
   * @private
   */
  getPositionObserver_() {
    // for testing
    if (this.injectedPositionObserver_) {
      return this.injectedPositionObserver_;
    }

    installPositionObserverServiceForDoc(this.ampdoc_);

    // No getter in services.js.
    return /** @type {!PositionObserver} */ (
      getServiceForDoc(this.ampdoc_, 'position-observer'));
  }

  /**
   * Reconciles the state of a docked or potentially dockable video when
   * the viewport/position changes.
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @return {?DockTargetDef}
   * @private
   */
  getTargetFor_(video) {
    if (this.isDragging_ ||
        !this.isValidSize_(video) ||
        this.ignoreBecauseAnotherDocked_(video) ||
        this.ignoreDueToNotPlayingManually_(video)) {
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
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @return {boolean}
   * @private
   */
  canUpdateFromSlot_(video) {
    if (!this.slotHasDimensions_()) {
      return false;
    }
    const relativeY = this.getSlotRelativeY_();
    const {element} = video;
    const {top, bottom} = getIntersectionRect(element);
    const {top: slotTop, height: slotHeight} = this.getFixedSlotLayoutBox_();
    const slotBottom = this.viewport_.getSize().height - slotHeight - slotTop;
    if (relativeY == RelativeY.TOP) {
      return top <= slotTop;
    }
    return bottom >= slotBottom;
  }

  /**
   * @return {!../../../src/layout-rect.LayoutRectDef}
   * @private
   */
  getFixedSlotLayoutBox_() {
    return this.getFixedLayoutBox_(dev().assertElement(this.getSlot_()));
  }

  /**
   * @param {!Element} element
   * @return {!../../../src/layout-rect.LayoutRectDef}
   * @private
   */
  getFixedLayoutBox_(element) {
    const dy = -this.viewport_.getScrollTop();
    return moveLayoutRect(element.getLayoutBox(), /* dx */ 0, dy);
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
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @private
   */
  updateOnResize_(video) {
    const target = this.getTargetFor_(video);
    if (target) {
      this.dock_(video, target, /* step */ 1);
      return;
    }
    if (this.isCurrentlyDocked_(video)) {
      this.undock_(video);
    }
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @private
   */
  updateOnPositionChange_(video) {
    if (this.isTransitioning_) {
      return;
    }
    if (this.scrollDirection_ == Direction.UP) {
      const target = this.getTargetFor_(video);
      if (target) {
        this.dockOnPositionChange_(video, target);
      }
    } else if (this.scrollDirection_ == Direction.DOWN) {
      if (!this.currentlyDocked_) {
        return;
      }
      const video = this.getDockedVideo_();
      if (this.isVisible_(video.element, REVERT_TO_INLINE_RATIO)) {
        this.undock_(video);
      }
    }
  }

  /**
   * @param  {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @return {boolean}
   */
  ignoreDueToNotPlayingManually_(video) {
    return !this.currentlyDocked_ && !this.isPlaying_(video);
  }

  /**
   * @param  {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @return {boolean}
   */
  ignoreBecauseAnotherDocked_(video) {
    return !!this.currentlyDocked_ && !this.isCurrentlyDocked_(video);
  }

  /**
   * @param  {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @return {boolean}
   * @private
   */
  isValidSize_(video) {
    const {width, height} = video.getLayoutBox();
    if ((width / height) < (1 - FLOAT_TOLERANCE)) {
      complainAboutPortrait(video.element);
      return false;
    }
    return this.getAreaWidth_() >= MIN_VIEWPORT_WIDTH &&
        this.getAreaHeight_() >= (height * REVERT_TO_INLINE_RATIO);
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
   * @return {!RelativeX}
   * @private
   */
  getRelativeX_() {
    return this.preferredCornerX_;
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @return {?RelativeY}
   * @private
   */
  maybeGetRelativeY_(video) {
    if (this.slotHasDimensions_()) {
      return null;
    }

    if (this.isCurrentlyDocked_(video) &&
        !isElement(this.currentlyDocked_.target)) {
      const {posY} = devAssert(this.currentlyDocked_).target;
      return /** @type {!RelativeY} */ (dev().assertNumber(posY));
    }

    const {element} = video;
    const intersectionRect = getIntersectionRect(element);

    if (!isSizedLayoutRect(intersectionRect) ||
        intersectionRect.top > this.getTopEdge_()) {
      return null;
    }

    dev().info(TAG, 'should dock at Y = TOP', {video, intersectionRect});
    return RelativeY.TOP;
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
   * @return {number}
   * @private
   */
  getAreaHeight_() {
    return this.getBottomEdge_() - this.getTopEdge_();
  }

  /**
   * @param {?../../../src/video-interface.VideoOrBaseElementDef} optVideo
   * @return {boolean}
   * @private
   */
  isPlaying_(optVideo = null) {
    const video = /** @type {!../../../src/video-interface.VideoInterface} */ (
      optVideo || this.getDockedVideo_());
    return this.manager_().getPlayingState(video) ==
        PlayingStates.PLAYING_MANUAL;
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
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @private
   */
  dockOnPositionChange_(video, target) {
    if (this.ignoreDueToDismissal_(video)) {
      return;
    }

    if (this.currentlyDocked_) {
      return;
    }

    this.dockInTwoSteps_(video, target);
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @private
   */
  dockInTwoSteps_(video, target) {
    // Do this in a two-step process due to a browser quirk in transferring
    // layers to GPU.
    this.dock_(video, target, /* step */ 0.1);

    requestAnimationFrame(() => {
      this.dock_(video, target, /* step */ 1);
    });
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @param {number} step
   * @private
   */
  dock_(video, target, step) {
    const currentlyDocked = this.currentlyDocked_;
    if (currentlyDocked && currentlyDocked.step >= step) {
      return;
    }

    dev().info(TAG, 'dock', {video, target, step});

    const {element} = video;

    // Component background is now visible, so hide the poster for the Android
    // workaround so authors can style the component container as they like.
    // (see `AmpVideo#createPosterForAndroidBug_`).
    this.removePosterForAndroidBug_(element);

    const {x, y, scale} = this.getDims_(video, target, step);
    video.hideControls();
    this.getControls_().enable();
    this.placeAt_(video, x, y, scale, step);
    this.setCurrentlyDocked_(video, target, step);
  }

  /**
   * @param {!Actions} action
   * @private
   */
  trigger_(action) {
    const element = dev().assertElement(
        this.isDockedToSlot_()
          ? this.getSlot_()
          : this.getDockedVideo_().element
    );

    const trust = ActionTrust.LOW;
    const event = createCustomEvent(this.ampdoc_.win,
        /** @type {string} */ (action), /* detail */ dict({}));
    const actions = Services.actionServiceForDoc(element);
    actions.trigger(element, action, event, trust);
  }

  /**
   * @param  {!../../../src/video-interface.VideoOrBaseElementDef} video
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
   * @param {!AmpElement} element
   * @param {?DockTargetDef=} target
   * @return {number}
   * @private
   */
  calculateIntersectionRatio_(element, target = null) {
    if (target == null || !isElement(target)) {
      return element.getIntersectionChangeEntry().intersectionRatio;
    }

    const layoutBox = element.getLayoutBox();
    const {top, bottom, height} = layoutBox;
    const {top: slotTop, bottom: slotBottom} = this.getSlot_().getLayoutBox();

    if (!isSizedLayoutRect(layoutBox)) {
      return 0;
    }

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
    const maxAutoTransitionDurationMs = 300;
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
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @param {number} x
   * @param {number} y
   * @param {number} scale
   * @param {number} step in [0..1]
   * @param {number=} opt_transitionDurationMs
   * @private
   */
  placeAt_(video, x, y, scale, step, opt_transitionDurationMs) {
    if (this.alreadyPlacedAt_(x, y, scale)) {
      return Promise.resolve();
    }

    this.isTransitioning_ = true;

    const transitionDurationMs = isFiniteNumber(opt_transitionDurationMs) ?
      dev().assertNumber(opt_transitionDurationMs) :
      this.calculateTransitionDuration_(step);

    const {width, height, x: videoX, y: videoY} = video.getLayoutBox();

    this.placedAt_ = {x, y, scale};

    const transitionTiming = step > 0 ? 'ease-out' : 'ease-in';

    const {element} = video;

    const internalElement = getInternalVideoElementFor(element);
    const shadowLayer = this.getShadowLayer_();
    const {overlay} = this.getControls_();
    const placeholderIcon = this.getPlaceholderIcon_();

    applyBreakpointClassname(placeholderIcon, width,
        PLACEHOLDER_ICON_BREAKPOINTS);

    // Setting explicit dimensions is needed to match the video's aspect
    // ratio. However, we only do this once to prevent jank in subsequent
    // frames.
    const boxNeedsSizing = this.boxNeedsSizing_(width, height);

    /**
     * @param {!Element} element
     * @param {boolean=} opt_positioned
     */
    const maybeSetSizing = (element, opt_positioned) => {
      if (!boxNeedsSizing) {
        return;
      }
      setImportantStyles(element, {
        'width': px(width),
        'height': px(height),
      });
      if (opt_positioned) {
        setImportantStyles(element, {
          'left': px(videoX),
          'top': px(videoY),
        });
      }
    };

    const setOpacity = element => setImportantStyles(element, {
      'opacity': step,
    });

    const setTransitionTiming = element => setImportantStyles(element, {
      'transition-duration': `${transitionDurationMs}ms`,
      'transition-timing-function': transitionTiming,
    });

    const isSmallPlaceholderIcon =
        placeholderIcon.classList.contains('amp-small');

    const placeholderIconWidth = isSmallPlaceholderIcon ?
      PLACEHOLDER_ICON_SMALL_WIDTH :
      PLACEHOLDER_ICON_LARGE_WIDTH;

    const placeholderIconMargin = isSmallPlaceholderIcon ?
      PLACEHOLDER_ICON_SMALL_MARGIN :
      PLACEHOLDER_ICON_LARGE_MARGIN;

    // TODO(alanorozco): Place, animate and style icon for RTL.
    const placeholderIconX = step *
        (width - placeholderIconWidth - placeholderIconMargin * 2);

    video.mutateElement(() => {
      internalElement.classList.add(BASE_CLASS_NAME);

      // Resets .i-amphtml-layout-size-defined to fix clipping on Safari.
      setImportantStyles(element, {'overflow': 'visible'});

      toggle(shadowLayer, true);
      toggle(overlay, true);

      this.getElementsOnPlaceholderArea_().forEach(el => {
        maybeSetSizing(el, /* positioned */ true);
        setOpacity(el);
        setTransitionTiming(el);
      });

      this.setPosterImage_(video);

      setTransitionTiming(placeholderIcon);
      setImportantStyles(placeholderIcon, {
        'transform': transform(placeholderIconX, /* y */ 0, /* scale */ 1),
      });

      this.getElementsOnDockArea_(video).forEach(el => {
        setImportantStyles(el, {
          'transform': transform(x, y, scale),
        });
        setTransitionTiming(el);
        maybeSetSizing(el);
      });

      setOpacity(shadowLayer);

      this.getControls_().positionOnVsync(scale, x, y, width, height);
    });

    return this.getTimer_().promise(transitionDurationMs).then(() => {
      this.isTransitioning_ = false;
    });
  }

  /**
   * @return {!../../../src/service/timer-impl.Timer}
   * @private
   */
  getTimer_() {
    return Services.timerFor(this.ampdoc_.win);
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @return {!Promise|undefined}
   * @private
   */
  maybeUpdateStaleYAfterScroll_(video) {
    if (!this.placedAt_) {
      return;
    }

    const {x, y, scale} = this.placedAt_;
    const {
      height,
      top: fixedScrollTop,
    } = this.getFixedLayoutBox_(video.element);

    if (y == fixedScrollTop) {
      return;
    }

    if (fixedScrollTop < -(height - height * REVERT_TO_INLINE_RATIO)) {
      return;
    }

    const maxTransitionDurationMs = 150;
    const tentativeTransitionDurationMs = Math.abs(y - fixedScrollTop) / 2;

    const transitionDurationMs = Math.min(
        maxTransitionDurationMs,
        tentativeTransitionDurationMs);

    return this.placeAt_(
        video, x, fixedScrollTop, scale, /* step */ 0, transitionDurationMs);
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @return {!Array<!Element>}
   * @private
   */
  getElementsOnDockArea_(video) {
    return [
      getInternalVideoElementFor(video.element),
      this.getShadowLayer_(),
      this.getControls_().overlay,
    ];
  }

  /**
   * @return {!Array<!Element>}
   * @private
   */
  getElementsOnPlaceholderArea_() {
    return [
      this.getPlaceholderBackground_(),
    ];
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   */
  setPosterImage_(video) {
    const attr = 'poster';

    const {element} = video;

    const placeholderBackground = this.getPlaceholderBackground_();

    // First child is the poster layer, see `PlaceholderBackground`.
    const placeholderPoster =
        dev().assertElement(childElementByTag(placeholderBackground, 'div'));

    if (!element.hasAttribute('poster')) {
      toggle(placeholderPoster, false);
      return;
    }

    const posterSrc = element.getAttribute(attr);

    toggle(placeholderPoster, true);
    setStyles(placeholderPoster, {
      'background-image': `url(${posterSrc})`,
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
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @return {boolean}
   */
  isCurrentlyDocked_(video) {
    return !!this.currentlyDocked_ && this.currentlyDocked_.video == video;
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @param {number} step
   */
  setCurrentlyDocked_(video, target, step) {
    const previouslyDocked = this.currentlyDocked_;
    this.currentlyDocked_ = {video, target, step};
    if (!previouslyDocked || previouslyDocked.video != video) {
      this.getControls_().setVideo(video);
      this.trigger_(Actions.DOCK);
    }
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
    if (!this.isTransitioning_) {
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

    offset.x = pointerCoords(e).x - startX;
    offset.y = 0;

    // Prevents dragging misfires.
    const offsetDist = Math.sqrt(Math.pow(offset.x, 2) + Math.pow(offset.y, 2));
    if (offsetDist <= 10) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    this.getControls_().hide(/* respectSticky */ false, /* immediately */ true);
    this.isDragging_ = true;
    this.getControls_().disable();
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
      this.getControls_().overlay.classList.toggle(className, inDismissalArea);
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

    this.getControls_().enable();

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
      const posY = RelativeY.TOP;
      const cornerX = posX == RelativeX.LEFT ?
        this.getLeftEdge_() :
        this.getRightEdge_();
      const cornerY = this.getTopEdge_();
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

    const target = {
      posX: closestCornerX,
      posY: closestCornerY,
    };

    this.currentlyDocked_.target = target;

    this.preferredCornerX_ = closestCornerX;

    const {x, y, scale} = this.getDims_(video, target, step);

    this.placeAt_(video, x, y, scale, step, /* transitionDurationMs */ 200);
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
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
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
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
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
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
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @param {number} step in [0..1]
   * @return {{x: number, y: number, scale: number}}
   */
  getDims_(video, target, step) {
    const {left, width} = video.getLayoutBox();
    const {x, y, targetWidth, initialY} = this.getTargetArea_(video, target);
    const currentX = mapStep(step, left, x);
    const currentWidth = mapStep(step, width, targetWidth);
    const currentY = mapStep(step, initialY,
        this.calculateFinalY_(video, y, step));
    const scale = currentWidth / width;
    return {x: currentX, y: currentY, scale};
  }

  /**
   * @param {!RelativeY} pos
   * @param {number} targetTop
   * @param {number} targetBottom
   * @param {number} naturalHeight
   * @return {number}
   * @private
   */
  calculateInitialY_(pos, targetTop, targetBottom, naturalHeight) {
    return pos == RelativeY.TOP ? targetTop : targetBottom - naturalHeight;
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @param {number} targetY
   * @param {number} step
   * @return {number}
   * @private
   */
  calculateFinalY_(video, targetY, step) {
    if (this.scrollDirection_ == Direction.UP ||
        step > FLOAT_TOLERANCE) {
      return targetY;
    }
    return this.getFixedLayoutBox_(video.element).top;
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @param {number=} unusedDismissDirX
   * @param {number=} unusedDismissDirY
   * @return {!Promise}
   * @private
   */
  undock_(video, unusedDismissDirX, unusedDismissDirY) {
    // TODO(alanorozco): animate dismissal from flick

    dev().info(TAG, 'undock', {video});

    this.getControls_().disable();
    this.trigger_(Actions.UNDOCK);

    const step = 0;

    const {target} = devAssert(this.currentlyDocked_);
    const {x, y, scale} = this.getDims_(video, target, step);

    return this.placeAt_(video, x, y, scale, step)
        .then(() => this.maybeUpdateStaleYAfterScroll_(video))
        .then(() => this.resetOnUndock_(video));
  }

  /**
   * @param {!../../../src/video-interface.VideoOrBaseElementDef} video
   * @return {!Promise}
   * @private
   */
  resetOnUndock_(video) {
    const {element} = video;
    const internalElement = getInternalVideoElementFor(element);

    dev().info(TAG, 'resetOnUndock', {video});

    return video.mutateElement(() => {
      video.showControls();
      internalElement.classList.remove(BASE_CLASS_NAME);
      const shadowLayer = this.getShadowLayer_();
      const {overlay} = this.getControls_();
      const almostDismissed = 'amp-video-docked-almost-dismissed';
      const placeholderIcon = this.getPlaceholderIcon_();
      const placeholderBackground = this.getPlaceholderBackground_();

      // TODO(alanorozco): Remove weird flick-to-dismiss.
      internalElement.classList.remove(almostDismissed);
      overlay.classList.remove(almostDismissed);

      toggle(shadowLayer, false);

      this.getControls_().reset();

      [
        element,
        internalElement,
        shadowLayer,
        placeholderBackground,
        placeholderIcon,
      ].forEach(el => {
        resetStyles(el, [
          'transform',
          'transition',
          'width',
          'height',
          'opacity',
          'overflow',
        ]);
      });

      this.placedAt_ = null;
      this.sizedAt_ = null;
      this.currentlyDocked_ = null;
    });
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

AMP.extension(TAG, 0.1, AMP => {
  AMP.registerServiceForDoc('video-docking', VideoDocking);
});
