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

/**
 * This type signifies a callback that gets called when an analytics event that
 * the listener subscribed to fires.
 * @typedef {function(!AnalyticsEvent)}
 */
let AnalyticsEventListener;

/**
 * @param {!Window} window Window object to listen on.
 * @param {!AnalyticsEventType} type Event type to listen to.
 * @param {!AnalyticsEventListener} listener Callback to call when the event
 *          fires.
 */
export function addListener(window, type, listener) {
  return instrumentationServiceFor(window).addListener(type, listener);
}

/**
 * Events that can result in analytics data to be sent.
 * @const
 * @enum {string}
 */
export const AnalyticsEventType = {
  VISIBLE: 'visible',
  TIMER: 'timer', // Not supported yet.
  CLICK: 'click', // Not supported yet.
  TAP: 'tap', // Not supported yet.
  HIDDEN: 'hidden' // Not supported yet.
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

    /**
     * @consti {!Viewer}
     */
    this.viewer_ = viewerFor(window);
  }

  /**
   * @param {!AnalyticsEventType} eventType The type of event
   * @param {!AnalyticsEventListener} The callback to call when the event
   *          occurs.
   */
  addListener(eventType, listener) {

    // TODO(btownsend, #871): Add support for clicks, timers, scroll etc.
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
    }
  }
}

/**
 * @param {!Window} window
 * @return {!InstrumentationService}
 */
function instrumentationServiceFor(window) {
  return getService(window, 'amp-analytics-instrumentation', () => {
    return new InstrumentationService(window);
  });
}
