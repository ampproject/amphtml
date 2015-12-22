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
import {log} from '../../../src/log';

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
 */
export function addListener(window, type, listener, opt_selector) {
  return instrumentationServiceFor(window).addListener(
      type, listener, opt_selector);
}

/**
 * Events that can result in analytics data to be sent.
 * @const
 * @enum {string}
 */
export const AnalyticsEventType = {
  VISIBLE: 'visible',
  CLICK: 'click'
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

    /** @private {!Observable<Event>} */
    this.clickObservable_ = new Observable();
  }

  /**
   * @param {!AnalyticsEventType} eventType The type of event
   * @param {!AnalyticsEventListenerDef} The callback to call when the event
   *   occurs.
   * @param {string=} opt_selector If specified, the given listener
   *   should only be called if the event target matches this selector.
   */
  addListener(eventType, listener, opt_selector) {
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
        log.warn(this.TAG_, 'Missing required selector on click trigger');
      } else {
        this.ensureClickListener_();
        this.clickObservable_.add(
            this.createSelectiveListener_(listener, opt_selector));
      }
    }
  }

  /**
   * Ensure we have a click listener registered on the document.
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
   */
  onClick_(e) {
    this.clickObservable_.fire(e);
  }

  /**
   * @param {!Function} listener
   * @param {string} selector
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
      log.error(this.TAG_, 'Bad query selector: ', selector, selectorError);
    }
    return false;
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

