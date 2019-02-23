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
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {closest} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {escapeCssSelectorIdent} from '../../../src/css';
import {hasTapAction, timeStrToMillis} from './utils';
import {listenOnce} from '../../../src/event-helper';
import {map} from '../../../src/utils/object';


/** @private @const {number} */
const NEXT_SCREEN_AREA_RATIO = 0.75;

/** @const {number} */
export const POLL_INTERVAL_MS = 300;

/** @const @enum */
export const TapNavigationDirection = {
  'NEXT': 1,
  'PREVIOUS': 2,
};

/** @const */
const PROTECTED_ELEMENTS = map({
  A: true,
  BUTTON: true,
});

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
   */
  stop() {
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
   * @protected
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
   * @param {!./amp-story-page.AmpStoryPage} page
   * @return {!AdvancementConfig}
   */
  static forPage(page) {
    const rootEl = page.element;
    const win = /** @type {!Window} */ (rootEl.ownerDocument.defaultView);
    const autoAdvanceStr = rootEl.getAttribute('auto-advance-after');

    const supportedAdvancementModes = [
      new ManualAdvancement(rootEl),
      TimeBasedAdvancement.fromAutoAdvanceString(autoAdvanceStr, win),
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
  stop() {
    super.stop();
    this.advancementModes_.forEach(advancementMode => {
      advancementMode.stop();
    });
  }
}


/**
 * Always provides a progress of 1.0.  Advances when the user taps the rightmost
 * 75% of the screen; triggers the previous listener when the user taps the
 * leftmost 25% of the screen.
 */
class ManualAdvancement extends AdvancementConfig {
  /**
   * @param {!Element} element The element that, when clicked, can cause
   *     advancing to the next page or going back to the previous.
   */
  constructor(element) {
    super();
    this.element_ = element;
    this.clickListener_ = this.maybePerformNavigation_.bind(this);
    this.hasAutoAdvanceStr_ = this.element_.getAttribute('auto-advance-after');
  }

  /** @override */
  start() {
    super.start();
    this.element_.addEventListener('click', this.clickListener_, true);
    if (!this.hasAutoAdvanceStr_) {
      super.onProgressUpdate();
    }
  }

  /** @override */
  stop() {
    super.stop();
    this.element_.removeEventListener('click', this.clickListener_, true);
  }

  /** @override */
  getProgress() {
    return 1.0;
  }

  /**
   * Determines whether a click should be used for navigation.  Navigate should
   * occur unless the click is on the system layer, or on an element that
   * defines on="tap:..."
   * @param {!Event} e 'click' event.
   * @return {boolean} true, if the click should be used for navigation.
   * @private
   */
  isNavigationalClick_(e) {
    return !closest(dev().assertElement(e.target), el => {
      return hasTapAction(el);
    }, /* opt_stopAt */ this.element_);
  }

  /**
   * We want clicks on certain elements to be exempted from normal page
   * navigation
   * @param {!Event} event
   * @return {boolean}
   */
  isProtectedTarget_(event) {
    return !!closest(dev().assertElement(event.target), el => {
      return PROTECTED_ELEMENTS[el.tagName];
    }, /* opt_stopAt */ this.element_);
  }


  /**
   * Performs a system navigation if it is determined that the specified event
   * was a click intended for navigation.
   * @param {!Event} event 'click' event
   * @private
   */
  maybePerformNavigation_(event) {
    if (!this.isNavigationalClick_(event) || this.isProtectedTarget_(event)) {
      // If the system doesn't need to handle this click, then we can simply
      // return and let the event propagate as it would have otherwise.
      return;
    }

    event.stopPropagation();

    // TODO(newmuis): This will need to be flipped for RTL.
    const elRect = this.element_./*OK*/getBoundingClientRect();

    // Using `left` as a fallback since Safari returns a ClientRect in some
    // cases.
    const offsetLeft = ('x' in elRect) ? elRect.x : elRect.left;
    const offsetWidth = elRect.width;

    const nextScreenAreaMin = offsetLeft +
        ((1 - NEXT_SCREEN_AREA_RATIO) * offsetWidth);
    const nextScreenAreaMax = offsetLeft + offsetWidth;

    if (event.pageX >= nextScreenAreaMin && event.pageX < nextScreenAreaMax) {
      this.onTapNavigation(TapNavigationDirection.NEXT);
    } else if (event.pageX >= offsetLeft && event.pageX < nextScreenAreaMin) {
      this.onTapNavigation(TapNavigationDirection.PREVIOUS);
    }
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
   */
  constructor(win, delayMs) {
    super();

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private @const {number} */
    this.delayMs_ = delayMs;

    /** @private {?number} */
    this.startTimeMs_ = null;

    /** @private {number|string|null} */
    this.timeoutId_ = null;
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
    this.startTimeMs_ = this.getCurrentTimestampMs_();

    this.timeoutId_ = this.timer_.delay(() => this.onAdvance(), this.delayMs_);

    this.timer_.poll(POLL_INTERVAL_MS, () => {
      this.onProgressUpdate();
      return !this.isRunning();
    });
  }

  /** @override */
  stop() {
    super.stop();

    if (this.timeoutId_ !== null) {
      this.timer_.cancel(this.timeoutId_);
    }
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
   * @return {?AdvancementConfig} An AdvancementConfig, if time-based
   *     auto-advance is supported for the specified auto-advance string; null
   *     otherwise.
   */
  static fromAutoAdvanceString(autoAdvanceStr, win) {
    if (!autoAdvanceStr) {
      return null;
    }

    const delayMs = timeStrToMillis(autoAdvanceStr);
    if (delayMs === undefined || isNaN(delayMs)) {
      return null;
    }

    return new TimeBasedAdvancement(win, Number(delayMs));
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
   * @param {!Element} element
   */
  constructor(win, element) {
    super();

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private @const {!Element} */
    this.element_ = element;

    /** @private {?Element} */
    this.mediaElement_ = null;

    /** @private {?../../../src/video-interface.VideoInterface} */
    this.video_ = null;
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

    // Prevents race condition when checking for video interface classname.
    (this.element_.whenBuilt ? this.element_.whenBuilt() : Promise.resolve())
        .then(() => this.startWhenBuilt_());
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
    listenOnce(mediaElement, 'ended', () => this.onAdvance());
    listenOnce(mediaElement, 'timeupdate', () => this.onProgressUpdate());
  }

  /** @private */
  startVideoInterfaceElement_() {
    this.element_.getImpl().then(video => {
      this.video_ = video;
    });

    listenOnce(this.element_, VideoEvents.ENDED, () => this.onAdvance(),
        {capture: true});

    this.timer_.poll(POLL_INTERVAL_MS, () => {
      this.onProgressUpdate();
      return !this.isRunning();
    });
  }

  /** @override */
  stop() {
    // We don't need to explicitly stop the polling or media events listed
    // above, since they are already bound to either the playback of the media
    // on the page, or the isRunning state of this AdvancementConfig.
    super.stop();
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
      const element = rootEl.querySelector(`#${
        escapeCssSelectorIdent(autoAdvanceStr)
      }`);

      if (!element) {
        return null;
      }

      return new MediaBasedAdvancement(win, element);
    } catch (e) {
      return null;
    }
  }
}
