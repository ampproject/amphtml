/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {triggerAnalyticsEvent} from '../../../src/analytics';

export const SubscriptionAnalyticsEvents = {
  PLATFORM_ACTIVATED: 'subscriptions-platform-activated',
  PLATFORM_REGISTERED: 'subscriptions-platform-registered',
  PLATFORM_REAUTHORIZED: 'subscriptions-platform-re-authorized',
  ACTION_DELEGATED: 'subscriptions-action-delegated',
  ENTITLEMENT_RESOLVED: 'subscriptions-entitlement-resolved',
  STARTED: 'subscriptions-started',
};

export class SubscriptionAnalytics {

  constructor(element) {
    this.element_ = element;
  }

  /**
   *
   * @param {string} eventType
   * @param {string} serviceId
   * @param {Object<string, string>=} opt_vars
   */
  serviceEvent(eventType, serviceId, opt_vars) {
    // TODO(dvoytenko): implement.
    triggerAnalyticsEvent(this.element_, eventType, Object.assign({
      serviceId,
    }, opt_vars));
  }

  /**
   *
   * @param {string} eventType
   * @param {Object<string, string>=} opt_vars
   */
  event(eventType, opt_vars) {
    // TODO(dvoytenko): implement.
    triggerAnalyticsEvent(this.element_, eventType, opt_vars || {});
  }
}
