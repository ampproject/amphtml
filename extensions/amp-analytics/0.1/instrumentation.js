/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {isVisibilitySpecValid} from './visibility-impl';
import {Observable} from '../../../src/observable';
import {fromClass} from '../../../src/service';
import {timer} from '../../../src/timer';
import {user} from '../../../src/log';
import {viewerFor} from '../../../src/viewer';
import {viewportFor} from '../../../src/viewport';
import {visibilityFor} from '../../../src/visibility';

const MIN_TIMER_INTERVAL_SECONDS_ = 0.5;
const DEFAULT_MAX_TIMER_LENGTH_SECONDS_ = 7200;
const SCROLL_PRECISION_PERCENT = 5;
const VAR_H_SCROLL_BOUNDARY = 'horizontalScrollBoundary';
const VAR_V_SCROLL_BOUNDARY = 'verticalScrollBoundary';

/**
 * Type to define a callback that is called when an instrumented event fires.
 * @typedef {function(!AnalyticsEvent)}
 */
let AnalyticsEventListenerDef;

/**
 * @param {!Window} window Window object to listen on.
 * @param {!JSONType} config Configuration for instrumentation.
 * @param {!AnalyticsEventListenerDef} listener Callback to call when the event
 *          fires.
 */
export function addListener(window, config, listener) {
  return instrumentationServiceFor(window).addListener(config, listener);
}

/**
 * Events that can result in analytics data to be sent.
 * @const
 * @enum {string}
 */
export const AnalyticsEventType = {
  VISIBLE: 'visible',
  CLICK: 'click',
  TIMER: 'timer',
  SCROLL: 'scroll',
};

/**
 * Ignore Most of this class as it has not been thought through yet. It will
 * change completely.
 */
class AnalyticsEvent {

  /**
   * @param {!AnalyticsEventType} type The type of event.
   * @param {!Object<string, string>} A map of vars and their values.
   */
  constructor(type, vars) {
    this.type = type;
    this.vars = vars || Object.create(null);
  }
}

/** @private Visible for testing. */
export class InstrumentationService {
  /**
   * @param {!Window} window
   */
  constructor(window) {
    /** @const {!Window} */
    this.win_ = window;

    /** @const {string} */
    this.TAG_ = 'Analytics.Instrumentation';

    /** @const {!Viewer} */
    this.viewer_ = viewerFor(window);

    /** @const {!Viewport} */
    this.viewport_ = viewportFor(window);

    /** @private {boolean} */
    this.clickHandlerRegistered_ = false;

    /** @private {!Observable<!Event>} */
    this.clickObservable_ = new Observable();

    /** @private {boolean} */
    this.scrollHandlerRegistered_ = false;

    /** @private {!Observable<Event>} */
    this.scrollObservable_ = new Observable();

    /** @private {!Object<string, !Observable<!AnalyticsEvent>>} */
    this.customEventObservers_ = {};

    /**
     * Early events have to be buffered because there's no way to predict
     * how fast all `amp-analytics` elements will be instrumented.
     * @private {!Object<string, !Array<!AnalyticsEvent>>|undefined}
     */
    this.customEventBuffer_ = {};

    // Stop buffering of custom events after 10 seconds. Assumption is that all
    // `amp-analytics` elements will have been instrumented by this time.
    timer.delay(() => {
      this.customEventBuffer_ = undefined;
    }, 10000);
  }

  /**
   * @param {!JSONType} config Configuration for instrumentation.
   * @param {!AnalyticsEventListenerDef} The callback to call when the event
   *   occurs.
   */
  addListener(config, listener) {
    const eventType = config['on'];
    if (eventType === AnalyticsEventType.VISIBLE) {
      this.createVisibilityListener_(listener, config);
    } else if (eventType === AnalyticsEventType.CLICK) {
      if (!config['selector']) {
        user.error(this.TAG_, 'Missing required selector on click trigger');
        return;
      }

      this.ensureClickListener_();
      this.clickObservable_.add(
          this.createSelectiveListener_(listener, config['selector']));
    } else if (eventType === AnalyticsEventType.SCROLL) {
      if (!config['scrollSpec']) {
        user.error(this.TAG_, 'Missing scrollSpec on scroll trigger.');
        return;
      }
      this.registerScrollTrigger_(config['scrollSpec'], listener);

      // Trigger an event to fire events that might have already happened.
      const size = this.viewport_.getSize();
      this.onScroll_({
        top: this.viewport_.getScrollTop(),
        left: this.viewport_.getScrollLeft(),
        width: size.width,
        height: size.height,
      });
    } else if (eventType === AnalyticsEventType.TIMER) {
      if (this.isTimerSpecValid_(config['timerSpec'])) {
        this.createTimerListener_(listener, config['timerSpec']);
      }
    } else {
      let observers = this.customEventObservers_[eventType];
      if (!observers) {
        observers = new Observable();
        this.customEventObservers_[eventType] = observers;
      }
      observers.add(listener);

      // Push recent events if any.
      if (this.customEventBuffer_) {
        const buffer = this.customEventBuffer_[eventType];
        if (buffer) {
          timer.delay(() => {
            buffer.forEach(event => {
              listener(event);
            });
          }, 1);
        }
      }
    }
  }

  /**
   * Triggers the analytics event with the specified type.
   * @param {string} eventType
   */
  triggerEvent(eventType) {
    const event = new AnalyticsEvent(eventType);

    // Enqueue.
    if (this.customEventBuffer_) {
      let buffer = this.customEventBuffer_[event.type];
      if (!buffer) {
        buffer = [];
        this.customEventBuffer_[event.type] = buffer;
      }
      buffer.push(event);
    }

    // If listeners already present - trigger right away.
    const observers = this.customEventObservers_[eventType];
    if (observers) {
      observers.fire(event);
    }
  }

  /**
   * Creates listeners for visibility conditions or calls the callback if all
   * the conditions are met.
   * @param {!AnalyticsEventListenerDef} The callback to call when the event
   *   occurs.
   * @param {!JSONType} config Configuration for instrumentation.
   * @private
   */
  createVisibilityListener_(callback, config) {
    if (config['visibilitySpec']) {
      if (!isVisibilitySpecValid(config)) {
        return;
      }

      this.runOrSchedule_(() => {
        visibilityFor(this.win_).then(visibility => {
          visibility.listenOnce(config['visibilitySpec'], vars => {
            callback(new AnalyticsEvent(AnalyticsEventType.VISIBLE, vars));
          });
        });
      });
    } else {
      this.runOrSchedule_(() => {
        callback(new AnalyticsEvent(AnalyticsEventType.VISIBLE));
      });
    }
  }

  /**
   * @param {function()} fn function to run or schedule.
   * @private
   */
  runOrSchedule_(fn) {
    if (this.viewer_.isVisible()) {
      fn();
    } else {
      this.viewer_.onVisibilityChanged(() => {
        if (this.viewer_.isVisible()) {
          fn();
        }
      });
    }
  }

  /**
   * Ensure we have a click listener registered on the document.
   * @private
   */
  ensureClickListener_() {
    if (!this.clickHandlerRegistered_) {
      this.clickHandlerRegistered_ = true;
      this.win_.document.documentElement.addEventListener(
          'click', this.onClick_.bind(this));
    }
  }

  /**
   * @param {!Event} e
   * @private
   */
  onClick_(e) {
    this.clickObservable_.fire(e);
  }

  /**
   * @param {!ViewportChangedEventDef} e
   * @private
   */
  onScroll_(e) {
    this.scrollObservable_.fire(e);
  }

  /**
   * @param {!Function} listener
   * @param {string} selector
   * @private
   */
  createSelectiveListener_(listener, selector) {
    return e => {
      // First do the cheap lookups.
      if (selector === '*' || this.matchesSelector_(e.target, selector)) {
        listener(new AnalyticsEvent(AnalyticsEventType.CLICK));
      } else {
        // More expensive search.
        let el = e.target;
        while (el.parentElement != null && el.parentElement.tagName != 'BODY') {
          el = el.parentElement;
          if (this.matchesSelector_(el, selector)) {
            listener(new AnalyticsEvent(AnalyticsEventType.CLICK));
            // Don't fire the event multiple times even if the more than one
            // ancestor matches the selector.
            return;
          }
        }
      }

    };
  }

  /**
   * Register for a listener to be called when the boundaries specified in
   * config are reached.
   * @param {!JSONType} config the config that specifies the boundaries.
   * @param {Function} listener
   * @private
   */
  registerScrollTrigger_(config, listener) {
    if (!Array.isArray(config['verticalBoundaries']) &&
        !Array.isArray(config['horizontalBoundaries'])) {
      user.error(this.TAG_, 'Boundaries are required for the scroll ' +
          'trigger to work.');
      return;
    }

    // Ensure that the scroll events are being listened to.
    if (!this.scrollHandlerRegistered_) {
      this.scrollHandlerRegistered_ = true;
      this.viewport_.onChanged(this.onScroll_.bind(this));
    }

    /**
     * @param {!Object<number, boolean>} bounds.
     * @param {number} scrollPos Number representing the current scroll
     * @param {string} varName variable name to assign to the bound that
     * triggers the event
     * position.
     */
    const triggerScrollEvents = function(bounds, scrollPos, varName) {
      if (!scrollPos) {
        return;
      }
      // Goes through each of the boundaries and fires an event if it has not
      // been fired so far and it should be.
      for (const b in bounds) {
        if (!bounds.hasOwnProperty(b) || b > scrollPos || bounds[b]) {
          continue;
        }
        bounds[b] = true;
        const vars = Object.create(null);
        vars[varName] = b;
        listener(new AnalyticsEvent(AnalyticsEventType.SCROLL, vars));
      }
    };

    const boundsV = this.normalizeBoundaries_(config['verticalBoundaries']);
    const boundsH = this.normalizeBoundaries_(config['horizontalBoundaries']);
    this.scrollObservable_.add(e => {
      // Calculates percentage scrolled by adding screen height/width to
      // top/left and dividing by the total scroll height/width.
      triggerScrollEvents(boundsV,
          (e.top + e.height) * 100 / this.viewport_.getScrollHeight(),
          VAR_V_SCROLL_BOUNDARY);
      triggerScrollEvents(boundsH,
          (e.left + e.width) * 100 / this.viewport_.getScrollWidth(),
          VAR_H_SCROLL_BOUNDARY);
    });
  }

  /**
   * Rounds the boundaries for scroll trigger to nearest
   * SCROLL_PRECISION_PERCENT and returns an object with normalized boundaries
   * as keys and false as values.
   *
   * @param {!Array<number>} bounds array of bounds.
   * @return {!Object<number,boolean>} Object with normalized bounds as keys
   * and false as value.
   * @private
   */
  normalizeBoundaries_(bounds) {
    const result = {};
    if (!bounds || !Array.isArray(bounds)) {
      return result;
    }

    for (let b = 0; b < bounds.length; b++) {
      let bound = bounds[b];
      if (typeof bound !== 'number' || !isFinite(bound)) {
        user.error(this.TAG_, 'Scroll trigger boundaries must be finite.');
        return result;
      }

      bound = Math.min(Math.round(bound / SCROLL_PRECISION_PERCENT) *
          SCROLL_PRECISION_PERCENT, 100);
      result[bound] = false;
    }
    return result;
  }

  /**
   * @param {!Element} el
   * @param {string} selector
   * @return {boolean} True if the given element matches the given selector.
   * @private
   */
  matchesSelector_(el, selector) {
    try {
      const matcher = el.matches ||
          el.webkitMatchesSelector ||
          el.mozMatchesSelector ||
          el.msMatchesSelector ||
          el.oMatchesSelector;
      if (matcher) {
        return matcher.call(el, selector);
      }
      const matches = this.win_.document.querySelectorAll(selector);
      let i = matches.length;
      while (i-- > 0 && matches.item(i) != el) {};
      return i > -1;
    } catch (selectorError) {
      user.error(this.TAG_, 'Bad query selector.', selector, selectorError);
    }
    return false;
  }

  /**
   * @param {JSONType} timerSpec
   * @private
   */
  isTimerSpecValid_(timerSpec) {
    if (!timerSpec) {
      user.error(this.TAG_, 'Bad timer specification');
      return false;
    } else if (!timerSpec.hasOwnProperty('interval')) {
      user.error(this.TAG_, 'Timer interval specification required');
      return false;
    } else if (typeof timerSpec['interval'] !== 'number' ||
               timerSpec['interval'] < MIN_TIMER_INTERVAL_SECONDS_) {
      user.error(this.TAG_, 'Bad timer interval specification');
      return false;
    } else if (timerSpec.hasOwnProperty('maxTimerLength') &&
              (typeof timerSpec['maxTimerLength'] !== 'number' ||
                  timerSpec['maxTimerLength'] <= 0)) {
      user.error(this.TAG_, 'Bad maxTimerLength specification');
      return false;
    } else {
      return true;
    }
  }

  /**
   * @param {!Function} listener
   * @param {JSONType} timerSpec
   * @private
   */
  createTimerListener_(listener, timerSpec) {
    const intervalId = this.win_.setInterval(
        listener.bind(null, new AnalyticsEvent(AnalyticsEventType.TIMER)),
        timerSpec['interval'] * 1000);
    listener(new AnalyticsEvent(AnalyticsEventType.TIMER));

    const maxTimerLength = timerSpec['maxTimerLength'] ||
        DEFAULT_MAX_TIMER_LENGTH_SECONDS_;
    this.win_.setTimeout(this.win_.clearInterval.bind(this.win_, intervalId),
        maxTimerLength * 1000);
  }
}

/**
 * @param {!Window} window
 * @return {!InstrumentationService}
 */
export function instrumentationServiceFor(window) {
  return fromClass(window, 'amp-analytics-instrumentation',
      InstrumentationService);
}
