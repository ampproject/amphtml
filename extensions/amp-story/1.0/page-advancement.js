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
import {
  Action,
  EmbeddedComponentState,
  InteractiveComponentDef,
  StateProperty,
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
import {hasTapAction, isMediaDisplayed, timeStrToMillis} from './utils';
import {
  interactiveElementsSelectors,
} from './amp-story-embedded-component';
import {listen, listenOnce} from '../../../src/event-helper';
import {toArray} from '../../../src/types';

/** @private @const {number} */
const HOLD_TOUCH_THRESHOLD_MS = 500;

/** @private @const {number} */
const NEXT_SCREEN_AREA_RATIO = 0.75;

/** @private @const {number} */
const PREVIOUS_SCREEN_AREA_RATIO = 0.25;

const INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS = Object.values(
    interactiveElementsSelectors()).join(',');

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
    this.progressListeners_.forEach(progressListener => {
      progressListener(progress);
    });
  }

  /** @protected */
  onAdvance() {
    this.advanceListeners_.forEach(advanceListener => {
      advanceListener();
    });
  }

  /** @protected */
  onPrevious() {
    this.previousListeners_.forEach(previousListener => {
      previousListener();
    });
  }

  /**
   * @param {number} navigationDirection Direction of navigation
   * @protected
   */
  onTapNavigation(navigationDirection) {
    this.tapNavigationListeners_.forEach(navigationListener => {
      navigationListener(navigationDirection);
    });
  }

  /**
   * Provides an AdvancementConfig object for the specified amp-story-page.
   * @param {!./amp-story-page.AmpStoryPage|!./amp-story.AmpStory} element
   * @return {!AdvancementConfig | !ManualAdvancement | !MultipleAdvancementConfig}
   */
  static forElement(element) {
    const rootEl = element.element;
    const win = /** @type {!Window} */ (rootEl.ownerDocument.defaultView);
    const autoAdvanceStr = rootEl.getAttribute('auto-advance-after');
    const supportedAdvancementModes = [
      ManualAdvancement.fromElement(win, rootEl),
      TimeBasedAdvancement.fromAutoAdvanceString(autoAdvanceStr, win, rootEl),
      MediaBasedAdvancement.fromAutoAdvanceString(autoAdvanceStr, win, rootEl),
    ].filter(x => x !== null);

    if (supportedAdvancementModes.length === 0) {
      return new AdvancementConfig();
    }

    if (supportedAdvancementModes.length === 1) {
      return supportedAdvancementModes[0];
    }

    return new MultipleAdvancementConfig(supportedAdvancementModes);
  }
}


/**
 * An AdvancementConfig implementation that composes multiple other
 * AdvancementConfig implementations by simply delegating all of its calls to
 * an array of underlying advancement modes.
 */
class MultipleAdvancementConfig extends AdvancementConfig {
  /**
   * @param {!Array<!AdvancementConfig>} advancementModes A list of
   *     AdvancementConfigs to which all calls should be delegated.
   */
  constructor(advancementModes) {
    super();

    /** @private @const {!Array<!AdvancementConfig>} */
    this.advancementModes_ = advancementModes;
  }

  /** @override */
  addProgressListener(progressListener) {
    this.advancementModes_.forEach(advancementMode => {
      advancementMode.addProgressListener(progressListener);
    });
  }

  /** @override */
  addOnTapNavigationListener(onTapNavigationListener) {
    this.advancementModes_.forEach(advancementMode => {
      advancementMode.addOnTapNavigationListener(onTapNavigationListener);
    });
  }

  /** @override */
  addAdvanceListener(advanceListener) {
    this.advancementModes_.forEach(advancementMode => {
      advancementMode.addAdvanceListener(advanceListener);
    });
  }

  /** @override */
  addPreviousListener(previousListener) {
    this.advancementModes_.forEach(advancementMode => {
      advancementMode.addPreviousListener(previousListener);
    });
  }

  /** @override */
  start() {
    super.start();
    this.advancementModes_.forEach(advancementMode => {
      advancementMode.start();
    });
  }

  /** @override */
  stop(canResume = false) {
    super.stop();
    this.advancementModes_.forEach(advancementMode => {
      advancementMode.stop(canResume);
    });
  }
}


/**
 * Always provides a progress of 1.0.  Advances when the user taps the
 * corresponding section, depending on language settings.
 */
class ManualAdvancement extends AdvancementConfig {
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

    this.startListening_();

    if (element.ownerDocument.defaultView) {
      /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
      this.storeService_ =
        getStoreService(element.ownerDocument.defaultView);
    }

    const rtlState = this.storeService_.get(StateProperty.RTL_STATE);
    this.sections_ = {
      // Width and navigation direction of each section depend on whether the
      // document is RTL or LTR.
      left: {
        widthRatio: rtlState ?
          NEXT_SCREEN_AREA_RATIO : PREVIOUS_SCREEN_AREA_RATIO,
        direction: rtlState ?
          TapNavigationDirection.NEXT : TapNavigationDirection.PREVIOUS,
      },
      right: {
        widthRatio: rtlState ?
          PREVIOUS_SCREEN_AREA_RATIO : NEXT_SCREEN_AREA_RATIO,
        direction: rtlState ?
          TapNavigationDirection.PREVIOUS : TapNavigationDirection.NEXT,
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
    this.element_
        .addEventListener('touchstart', this.onTouchstart_.bind(this), true);
    this.element_
        .addEventListener('touchend', this.onTouchend_.bind(this), true);
    this.element_
        .addEventListener(
            'click', this.maybePerformNavigation_.bind(this), true);
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
    if ((Date.now() - this.touchstartTimestamp_) > HOLD_TOUCH_THRESHOLD_MS) {
      event.preventDefault();
    }

    this.storeService_.dispatch(Action.TOGGLE_PAUSED, false);
    this.touchstartTimestamp_ = null;
    this.timer_.cancel(this.timeoutId_);
    if (!this.storeService_.get(StateProperty.SYSTEM_UI_IS_VISIBLE_STATE) &&
    /** @type {InteractiveComponentDef} */ (this.storeService_.get(
        StateProperty.INTERACTIVE_COMPONENT_STATE)).state !==
        EmbeddedComponentState.EXPANDED) {
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
    return !closest(dev().assertElement(event.target), el => {
      return hasTapAction(el);
    }, /* opt_stopAt */ this.element_);
  }

  /**
   * We want clicks on certain elements to be exempted from normal page
   * navigation
   * @param {!Event} event
   * @return {boolean}
   * @private
   */
  isProtectedTarget_(event) {
    return !!closest(dev().assertElement(event.target), el => {
      const elementRole = el.getAttribute('role');

      if (elementRole) {
        return !!TAPPABLE_ARIA_ROLES[elementRole.toLowerCase()];
      }
      return false;
    }, /* opt_stopAt */ this.element_);
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

    closest(dev().assertElement(event.target), el => {
      tagName = el.tagName.toLowerCase();
      if (tagName === 'amp-story-page-attachment') {
        shouldHandleEvent = false;
        return true;
      }

      if (tagName === 'amp-story-page') {
        shouldHandleEvent = true;
        return true;
      }

      return false;
    }, /* opt_stopAt */ this.element_);

    return shouldHandleEvent;
  }

  /**
   * For an element to trigger a tooltip it has to be descendant of
   * amp-story-page but not of amp-story-cta-layer or amp-story-page-attachment.
   * @param {!Event} event
   * @return {boolean}
   * @private
   */
  canShowTooltip_(event) {
    let valid = true;
    let tagName;

    return !!closest(dev().assertElement(event.target), el => {
      tagName = el.tagName.toLowerCase();

      if (tagName === 'amp-story-cta-layer' ||
          tagName === 'amp-story-page-attachment') {
        valid = false;
        return false;
      }

      return tagName === 'amp-story-page' && valid;
    }, /* opt_stopAt */ this.element_);
  }

  /**
   * Performs a system navigation if it is determined that the specified event
   * was a click intended for navigation.
   * @param {!Event} event 'click' event
   * @private
   */
  maybePerformNavigation_(event) {
    const target = dev().assertElement(event.target);

    if (this.canShowTooltip_(event) &&
      matches(target, INTERACTIVE_EMBEDDED_COMPONENTS_SELECTORS)) {
      // Clicked element triggers a tooltip, so we dispatch the corresponding
      // event and skip navigation.
      event.preventDefault();
      const embedComponent = /** @type {InteractiveComponentDef} */ (
        this.storeService_.get(StateProperty.INTERACTIVE_COMPONENT_STATE));
      this.storeService_.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
        element: target,
        state: embedComponent.state || EmbeddedComponentState.FOCUSED,
        clientX: event.clientX,
        clientY: event.clientY,
      });
      return;
    }

    if (!this.isRunning() ||
      !this.isNavigationalClick_(event) ||
      this.isProtectedTarget_(event) ||
      !this.shouldHandleEvent_(event)) {
      // If the system doesn't need to handle this click, then we can simply
      // return and let the event propagate as it would have otherwise.
      return;
    }

    event.stopPropagation();

    this.storeService_.dispatch(
        Action.SET_ADVANCEMENT_MODE, AdvancementMode.MANUAL_ADVANCE);

    const pageRect = this.element_./*OK*/getBoundingClientRect();

    // Using `left` as a fallback since Safari returns a ClientRect in some
    // cases.
    const offsetLeft = ('x' in pageRect) ? pageRect.x : pageRect.left;

    const page = {
      // Offset starting left of the page.
      offset: offsetLeft,
      width: pageRect.width,
      clickEventX: event.pageX,
    };

    this.onTapNavigation(this.getTapDirection_(page));
  }

  /**
   * Decides what direction to navigate depending on which
   * section of the page was there a click. The navigation direction of each
   * individual section has been previously defined depending on the language
   * settings.
   * @param {!Object} page
   * @private
   */
  getTapDirection_(page) {
    const {left, right} = this.sections_;

    if (page.clickEventX <= page.offset + (left.widthRatio * page.width)) {
      return left.direction;
    }

    return right.direction;
  }

  /**
   * Gets an instance of ManualAdvancement based on the HTML tag of the element.
   * @param {!Window} win
   * @param {!Element} rootEl
   * @return {?AdvancementConfig} An AdvancementConfig, only if the rootEl is
   *                              an amp-story tag.
   */
  static fromElement(win, rootEl) {
    if (rootEl.tagName.toLowerCase() !== 'amp-story') {
      return null;
    }
    return new ManualAdvancement(win, rootEl);
  }
}

/**
 * Provides progress and advancement based on a fixed duration of time,
 * specified in either seconds or milliseconds.
 */
class TimeBasedAdvancement extends AdvancementConfig {
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
      this.storeService_ =
        getStoreService(element.ownerDocument.defaultView);
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

    this.storeService_.dispatch(
        Action.SET_ADVANCEMENT_MODE, AdvancementMode.AUTO_ADVANCE_TIME);

    if (this.remainingDelayMs_) {
      this.startTimeMs_ =
          this.getCurrentTimestampMs_() -
              (this.delayMs_ - this.remainingDelayMs_);
    } else {
      this.startTimeMs_ = this.getCurrentTimestampMs_();
    }

    this.timeoutId_ = this.timer_.delay(
        () => this.onAdvance(), this.remainingDelayMs_ || this.delayMs_);

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
    this.remainingDelayMs_ = canResume ?
      this.startTimeMs_ + this.delayMs_ - this.getCurrentTimestampMs_() :
      null;
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

  /**
   * Gets an instance of TimeBasedAdvancement based on the value of the
   * auto-advance string (from the 'auto-advance-after' attribute on the page).
   * @param {string} autoAdvanceStr The value of the auto-advance-after
   *     attribute.
   * @param {!Window} win
   * @param {!Element} rootEl
   * @return {?AdvancementConfig} An AdvancementConfig, if time-based
   *     auto-advance is supported for the specified auto-advance string; null
   *     otherwise.
   */
  static fromAutoAdvanceString(autoAdvanceStr, win, rootEl) {
    if (!autoAdvanceStr) {
      return null;
    }

    const delayMs = timeStrToMillis(autoAdvanceStr);
    if (delayMs === undefined || isNaN(delayMs)) {
      return null;
    }

    return new TimeBasedAdvancement(win, Number(delayMs), rootEl);
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
class MediaBasedAdvancement extends AdvancementConfig {
  /**
   * @param {!Window} win
   * @param {!Array<!Element>} elements
   */
  constructor(win, elements) {
    super();

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private @const {!../../../src/service/resources-impl.Resources} */
    this.resources_ = Services.resourcesForDoc(getAmpdoc(win.document));

    /** @private @const {!Array<!Element>} */
    this.elements_ = elements;

    /** @private {?Element} */
    this.element_ = this.getFirstPlayableElement_();

    /** @private {?Element} */
    this.mediaElement_ = null;

    /** @private {!Array<!UnlistenDef>} */
    this.unlistenFns_ = [];

    /** @private {?UnlistenDef} */
    this.unlistenEndedFn_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenTimeupdateFn_ = null;

    /** @private {?../../../src/video-interface.VideoInterface} */
    this.video_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    this.elements_.forEach(el => {
      listen(el, VideoEvents.VISIBILITY, () => this.onVideoVisibilityChange_());
    });
  }

  /**
   * Returns the first playable element, or null. An element is considered
   * playable if it's either visible, or a hidden AMP-AUDIO.
   * @return {?Element}
   * @private
   */
  getFirstPlayableElement_() {
    if (this.elements_.length === 1) {
      return this.elements_[0];
    }

    for (let i = 0; i < this.elements_.length; i++) {
      const element = this.elements_[i];
      const resource = this.resources_.getResourceForElement(element);
      if (isMediaDisplayed(element, resource)) {
        return element;
      }
    }

    return null;
  }

  /**
   * On video visibility change, resets the media based advancement to rely on
   * the newly visible video, if needed.
   * @private
   */
  onVideoVisibilityChange_() {
    const element = this.getFirstPlayableElement_();
    if (element === this.element_) {
      return;
    }
    this.element_ = element;
    this.mediaElement_ = null;
    this.video_ = null;
    // If the page-advancement is running, reset the event listeners so the
    // progress bar reflects the advancement of the new video. If not running,
    // the next call to `start()` will set the listeners on the new element.
    if (this.isRunning()) {
      this.stop();
      this.start();
    }
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
    } else if (this.element_.hasAttribute('background-audio') &&
        (tagName === 'amp-story' || tagName === 'amp-story-page')) {
      return this.element_.querySelector('.i-amphtml-story-background-audio');
    } else if (tagName === 'amp-audio') {
      return this.element_.querySelector('audio');
    }

    return null;
  }

  /** @override */
  start() {
    super.start();

    // If no element is visible yet, keep isRunning true by stepping out after
    // `super.start()`. When an element becomes visible, it will call `start()`
    // again if isRunning is still true.
    if (!this.element_) {
      return;
    }

    // Prevents race condition when checking for video interface classname.
    (this.element_.whenBuilt ? this.element_.whenBuilt() : Promise.resolve())
        .then(() => this.startWhenBuilt_());

    this.storeService_.dispatch(
        Action.SET_ADVANCEMENT_MODE, AdvancementMode.AUTO_ADVANCE_MEDIA);
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

    user().error('AMP-STORY-PAGE',
        `Element with ID ${this.element_.id} is not a media element ` +
        'supported for automatic advancement.');
  }

  /** @private */
  startHtmlMediaElement_() {
    const mediaElement = dev().assertElement(this.mediaElement_,
        'Media element was unspecified.');
    this.unlistenFns_.push(
        listenOnce(mediaElement, 'ended', () => this.onAdvance()));
    this.unlistenFns_.push(
        listenOnce(mediaElement, 'timeupdate', () => this.onProgressUpdate()));
  }

  /** @private */
  startVideoInterfaceElement_() {
    this.element_.getImpl().then(video => {
      this.video_ = video;
    });

    this.unlistenFns_.push(
        listenOnce(this.element_, VideoEvents.ENDED, () => this.onAdvance(),
            {capture: true}));

    this.onProgressUpdate();

    this.timer_.poll(POLL_INTERVAL_MS, () => {
      this.onProgressUpdate();
      return !this.isRunning();
    });
  }

  /** @override */
  stop() {
    super.stop();
    this.unlistenFns_.forEach(fn => fn());
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

  /**
   * Gets an instance of MediaBasedAdvancement based on the value of the
   * auto-advance string (from the 'auto-advance-after' attribute on the page).
   * @param {string} autoAdvanceStr The value of the auto-advance-after
   *     attribute.
   * @param {!Window} win
   * @param {!Element} rootEl
   * @return {?AdvancementConfig} An AdvancementConfig, if media-element-based
   *     auto-advance is supported for the specified auto-advance string; null
   *     otherwise.
   */
  static fromAutoAdvanceString(autoAdvanceStr, win, rootEl) {
    try {
      const elements = rootEl.querySelectorAll(
          `[data-id=${escapeCssSelectorIdent(autoAdvanceStr)}],
          #${escapeCssSelectorIdent(autoAdvanceStr)}`);
      if (!elements.length) {
        return null;
      }

      return new MediaBasedAdvancement(win, toArray(elements));
    } catch (e) {
      return null;
    }
  }
}
