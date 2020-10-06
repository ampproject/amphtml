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
 * @enum {string}
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
  SUBSCRIPTIONS_ACTION: 'subscriptions-action',
};

/** @enum {string} */
export const Action = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  LINK: 'link',
  SUBSCRIBE: 'subscribe',
  CONTRIBUTE: 'contribute',
  SHOW_CONTRIBUTION_OPTIONS: 'showContributionOptions',
  SHOW_OFFERS: 'showOffers',
};

/** @enum {string} */
export const ActionStatus = {
  STARTED: 'started',
  REJECTED: 'rejected',
  FAILED: 'failed',
  SUCCESS: 'success',
};

export class SubscriptionAnalytics {
  /**
   * Creates an instance of SubscriptionAnalytics.
   * @param {!Element} element
   */
  constructor(element) {
    this.element_ = element;

    /** @private @const {Array<function((!SubscriptionAnalyticsEvents|string),!JsonObject,!JsonObject)>} */
    this.listeners_ = [];
  }

  /**
   * Notified of any event sent to SubscriptionAnalytics.  The parameters
   * passed to the listener are:
   *  1) The type of event.  This should eventually always be an enum value but
   *     may not be in some circumstances for historic reasons.
   *  2) The optional parameters passed into the framework by the publisher
   *  3) An internal variables object which be populated for the
   *     SUBSCRIPTIONS_ACTION event type: {
   *       action: (Action|undefined),
   *       status: (ActionStatus|undefined),
   *     }
   * @param {function((!SubscriptionAnalyticsEvents|string),!JsonObject,!JsonObject)} listener
   */
  registerEventListener(listener) {
    this.listeners_.push(listener);
  }

  /**
   * @param {!SubscriptionAnalyticsEvents|string} eventType
   * @param {string} serviceId
   * @param {!JsonObject=} opt_vars
   * @param {!JsonObject=} internalVars
   */
  serviceEvent(eventType, serviceId, opt_vars, internalVars) {
    this.event(
      eventType,
      /** @type {!JsonObject} */ (Object.assign(
        dict({
          'serviceId': serviceId,
        }),
        opt_vars
      )),
      internalVars
    );
  }

  /**
   * @param {!SubscriptionAnalyticsEvents|string} eventType
   * @param {!JsonObject=} opt_vars
   * @param {!JsonObject=} internalVars
   */
  event(eventType, opt_vars, internalVars) {
    internalVars = internalVars || dict({});

    const loggedString =
      eventType !== SubscriptionAnalyticsEvents.SUBSCRIPTIONS_ACTION
        ? eventType
        : eventType + `-${internalVars['action']}-${internalVars['status']}`;

    user().info(TAG, loggedString, opt_vars || '');

    opt_vars = opt_vars || dict({});
    triggerAnalyticsEvent(
      this.element_,
      loggedString,
      opt_vars,
      /** enableDataVars */ false
    );

    for (let l = 0; l < this.listeners_.length; l++) {
      this.listeners_[l](eventType, opt_vars, internalVars);
    }
  }

  /**
   * @param {string} serviceId
   * @param {!Action|string} action
   * @param {!ActionStatus|string} status
   * @param {!JsonObject=} opt_vars
   */
  actionEvent(serviceId, action, status, opt_vars) {
    this.serviceEvent(
      SubscriptionAnalyticsEvents.SUBSCRIPTIONS_ACTION,
      serviceId,
      opt_vars,
      dict({
        'action': action,
        'status': status,
      })
    );
  }
}
