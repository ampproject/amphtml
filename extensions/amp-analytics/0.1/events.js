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

import {CommonSignals} from '../../../src/common-signals';
import {Observable} from '../../../src/observable';
import {
  PlayingStates,
  VideoAnalyticsDetailsDef,
  VideoAnalyticsEvents,
} from '../../../src/video-interface';
import {dev, user} from '../../../src/log';
import {getData} from '../../../src/event-helper';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {startsWith} from '../../../src/string';

const MIN_TIMER_INTERVAL_SECONDS = 0.5;
const DEFAULT_MAX_TIMER_LENGTH_SECONDS = 7200;
const VARIABLE_DATA_ATTRIBUTE_KEY = /^vars(.+)/;
const NO_UNLISTEN = function() {};
const TAG = 'analytics-events';

/**
 * @interface
 */
class SignalTrackerDef {
  /**
   * @param {string} unusedEventType
   * @return {!Promise}
   */
  getRootSignal(unusedEventType) {}

  /**
   * @param {string} unusedEventType
   * @param {!Element} unusedElement
   * @return {!Promise}
   */
  getElementSignal(unusedEventType, unusedElement) {}
}

/**
 * The analytics event.
 */
export class AnalyticsEvent {
  /**
   * @param {!Element} target The most relevant target element.
   * @param {string} type The type of event.
   * @param {!Object<string, string>=} opt_vars A map of vars and their values.
   */
  constructor(target, type, opt_vars) {
    /** @const */
    this.target = target;
    /** @const */
    this.type = type;
    /** @const */
    this.vars = opt_vars || Object.create(null);
  }
}


/**
 * The base class for all trackers. A tracker tracks all events of the same
 * type for a single analytics root.
 *
 * @implements {../../../src/service.Disposable}
 * @abstract
 * @visibleForTesting
 */
export class EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    /** @const */
    this.root = root;
  }

  /** @override @abstract */
  dispose() {}

  /**
   * @param {!Element} unusedContext
   * @param {string} unusedEventType
   * @param {!JsonObject} unusedConfig
   * @param {function(!AnalyticsEvent)} unusedListener
   * @param {function(!JsonObject): EventTracker} unusedTrackerProvider
   * @return {!UnlistenDef}
   * @abstract
   */
  add(unusedContext, unusedEventType, unusedConfig, unusedListener,
      unusedTrackerProvider) {}
}


/**
 * Tracks custom events.
 */
export class CustomEventTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);

    /** @const @private {!Object<string, !Observable<!AnalyticsEvent>>} */
    this.observables_ = {};

    /**
     * Early events have to be buffered because there's no way to predict
     * how fast all `amp-analytics` elements will be instrumented.
     * @private {!Object<string, !Array<!AnalyticsEvent>>|undefined}
     */
    this.buffer_ = {};

    /**
     * Sandbox events get their own buffer, because handler to those events will
     * be added after parent element's layout. (Time varies, can be later than 10s)
     * sandbox events buffer will never expire but will cleared when handler is ready.
     * @private {!Object<string, !Array<!AnalyticsEvent>|undefined>|undefined}
     */
    this.sandboxBuffer_ = {};

    // Stop buffering of custom events after 10 seconds. Assumption is that all
    // `amp-analytics` elements will have been instrumented by this time.
    setTimeout(() => {
      this.buffer_ = undefined;
    }, 10000);
  }

  /** @override */
  dispose() {
    this.buffer_ = undefined;
    this.sandboxBuffer_ = undefined;
    for (const k in this.observables_) {
      this.observables_[k].removeAll();
    }
  }

  /** @override */
  add(context, eventType, config, listener, trackerProvider) {
    let selector = config['selector'];
    if (!selector) {
      selector = ':root';
    }
    const selectionMethod = config['selectionMethod'] || null;

    const targetReady =
        this.root.getElement(context, selector, selectionMethod);

    const isSandboxEvent = startsWith(eventType, 'sandbox-');

    // Push recent events if any.
    const buffer = isSandboxEvent ?
        this.sandboxBuffer_ && this.sandboxBuffer_[eventType] :
        this.buffer_ && this.buffer_[eventType];

    if (buffer) {
      const bufferLength = buffer.length;
      targetReady.then(target => {
        setTimeout(() => {
          for (let i = 0; i < bufferLength; i++) {
            const event = buffer[i];
            if (target.contains(event.target)) {
              listener(event);
            }
          }
          if (isSandboxEvent) {
            // We assume sandbox event will only has single listener.
            // It is safe to clear buffer once handler is ready.
            this.sandboxBuffer_[eventType] = undefined;
          }
        }, 1);
      });
    }

    let observables = this.observables_[eventType];
    if (!observables) {
      observables = new Observable();
      this.observables_[eventType] = observables;
    }

    return this.observables_[eventType].add(event => {
      // Wait for target selected
      targetReady.then(target => {
        if (target.contains(event.target)) {
          listener(event);
        }
      });
    });
  }

  /**
   * Triggers a custom event for the associated root.
   * @param {!AnalyticsEvent} event
   */
  trigger(event) {
    const eventType = event.type;
    const isSandboxEvent = startsWith(eventType, 'sandbox-');
    const observables = this.observables_[eventType];

    // If listeners already present - trigger right away.
    if (observables) {
      observables.fire(event);
      if (isSandboxEvent) {
        // No need to buffer sandbox event if handler ready
        return;
      }
    }

    // Create buffer and enqueue buffer if needed
    if (isSandboxEvent) {
      this.sandboxBuffer_[eventType] = this.sandboxBuffer_[eventType] || [];
      this.sandboxBuffer_[eventType].push(event);
    } else {
      // Check if buffer has expired
      if (this.buffer_) {
        this.buffer_[eventType] = this.buffer_[eventType] || [];
        this.buffer_[eventType].push(event);
      }
    }
  }
}


/**
 * Tracks click events.
 */
export class ClickEventTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);

    /** @private {!Observable<!Event>} */
    this.clickObservable_ = new Observable();

    /** @private @const */
    this.boundOnClick_ = e => {
      this.clickObservable_.fire(e);
    };
    this.root.getRoot().addEventListener('click', this.boundOnClick_);
  }

  /** @override */
  dispose() {
    this.root.getRoot().removeEventListener('click', this.boundOnClick_);
    this.clickObservable_.removeAll();
  }

  /** @override */
  add(context, eventType, config, listener, trackerProvider) {
    const selector = user().assert(config['selector'],
        'Missing required selector on click trigger');
    const selectionMethod = config['selectionMethod'] || null;
    return this.clickObservable_.add(this.root.createSelectiveListener(
        this.handleClick_.bind(this, listener),
        (context.parentElement || context),
        selector,
        selectionMethod));
  }

  /**
   * @param {function(!AnalyticsEvent)} listener
   * @param {!Element} target
   * @param {!Event} unusedEvent
   * @private
   */
  handleClick_(listener, target, unusedEvent) {
    const params = getDataParamsFromAttributes(
        target,
        /* computeParamNameFunc */ undefined,
        VARIABLE_DATA_ATTRIBUTE_KEY);
    listener(new AnalyticsEvent(target, 'click', params));
  }
}


/**
 * Tracks events based on signals.
 * @implements {SignalTrackerDef}
 */
export class SignalTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);
  }

  /** @override */
  dispose() {
  }

  /** @override */
  add(context, eventType, config, listener, trackerProvider) {
    let target;
    let signalsPromise;
    const selector = config['selector'] || ':root';
    if (selector == ':root' || selector == ':host') {
      // Root selectors are delegated to analytics roots.
      target = this.root.getRootElement();
      signalsPromise = this.getRootSignal(eventType);
    } else {
      // Look for the AMP-element. Wait for DOM to be fully parsed to avoid
      // false missed searches.
      const selectionMethod = config['selectionMethod'];
      signalsPromise = this.root.getAmpElement(
          (context.parentElement || context),
          selector,
          selectionMethod
          ).then(element => {
            target = element;
            return this.getElementSignal(eventType, target);
          });
    }

    // Wait for the target and the event signal.
    signalsPromise.then(() => {
      listener(new AnalyticsEvent(target, eventType));
    });
    return NO_UNLISTEN;
  }

  /** @override */
  getRootSignal(eventType) {
    return this.root.signals().whenSignal(eventType);
  }

  /** @override */
  getElementSignal(eventType, element) {
    if (typeof element.signals != 'function') {
      return Promise.resolve();
    }
    return element.signals().whenSignal(eventType);
  }
}

/**
 * Tracks when the elements in the first viewport has been loaded - "ini-load".
 * @implements {SignalTrackerDef}
 */
export class IniLoadTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);
  }

  /** @override */
  dispose() {
  }

  /** @override */
  add(context, eventType, config, listener, trackerProvider) {
    let target;
    let promise;
    const selector = config['selector'] || ':root';
    if (selector == ':root' || selector == ':host') {
      // Root selectors are delegated to analytics roots.
      target = this.root.getRootElement();
      promise = this.getRootSignal();
    } else {
      // An AMP-element. Wait for DOM to be fully parsed to avoid
      // false missed searches.
      const selectionMethod = config['selectionMethod'];
      promise = this.root.getAmpElement(
          (context.parentElement || context),
          selector,
          selectionMethod
          ).then(element => {
            target = element;
            return this.getElementSignal('ini-load', target);
          });
    }
    // Wait for the target and the event.
    promise.then(() => {
      listener(new AnalyticsEvent(target, eventType));
    });
    return NO_UNLISTEN;
  }

  /** @override */
  getRootSignal() {
    return this.root.whenIniLoaded();
  }

  /** @override */
  getElementSignal(unusedEventType, element) {
    if (typeof element.signals != 'function') {
      return Promise.resolve();
    }
    const signals = element.signals();
    return Promise.race([
      signals.whenSignal(CommonSignals.INI_LOAD),
      signals.whenSignal(CommonSignals.LOAD_END),
    ]);
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
    /** @const @private {!Object<number, Object>} */
    this.trackers_ = {};

    /** @private {number} */
    this.timerIdSequence_ = 1;

    /**
     * Timer event param names.
     * @const
     * @enum {number}
     * @private
     */
    TIMER_PARAMS_ = {
       INTERVAL_ID: 1,
       INTERVAL_LENGTH: 2,
       MAX_TIMER_LENGTH: 3,
       CALL_IMMEDIATE: 4,
       UNLISTEN_START: 5,
       UNLISTEN_STOP: 6,
       CAN_RESTART: 7,
       START_BUILDER: 8,
       STOP_BUILDER: 9
    };
  }

  /**
   * Visible for testing.
   * @return {!Array<number>}
   */
  getTrackedTimerKeys() {
    return Object.keys(this.trackers_);
  }

  /** @override */
  dispose() {
    const win = this.root.ampdoc.win;
    this.getTrackedTimerKeys().forEach(timerId => {
      this.removeTracker_(timerId);
    });
  }

  /** @override */
  add(context, eventType, config, listener, trackerProvider) {
    const timerSpec = config['timerSpec'];
    user().assert(timerSpec && typeof timerSpec == 'object',
        'Bad timer specification');
    user().assert('interval' in timerSpec,
        'Timer interval specification required');
    const interval = Number(timerSpec['interval']) || 0;
    user().assert(interval >= MIN_TIMER_INTERVAL_SECONDS,
        'Bad timer interval specification');
    const maxTimerLength = 'maxTimerLength' in timerSpec ?
        Number(timerSpec['maxTimerLength']) : DEFAULT_MAX_TIMER_LENGTH_SECONDS;
    user().assert(maxTimerLength == null || maxTimerLength > 0,
        'Bad maxTimerLength specification');
    const callImmediate = 'immediate' in timerSpec ?
        Boolean(timerSpec['immediate']) : true;
    const timerStart = 'startSpec' in timerSpec ? timerSpec['startSpec'] : null;
    user().assert(!timerStart || typeof timerStart == 'object',
        'Bad timer start specification');
    const timerStop = 'stopSpec' in timerSpec ? timerSpec['stopSpec'] : null;
    user().assert((!timerStart && !timerStop) || typeof timerStop == 'object',
        'Bad timer stop specification');

    const timerId = this.generateTimerId_();
    const timerParams = {};
    timerParams[TIMER_PARAMS_.INTERVAL_LENGTH] = interval;
    timerParams[TIMER_PARAMS_.MAX_TIMER_LENGTH] = maxTimerLength;
    timerParams[TIMER_PARAMS_.CALL_IMMEDIATE] = callImmediate;
    this.trackers_[timerId] = timerParams;
    if (!timerStart) {
      this.startTimer_(timerId, eventType, listener);
      this.trackers_[timerId][TIMER_PARAMS_.CAN_RESTART] = false;
    } else {
      this.trackers_[timerId][TIMER_PARAMS_.CAN_RESTART] = true;
      const startTracker = trackerProvider(timerStart);
      user().assert(startTracker, 'Cannot track timer start');
      const startTrackerBuilder = startTracker.add.bind(startTracker, context,
          timerStart['on'], timerStart,
          this.handleTimerToggle_.bind(this, timerId, eventType, listener),
          trackerProvider);
      this.trackers_[timerId][TIMER_PARAMS_.START_BUILDER] =
          startTrackerBuilder;
      const unlistenStart = startTrackerBuilder();
      this.trackers_[timerId][TIMER_PARAMS_.UNLISTEN_START] = unlistenStart;
      const stopTracker = timerStop ? trackerProvider(timerStop) : null;
      if (!!stopTracker) {
        const stopTrackerBuilder = stopTracker.add.bind(stopTracker, context,
            timerStop['on'], timerStop,
            this.handleTimerToggle_.bind(this, timerId, eventType, listener),
            trackerProvider);
	this.trackers_[timerId][TIMER_PARAMS_.STOP_BUILDER] =
            stopTrackerBuilder;
      }

    }
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
   * Toggles which listeners are active depending on timer state, so no race
   * conditions can occur in the case where the timer starts and stops on the
   * same event type from the same target.
   * @param {string} timerId
   * @param {string} eventType
   * @param {function(!AnalyticsEvent)} listener
   * @private
   */
  handleTimerToggle_(timerId, eventType, listener) {
    const timerSpec = this.trackers_[timerId];
    if (!!timerSpec[TIMER_PARAMS_.INTERVAL_ID]) {
      // Stop timer and listen for start.
      this.stopTimer_(timerId);
      if (!!timerSpec[TIMER_PARAMS_.START_BUILDER]) {
        const unlistenStart = timerSpec[TIMER_PARAMS_.START_BUILDER]();
        this.trackers_[timerId][TIMER_PARAMS_.UNLISTEN_START] = unlistenStart;
      }
    } else {
      // Start timer and listen for stop.
      this.startTimer_(timerId, eventType, listener);
      if (!!timerSpec[TIMER_PARAMS_.STOP_BUILDER]) {
        const unlistenStop =
            timerSpec[TIMER_PARAMS_.STOP_BUILDER]();
        this.trackers_[timerId][TIMER_PARAMS_.UNLISTEN_STOP] = unlistenStop;
      }
    }
  }

  /**
   * @param {string} timerId
   * @param {string} eventType
   * @param {function(!AnalyticsEvent)} listener
   * @return {string}
   * @private
   */
  startTimer_(timerId, eventType, listener) {
    const timerSpec = this.trackers_[timerId];
    if (!!timerSpec[TIMER_PARAMS_.INTERVAL_ID]) {
      return; // Timer already running.
    }
    const win = this.root.ampdoc.win;
    const intervalId = win.setInterval(() => {
      listener(this.createEvent_(eventType));
    }, timerSpec[TIMER_PARAMS_.INTERVAL_LENGTH] * 1000);
    this.trackers_[timerId][TIMER_PARAMS_.INTERVAL_ID] = intervalId;
    if (!!timerSpec[TIMER_PARAMS_.UNLISTEN_START]) {
      timerSpec[TIMER_PARAMS_.UNLISTEN_START]();
      delete this.trackers_[timerId][TIMER_PARAMS_.UNLISTEN_START];
    }
    if (!this.isRestartableTimer_(timerId)) {
      win.setTimeout(() => {
        this.removeTracker_(timerId);
      }, timerSpec[TIMER_PARAMS_.MAX_TIMER_LENGTH] * 1000);
    }
    if (timerSpec[TIMER_PARAMS_.CALL_IMMEDIATE]) {
      listener(this.createEvent_(eventType));
    }
  }

  /**
   * @param {string} timerId
   * @private
   */
  stopTimer_(timerId) {
    if (!this.trackers_[timerId][TIMER_PARAMS_.INTERVAL_ID]) {
      return; // Timer not running.
    }
    const win = this.root.ampdoc.win;
    win.clearInterval(this.trackers_[timerId][TIMER_PARAMS_.INTERVAL_ID]);
    delete this.trackers_[timerId][TIMER_PARAMS_.INTERVAL_ID];
    if (!!this.trackers_[timerId][TIMER_PARAMS_.UNLISTEN_STOP]) {
      this.trackers_[timerId][TIMER_PARAMS.UNLISTEN_STOP]();
      delete this.trackers_[timerId][TIMER_PARAMS_.UNLISTEN_STOP];
    }
  }

  /**
   * @param {string} timerId
   * @return {boolean}
   * @private
   */
  isRestartableTimer_(timerId) {
    return this.trackers_[timerId][TIMER_PARAMS_.CAN_RESTART];
  }

  /**
   * @param {string} eventType
   * @return {!AnalyticsEvent}
   * @private
   */
  createEvent_(eventType) {
    return new AnalyticsEvent(this.root.getRootElement(), eventType);
  }

  /**
   * @param {number} timerId
   * @private
   */
  removeTracker_(timerId) {
    if (!!this.trackers_[timerId]) {
      this.stopTimer_(timerId);
      if (!!this.trackers_[timerId][TIMER_PARAMS_.UNLISTEN_START]) {
        this.trackers_[timerId][TIMER_PARAMS_.UNLISTEN_START]();
      }
      if (!!this.trackers_[timerId][TIMER_PARAMS_.UNLISTEN_STOP]) {
        this.trackers_[timerId][TIMER_PARAMS_.UNLISTEN_STOP]();
      }
      delete this.trackers_[timerId];
    }
  }
}


/**
 * Tracks video session events
 */
export class VideoEventTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);

    /** @private {?Observable<!Event>} */
    this.sessionObservable_ = new Observable();

    /** @private {?Function} */
    this.boundOnSession_ = e => {
      this.sessionObservable_.fire(e);
    };

    Object.keys(VideoAnalyticsEvents).forEach(key => {
      this.root.getRoot().addEventListener(
          VideoAnalyticsEvents[key], this.boundOnSession_);
    });
  }

  /** @override */
  dispose() {
    const root = this.root.getRoot();
    Object.keys(VideoAnalyticsEvents).forEach(key => {
      root.removeEventListener(VideoAnalyticsEvents[key], this.boundOnSession_);
    });
    this.boundOnSession_ = null;
    this.sessionObservable_ = null;
  }

  /** @override */
  add(context, eventType, config, listener, trackerProvider) {
    const videoSpec = config['videoSpec'] || {};
    const selector = config['selector'] || videoSpec['selector'];
    const selectionMethod = config['selectionMethod'] || null;
    const targetReady =
        this.root.getElement(context, selector, selectionMethod);

    const endSessionWhenInvisible = videoSpec['end-session-when-invisible'];
    const excludeAutoplay = videoSpec['exclude-autoplay'];
    const interval = videoSpec['interval'];
    const on = config['on'];

    let intervalCounter = 0;

    return this.sessionObservable_.add(event => {
      const type = event.type;
      const isVisibleType = (type === VideoAnalyticsEvents.SESSION_VISIBLE);
      const normalizedType =
          isVisibleType ? VideoAnalyticsEvents.SESSION : type;
      const details = /** @type {!VideoAnalyticsDetailsDef} */ (getData(event));

      if (normalizedType !== on) {
        return;
      }

      if (normalizedType === VideoAnalyticsEvents.SECONDS_PLAYED && !interval) {
        user().error(TAG, 'video-seconds-played requires interval spec ' +
            'with non-zero value');
        return;
      }

      if (normalizedType === VideoAnalyticsEvents.SECONDS_PLAYED) {
        intervalCounter++;
        if (intervalCounter % interval !== 0) {
          return;
        }
      }

      if (isVisibleType && !endSessionWhenInvisible) {
        return;
      }

      if (excludeAutoplay && details['state'] === PlayingStates.PLAYING_AUTO) {
        return;
      }

      const el = dev().assertElement(event.target,
          'No target specified by video session event.');
      targetReady.then(target => {
        if (target.contains(el)) {
          listener(new AnalyticsEvent(target, normalizedType, details));
        }
      });
    });
  }
}


/**
 * Tracks visibility events.
 */
export class VisibilityTracker extends EventTracker {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  constructor(root) {
    super(root);

    /** @private */
    this.waitForTrackers_ = {};
  }

  /** @override */
  dispose() {
  }

  /** @override */
  add(context, eventType, config, listener, trackerProvider) {
    const visibilitySpec = config['visibilitySpec'] || {};
    const selector = config['selector'] || visibilitySpec['selector'];
    const waitForSpec = visibilitySpec['waitFor'];
    const visibilityManager = this.root.getVisibilityManager();
    // special polyfill for eventType: 'hidden'
    let createReadyReportPromiseFunc = null;
    if (eventType == 'hidden') {
      createReadyReportPromiseFunc = this.createReportReadyPromise_.bind(this);
    }

    // Root selectors are delegated to analytics roots.
    if (!selector || selector == ':root' || selector == ':host') {
      // When `selector` is specified, we always use "ini-load" signal as
      // a "ready" signal.
      return visibilityManager.listenRoot(
          visibilitySpec,
          this.getReadyPromise(waitForSpec, selector),
          createReadyReportPromiseFunc,
          this.onEvent_.bind(
              this, eventType, listener, this.root.getRootElement()));
    }

    // An AMP-element. Wait for DOM to be fully parsed to avoid
    // false missed searches.
    const selectionMethod = config['selectionMethod'] ||
          visibilitySpec['selectionMethod'];
    const unlistenPromise = this.root.getAmpElement(
        (context.parentElement || context),
        selector,
        selectionMethod
        ).then(element => {
          return visibilityManager.listenElement(
              element,
              visibilitySpec,
              this.getReadyPromise(waitForSpec, selector, element),
              createReadyReportPromiseFunc,
              this.onEvent_.bind(this, eventType, listener, element));
        });
    return function() {
      unlistenPromise.then(unlisten => {
        unlisten();
      });
    };
  }

  /**
   * @return {!Promise}
   * @visibleForTesting
   */
  createReportReadyPromise_() {
    const viewer = this.root.getViewer();

    if (!viewer.isVisible()) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      viewer.onVisibilityChanged(() => {
        if (!viewer.isVisible()) {
          resolve();
        }
      });
    });
  }

  /**
   * @param {string|undefined} waitForSpec
   * @param {string|undefined} selector
   * @param {Element=} element
   * @return {?Promise}
   * @visibleForTesting
   */
  getReadyPromise(waitForSpec, selector, element) {
    if (!waitForSpec) {
      // Default case:
      if (!selector) {
        // waitFor nothing is selector is not defined
        waitForSpec = 'none';
      } else {
        // otherwise wait for ini-load by default
        waitForSpec = 'ini-load';
      }
    }

    user().assert(SUPPORT_WAITFOR_TRACKERS[waitForSpec] !== undefined,
        'waitFor value %s not supported', waitForSpec);

    if (!SUPPORT_WAITFOR_TRACKERS[waitForSpec]) {
      // waitFor NONE, wait for nothing
      return null;
    }

    if (!this.waitForTrackers_[waitForSpec]) {
      this.waitForTrackers_[waitForSpec] =
        new SUPPORT_WAITFOR_TRACKERS[waitForSpec](this.root);
    }

    const waitForTracker = this.waitForTrackers_[waitForSpec];
    // Wait for root signal if there's no element selected.
    return element ? waitForTracker.getElementSignal(waitForSpec, element)
        : waitForTracker.getRootSignal(waitForSpec);
  }

  /**
   * @param {string} eventType
   * @param {function(!AnalyticsEvent)} listener
   * @param {!Element} target
   * @param {!Object<string, *>} state
   * @private
   */
  onEvent_(eventType, listener, target, state) {
    const attr = getDataParamsFromAttributes(
        target,
        /* computeParamNameFunc */ undefined,
        VARIABLE_DATA_ATTRIBUTE_KEY);
    for (const key in attr) {
      state[key] = attr[key];
    }
    listener(new AnalyticsEvent(target, eventType, state));
  }
}

/** @const @private */
const SUPPORT_WAITFOR_TRACKERS = {
  'none': null,
  'ini-load': IniLoadTracker,
  'render-start': SignalTracker,
};
