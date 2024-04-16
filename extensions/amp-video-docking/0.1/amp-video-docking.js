import {ActionTrust_Enum} from '#core/constants/action-constants';
import {isRTL, removeElement} from '#core/dom';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {applyFillContent} from '#core/dom/layout';
import {layoutRectEquals, rectIntersection} from '#core/dom/layout/rect';
import {scopedQuerySelector} from '#core/dom/query';
import {htmlFor, htmlRefs} from '#core/dom/static-template';
import {
  px,
  resetStyles,
  setImportantStyles,
  setStyles,
  toggle,
} from '#core/dom/style';
import {getInternalVideoElementFor} from '#core/dom/video';
import {once} from '#core/types/function';

import {Services} from '#service';

import {createCustomEvent, listen, listenOnce} from '#utils/event-helper';
import {dev, devAssert, user, userAssert} from '#utils/log';

import {applyBreakpointClassname} from './breakpoints';
import {Controls} from './controls';
import {DirectionX, DirectionY, FLOAT_TOLERANCE, RectDef} from './def';
import {VideoDockingEvents, pointerCoords} from './events';
import {HtmlLiteralTagDef} from './html';
import {
  calculateLeftJustifiedX,
  calculateRightJustifiedX,
  interpolatedBoxesTransform,
  isSizedRect,
  isVisibleBySize,
  letterboxRect,
  topCornerRect,
} from './math';
import {createViewportRect} from './viewport-rect';

import {CSS} from '../../../build/amp-video-docking-0.1.css';
import {installStylesForDoc} from '../../../src/style-installer';
import {
  PlayingStates_Enum,
  VideoAttributes_Enum,
  VideoEvents_Enum,
  VideoInterface,
  VideoOrBaseElementDef,
  isDockable,
} from '../../../src/video-interface';

const TAG = 'amp-video-docking';

/** Ratio to viewport width to use when docked to corner. */
export const CORNER_WIDTH_RATIO = 0.3;

/** Min width in pixels for corner area. */
export const CORNER_WIDTH_MIN = 180;

/** Max amount of pixels to use for margins (it's relative to viewport.) */
export const CORNER_MARGIN_MAX = 30;

/** Max % of viewport width to use form margins. */
export const CORNER_MARGIN_RATIO = 0.04;

/** Min viewport width for dock to appear at all. */
export const MIN_VIEWPORT_WIDTH = 320;

/** Min visible intersection ratio of inline box to undock when scrolling. */
export const REVERT_TO_INLINE_RATIO = 0.85;

/**
 * Width/height of placeholder icon when the inline box is large.
 * @visibleForTesting
 */
export const PLACEHOLDER_ICON_LARGE_WIDTH = 48;

/** Margin applied to placeholder icon when the inline box is large. */
export const PLACEHOLDER_ICON_LARGE_MARGIN = 40;

/** Width/height of placeholder icon when the inline box is small. */
export const PLACEHOLDER_ICON_SMALL_WIDTH = 32;

/** Margin applied to placeholder icon when the inline box is large. */
export const PLACEHOLDER_ICON_SMALL_MARGIN = 20;

/** @const {!Array<!./breakpoints.SyntheticBreakpointDef>} */
export const PLACEHOLDER_ICON_BREAKPOINTS = [
  {
    className: 'amp-small',
    minWidth: 0,
  },
  {
    className: 'amp-large',
    minWidth: 420,
  },
];

/** @visibleForTesting @const {string} */
export const BASE_CLASS_NAME = 'i-amphtml-video-docked';

/** @enum {string} */
export const Actions = {DOCK: 'dock', UNDOCK: 'undock'};

/** @enum {string} */
export const DockTargetType = {
  // Dynamically calculated corner based on viewport percentage. Draggable.
  CORNER: 'corner',
  // Targets author-defined element's box. Not draggable.
  SLOT: 'slot',
};

/**
 * @struct @typedef {{
 *   video: !VideoOrBaseElementDef,
 *   target: !DockTargetDef,
 *   step: number,
 *   viewportRect: !RectDef,
 * }}
 */
let DockedDef;

/**
 * @struct @typedef {{
 *   type: DockTargetType,
 *   rect: !RectDef,
 *   slot: (!Element|undefined),
 * }}
 */
let DockTargetDef;

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
 * @param {!Element} element
 * @restricted
 */
function complainAboutPortrait(element) {
  // Constant named `TAG` per lint rules.
  const TAG = element.tagName.toUpperCase();
  user().error(
    TAG,
    'Minimize-to-corner (`dock`) does not support portrait video.',
    element
  );
}

/**
 * Gets a poster src URL from a video players element.
 * API across components is unfortunately inconsistent, so this queries for all
 * known `poster` attribute patterns. Instances may also not use the `poster`
 * API at all, in which case we fallback to `placeholder` images.
 * @param {!Element} element
 * @return {string|undefined}
 * @private
 */
export function getPosterImageSrc(element) {
  const attr =
    element.getAttribute('poster') || element.getAttribute('data-poster');
  if (attr) {
    return attr;
  }
  const imgEl = scopedQuerySelector(
    element,
    'amp-img[placeholder],img[placeholder],[placeholder] amp-img'
  );
  if (imgEl) {
    return imgEl.getAttribute('src');
  }
}

/**
 * Returns an element representing a shadow under the docked video.
 * Alternatively, we could use box-shadow on the video element, but in
 * order to animate it without jank we have to use an opacity transition.
 * A separate layer also has the added benefit that authors can override its
 * box-shadow value or any other styling without handling the transition
 * themselves.
 * @param {!HtmlLiteralTagDef} html
 * @return {!Element}
 * @private
 */
const ShadowLayer = (html) => html`
  <div class="amp-video-docked-shadow" hidden></div>
`;

/**
 * @param {!HtmlLiteralTagDef} html
 * @return {!Element}
 * @private
 */
const PlaceholderBackground = (html) => html`
  <div class="amp-video-docked-placeholder-background">
    <div
      class="amp-video-docked-placeholder-background-poster"
      ref="poster"
    ></div>
    <div class="amp-video-docked-placeholder-icon" ref="icon"></div>
  </div>
`;

/**
 * Manages docking (a.k.a. minimize to corner) for videos that satisfy the
 * {@see VideoInterface}.
 * @visibleForTesting
 */
export class VideoDocking {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.manager_ = once(() => Services.videoManagerForDoc(ampdoc));

    /** @private @const {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(ampdoc);

    /** @private @const {!RectDef} */
    this.viewportRect_ = createViewportRect(this.viewport_);

    /** @private {?DockedDef} */
    this.currentlyDocked_ = null;

    /**
     * Overriden when user drags the video to a different corner.
     * @private {?DirectionX}
     */
    this.cornerDirectionX_ = null;

    const html = htmlFor(this.getDoc_());

    /** @private @const {function():!Element} */
    this.getShadowLayer_ = once(() => this.append_(ShadowLayer(html)));

    /** @private @const {function():!Controls} */
    this.getControls_ = once(() => this.installControls_());

    /** @private @const {function():!Element} */
    this.getPlaceholderBackground_ = once(() =>
      this.append_(PlaceholderBackground(html))
    );

    /** @private @const {function():!{[key: string]: !Element}} */
    this.getPlaceholderRefs_ = once(() =>
      htmlRefs(this.getPlaceholderBackground_())
    );

    /** @private {?VideoOrBaseElementDef} */
    this.lastDismissed_ = null;

    /**
     * Memoizes x, y and scale to prevent useless mutations.
     * @private {?{x: number, y: number, scale: number}}
     */
    this.placedAt_ = null;

    /** @private {?{width: number, height: number}} */
    this.sizedAt_ = null;

    /** @private {?DirectionY} */
    this.scrollDirection_ = null;

    /** @private {number} */
    this.lastScrollTop_ = this.viewport_.getScrollTop();

    /** @private {boolean} */
    this.isDragging_ = false;

    /** @private {number} */
    this.dragOffsetX_ = 0;

    /** @private {number} */
    this.previousDragOffsetX_ = 0;

    /** @private {number} */
    this.dragVelocityX_ = 0;

    /** @private {!Array<!VideoOrBaseElementDef>} */
    this.observed_ = [];

    /**
     * Lazily invoked.
     * @private @const {!function()}
     */
    this.install_ = once(() => {
      const ampdoc = this.ampdoc_;

      this.viewport_.onScroll(
        throttleByAnimationFrame(ampdoc.win, () => this.updateScroll_())
      );

      this.viewport_.onResize(() => this.onViewportResize_());

      installStylesForDoc(
        ampdoc,
        CSS,
        /* callback */ null,
        /* isRuntimeCss */ false,
        TAG
      );
    });

    /** @private @const {function():?Element} */
    this.findSlotOnce_ = once(() => this.findSlot_());

    /** @private @const {?IntersectionObserver} */
    this.intersectionObserver_ = null;

    /** @private {boolean} */
    this.isTransitioning_ = false;

    this.registerAll_();
  }

  /** @private */
  registerAll_() {
    if (!this.isEnabled_()) {
      return;
    }

    const ampdoc = this.ampdoc_;

    const dockableSelector = `[${escapeCssSelectorIdent(
      VideoAttributes_Enum.DOCK
    )}]`;

    const dockableElements = ampdoc
      .getRootNode()
      .querySelectorAll(dockableSelector);

    for (let i = 0; i < dockableElements.length; i++) {
      const element = dockableElements[i];
      if (
        element.signals &&
        element.signals().get(VideoEvents_Enum.REGISTERED)
      ) {
        this.registerElement(element);
      }
    }

    listen(ampdoc.getBody(), VideoEvents_Enum.REGISTERED, (e) => {
      const target = dev().assertElement(e.target);
      if (isDockable(target)) {
        this.registerElement(target);
      }
    });
  }

  /**
   * @return {boolean}
   * @private
   */
  isEnabled_() {
    // iOS is impossible in the viewer. See https://bit.ly/2BJcNjV
    if (
      Services.platformFor(this.ampdoc_.win).isIos() &&
      Services.viewerForDoc(this.ampdoc_).isEmbedded()
    ) {
      return false;
    }
    return true;
  }

  /**
   * @return {?Element}
   * @private
   */
  findSlot_() {
    const root = this.ampdoc_.getRootNode();

    // For consistency always honor the dock attribute on the first el in page.
    const video = root.querySelector('[dock]');

    dev().assertElement(video);

    userAssert(
      video.signals().get(VideoEvents_Enum.REGISTERED),
      '`dock` attribute can only be set on video components.'
    );

    const slotSelector = video.getAttribute('dock').trim();

    if (slotSelector == '') {
      return null;
    }

    const el = root.querySelector(slotSelector);

    if (el) {
      userAssert(
        el.tagName.toLowerCase() == 'amp-layout',
        'Dock slot must be an <amp-layout> element.'
      );
    }

    return el;
  }

  /** @private */
  onViewportResize_() {
    if (
      this.viewportRect_.width === this.currentlyDocked_?.viewportRect.width
    ) {
      // Ignore resize events that occur when only the height changes.
      // This works around issues where the browser may hide the location bar,
      // or a virtual keyboard; causing a height-only resize that would
      // otherwise undock the video.
      return;
    }
    this.observed_.forEach((video) => this.updateOnResize_(video));
  }

  /**
   * @return {number}
   * @private
   */
  getTopBoundary_() {
    const slot = this.getSlot_();
    if (slot) {
      // Match slot's top edge to tie transition to element.
      // TODO: Reuse a inlineRect
      return slot./*OK*/ getBoundingClientRect().top;
    }
    return 0;
  }

  /** @param {!VideoOrBaseElementDef} video */
  register(video) {
    this.install_();

    if (!this.intersectionObserver_) {
      this.intersectionObserver_ = new IntersectionObserver(
        (entries) => {
          // Multiple entries could belong to the same element, use only the
          // most recent.
          const handled = [];
          for (let i = entries.length - 1; i >= 0; i--) {
            const {boundingClientRect, target} = entries[i];
            if (handled.indexOf(target) < 0) {
              target.getImpl().then((video) => {
                this.updateOnPositionChange_(video, boundingClientRect);
              });
              handled.push(target);
            }
          }
        },
        {threshold: [0, 0.1, 0.2, 0.8, 0.9, 1]}
      );
    }

    this.intersectionObserver_.observe(video.element);
    this.observed_.push(video);
  }

  /**
   * @param {!Element} element
   * @public
   */
  registerElement(element) {
    element.getImpl().then((video) => this.register(video));
  }

  /** @private */
  updateScroll_() {
    const scrollTop = this.viewport_.getScrollTop();

    // debounce
    if (Math.abs(scrollTop - this.lastScrollTop_) < 5) {
      return;
    }

    const scrollDirection =
      scrollTop > this.lastScrollTop_ ? DirectionY.TOP : DirectionY.BOTTOM;

    this.scrollDirection_ = scrollDirection;
    this.lastScrollTop_ = scrollTop;
  }

  /**
   * @return {!Document}
   * @private
   */
  getDoc_() {
    const root = this.ampdoc_.getRootNode();
    return /** @type {!Document} */ (root.ownerDocument || root);
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
    const handler = (e) => this.drag_(/** @type {!TouchEvent} */ (e));

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

    listen(container, VideoDockingEvents.SCROLL_BACK, () => {
      this.scrollBack_();
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
   * @return {!VideoOrBaseElementDef}
   * @private
   */
  getDockedVideo_() {
    return devAssert(this.currentlyDocked_).video;
  }

  /**
   * Returns the area's target when a video should be docked.
   * @param {!VideoOrBaseElementDef} video
   * @param {!RectDef=} opt_inlineRect
   * @return {?DockTargetDef}
   * @private
   */
  getTargetFor_(video, opt_inlineRect) {
    if (
      this.isDragging_ ||
      !this.isValidSize_(video, opt_inlineRect) ||
      this.ignoreBecauseAnotherDocked_(video) ||
      this.ignoreDueToNotPlayingManually_(video)
    ) {
      return null;
    }

    const {element} = video;
    const inlineRect = opt_inlineRect || element./*OK*/ getBoundingClientRect();
    const intersectionRect = rectIntersection(inlineRect, this.viewportRect_);
    if (!intersectionRect || !isSizedRect(intersectionRect)) {
      return null;
    }
    if (intersectionRect.top > this.getTopBoundary_()) {
      return null;
    }
    return this.getUsableTarget_(video, opt_inlineRect);
  }

  /**
   * @param {!AmpElement|!VideoOrBaseElementDef} element
   * @return {!inlineRect}
   * @private
   */
  getScrollAdjustedRect_(element) {
    element = element.element || element;
    return element./*OK*/ getBoundingClientRect();
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @private
   */
  updateOnResize_(video) {
    // Update on subsequent animation frame to allow CSS media queries to be
    // applied.
    this.raf_(() => {
      const target = this.getTargetFor_(video);
      if (target) {
        this.dock_(video, target, /* step */ 1);
        return;
      }
      if (this.isCurrentlyDocked_(video)) {
        this.undock_(video);
      }
    });
  }

  /**
   * @param {function()} cb
   * @private
   */
  raf_(cb) {
    this.ampdoc_.win.requestAnimationFrame(cb);
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {!RectDef=} opt_inlineRect
   * @private
   */
  updateOnPositionChange_(video, opt_inlineRect) {
    if (this.isTransitioning_) {
      return;
    }
    if (this.scrollDirection_ == DirectionY.TOP) {
      const target = this.getTargetFor_(video, opt_inlineRect);
      if (target) {
        this.dockOnPositionChange_(video, target, opt_inlineRect);
      }
    } else if (this.scrollDirection_ == DirectionY.BOTTOM) {
      if (!this.currentlyDocked_) {
        return;
      }
      if (video === this.getDockedVideo_()) {
        if (this.isVisible_(video, REVERT_TO_INLINE_RATIO, opt_inlineRect)) {
          this.undock_(video, /* opt_reconciled */ false, opt_inlineRect);
        }
      }
    }
  }

  /**
   * @param  {!VideoOrBaseElementDef} video
   * @return {boolean}
   */
  ignoreDueToNotPlayingManually_(video) {
    return !this.currentlyDocked_ && !this.isPlaying_(video);
  }

  /**
   * @param  {!VideoOrBaseElementDef} video
   * @return {boolean}
   */
  ignoreBecauseAnotherDocked_(video) {
    return !!this.currentlyDocked_ && !this.isCurrentlyDocked_(video);
  }

  /**
   * @param  {!VideoOrBaseElementDef} video
   * @param {!RectDef=} opt_inlineRect
   * @return {boolean}
   * @private
   */
  isValidSize_(video, opt_inlineRect) {
    const {height, width} =
      opt_inlineRect || video.element./*OK*/ getBoundingClientRect();
    if (width / height < 1 - FLOAT_TOLERANCE) {
      complainAboutPortrait(video.element);
      return false;
    }
    return (
      this.viewportRect_.width >= MIN_VIEWPORT_WIDTH &&
      this.viewportRect_.height >= height * REVERT_TO_INLINE_RATIO
    );
  }

  /**
   * @param {?VideoOrBaseElementDef} optVideo
   * @return {boolean}
   * @private
   */
  isPlaying_(optVideo = null) {
    const video = /** @type {!VideoInterface} */ (
      optVideo || this.getDockedVideo_()
    );
    return (
      this.manager_().getPlayingState(video) ==
      PlayingStates_Enum.PLAYING_MANUAL
    );
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @param {!RectDef=} opt_inlineRect
   * @private
   */
  dockOnPositionChange_(video, target, opt_inlineRect) {
    if (this.ignoreDueToDismissal_(video)) {
      return;
    }

    if (this.currentlyDocked_) {
      return;
    }

    this.dockInTransferLayerStep_(video, target, opt_inlineRect);
  }

  /**
   * Dock this in a two-step process due to a browser quirk in transferring
   * layers to GPU.
   * @param {!VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @param {!RectDef=} opt_inlineRect
   * @return {!Promise}
   * @private
   */
  dockInTransferLayerStep_(video, target, opt_inlineRect) {
    const isTransferLayerStep = true;
    return this.dock_(
      video,
      target,
      /* step */ 0.05,
      opt_inlineRect,
      isTransferLayerStep
    ).then(
      () =>
        new Promise((resolve) => {
          this.raf_(() => {
            this.dock_(video, target, /* step */ 1, opt_inlineRect).then(
              resolve
            );
          });
        })
    );
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @param {number} step
   * @param {!RectDef=} opt_inlineRect
   * @param {boolean=} opt_isTransferLayerStep
   * @return {!Promise}
   * @private
   */
  dock_(video, target, step, opt_inlineRect, opt_isTransferLayerStep) {
    const {element} = video;

    // Component background is now visible, so hide the poster for the Android
    // workaround so authors can style the component container as they like.
    // (see `AmpVideo#createPosterForAndroidBug_`).
    // TODO(alanorozco): Make docking agnostic to this workaround.
    this.removePosterForAndroidBug_(element);

    const {relativeX, scale, x, y} = this.getDims_(
      video,
      target,
      step,
      opt_inlineRect
    );

    video.hideControls();

    const transitionDurationMs = this.calculateTransitionDuration_(step);

    this.setCurrentlyDocked_(video, target, step);

    return this.placeAt_(
      video,
      x,
      y,
      scale,
      step,
      transitionDurationMs,
      relativeX,
      opt_inlineRect
    ).then(() => {
      if (opt_isTransferLayerStep) {
        // Do not enable controls during transfer layer steps, which would
        // make them appear on hover during transition.
        return;
      }
      this.getControls_().enable();
    });
  }

  /**
   * @param {!Actions} action
   * @param {!DockTargetDef=} opt_target
   * @private
   */
  trigger_(action, opt_target) {
    const element = dev().assertElement(
      (opt_target && opt_target.slot) ||
        this.getSlot_() ||
        this.getDockedVideo_().element
    );

    const trust = ActionTrust_Enum.LOW;
    const event = createCustomEvent(
      this.ampdoc_.win,
      /** @type {string} */ (action),
      {}
    );
    const actions = Services.actionServiceForDoc(element);
    actions.trigger(element, action, event, trust);
  }

  /**
   * @param  {!VideoOrBaseElementDef} video
   * @return {boolean}
   * @private
   */
  ignoreDueToDismissal_(video) {
    if (this.lastDismissed_ != video) {
      return false;
    }
    // TODO: Reuse a inlineRect
    if (this.isVisible_(video.element, FLOAT_TOLERANCE)) {
      this.resetDismissed_();
    }
    return true;
  }

  /** @private */
  resetDismissed_() {
    this.lastDismissed_ = null;
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
    return (
      !!this.placedAt_ &&
      this.placedAt_.x == x &&
      this.placedAt_.y == y &&
      this.placedAt_.scale == scale
    );
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {number} x
   * @param {number} y
   * @param {number} scale
   * @param {number} step in [0..1]
   * @param {number} transitionDurationMs
   * @param {DirectionX=} opt_relativeX
   * @param {!RectDef=} opt_inlineRect
   * @param {string=} position
   * @return {!Promise}
   * @private
   */
  placeAt_(
    video,
    x,
    y,
    scale,
    step,
    transitionDurationMs,
    opt_relativeX,
    opt_inlineRect,
    position = 'fixed'
  ) {
    if (this.alreadyPlacedAt_(x, y, scale)) {
      return Promise.resolve();
    }

    this.isTransitioning_ = true;

    const {element} = video;
    const inlineRect =
      opt_inlineRect || video.element./*OK*/ getBoundingClientRect();

    const {height, width} = inlineRect;

    this.placedAt_ = {x, y, scale};

    const transitionTiming = step > 0 ? 'ease-out' : 'ease-in';

    const internalElement = getInternalVideoElementFor(element);
    const shadowLayer = this.getShadowLayer_();
    const {overlay} = this.getControls_();
    const placeholderBackground = this.getPlaceholderBackground_();
    const placeholderIcon = this.getPlaceholderRefs_()['icon'];
    const hasRelativePlacement = opt_relativeX !== undefined;
    const isPlacementRtl = opt_relativeX == DirectionX.LEFT;

    if (hasRelativePlacement) {
      applyBreakpointClassname(
        placeholderIcon,
        width,
        PLACEHOLDER_ICON_BREAKPOINTS
      );

      placeholderIcon.classList.toggle('amp-rtl', isPlacementRtl);
      this.getControls_().container.classList.toggle('amp-rtl', isPlacementRtl);
    }

    // Setting explicit dimensions is needed to match the video's aspect
    // ratio. However, we only do this once to prevent jank in subsequent
    // frames.
    const boxNeedsSizing = this.boxNeedsSizing_(width, height);

    /** @param {!Element} element */
    const maybeSetSizing = (element) => {
      if (!boxNeedsSizing) {
        return;
      }
      setImportantStyles(element, {
        'width': px(width),
        'height': px(height),
        'min-width': px(width),
        'min-height': px(height),
      });
    };

    const setOpacity = (element) =>
      setImportantStyles(element, {
        'opacity': step,
      });

    const setTransitionTiming = (element) =>
      setImportantStyles(element, {
        'transition-duration': `${transitionDurationMs}ms`,
        'transition-timing-function': transitionTiming,
      });

    const isSmallPlaceholderIcon =
      placeholderIcon.classList.contains('amp-small');

    const placeholderIconWidth = isSmallPlaceholderIcon
      ? PLACEHOLDER_ICON_SMALL_WIDTH
      : PLACEHOLDER_ICON_LARGE_WIDTH;

    const placeholderIconMargin = isSmallPlaceholderIcon
      ? PLACEHOLDER_ICON_SMALL_MARGIN
      : PLACEHOLDER_ICON_LARGE_MARGIN;

    /**
     * @param {number} containerWidth
     * @param {number} itemWidth
     * @param {number} itemMargin
     * @param {number} step
     * @return {number}
     */
    const iconPlacementFn = isPlacementRtl
      ? calculateLeftJustifiedX
      : calculateRightJustifiedX;

    const placeholderIconX = iconPlacementFn(
      width,
      placeholderIconWidth,
      placeholderIconMargin,
      step
    );

    video.mutateElement(() => {
      internalElement.classList.add(BASE_CLASS_NAME);

      // Resets .i-amphtml-layout-size-defined to fix clipping on Safari.
      setImportantStyles(element, {'overflow': 'visible'});

      toggle(shadowLayer, true);
      toggle(overlay, true);

      applyFillContent(this.getPlaceholderRefs_()['poster']);
      applyFillContent(placeholderBackground);
      this.setPosterImage_(video);

      element.appendChild(placeholderBackground);

      // Delay by one frame to account for reparenting.
      this.raf_(() => {
        video.mutateElement(() => {
          setOpacity(placeholderBackground);
          setTransitionTiming(placeholderBackground);
          setTransitionTiming(placeholderIcon);
          if (hasRelativePlacement) {
            const y = 0;
            const scale = 1;
            setImportantStyles(placeholderIcon, {
              'transform': transform(placeholderIconX, y, scale),
            });
          }
        });
      });

      // To re-orient position: absolute elements since they're no longer
      // relative to viewport rect.
      let offsetLeft = 0;
      let offsetTop = 0;

      // Body-level elements that do not descend from the <amp-video> element,
      // like the shadow layer, need to be additionally offset by the inline
      // element's position relative to the body.
      let bodyLevelOffsetLeft = 0;
      let bodyLevelOffsetTop = 0;

      if (position === 'absolute') {
        offsetLeft = inlineRect.left;
        offsetTop = inlineRect.top;
        bodyLevelOffsetLeft = element./*OK*/ offsetLeft;
        bodyLevelOffsetTop = element./*OK*/ offsetTop;
      }

      this.getElementsOnDockArea_(video).forEach((element) => {
        const bodyLevelOffsetFactor = Number(element !== internalElement);

        const left = bodyLevelOffsetFactor * bodyLevelOffsetLeft - offsetLeft;
        const top = bodyLevelOffsetFactor * bodyLevelOffsetTop - offsetTop;

        setImportantStyles(element, {
          'position': position,
          'left': px(left),
          'top': px(top),
          'transform': transform(x, y, scale),
        });

        setTransitionTiming(element);
        maybeSetSizing(element);
      });

      setOpacity(shadowLayer);

      this.getControls_().positionOnVsync(scale, x, y, width, height);
    });

    return this.getTimer_()
      .promise(transitionDurationMs)
      .then(() => {
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
   * @param {!VideoOrBaseElementDef} video
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
   * @param {!VideoOrBaseElementDef} video
   * @private
   */
  setPosterImage_(video) {
    const placeholderPoster = this.getPlaceholderRefs_()['poster'];
    const posterSrc = getPosterImageSrc(video.element);

    if (!posterSrc) {
      toggle(placeholderPoster, false);
      return;
    }

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
   * @param {!VideoOrBaseElementDef} video
   * @return {boolean}
   */
  isCurrentlyDocked_(video) {
    return !!this.currentlyDocked_ && this.currentlyDocked_.video == video;
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @param {number} step
   */
  setCurrentlyDocked_(video, target, step) {
    const previouslyDocked = this.currentlyDocked_;
    const viewportRect = {...this.viewportRect_};
    this.currentlyDocked_ = {video, target, step, viewportRect};
    if (
      previouslyDocked &&
      previouslyDocked.video == video &&
      layoutRectEquals(target.rect, previouslyDocked.target.rect)
    ) {
      return;
    }
    this.getControls_().setVideo(video, target.rect);
    this.trigger_(Actions.DOCK, target);
  }

  /**
   * @param {number} offsetX
   * @private
   */
  offsetX_(offsetX) {
    const video = this.getDockedVideo_();
    const {target} = this.currentlyDocked_;

    const step = 1;
    const transitionDurationMs = 0;

    const {scale, x, y} = this.getDims_(video, target, step);
    const centerX = this.getCenterX_(offsetX);
    const directionX = this.calculateDirectionX_(centerX);

    this.dragVelocityX_ = offsetX - this.previousDragOffsetX_;
    this.previousDragOffsetX_ = offsetX;

    this.placeAt_(
      video,
      x + offsetX,
      y,
      scale,
      step,
      transitionDurationMs,
      directionX
    );
  }

  /**
   * @param {!AmpElement|!VideoOrBaseElementDef} element
   * @param {number=} minRatio
   * @param {!RectDef=} opt_inlineRect
   * @return {boolean}
   */
  isVisible_(element, minRatio = 1, opt_inlineRect) {
    const inlineRect = opt_inlineRect || this.getScrollAdjustedRect_(element);

    // If the component's box is way out of view, the runtime might have
    // discarded its size values.
    if (!isSizedRect(inlineRect)) {
      return 0;
    }

    const intersectionHeight =
      Math.min(inlineRect.bottom, this.viewportRect_.bottom) -
      Math.max(inlineRect.top, this.viewportRect_.top);

    const intersectionRatio = Math.max(
      0,
      intersectionHeight / inlineRect.height
    );

    return intersectionRatio > minRatio - FLOAT_TOLERANCE;
  }

  /**
   * @param {!MouseEvent|!TouchEvent} e
   * @private
   */
  drag_(e) {
    if (!this.currentlyDocked_) {
      return;
    }

    if (this.isDockedToType_(DockTargetType.SLOT)) {
      return;
    }

    // Don't allow dragging videos that are transitioning.
    // This allows the user to keep scrolling while touching the inline/almost
    // inline video area.
    if (this.isTransitioning_) {
      return;
    }

    this.dragOffsetX_ = 0;

    const {x} = pointerCoords(e);
    const {directionX} = this.currentlyDocked_.target;

    const onDragMove = throttleByAnimationFrame(this.ampdoc_.win, (e) =>
      this.onDragMove_(
        /** @type {!TouchEvent|!MouseEvent} */ (e),
        directionX,
        x
      )
    );

    const onDragEnd = () => this.onDragEnd_(unlisteners);

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
   * @param {!DockTargetType} type
   * @return {boolean}
   * @private
   */
  isDockedToType_(type) {
    return (
      !!this.currentlyDocked_ && this.currentlyDocked_.target.type === type
    );
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
   * @param {!DirectionX} directionX
   * @param {number} startX
   * @private
   */
  onDragMove_(e, directionX, startX) {
    if (this.currentlyDocked_.target.directionX !== directionX) {
      // stale event
      return;
    }

    const offsetX = pointerCoords(e).x - startX;

    this.dragOffsetX_ = offsetX;

    // Prevents dragging misfires.
    if (offsetX <= 10) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    this.getControls_().hide(/* respectSticky */ false, /* immediately */ true);
    this.isDragging_ = true;
    this.getControls_().disable();
    this.offsetX_(offsetX);
  }

  /**
   * Works around https://bugs.webkit.org/show_bug.cgi?id=184250
   * @return {!UnlistenDef}
   * @private
   */
  workaroundWebkitDragAndScrollIssue_() {
    const {win} = this.ampdoc_;
    if (!Services.platformFor(win).isIos()) {
      return () => {
        /* NOOP */
      };
    }
    const handler = (e) => e.preventDefault();
    win.addEventListener('touchmove', handler, {passive: false});
    return () => win.removeEventListener('touchmove', handler);
  }

  /**
   * @param {!Array<!UnlistenDef>} unlisteners
   * @private
   */
  onDragEnd_(unlisteners) {
    unlisteners.forEach((unlisten) => unlisten.call());

    this.isDragging_ = false;

    this.getControls_().enable();

    if (Math.abs(this.dragVelocityX_) < 40) {
      this.snap_(this.dragOffsetX_);
    } else {
      this.flickToDismiss_(
        this.previousDragOffsetX_,
        Math.sign(this.dragVelocityX_)
      );
    }

    this.dragVelocityX_ = 0;
    this.previousDragOffsetX_ = 0;
    this.dragOffsetX_ = 0;
  }

  /**
   * @param {number} offsetX
   * @param {number} direction -1 or 1
   * @private
   */
  flickToDismiss_(offsetX, direction) {
    devAssert(Math.abs(direction) == 1);

    const video = this.getDockedVideo_();

    video.pause();

    // TODO: Reuse a inlineRect
    if (this.isVisible_(video, 0.2)) {
      this.bounceToDismiss_(video, offsetX, direction);
      return;
    }

    const step = 1;
    const {target} = devAssert(this.currentlyDocked_);
    const {width, x, y} = target.rect;
    const {scale} = this.getDims_(video, target, step);

    const currentX = x + offsetX;
    const nextX =
      direction == 1
        ? this.viewportRect_.right
        : this.viewportRect_.left - width;

    const transitionDurationMs = this.calculateDismissalTransitionDurationMs_(
      nextX - currentX
    );

    this.reconcileUndocked_();

    // Show immediately due to Chrome freeze bug when out-of-view.
    video.showControls();

    this.placeAt_(
      video,
      nextX,
      y,
      scale,
      /* step */ 0,
      transitionDurationMs
    ).then(() => {
      this.resetOnUndock_(video);
    });
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {number} offsetX
   * @param {number} direction -1 or 1
   * @private
   */
  bounceToDismiss_(video, offsetX, direction) {
    devAssert(Math.abs(direction) == 1);

    const step = 1;
    const {target} = devAssert(this.currentlyDocked_);

    const {width, x, y} = target.rect;
    const {scale} = this.getDims_(video, target, step);

    const outerWidth = this.viewportRect_.width;

    const currentX = x + offsetX;
    const nextX =
      direction == 1
        ? calculateRightJustifiedX(outerWidth, width, /* margin */ 0, step)
        : calculateLeftJustifiedX(outerWidth, width, /* margin */ 0, step);

    const transitionDurationMs = this.calculateDismissalTransitionDurationMs_(
      nextX - currentX
    );

    this.reconcileUndocked_();

    this.placeAt_(
      video,
      nextX,
      y,
      scale,
      /* step */ 0,
      transitionDurationMs
    ).then(() => {
      // TODO: Reuse a inlineRect
      this.undock_(video, /* reconciled */ true);
      video.showControls();
    });
  }

  /**
   * @param {number} deltaX
   * @return {number}
   * @private
   */
  calculateDismissalTransitionDurationMs_(deltaX) {
    return Math.min(300, Math.abs(deltaX) / 2);
  }

  /**
   * Gets the horizontal center of the currently docked video, offset by x.
   * @param {number} offsetX
   * @return {number}
   * @private
   */
  getCenterX_(offsetX) {
    const {step, target} = this.currentlyDocked_;
    const video = this.getDockedVideo_();
    const {width} = video.element./*OK*/ getBoundingClientRect();
    const {scale, x} = this.getDims_(video, target, step);
    return x + offsetX + (width * scale) / 2;
  }

  /**
   * @param {number} offsetX
   * @private
   */
  snap_(offsetX) {
    const video = this.getDockedVideo_();
    const {step} = this.currentlyDocked_;

    const directionX = this.calculateDirectionX_(offsetX);
    this.cornerDirectionX_ = directionX;

    // TODO: Reuse inlineRect
    const target = this.getUsableTarget_(video);

    this.currentlyDocked_.target = target;

    const {scale, x, y} = this.getDims_(video, target, step);

    this.placeAt_(
      video,
      x,
      y,
      scale,
      step,
      /* transitionDurationMs */ 200,
      directionX
    );
  }

  /**
   * @param {number} offsetX
   * @return {!DirectionX}
   * @private
   */
  calculateDirectionX_(offsetX) {
    return this.getCenterX_(offsetX) >= this.viewportRect_.width / 2
      ? DirectionX.RIGHT
      : DirectionX.LEFT;
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {!DockTargetDef} target
   * @param {number} step in [0..1]
   * @param {!RectDef} opt_inlineRect
   * @return {{x: number, y: number, scale: number, relativeX: !DirectionX}}
   */
  getDims_(video, target, step, opt_inlineRect) {
    return interpolatedBoxesTransform(
      opt_inlineRect || this.getScrollAdjustedRect_(video),
      target.rect,
      step
    );
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @param {boolean=} opt_reconciled
   * @param {!RectDef=} opt_inlineRect
   * @return {!Promise}
   * @private
   */
  undock_(video, opt_reconciled, opt_inlineRect) {
    const isMostlyInView = this.isVisible_(
      video,
      REVERT_TO_INLINE_RATIO,
      opt_inlineRect
    );

    if (!isMostlyInView) {
      video.pause();

      // Show controls immediately rather than after transition to work around a
      // weird Chrome bug where controls never reappear if enabled on a paused,
      // out-of-view video.
      video.showControls();
    }

    if (!opt_reconciled) {
      this.reconcileUndocked_();
    }

    const step = 0;

    const {target} = devAssert(this.currentlyDocked_);

    const {relativeX, scale, x, y} = this.getDims_(video, target, step);

    // Do not animate transition if video is out-of-view. Chrome glitches
    // when pausing an out-of-view video, so we need to show controls and
    // transition after. If we animate the transition, we would see native
    // controls during, which looks a bit funky.
    const transitionDurationMs = isMostlyInView
      ? this.calculateTransitionDuration_(step)
      : 0;

    return this.placeAt_(
      video,
      x,
      y,
      scale,
      step,
      transitionDurationMs,
      relativeX,
      opt_inlineRect,
      /* position */ 'absolute'
    ).then(() => {
      video.showControls();
      this.resetOnUndock_(video);
    });
  }

  /** @private */
  reconcileUndocked_() {
    this.getControls_().disable();

    // Prevents ghosting
    this.getControls_().hide(/* respectSticky */ false, /* immediately */ true);

    this.trigger_(Actions.UNDOCK);
  }

  /**
   * @param {!VideoOrBaseElementDef} video
   * @return {!Promise}
   * @private
   */
  resetOnUndock_(video) {
    const {element} = video;
    const internalElement = getInternalVideoElementFor(element);

    return video.mutateElement(() => {
      internalElement.classList.remove(BASE_CLASS_NAME);
      const shadowLayer = this.getShadowLayer_();
      const placeholderIcon = this.getPlaceholderRefs_()['icon'];
      const placeholderBackground = this.getPlaceholderBackground_();

      toggle(shadowLayer, false);

      this.getControls_().reset();

      [
        internalElement,
        shadowLayer,
        placeholderBackground,
        placeholderIcon,
      ].forEach((el) => {
        resetStyles(el, [
          'transform',
          'transition',
          'min-width',
          'min-height',
          'width',
          'height',
          'opacity',
          'overflow',
          'position',
          'left',
          'top',
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

  /** @private */
  scrollBack_() {
    if (!this.currentlyDocked_) {
      return;
    }
    // Don't set duration or curve.
    // Rely on Viewport service to determine timing based on scroll Δ.
    this.viewport_.animateScrollIntoView(
      this.getDockedVideo_().element,
      'center'
    );
  }

  /**
   * Returns usable target. If it can dock to a `slot` element that's larger
   * than zero width/height, it calculates a letterboxed rectangle that matches
   * the aspect ratio of the `video` but is contained within the slot's box.
   * Otherwise returns a rectangle calculated relative to viewport and sticking
   * to the horizontal `directionX`.
   * @param {!AmpElement|!VideoOrBaseElementDef} video
   * @param {!RectDef=} opt_inlineRect
   * @return {!DockTargetDef}
   * @private
   */
  getUsableTarget_(video, opt_inlineRect) {
    const slot = this.getSlot_();
    const inlineRect =
      opt_inlineRect || video.element./*OK*/ getBoundingClientRect();

    if (slot) {
      return {
        type: DockTargetType.SLOT,
        rect: letterboxRect(inlineRect, slot./*OK*/ getBoundingClientRect()),
        slot,
      };
    }

    if (this.cornerDirectionX_ === null) {
      this.cornerDirectionX_ = isRTL(this.getDoc_())
        ? DirectionX.LEFT
        : DirectionX.RIGHT;
    }

    return {
      type: DockTargetType.CORNER,
      rect: topCornerRect(
        inlineRect,
        this.viewportRect_,
        this.cornerDirectionX_,
        CORNER_WIDTH_RATIO,
        CORNER_WIDTH_MIN,
        CORNER_MARGIN_RATIO,
        CORNER_MARGIN_MAX
      ),
      // Bookkeep horizontal edge for drag-and-snap.
      directionX: this.cornerDirectionX_,
    };
  }

  /**
   * @return {?Element}
   * @private
   */
  getSlot_() {
    const slot = this.findSlotOnce_();

    // Slots are optional by configuration but also by visibility.
    // If the slot element is hidden via media queries (`isVisibleBySize`),
    // fallback to corner.
    if (slot && isVisibleBySize(slot)) {
      return slot;
    }

    return null;
  }
}

AMP.extension(TAG, 0.1, (AMP) => {
  AMP.registerServiceForDoc('video-docking', VideoDocking);
});
