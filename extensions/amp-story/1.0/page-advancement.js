/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {AFFILIATE_LINK_SELECTOR} from './amp-story-affiliate-link';
import {
  Action,
  EmbeddedComponentState,
  InteractiveComponentDef,
  StateProperty,
  UIType,
  getStoreService,
} from './amp-story-store-service';
import {AdvancementMode} from './story-analytics';
import {Services} from '../../../src/services';
import {TAPPABLE_ARIA_ROLES} from '../../../src/service/action-impl';
import {VideoEvents} from '../../../src/video-interface';
import {closest, matches} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {escapeCssSelectorIdent} from '../../../src/css';
import {getAmpdoc} from '../../../src/service';
import {hasTapAction, timeStrToMillis} from './utils';
import {interactiveElementsSelectors} from './amp-story-embedded-component';
import {listenOnce} from '../../../src/event-helper';

/** @private @const {number} */
const HOLD_TOUCH_THRESHOLD_MS = 500;

/** @private @const {number} */
const NEXT_SCREEN_AREA_RATIO = 0.75;

/** @private @const {number} */
const PREVIOUS_SCREEN_AREA_RATIO = 0.25;

/** @private @const {number} */
const TOP_REGION = 0.8;

/**
 * Protected edges of the screen as a percent of page width. When tapped on these areas, we will
 * always perform navigation. Even if a clickable element is there.
 * @const {number}
 * @private
 */
const PROTECTED_SCREEN_EDGE_PERCENT = 12;

/**
 * Minimum protected edges of the screen in pixels.
 * If PROTECTED_SCREEN_EDGE_PERCENT results in a protected edge value less than MINIMUM_PROTECTED_SCREEN_EDGE_PX,
 * we will use MINIMUM_PROTECTED_SCREEN_EDGE_PX.
 * @const {number}
 * @private
 */
const MINIMUM_PROTECTED_SCREEN_EDGE_PX = 48;

/**
 * Maximum percent of screen that can be occupied by a single link
 * before the link is considered navigation blocking and ignored.
 * @const {number}
 * @private
 */
const MAX_LINK_SCREEN_PERCENT = 0.8;

const INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS = Object.values(
  interactiveElementsSelectors()
).join(',');

/** @const {number} */
export const POLL_INTERVAL_MS = 300;

/** @const @enum */
export const TapNavigationDirection = {
  'NEXT': 1,
  'PREVIOUS': 2,
};

/**
 * Base class for the AdvancementConfig.  By default, does nothing other than
 * tracking its internal state when started/stopped, and listeners will never be
 * invoked.
 */
export class AdvancementConfig {
  /**
   * @public
   */
  constructor() {
    /** @private @const {!Array<function(number)>} */
    this.progressListeners_ = [];

    /** @private @const {!Array<function()>} */
    this.advanceListeners_ = [];

    /** @private @const {!Array<function()>} */
    this.previousListeners_ = [];

    /** @private @const {!Array<function(number)>} */
    this.tapNavigationListeners_ = [];

    /** @private {boolean} */
    this.isRunning_ = false;
  }

  /**
   * @param {function(number)} progressListener A function that handles when the
   *     progress of the current page has been updated.  It accepts a number
   *     between 0.0 and 1.0 as its only argument, that represents the current
   *     progress.
   */
  addProgressListener(progressListener) {
    this.progressListeners_.push(progressListener);
  }

  /**
   * @param {function()} advanceListener A function that handles when a
   *     page should be advanced.
   */
  addAdvanceListener(advanceListener) {
    this.advanceListeners_.push(advanceListener);
  }

  /**
   * @param {function()} previousListener A function that handles when a
   *     page should go back to the previous page.
   */
  addPreviousListener(previousListener) {
    this.previousListeners_.push(previousListener);
  }

  /**
   * @param {function(number)} onTapNavigationListener A function that handles when a
   * navigation listener to be fired.
   */
  addOnTapNavigationListener(onTapNavigationListener) {
    this.tapNavigationListeners_.push(onTapNavigationListener);
  }

  /**
   * Invoked when the advancement configuration should begin taking effect.
   */
  start() {
    this.isRunning_ = true;
  }

  /**
   * Invoked when the advancement configuration should cease taking effect.
   * @param {boolean=} unusedCanResume
   */
  stop(unusedCanResume) {
    this.isRunning_ = false;
  }

  /**
   * Returns whether the advancement configuration will automatically advance
   * @return {boolean}
   */
  isAutoAdvance() {
    return false;
  }

  /**
   * @return {boolean}
   * @protected
   */
  isRunning() {
    return this.isRunning_;
  }

  /**
   * @return {number}
   */
  getProgress() {
    return 1;
  }

  /** @protected */
  onProgressUpdate() {
    const progress = this.getProgress();
    this.progressListeners_.forEach((progressListener) => {
      progressListener(progress);
    });
  }

  /** @protected */
  onAdvance() {
    this.advanceListeners_.forEach((advanceListener) => {
      advanceListener();
    });
  }

  /** @protected */
  onPrevious() {
    this.previousListeners_.forEach((previousListener) => {
      previousListener();
    });
  }

  /**
   * @param {number} navigationDirection Direction of navigation
   * @protected
   */
  onTapNavigation(navigationDirection) {
    this.tapNavigationListeners_.forEach((navigationListener) => {
      navigationListener(navigationDirection);
    });
  }

  /**
   * Provides an AdvancementConfig object for the specified amp-story or
   * amp-story-page.
   * @param {!Window} win
   * @param {!Element} element
   * @return {!AdvancementConfig|!ManualAdvancement|!TimeBasedAdvancement|!MediaBasedAdvancement}
   */
  static forElement(win, element) {
    const manualAdvancement = ManualAdvancement.fromElement(win, element);
    if (manualAdvancement) {
      return manualAdvancement;
    }

    const autoAdvanceStr = element.getAttribute('auto-advance-after');

    if (autoAdvanceStr) {
      const timeBasedAdvancement = TimeBasedAdvancement.fromAutoAdvanceString(
        autoAdvanceStr,
        win,
        element
      );
      if (timeBasedAdvancement) {
        return timeBasedAdvancement;
      }

      const mediaBasedAdvancement = MediaBasedAdvancement.fromAutoAdvanceString(
        autoAdvanceStr,
        win,
        element
      );
      if (mediaBasedAdvancement) {
        return mediaBasedAdvancement;
      }
    }

    return new AdvancementConfig();
  }
}

/**
 * Always provides a progress of 1.0.  Advances when the user taps the
 * corresponding section, depending on language settings.
 */
export class ManualAdvancement extends AdvancementConfig {
  /**
   * @param {!Window} win The Window object.
   * @param {!Element} element The element that, when clicked, can cause
   *     advancing to the next page or going back to the previous.
   */
  constructor(win, element) {
    super();

    /** @private @const {!Element} */
    this.element_ = element;

    /** @private {number|string|null} */
    this.timeoutId_ = null;

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private {?number} Last touchstart event's timestamp */
    this.touchstartTimestamp_ = null;

    /** @private {boolean} Saving the paused state before pressing */
    this.pausedState_ = false;

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = getAmpdoc(win.document);

    this.startListening_();

    if (element.ownerDocument.defaultView) {
      /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
      this.storeService_ = getStoreService(element.ownerDocument.defaultView);
    }

    const rtlState = this.storeService_.get(StateProperty.RTL_STATE);
    this.sections_ = {
      // Width and navigation direction of each section depend on whether the
      // document is RTL or LTR.
      left: {
        widthRatio: rtlState
          ? NEXT_SCREEN_AREA_RATIO
          : PREVIOUS_SCREEN_AREA_RATIO,
        direction: rtlState
          ? TapNavigationDirection.NEXT
          : TapNavigationDirection.PREVIOUS,
      },
      right: {
        widthRatio: rtlState
          ? PREVIOUS_SCREEN_AREA_RATIO
          : NEXT_SCREEN_AREA_RATIO,
        direction: rtlState
          ? TapNavigationDirection.PREVIOUS
          : TapNavigationDirection.NEXT,
      },
    };
  }

  /** @override */
  getProgress() {
    return 1.0;
  }

  /**
   * Binds the event listeners.
   * @private
   */
  startListening_() {
    this.element_.addEventListener(
      'touchstart',
      this.onTouchstart_.bind(this),
      true
    );
    this.element_.addEventListener(
      'touchend',
      this.onTouchend_.bind(this),
      true
    );
    this.element_.addEventListener(
      'click',
      this.maybePerformNavigation_.bind(this),
      true
    );
    this.ampdoc_.onVisibilityChanged(() => {
      this.ampdoc_.isVisible() ? this.processTouchend_() : null;
    });
  }

  /**
   * @override
   */
  isAutoAdvance() {
    return false;
  }

  /**
   * TouchEvent touchstart events handler.
   * @param {!Event} event
   * @private
   */
  onTouchstart_(event) {
    // Don't start the paused state if the event should not be handled by this
    // class. Also ignores any subsequent touchstart that would happen before
    // touchend was fired, since it'd reset the touchstartTimestamp (ie: user
    // touches the screen with a second finger).
    if (this.touchstartTimestamp_ || !this.shouldHandleEvent_(event)) {
      return;
    }
    this.touchstartTimestamp_ = Date.now();
    this.pausedState_ = /** @type {boolean} */ (this.storeService_.get(
      StateProperty.PAUSED_STATE
    ));
    this.storeService_.dispatch(Action.TOGGLE_PAUSED, true);
    this.timeoutId_ = this.timer_.delay(() => {
      this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, false);
    }, HOLD_TOUCH_THRESHOLD_MS);
  }

  /**
   * TouchEvent touchend events handler.
   * @param {!Event} event
   * @private
   */
  onTouchend_(event) {
    // Ignores the event if there's still a user's finger holding the screen.
    const touchesCount = (event.touches || []).length;
    if (!this.touchstartTimestamp_ || touchesCount > 0) {
      return;
    }

    // Cancels the navigation if user paused the story for over 500ms. Calling
    // preventDefault on the touchend event ensures the click/tap event won't
    // fire.
    if (Date.now() - this.touchstartTimestamp_ > HOLD_TOUCH_THRESHOLD_MS) {
      event.preventDefault();
    }

    this.processTouchend_();
  }

  /**
   * Logic triggered by touchend events.
   * @private
   */
  processTouchend_() {
    if (!this.touchstartTimestamp_) {
      return;
    }
    this.storeService_.dispatch(Action.TOGGLE_PAUSED, this.pausedState_);
    this.touchstartTimestamp_ = null;
    this.timer_.cancel(this.timeoutId_);
    this.timeoutId_ = null;
    if (
      !this.storeService_.get(StateProperty.SYSTEM_UI_IS_VISIBLE_STATE) &&
      /** @type {InteractiveComponentDef} */ (this.storeService_.get(
        StateProperty.INTERACTIVE_COMPONENT_STATE
      )).state !== EmbeddedComponentState.EXPANDED
    ) {
      this.storeService_.dispatch(Action.TOGGLE_SYSTEM_UI_IS_VISIBLE, true);
    }
  }

  /**
   * Determines whether a click should be used for navigation.  Navigate should
   * occur unless the click is on the system layer, or on an element that
   * defines on="tap:..."
   * @param {!Event} event 'click' event.
   * @return {boolean} true, if the click should be used for navigation.
   * @private
   */
  isNavigationalClick_(event) {
    return !closest(
      dev().assertElement(event.target),
      (el) => {
        return hasTapAction(el);
      },
      /* opt_stopAt */ this.element_
    );
  }

  /**
   * We want clicks on certain elements to be exempted from normal page
   * navigation
   * @param {!Event} event
   * @return {boolean}
   * @private
   */
  isProtectedTarget_(event) {
    return !!closest(
      dev().assertElement(event.target),
      (el) => {
        const elementRole = el.getAttribute('role');

        if (elementRole) {
          return !!TAPPABLE_ARIA_ROLES[elementRole.toLowerCase()];
        }
        return false;
      },
      /* opt_stopAt */ this.element_
    );
  }

  /**
   * Checks if the event should be handled by ManualAdvancement, or should
   * follow its capture phase.
   * @param {!Event} event
   * @return {boolean}
   * @private
   */
  shouldHandleEvent_(event) {
    let shouldHandleEvent = false;
    let tagName;

    closest(
      dev().assertElement(event.target),
      (el) => {
        tagName = el.tagName.toLowerCase();

        if (tagName === 'amp-story-page-attachment') {
          shouldHandleEvent = false;
          return true;
        }

        if (
          tagName.startsWith('amp-story-interactive-') &&
          !this.isInStoryPageSideEdge_(event, this.getStoryPageRect_())
        ) {
          shouldHandleEvent = false;
          return true;
        }

        if (tagName === 'amp-story-page') {
          shouldHandleEvent = true;
          return true;
        }

        return false;
      },
      /* opt_stopAt */ this.element_
    );

    return shouldHandleEvent;
  }

  /**
   * For an element to trigger a tooltip it has to be descendant of
   * amp-story-page but not of amp-story-cta-layer or amp-story-page-attachment.
   * @param {!Event} event
   * @param {!ClientRect} pageRect
   * @return {boolean}
   * @private
   */
  canShowTooltip_(event, pageRect) {
    let valid = true;
    let tagName;
    // We have a `pointer-events: none` set to all children of <a> tags inside
    // of amp-story-grid-layer, which acts as a click shield, making sure we
    // handle the click before navigation (see amp-story.css). It also ensures
    // we always get the <a> to be the target, even if it has children (e.g.
    // <span>).
    const target = dev().assertElement(event.target);

    if (
      this.isInStoryPageSideEdge_(event, pageRect) ||
      this.isTooLargeOnPage_(event, pageRect)
    ) {
      event.preventDefault();
      return false;
    }

    if (
      target.getAttribute('show-tooltip') === 'auto' &&
      this.isInScreenBottom_(target, pageRect)
    ) {
      target.setAttribute('target', '_blank');
      target.setAttribute('role', 'link');
      return false;
    }

    return !!closest(
      target,
      (el) => {
        tagName = el.tagName.toLowerCase();

        if (
          tagName === 'amp-story-cta-layer' ||
          tagName === 'amp-story-page-attachment'
        ) {
          valid = false;
          return false;
        }

        return tagName === 'amp-story-page' && valid;
      },
      /* opt_stopAt */ this.element_
    );
  }

  /**
   * Checks if element is inside of the bottom region of the screen.
   * @param {!Element} target
   * @param {!ClientRect} pageRect
   * @return {boolean}
   * @private
   */
  isInScreenBottom_(target, pageRect) {
    const targetRect = target./*OK*/ getBoundingClientRect();
    return targetRect.top - pageRect.top >= pageRect.height * TOP_REGION;
  }

  /**
   * Checks if click was inside of one of the side edges of the page.
   * @param {!Event} event
   * @param {!ClientRect} pageRect
   * @return {boolean}
   * @private
   */
  isInStoryPageSideEdge_(event, pageRect) {
    // Clicks with coordinates (0,0) are assumed to be from keyboard or Talkback.
    // These clicks should never be overriden for navigation.
    if (event.clientX === 0 && event.clientY === 0) {
      return false;
    }

    const sideEdgeWidthFromPercent =
      pageRect.width * (PROTECTED_SCREEN_EDGE_PERCENT / 100);
    const sideEdgeLimit = Math.max(
      sideEdgeWidthFromPercent,
      MINIMUM_PROTECTED_SCREEN_EDGE_PX
    );

    return (
      event.clientX <= pageRect.x + sideEdgeLimit ||
      event.clientX >= pageRect.x + pageRect.width - sideEdgeLimit
    );
  }

  /**
   * Checks if click target is too large on the page and preventing navigation.
   * If yes, the link is ignored & logged.
   * @param {!Event} event
   * @param {!ClientRect} pageRect
   * @return {boolean}
   * @private
   */
  isTooLargeOnPage_(event, pageRect) {
    // Clicks with coordinates (0,0) are assumed to be from keyboard or Talkback.
    // These clicks should never be overriden for navigation.
    if (event.clientX === 0 && event.clientY === 0) {
      return false;
    }

    const target = dev().assertElement(event.target);
    const targetRect = target./*OK*/ getBoundingClientRect();
    if (
      (targetRect.height * targetRect.width) /
        (pageRect.width * pageRect.height) >=
      MAX_LINK_SCREEN_PERCENT
    ) {
      user().error(
        'AMP-STORY-PAGE',
        'Link was too large; skipped for navigation. For more information, see https://github.com/ampproject/amphtml/issues/31108'
      );
      return true;
    }
    return false;
  }

  /**
   * Checks if click should be handled by the embedded component logic rather
   * than by navigation.
   * @param {!Event} event
   * @param {!ClientRect} pageRect
   * @return {boolean}
   * @private
   */
  isHandledByEmbeddedComponent_(event, pageRect) {
    const target = dev().assertElement(event.target);
    const stored = /** @type {InteractiveComponentDef} */ (this.storeService_.get(
      StateProperty.INTERACTIVE_COMPONENT_STATE
    ));
    const inExpandedMode = stored.state === EmbeddedComponentState.EXPANDED;

    return (
      inExpandedMode ||
      (matches(target, INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS) &&
        this.canShowTooltip_(event, pageRect))
    );
  }

  /**
   * Check if click should be handled by the affiliate link logic.
   * @param {!Element} target
   * @private
   * @return {boolean}
   */
  isHandledByAffiliateLink_(target) {
    const clickedOnLink = matches(target, AFFILIATE_LINK_SELECTOR);

    // do not handle if clicking on expanded affiliate link
    if (clickedOnLink && target.hasAttribute('expanded')) {
      return false;
    }

    const expandedElement = this.storeService_.get(
      StateProperty.AFFILIATE_LINK_STATE
    );

    return expandedElement != null || clickedOnLink;
  }

  /**
   * Performs a system navigation if it is determined that the specified event
   * was a click intended for navigation.
   * @param {!Event} event 'click' event
   * @private
   */
  maybePerformNavigation_(event) {
    const target = dev().assertElement(event.target);

    const pageRect = this.getStoryPageRect_();

    if (this.isHandledByEmbeddedComponent_(event, pageRect)) {
      event.stopPropagation();
      event.preventDefault();
      const embedComponent = /** @type {InteractiveComponentDef} */ (this.storeService_.get(
        StateProperty.INTERACTIVE_COMPONENT_STATE
      ));
      this.storeService_.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
        element: target,
        state: embedComponent.state || EmbeddedComponentState.FOCUSED,
        clientX: event.clientX,
        clientY: event.clientY,
      });
      return;
    }

    if (this.isHandledByAffiliateLink_(target)) {
      event.preventDefault();
      event.stopPropagation();
      const clickedOnLink = matches(target, AFFILIATE_LINK_SELECTOR);
      if (clickedOnLink) {
        this.storeService_.dispatch(Action.TOGGLE_AFFILIATE_LINK, target);
      } else {
        this.storeService_.dispatch(Action.TOGGLE_AFFILIATE_LINK, null);
      }
      return;
    }

    if (
      !this.isRunning() ||
      !this.isNavigationalClick_(event) ||
      this.isProtectedTarget_(event) ||
      !this.shouldHandleEvent_(event)
    ) {
      // If the system doesn't need to handle this click, then we can simply
      // return and let the event propagate as it would have otherwise.
      return;
    }

    event.stopPropagation();

    this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE
    );

    // Using `left` as a fallback since Safari returns a ClientRect in some
    // cases.
    const offsetLeft = 'x' in pageRect ? pageRect.x : pageRect.left;

    const page = {
      // Offset starting left of the page.
      offset: offsetLeft,
      width: pageRect.width,
      clickEventX: event.pageX,
    };

    this.onTapNavigation(this.getTapDirection_(page));
  }

  /**
   * Calculates the pageRect based on the UIType.
   * We can an use LayoutBox for mobile since the story page occupies entire screen.
   * Desktop UI needs the most recent value from the getBoundingClientRect function.
   * @return {DOMRect | LayoutBox}
   * @private
   */
  getStoryPageRect_() {
    if (
      this.storeService_.get(StateProperty.UI_STATE) !== UIType.DESKTOP_PANELS
    ) {
      return this.element_.getLayoutBox();
    } else {
      return this.element_
        .querySelector('amp-story-page[active]')
        ./*OK*/ getBoundingClientRect();
    }
  }

  /**
   * Decides what direction to navigate depending on which
   * section of the page was there a click. The navigation direction of each
   * individual section has been previously defined depending on the language
   * settings.
   * @param {!Object} page
   * @return {number}
   * @private
   */
  getTapDirection_(page) {
    const {left, right} = this.sections_;

    if (page.clickEventX <= page.offset + left.widthRatio * page.width) {
      return left.direction;
    }

    return right.direction;
  }

  /**
   * Gets an instance of ManualAdvancement based on the HTML tag of the element.
   * @param {!Window} win
   * @param {!Element} element
   * @return {?AdvancementConfig} An AdvancementConfig, only if the element is
   *                              an amp-story tag.
   */
  static fromElement(win, element) {
    if (element.tagName.toLowerCase() !== 'amp-story') {
      return null;
    }
    return new ManualAdvancement(win, element);
  }
}

/**
 * Provides progress and advancement based on a fixed duration of time,
 * specified in either seconds or milliseconds.
 */
export class TimeBasedAdvancement extends AdvancementConfig {
  /**
   * @param {!Window} win The Window object.
   * @param {number} delayMs The duration to wait before advancing.
   * @param {!Element} element
   */
  constructor(win, delayMs, element) {
    super();

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private @const {number} */
    this.delayMs_ = delayMs;

    /** @private {?number} */
    this.remainingDelayMs_ = null;

    /** @private {?number} */
    this.startTimeMs_ = null;

    /** @private {number|string|null} */
    this.timeoutId_ = null;

    if (element.ownerDocument.defaultView) {
      /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
      this.storeService_ = getStoreService(element.ownerDocument.defaultView);
    }
  }

  /**
   * @return {number} The current timestamp, in milliseconds.
   * @private
   */
  getCurrentTimestampMs_() {
    return Date.now();
  }

  /** @override */
  start() {
    super.start();

    if (this.remainingDelayMs_) {
      this.startTimeMs_ =
        this.getCurrentTimestampMs_() -
        (this.delayMs_ - this.remainingDelayMs_);
    } else {
      this.startTimeMs_ = this.getCurrentTimestampMs_();
    }

    this.timeoutId_ = this.timer_.delay(
      () => this.onAdvance(),
      this.remainingDelayMs_ || this.delayMs_
    );

    this.onProgressUpdate();

    this.timer_.poll(POLL_INTERVAL_MS, () => {
      this.onProgressUpdate();
      return !this.isRunning();
    });
  }

  /** @override */
  stop(canResume = false) {
    super.stop();

    if (this.timeoutId_ !== null) {
      this.timer_.cancel(this.timeoutId_);
    }

    // Store the remaining time if the advancement can be resume, ie: if it is
    // paused.
    this.remainingDelayMs_ = canResume
      ? this.startTimeMs_ + this.delayMs_ - this.getCurrentTimestampMs_()
      : null;
  }

  /**
   * @override
   */
  isAutoAdvance() {
    return true;
  }

  /** @override */
  getProgress() {
    if (this.startTimeMs_ === null) {
      return 0;
    }

    const progress =
      (this.getCurrentTimestampMs_() - this.startTimeMs_) / this.delayMs_;

    return Math.min(Math.max(progress, 0), 1);
  }

  /** @override */
  onAdvance() {
    this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.AUTO_ADVANCE_TIME
    );
    super.onAdvance();
  }

  /**
   * Gets an instance of TimeBasedAdvancement based on the value of the
   * auto-advance string (from the 'auto-advance-after' attribute on the page).
   * @param {string} autoAdvanceStr The value of the auto-advance-after
   *     attribute.
   * @param {!Window} win
   * @param {!Element} element
   * @return {?AdvancementConfig} An AdvancementConfig, if time-based
   *     auto-advance is supported for the specified auto-advance string; null
   *     otherwise.
   */
  static fromAutoAdvanceString(autoAdvanceStr, win, element) {
    if (!autoAdvanceStr) {
      return null;
    }

    const delayMs = timeStrToMillis(autoAdvanceStr);
    if (delayMs === undefined || isNaN(delayMs)) {
      return null;
    }

    return new TimeBasedAdvancement(win, Number(delayMs), element);
  }
}

/**
 * Provides progress and advances pages based on the completion percentage of
 * playback of an HTMLMediaElement or a video that implements the AMP
 * video-interface.
 *
 * These are combined into a single AdvancementConfig implementation because we
 * may not know at build time whether a video implements the AMP
 * video-interface, since that is dependent on the amp-video buildCallback
 * having been executed before the amp-story-page buildCallback, which is not
 * guaranteed.
 */
export class MediaBasedAdvancement extends AdvancementConfig {
  /**
   * @param {!Window} win
   * @param {!Element} element
   */
  constructor(win, element) {
    super();

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private {!Element} */
    this.element_ = element;

    /** @private {?Element} */
    this.mediaElement_ = null;

    /** @private {!Array<!UnlistenDef>} */
    this.unlistenFns_ = [];

    /** @protected {?UnlistenDef} */
    this.unlistenEndedFn_ = null;

    /** @protected {?UnlistenDef} */
    this.unlistenTimeupdateFn_ = null;

    /** @private {?../../../src/video-interface.VideoInterface} */
    this.video_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);
  }

  /**
   * Determines whether the element for auto advancement implements the video
   * interface.
   * @return {boolean} true, if the specified element implements the video
   *     interface.
   * @private
   */
  isVideoInterfaceVideo_() {
    return this.element_.classList.contains('i-amphtml-video-interface');
  }

  /**
   * Gets an HTMLMediaElement from an element that wraps it.
   * @return {?Element} The underlying HTMLMediaElement, if one exists.
   * @private
   */
  getMediaElement_() {
    const tagName = this.element_.tagName.toLowerCase();

    if (this.element_ instanceof HTMLMediaElement) {
      return this.element_;
    } else if (
      this.element_.hasAttribute('background-audio') &&
      tagName === 'amp-story-page'
    ) {
      return this.element_.querySelector('.i-amphtml-story-background-audio');
    } else if (tagName === 'amp-audio') {
      return this.element_.querySelector('audio');
    }

    return null;
  }

  /** @override */
  start() {
    super.start();

    // Prevents race condition when checking for video interface classname.
    (this.element_.whenBuilt
      ? this.element_.whenBuilt()
      : Promise.resolve()
    ).then(() => this.startWhenBuilt_());
  }

  /** @private */
  startWhenBuilt_() {
    if (this.isVideoInterfaceVideo_()) {
      this.startVideoInterfaceElement_();
      return;
    }

    if (!this.mediaElement_) {
      this.mediaElement_ = this.getMediaElement_();
    }

    if (this.mediaElement_) {
      this.startHtmlMediaElement_();
      return;
    }

    user().error(
      'AMP-STORY-PAGE',
      `Element with ID ${this.element_.id} is not a media element ` +
        'supported for automatic advancement.'
    );
  }

  /** @private */
  startHtmlMediaElement_() {
    const mediaElement = dev().assertElement(
      this.mediaElement_,
      'Media element was unspecified.'
    );

    // Removes [loop] attribute if specified, so the 'ended' event can trigger.
    this.mediaElement_.removeAttribute('loop');

    this.unlistenFns_.push(
      listenOnce(mediaElement, 'ended', () => this.onAdvance())
    );

    this.onProgressUpdate();

    this.timer_.poll(POLL_INTERVAL_MS, () => {
      this.onProgressUpdate();
      return !this.isRunning();
    });
  }

  /** @private */
  startVideoInterfaceElement_() {
    this.element_.getImpl().then((video) => {
      this.video_ = video;
    });

    // Removes [loop] attribute if specified, so the 'ended' event can trigger.
    this.element_.querySelector('video').removeAttribute('loop');

    this.unlistenFns_.push(
      listenOnce(this.element_, VideoEvents.ENDED, () => this.onAdvance(), {
        capture: true,
      })
    );

    this.onProgressUpdate();

    this.timer_.poll(POLL_INTERVAL_MS, () => {
      this.onProgressUpdate();
      return !this.isRunning();
    });
  }

  /** @override */
  stop() {
    super.stop();
    this.unlistenFns_.forEach((fn) => fn());
  }

  /**
   * @override
   */
  isAutoAdvance() {
    return true;
  }

  /** @override */
  getProgress() {
    if (this.isVideoInterfaceVideo_()) {
      if (this.video_ && this.video_.getDuration()) {
        return this.video_.getCurrentTime() / this.video_.getDuration();
      }

      return 0;
    }

    if (this.mediaElement_ && this.mediaElement_.duration) {
      return this.mediaElement_.currentTime / this.mediaElement_.duration;
    }

    return super.getProgress();
  }

  /** @override */
  onAdvance() {
    this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.AUTO_ADVANCE_MEDIA
    );
    super.onAdvance();
  }

  /**
   * Gets an instance of MediaBasedAdvancement based on the value of the
   * auto-advance string (from the 'auto-advance-after' attribute on the page).
   * @param {string} autoAdvanceStr The value of the auto-advance-after
   *     attribute.
   * @param {!Window} win
   * @param {!Element} pageEl
   * @return {?AdvancementConfig} An AdvancementConfig, if media-element-based
   *     auto-advance is supported for the specified auto-advance string; null
   *     otherwise.
   */
  static fromAutoAdvanceString(autoAdvanceStr, win, pageEl) {
    try {
      // amp-video, amp-audio, as well as amp-story-page with a background audio
      // are eligible for media based auto advance.
      let element = pageEl.querySelector(
        `amp-video[data-id=${escapeCssSelectorIdent(autoAdvanceStr)}],
          amp-video#${escapeCssSelectorIdent(autoAdvanceStr)},
          amp-audio[data-id=${escapeCssSelectorIdent(autoAdvanceStr)}],
          amp-audio#${escapeCssSelectorIdent(autoAdvanceStr)}`
      );
      if (
        matches(
          pageEl,
          `amp-story-page[background-audio]#${escapeCssSelectorIdent(
            autoAdvanceStr
          )}`
        )
      ) {
        element = pageEl;
      }
      if (!element) {
        if (autoAdvanceStr) {
          user().warn(
            'AMP-STORY-PAGE',
            `Element with ID ${pageEl.id} has no media element ` +
              'supported for automatic advancement.'
          );
        }
        return null;
      }

      return new MediaBasedAdvancement(win, element);
    } catch (e) {
      return null;
    }
  }
}
