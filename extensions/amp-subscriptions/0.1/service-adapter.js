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
   * @return {!PageConfig}
   */
  getPageConfig() {
    return this.subscriptionService_.getPageConfig();
  }

  /**
   * Delegates actions to local platform.
   * @param {string} action
   * @return {!Promise<boolean>}
   */
  delegateActionToLocal(action) {
    return this.delegateActionToService(action, 'local');
  }

  /**
   * Delegates actions to a given service.
   * @param {string} action
   * @param {string} serviceId
   * @return {!Promise<boolean>}
   */
  delegateActionToService(action, serviceId) {
    return this.subscriptionService_.delegateActionToService(action, serviceId);
  }

  /**
   * Delegate UI decoration to another service.
   * @param {!Element} element
   * @param {string} serviceId
   * @param {string} action
   * @param {?JsonObject} options
   */
  decorateServiceAction(element, serviceId, action, options) {
    this.subscriptionService_.decorateServiceAction(element, serviceId,
        action, options);
  }

  /**
   * Reauthorize platforms
   * @param {!./subscription-platform.SubscriptionPlatform} subscriptionPlatform
   */
  reAuthorizePlatform(subscriptionPlatform) {
    this.subscriptionService_.reAuthorizePlatform(subscriptionPlatform);
  }

  /**
   * Returns the singleton Dialog instance
   * @return {!./dialog.Dialog}
   */
  getDialog() {
    return this.subscriptionService_.getDialog();
  }

  /**
   * Returns login platform based on platform selection
   *
   * @return {!./subscription-platform.SubscriptionPlatform}
   */
  selectPlatformForLogin() {
    return this.subscriptionService_.selectPlatformForLogin();
  }
}

/** @package @VisibleForTesting */
export function getPageConfigForTesting() {
  return PageConfig;
}

