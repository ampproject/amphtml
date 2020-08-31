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

import {Services} from './services';
import {dict} from './utils/object';

/**
 * Helper method to trigger analytics event if amp-analytics is available.
 * TODO: Do not expose this function
 * @param {!Element} target
 * @param {string} eventType
 * @param {!JsonObject} vars A map of vars and their values.
 * @param {boolean} enableDataVars A boolean to indicate if data-vars-*
 * attribute value from target element should be included.
 */
export function triggerAnalyticsEvent(
  target,
  eventType,
  vars = dict(),
  enableDataVars = true
) {
  Services.analyticsForDocOrNull(target).then((analytics) => {
    if (!analytics) {
      return;
    }
    analytics.triggerEventForTarget(target, eventType, vars, enableDataVars);
  });
}
