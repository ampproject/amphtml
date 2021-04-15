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

import {AnalyticsEvent, MIN_TIMER_INTERVAL_SECONDS, DEFAULT_MAX_TIMER_LENGTH_SECONDS, EventTracker} from './events';
import {dict} from '../../../src/utils/object';
import {user, userAssert} from '../../../src/log';

/**
 * Timer event handler.
 */
class TimerEventHandler {
  /**
   * @param {JsonObject} timerSpec The timer specification.
   * @param {function(): UnlistenDef=} opt_startBuilder Factory for building
   *     start trackers for this timer.
   * @param {function(): UnlistenDef=} opt_stopBuilder Factory for building stop
   *     trackers for this timer.
   */
  constructor(timerSpec, opt_startBuilder, opt_stopBuilder) {
    /** @private {number|undefined} */
    this.intervalId_ = undefined;

    userAssert(
      'interval' in timerSpec,
      'Timer interval specification required'
    );
    /** @private @const {number} */
    this.intervalLength_ = Number(timerSpec['interval']) || 0;
    userAssert(
      this.intervalLength_ >= MIN_TIMER_INTERVAL_SECONDS,
      'Bad timer interval specification'
    );

    /** @private @const {number} */
    this.maxTimerLength_ =
      'maxTimerLength' in timerSpec
        ? Number(timerSpec['maxTimerLength'])
        : DEFAULT_MAX_TIMER_LENGTH_SECONDS;
    userAssert(this.maxTimerLength_ > 0, 'Bad maxTimerLength specification');

    /** @private @const {boolean} */
    this.maxTimerInSpec_ = 'maxTimerLength' in timerSpec;

    /** @private @const {boolean} */
    this.callImmediate_ =
      'immediate' in timerSpec ? Boolean(timerSpec['immediate']) : true;

    /** @private {?function()} */
    this.intervalCallback_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenStart_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenStop_ = null;

    /** @private @const {?function(): UnlistenDef} */
    this.startBuilder_ = opt_startBuilder || null;

    /** @private @const {?function(): UnlistenDef} */
    this.stopBuilder_ = opt_stopBuilder || null;

    /** @private {number|undefined} */
    this.startTime_ = undefined; // milliseconds

    /** @private {number|undefined} */
    this.lastRequestTime_ = undefined; // milliseconds
  }

  /**
   * @param {function()} startTimer
   */
  init(startTimer) {
    if (!this.startBuilder_) {
      // Timer starts on load.
      startTimer();
    } else {
      // Timer starts on event.
      this.listenForStart_();
    }
  }

  /**
   * Unlistens for start and stop.
   */
  dispose() {
    this.unlistenForStop_();
    this.unlistenForStart_();
  }

  /** @private */
  listenForStart_() {
    if (this.startBuilder_) {
      this.unlistenStart_ = this.startBuilder_();
    }
  }

  /** @private */
  unlistenForStart_() {
    if (this.unlistenStart_) {
      this.unlistenStart_();
      this.unlistenStart_ = null;
    }
  }

  /** @private */
  listenForStop_() {
    if (this.stopBuilder_) {
      try {
        this.unlistenStop_ = this.stopBuilder_();
      } catch (e) {
        this.dispose(); // Stop timer and then throw error.
        throw e;
      }
    }
  }

  /** @private */
  unlistenForStop_() {
    if (this.unlistenStop_) {
      this.unlistenStop_();
      this.unlistenStop_ = null;
    }
  }

  /** @return {boolean} */
  isRunning() {
    return !!this.intervalId_;
  }

  /**
   * @param {!Window} win
   * @param {function()} timerCallback
   * @param {function()} timeoutCallback
   */
  startIntervalInWindow(win, timerCallback, timeoutCallback) {
    if (this.isRunning()) {
      return;
    }
    this.startTime_ = Date.now();
    this.lastRequestTime_ = undefined;
    this.intervalCallback_ = timerCallback;
    this.intervalId_ = win.setInterval(() => {
      timerCallback();
    }, this.intervalLength_ * 1000);

    // If there's no way to turn off the timer, cap it.
    if (!this.stopBuilder_ || (this.stopBuilder_ && this.maxTimerInSpec_)) {
      win.setTimeout(() => {
        timeoutCallback();
      }, this.maxTimerLength_ * 1000);
    }

    this.unlistenForStart_();
    if (this.callImmediate_) {
      timerCallback();
    }
    this.listenForStop_();
  }

  /**
   * @param {!Window} win
   * @restricted
   */
  stopTimer_(win) {
    if (!this.isRunning()) {
      return;
    }
    this.intervalCallback_();
    this.intervalCallback_ = null;
    win.clearInterval(this.intervalId_);
    this.intervalId_ = undefined;
    this.lastRequestTime_ = undefined;
    this.unlistenForStop_();
    this.listenForStart_();
  }

  /**
   * @private
   * @return {number}
   */
  calculateDuration_() {
    if (this.startTime_) {
      return Date.now() - (this.lastRequestTime_ || this.startTime_);
    }
    return 0;
  }

  /** @return {!JsonObject} */
  getTimerVars() {
    let timerDuration = 0;
    if (this.isRunning()) {
      timerDuration = this.calculateDuration_();
      this.lastRequestTime_ = Date.now();
    }
    return dict({
      'timerDuration': timerDuration,
      'timerStart': this.startTime_ || 0,
    });
  }
}

/**
 * Tracks timer events.
 */
export class TimerEventTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);
    /** @const @private {!Object<number, TimerEventHandler>} */
    this.trackers_ = {};

    /** @private {number} */
    this.timerIdSequence_ = 1;
  }

  /**
   * @return {!Array<number>}
   * @visibleForTesting
   */
  getTrackedTimerKeys() {
    return /** @type {!Array<number>} */ (Object.keys(this.trackers_));
  }

  /** @override */
  dispose() {
    this.getTrackedTimerKeys().forEach((timerId) => {
      this.removeTracker_(timerId);
    });
  }

  /** @override */
  add(context, eventType, config, listener) {
    const timerSpec = config['timerSpec'];
    userAssert(
      timerSpec && typeof timerSpec == 'object',
      'Bad timer specification'
    );
    const timerStart = 'startSpec' in timerSpec ? timerSpec['startSpec'] : null;
    userAssert(
      !timerStart || typeof timerStart == 'object',
      'Bad timer start specification'
    );
    const timerStop = 'stopSpec' in timerSpec ? timerSpec['stopSpec'] : null;
    userAssert(
      (!timerStart && !timerStop) || typeof timerStop == 'object',
      'Bad timer stop specification'
    );

    const timerId = this.generateTimerId_();
    let startBuilder;
    let stopBuilder;
    if (timerStart) {
      const startTracker = this.getTracker_(timerStart);
      userAssert(startTracker, 'Cannot track timer start');
      startBuilder = startTracker.add.bind(
        startTracker,
        context,
        timerStart['on'],
        timerStart,
        this.handleTimerToggle_.bind(this, timerId, eventType, listener)
      );
    }
    if (timerStop) {
      const stopTracker = this.getTracker_(timerStop);
      userAssert(stopTracker, 'Cannot track timer stop');
      stopBuilder = stopTracker.add.bind(
        stopTracker,
        context,
        timerStop['on'],
        timerStop,
        this.handleTimerToggle_.bind(this, timerId, eventType, listener)
      );
    }

    const timerHandler = new TimerEventHandler(
      /** @type {!JsonObject} */ (timerSpec),
      startBuilder,
      stopBuilder
    );
    this.trackers_[timerId] = timerHandler;

    timerHandler.init(
      this.startTimer_.bind(this, timerId, eventType, listener)
    );
    return () => {
      this.removeTracker_(timerId);
    };
  }

  /**
   * @return {number}
   * @private
   */
  generateTimerId_() {
    return ++this.timerIdSequence_;
  }

  /**
   * @param {!JsonObject} config
   * @return {?EventTracker}
   * @private
   */
  getTracker_(config) {
    const eventType = user().assertString(config['on']);
    const trackerKey = getTrackerKeyName(eventType);

    return this.root.getTrackerForAllowlist(
      trackerKey,
      getTrackerTypesForParentType('timer')
    );
  }

  /**
   * Toggles which listeners are active depending on timer state, so no race
   * conditions can occur in the case where the timer starts and stops on the
   * same event type from the same target.
   * @param {number} timerId
   * @param {string} eventType
   * @param {function(!AnalyticsEvent)} listener
   * @private
   */
  handleTimerToggle_(timerId, eventType, listener) {
    const timerHandler = this.trackers_[timerId];
    if (!timerHandler) {
      return;
    }
    if (timerHandler.isRunning()) {
      this.stopTimer_(timerId);
    } else {
      this.startTimer_(timerId, eventType, listener);
    }
  }

  /**
   * @param {number} timerId
   * @param {string} eventType
   * @param {function(!AnalyticsEvent)} listener
   * @private
   */
  startTimer_(timerId, eventType, listener) {
    const timerHandler = this.trackers_[timerId];
    const timerCallback = () => {
      listener(this.createEvent_(timerId, eventType));
    };
    timerHandler.startIntervalInWindow(
      this.root.ampdoc.win,
      timerCallback,
      this.removeTracker_.bind(this, timerId)
    );
  }

  /**
   * @param {number} timerId
   * @private
   */
  stopTimer_(timerId) {
    this.trackers_[timerId].stopTimer_(this.root.ampdoc.win);
  }

  /**
   * @param {number} timerId
   * @param {string} eventType
   * @return {!AnalyticsEvent}
   * @private
   */
  createEvent_(timerId, eventType) {
    return new AnalyticsEvent(
      this.root.getRootElement(),
      eventType,
      this.trackers_[timerId].getTimerVars(),
      /** enableDataVars */ false
    );
  }

  /**
   * @param {number} timerId
   * @private
   */
  removeTracker_(timerId) {
    if (this.trackers_[timerId]) {
      this.stopTimer_(timerId);
      this.trackers_[timerId].dispose();
      delete this.trackers_[timerId];
    }
  }
}
