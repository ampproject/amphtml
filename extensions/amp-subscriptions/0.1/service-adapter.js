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

import {PageConfig} from '../../../third_party/subscriptions-project/config';

export class ServiceAdapter {

  /**
   * @param {./amp-subscriptions.SubscriptionService} subscriptionService
   */
  constructor(subscriptionService) {
    this.subscriptionService_ = subscriptionService;
  }

  /**
   * Returns the page config.
   * @returns {!PageConfig}
   */
  getPageConfig() {
    return this.subscriptionService_.getPageConfig();
  }

  /**
   * Delegates actions to local platform
   * @param {string} action
   */
  delegateActionToLocal(action) {
    this.subscriptionService_.delegateActionToLocal(action);
  }

  /**
   * Reauthorize platforms
   * @param {!./subscription-platform.SubscriptionPlatform} subscriptionPlatform
   */
  reAuthorizePlatform(subscriptionPlatform) {
    this.subscriptionService_.reAuthorizePlatform(subscriptionPlatform);
  }
}

/** @package @VisibleForTesting */
export function getPageConfigForTesting() {
  return PageConfig;
}

