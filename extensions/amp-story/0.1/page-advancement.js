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
import {dev, user} from '../../../src/log';
import {isFiniteNumber} from '../../../src/types';
import {scopedQuerySelector} from '../../../src/dom';
import {listenOnce} from '../../../src/event-helper';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {closest} from '../../../src/dom';


/** @private @enum {!RegExp} */
const TIME_REGEX = {
  MILLISECONDS: /^(\d+)ms$/,
  SECONDS: /^(\d+)s$/,
};

/** @private @const {number} */
const NEXT_SCREEN_AREA_RATIO = 0.75;

/** @const {number} */
const POLL_INTERVAL_MS = 250;


/** @const {function(?AdvancementConfig): boolean} */
function isNonNull(advancementConfig) {
  return advancementConfig !== null;
}

/**
 * @param {!Element} el
 * @return {boolean}
 */
function hasTapAction(el) {
  // There are better ways to determine this, but they're all bound to action
  // service race conditions. This is good enough for our use case.
  return el.hasAttribute('on') &&
      !!el.getAttribute('on').match(/(^|;)\s*tap\s*:/);
}


/**
 * 
 */
export class AdvancementConfig {
  constructor(win) {
    /** @private @const {!Array<!>} */
    this.progressListeners_ = [];

    /** @private @const {!Array<!>} */
    this.advanceListeners_ = [];

    /** @private @const {!Array<!>} */
    this.previousListeners_ = [];

    /** @private {boolean} */
    this.isRunning_ = false;
  }

  addProgressListener(progressListener) {
    this.progressListeners_.push(progressListener);
  }

  addAdvanceListener(advanceListener) {
    this.advanceListeners_.push(advanceListener);
  }

  addPreviousListener(previousListener) {
    this.previousListeners_.push(previousListener);
  }

  start() {
    this.isRunning_ = true;
  }

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
   * @param {!Element} rootElement 
   * @return {?AdvancementConfig} 
   */
  static forElement(rootElement) {
    const win = rootElement.ownerDocument.defaultView;
    const autoAdvanceStr = rootElement.getAttribute('auto-advance-after');

    const supportedAdvancementModes = [
      new ManualAdvancement(rootElement),
      TimeBasedAdvancement.fromAutoAdvanceString(autoAdvanceStr, win, rootElement),
      MediaBasedAdvancement.fromAutoAdvanceString(autoAdvanceStr, win, rootElement),
    ].filter(isNonNull);

    if (supportedAdvancementModes.length === 1) {
      return supportedAdvancementModes[0];
    }

    return new MultipleAdvancementConfig(supportedAdvancementModes);
  }
}

class MultipleAdvancementConfig extends AdvancementConfig {
  constructor(advancementModes) {
    super();

    /** @private @const {!Array<!AdvancementConfig>} */
    this.advancementModes_ = advancementModes;
  }

  addProgressListener(progressListener) {
    this.advancementModes_.forEach(advancementMode => {
      advancementMode.addProgressListener(progressListener);
    });
  }

  addAdvanceListener(advanceListener) {
    this.advancementModes_.forEach(advancementMode => {
      advancementMode.addAdvanceListener(advanceListener);
    });
  }

  addPreviousListener(previousListener) {
    this.advancementModes_.forEach(advancementMode => {
      advancementMode.addPreviousListener(previousListener);
    });
  }

  start() {
    super.start();
    this.advancementModes_.forEach(advancementMode => {
      advancementMode.start();
    });
  }

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
  constructor(element) {
    super();
    this.element_ = element;
    this.clickListener_ = this.maybePerformSystemNavigation_.bind(this);
  }


  /** @override */
  start() {
    super.start();
    this.element_.addEventListener('click', this.clickListener_, true);
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
   * Performs a system navigation if it is determined that the specified event
   * was a click intended for navigation.
   * @param {!Event} event 'click' event
   * @private
   */
  maybePerformSystemNavigation_(event) {
    if (!this.isNavigationalClick_(event)) {
      // If the system doesn't need to handle this click, then we can simply
      // return and let the event propagate as it would have otherwise.
      return;
    }

    event.stopPropagation();

    // TODO(newmuis): This will need to be flipped for RTL.
    const elRect = this.element_.getBoundingClientRect();
    const offsetLeft = elRect.x;
    const offsetWidth = elRect.width;
    const nextScreenAreaMin = offsetLeft +
        ((1 - NEXT_SCREEN_AREA_RATIO) * offsetWidth);
    const nextScreenAreaMax = offsetLeft + offsetWidth;

    if (event.pageX >= nextScreenAreaMin && event.pageX < nextScreenAreaMax) {
      this.onAdvance();
    } else if (event.pageX >= offsetLeft && event.pageX < nextScreenAreaMin) {
      this.onPrevious();
    }
  }
}


/**
 * Provides progress and advancement based on a fixed duration of time,
 * specified in either seconds or milliseconds.
 */
class TimeBasedAdvancement extends AdvancementConfig {
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
   * @return {number} 
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
   * @param {string} autoAdvanceStr 
   * @return {?number} The delay before the page should automatically advance to
   *     the next page, or null if the page will not advance based on time.
   * @private
   */
  static getAutoAdvanceDelayMs_(autoAdvanceStr) {
    if (TIME_REGEX.MILLISECONDS.test(autoAdvanceStr)) {
      return Number(TIME_REGEX.MILLISECONDS.exec(autoAdvanceStr)[1]);
    } else if (TIME_REGEX.SECONDS.test(autoAdvanceStr)) {
      return Number(TIME_REGEX.SECONDS.exec(autoAdvanceStr)[1]) * 1000;
    }

    return null;
  }


  /**
   * 
   * @param {string} autoAdvanceStr 
   * @return {?AdvancementConfig}
   */
  static fromAutoAdvanceString(autoAdvanceStr, win, rootElement) {
    if (!autoAdvanceStr) {
      return null;
    }

    const delayMs = TimeBasedAdvancement.getAutoAdvanceDelayMs_(autoAdvanceStr);
    if (delayMs === null) {
      return null;
    }

    user().assert(isFiniteNumber(delayMs) && delayMs > 0,
        `Invalid automatic advance delay '${autoAdvanceStr}' ` +
        `for page '${rootElement.id}'.`);

    return new TimeBasedAdvancement(win, delayMs);
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
  constructor(win, element) {
    super();

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

    /** @private @const {!Element} */
    this.element_ = element;

    /** @private {?Element} */
    this.mediaElement_ = null;

    /** @private {?VideoInterface} */
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
      return scopedQuerySelector(this.element_,
          '.i-amphtml-story-background-audio');
    } else if (tagName === 'amp-audio') {
      return scopedQuerySelector(this.element_, 'audio');
    }

    return null;
  }


  /** @override */
  start() {
    super.start();

    if (this.isVideoInterfaceVideo_()) {
      this.startVideoInterfaceElement_();
      return;
    }

    if (!this.mediaElement_) {
      this.mediaElement_ = this.getMediaElement_(this.element_);
    }

    if (this.mediaElement_) {
      this.startHtmlMediaElement_();
      return;
    }

    user().error(`Element with ID ${this.element_.id} is not a media element ` +
        'supported for automatic advancement.');
  }


  startHtmlMediaElement_() {
    listenOnce(this.mediaElement_, 'ended', () => this.onAdvance());
    listenOnce(this.mediaElement_, 'timeupdate', () => this.onProgressUpdate());
  }

  startVideoInterfaceElement_() {
    this.element_.getImpl().then(video => {
      this.video_ = video;
    });

    listenOnce(this.element_, VideoEvents.ENDED, () => this.onAdvance(), {capture: true});

    this.timer_.poll(POLL_INTERVAL_MS, () => {
      this.onProgressUpdate();
      return !this.isRunning();
    });
  }


  /** @override */
  stop() {
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


  static fromAutoAdvanceString(autoAdvanceStr, win, rootElement) {
    const element = user().assertElement(
        scopedQuerySelector(rootElement, `#${autoAdvanceStr}`),
        'ID specified for automatic advance does not refer to any ' +
        `element on page '${rootElement.id}'.`);

    return new MediaBasedAdvancement(win, element);
  }
}
