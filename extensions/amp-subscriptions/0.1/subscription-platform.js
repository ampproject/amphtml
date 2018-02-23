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

import {Entitlements} from '../../../third_party/subscriptions-project/apis';
import {PageConfig} from '../../../third_party/subscriptions-project/config';


/**
 * This interface is intended to be implemented by Subscription platforms to
 * provide method of getting entitlements.
 *
 * @interface
 */
export class SubscriptionPlatform {

  /**
   * @param {!JsonObject} unusedPlatformConfig
   * @param {!PageConfig} unusedPageConfig
   */
  configure(unusedPlatformConfig, unusedPageConfig) {}

  /**
   * Requests entitlement for a subscription platform.
   * @return {!Promise<!Entitlements>}
   */
  getEntitlements() {
  }
}


/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @visibleForTesting
 */
export function getEntitlementsClassForTesting() {
  return Entitlements;
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @visibleForTesting
 */
export function getPageConfigClassForTesting() {
  return PageConfig;
}
