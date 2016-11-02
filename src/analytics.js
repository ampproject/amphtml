/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
  getElementService,
  getElementServiceIfAvailable,
} from './element-service';


/**
 * @param {!Window} window
 * @return {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
 */
export function analyticsFor(window) {
  return (/** @type {!Promise<
            !../extensions/amp-analytics/0.1/instrumentation.InstrumentationService
          >} */ (getElementService(
                window, 'amp-analytics-instrumentation', 'amp-analytics')));
};

/**
 * @param {!Window} window
 * @return {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
 */
export function analyticsForOrNull(window) {
  return (/** @type {!Promise<
            ?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService
          >} */ (getElementServiceIfAvailable(
                window, 'amp-analytics-instrumentation', 'amp-analytics')));
};

/**
 * Helper method to trigger analytics event if amp-analytics is available.
 * @param {!Window} window
 * @param {string} eventType
 * @param {!Object<string, string>=} opt_vars A map of vars and their values.
 */
export function triggerAnalyticsEvent(window, eventType, opt_vars) {
  analyticsForOrNull(window).then(analytics => {
    if (!analytics) {
      return;
    }
    analytics.triggerEvent(eventType, opt_vars);
  });
}
