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

import {
  LocalSubscriptionIframePlatform,
} from './local-subscription-platform-iframe';
import {
  LocalSubscriptionRemotePlatform,
} from './local-subscription-platform-remote';
import {PageConfig} from '../../../third_party/subscriptions-project/config';

/**
 * Local subscription platform factory method.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!JsonObject} platformConfig
 * @param {!./service-adapter.ServiceAdapter} serviceAdapter
 * @return {!./subscription-platform.SubscriptionPlatform}
 */
export function LocalSubscriptionPlatformFactory(
  ampdoc, platformConfig, serviceAdapter) {
  /* Return the correxct platform based on the config */
  if (platformConfig['iframeUrl']) {
    return new LocalSubscriptionIframePlatform(
        ampdoc, platformConfig, serviceAdapter);
  }
  return new LocalSubscriptionRemotePlatform(
      ampdoc, platformConfig, serviceAdapter);
}

/**
 * TODO(dvoytenko): remove once compiler type checking is fixed for third_party.
 * @package @VisibleForTesting
 */
export function getPageConfigClassForTesting() {
  return PageConfig;
}
