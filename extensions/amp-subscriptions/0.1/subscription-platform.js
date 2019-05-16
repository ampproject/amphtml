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

/**
 * This interface is intended to be implemented by Subscription platforms to
 * provide method of getting entitlements.
 *
 * @interface
 */
export class SubscriptionPlatform {
  /**
   * Returns the service Id.
   * @return {string}
   */
  getServiceId() {}

  /**
   * Requests entitlement for a subscription platform.
   * @return {!Promise<?./entitlement.Entitlement>}
   */
  getEntitlements() {}

  /**
   * Activates the subscription platform and hands over the control for
   * rendering.
   * @param {!./entitlement.Entitlement} unusedEntitlement
   * @param {?./entitlement.Entitlement} unusedGrantEntitlement
   */
  activate(unusedEntitlement, unusedGrantEntitlement) {}

  /**
   * Reset the platform and renderer.
   * This should clear dialogs and toasts originating
   * from the platform.
   */
  reset() {}

  /**
   * True if this platform can fetch entitlement safely in pre-render
   * without leaking information to the publisher or a 3rd party
   * @return {boolean}
   */
  isPrerenderSafe() {}

  /**
   * Returns if pingback is enabled for this platform.
   * @return {boolean}
   */
  isPingbackEnabled() {}

  /**
   * Performs the pingback to the subscription platform.
   * @param {!./entitlement.Entitlement} unusedSelectedPlatform
   * @return {!Promise|undefined}
   */
  pingback(unusedSelectedPlatform) {}

  /**
   * Tells if the platform supports a score factor
   * @param {string} unusedFactor
   * @return {number}
   */
  getSupportedScoreFactor(unusedFactor) {}

  /**
   * Executes action for the local platform.
   * @param {string} unusedAction
   * @return {!Promise<boolean>}
   */
  executeAction(unusedAction) {}

  /**
   * Returns the base score configured for the platform.
   * @return {number}
   */
  getBaseScore() {}

  /**
   * Decorate the DomNode according to your platform
   * @param {!Element} unusedElement
   * @param {string} unusedAction
   * @param {?JsonObject} unusedOptions
   */
  decorateUI(unusedElement, unusedAction, unusedOptions) {}
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @visibleForTesting
 */
export function getPageConfigClassForTesting() {
  return PageConfig;
}
