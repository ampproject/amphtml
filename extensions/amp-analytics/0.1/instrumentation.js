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

import {getService} from '../../../src/service';
import {viewerFor} from '../../../src/viewer';
import {Observable} from '../../../src/observable';

const MIN_TIMER_INTERVAL_SECONDS_ = 0.5;
const DEFAULT_MAX_TIMER_LENGTH_SECONDS_ = 7200;

/**
 * This type signifies a callback that gets called when an analytics event that
 * the listener subscribed to fires.
 * @typedef {function(!AnalyticsEvent)}
 */
let AnalyticsEventListenerDef;

/**
 * @param {!Window} window Window object to listen on.
 * @param {!AnalyticsEventType} type Event type to listen to.
 * @param {!AnalyticsEventListenerDef} listener Callback to call when the event
 *          fires.
 * @param {string=} opt_selector If specified, the given listener
 *   should only be called if the event target matches this selector.
 * @param {JSONObject=} opt_timerSpec If specified, the specification on how
 *   the timer should fire.
 */
export function addListener(window, type, listener, opt_selector,
    opt_timerSpec) {
  return instrumentationServiceFor(window).addListener(
      type, listener, opt_selector, opt_timerSpec);
}

/**
 * Events that can result in analytics data to be sent.
 * @const
 * @enum {string}
 */
export const AnalyticsEventType = {
  VISIBLE: 'visible',
  CLICK: 'click',
  TIMER: 'timer'
};

/**
 * Ignore Most of this class as it has not been thought through yet. It will
 * change completely.
 */
class AnalyticsEvent {

  /**
   * @param {!AnalyticsEventType} type The type of event.
   */
  constructor(type) {
    this.type = type;
  }
}

/** @private */
class InstrumentationService {
  /**
   * @param {!Window} window
   */
  constructor(window) {
    /** @const {!Window} */
    this.win_ = window;

    /** @const {string} */
    this.TAG_ = "Analytics.Instrumentation";

    /** @const {!Viewer} */
    this.viewer_ = viewerFor(window);

    /** @private {boolean} */
    this.clickHandlerRegistered_ = false;

    /** @private {!Observable<!Event>} */
    this.clickObservable_ = new Observable();

    /** @private {!Object<string, !Observable<!AnalyticsEvent>>} */
    this.observers_ = {};
  }

  /**
   * @param {!AnalyticsEventType} eventType The type of event
   * @param {!AnalyticsEventListenerDef} The callback to call when the event
   *   occurs.
   * @param {string=} opt_selector If specified, the given listener
   *   should only be called if the event target matches this selector.
   * @param {JSONObject=} opt_timerSpec If specified, the specification on how
   *   the timer should fire.
   */
  addListener(eventType, listener, opt_selector, opt_timerSpec) {
    if (eventType === AnalyticsEventType.VISIBLE) {
      if (this.viewer_.isVisible()) {
        listener(new AnalyticsEvent(AnalyticsEventType.VISIBLE));
      } else {
        this.viewer_.onVisibilityChanged(() => {
          if (this.viewer_.isVisible()) {
            listener(new AnalyticsEvent(AnalyticsEventType.VISIBLE));
          }
        });
      }
    } else if (eventType === AnalyticsEventType.CLICK) {
      if (!opt_selector) {
        console./*OK*/error(this.TAG_,
            'Missing required selector on click trigger');
      } else {
        this.ensureClickListener_();
        this.clickObservable_.add(
            this.createSelectiveListener_(listener, opt_selector));
      }
    } else if (eventType === AnalyticsEventType.TIMER) {
      if (this.isTimerSpecValid_(opt_timerSpec)) {
        this.createTimerListener_(listener, opt_timerSpec);
      }
    } else {
      let observers = this.observers_[eventType];
      if (!observers) {
        observers = new Observable();
        this.observers_[eventType] = observers;
      }
      observers.add(listener);
    }
  }

  /**
   * Triggers the analytics event with the specified type.
   * @param {string} eventType
   */
  triggerEvent(eventType) {
    const observers = this.observers_[eventType];
    if (observers) {
      observers.fire(new AnalyticsEvent(eventType));
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
   * @param {!Function} listener
   * @param {string} selector
   * @private
   */
  createSelectiveListener_(listener, selector) {
    return e => {
      if (selector === '*' || this.matchesSelector_(e.target, selector)) {
        listener(new AnalyticsEvent(AnalyticsEventType.CLICK));
      }
    };
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
      console./*OK*/error(this.TAG_, 'Bad query selector.', selector,
          selectorError);
    }
    return false;
  }

  /**
   * @param {JSONObject} timerSpec
   * @private
   */
  isTimerSpecValid_(timerSpec) {
    if (!timerSpec) {
      console./*OK*/error(this.TAG_, 'Bad timer specification');
      return false;
    } else if (!timerSpec.hasOwnProperty('interval')) {
      console./*OK*/error(this.TAG_, 'Timer interval specification required');
      return false;
    } else if (typeof timerSpec['interval'] !== 'number' ||
               timerSpec['interval'] < MIN_TIMER_INTERVAL_SECONDS_) {
      console./*OK*/error(this.TAG_, 'Bad timer interval specification');
      return false;
    } else if (timerSpec.hasOwnProperty('max-timer-length') &&
              (typeof timerSpec['max-timer-length'] !== 'number' ||
                  timerSpec['max-timer-length'] <= 0)) {
      console./*OK*/error(this.TAG_, 'Bad max-timer-length specification');
      return false;
    } else {
      return true;
    }
  }

  /**
   * @param {!Function} listener
   * @param {JSONObject} timerSpec
   * @private
   */
  createTimerListener_(listener, timerSpec) {
    const intervalId = this.win_.setInterval(
        listener.bind(null, new AnalyticsEvent(AnalyticsEventType.TIMER)),
        timerSpec['interval'] * 1000);
    listener(new AnalyticsEvent(AnalyticsEventType.TIMER));

    const maxTimerLength = timerSpec['max-timer-length'] ||
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
  return getService(window, 'amp-analytics-instrumentation', () => {
    return new InstrumentationService(window);
  });
}

