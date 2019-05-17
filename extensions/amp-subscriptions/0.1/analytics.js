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

import {dict} from '../../../src/utils/object';
import {triggerAnalyticsEvent} from '../../../src/analytics';
import {user} from '../../../src/log';

const TAG = 'amp-subscriptions';

/**
 * subscriptions-platform-* event names are deprecated in favor
 * of subscription-service-*  The DEPRECATED events are still triggered
 * for backward compatibility with existing publisher code.
 */
export const SubscriptionAnalyticsEvents = {
  PLATFORM_ACTIVATED: 'subscriptions-service-activated',
  PLATFORM_ACTIVATED_DEPRECATED: 'subscriptions-platform-activated',
  PAYWALL_ACTIVATED: 'subscriptions-paywall-activated',
  PLATFORM_REGISTERED: 'subscriptions-service-registered',
  PLATFORM_REGISTERED_DEPRECATED: 'subscriptions-platform-registered',
  PLATFORM_REAUTHORIZED: 'subscriptions-service-re-authorized',
  PLATFORM_REAUTHORIZED_DEPRECATED: 'subscriptions-platform-re-authorized',
  ACTION_DELEGATED: 'subscriptions-action-delegated',
  ENTITLEMENT_RESOLVED: 'subscriptions-entitlement-resolved',
  STARTED: 'subscriptions-started',
  ACCESS_GRANTED: 'subscriptions-access-granted',
  ACCESS_DENIED: 'subscriptions-access-denied',
  // common service adapter events
  LINK_REQUESTED: 'subscriptions-link-requested',
  LINK_COMPLETE: 'subscriptions-link-complete',
  LINK_CANCELED: 'subscriptions-link-canceled',
};

export class SubscriptionAnalytics {
  /**
   * Creates an instance of SubscriptionAnalytics.
   * @param {!Element} element
   */
  constructor(element) {
    this.element_ = element;
  }

  /**
   * @param {string} eventType
   * @param {string} serviceId
   * @param {!JsonObject=} opt_vars
   */
  serviceEvent(eventType, serviceId, opt_vars) {
    this.event(
      eventType,
      /** @type {!JsonObject} */ (Object.assign(
        dict({
          'serviceId': serviceId,
        }),
        opt_vars
      ))
    );
  }

  /**
   * @param {string} eventType
   * @param {!JsonObject=} opt_vars
   */
  event(eventType, opt_vars) {
    user().info(TAG, eventType, opt_vars || '');
    triggerAnalyticsEvent(this.element_, eventType, opt_vars || dict({}));
  }

  /**
   * @param {string} serviceId
   * @param {string} action
   * @param {string} status
   * @param {!JsonObject=} opt_vars
   */
  actionEvent(serviceId, action, status, opt_vars) {
    this.serviceEvent(
      `subscriptions-action-${action}-${status}`,
      serviceId,
      opt_vars
    );
  }
}
