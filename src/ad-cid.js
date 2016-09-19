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

import {cidForOrNull} from './cid';
import {adConfig} from '../ads/_config';
import {userNotificationManagerFor} from './user-notification';
import {dev} from '../src/log';
import {timerFor} from '../src/timer';


/**
 * @param {BaseElement} adElement
 * @return {!Promise<string|undefined>} A promise for a CID or undefined if
 *     - the ad network does not request one or
 *     - `amp-analytics` which provides the CID service was not installed.
 */
export function getAdCid(adElement) {
  const config = adConfig[adElement.element.getAttribute('type')];
  const scope = config ? config.clientIdScope : null;
  const consentId = adElement.element.getAttribute(
    'data-consent-notification-id');
  if (!(scope || consentId)) {
    return Promise.resolve();
  }
  const cidPromise = cidForOrNull(adElement.win).then(cidService => {
    if (!cidService) {
      return;
    }
    let consent = Promise.resolve();
    if (consentId) {
      consent = userNotificationManagerFor(adElement.win).then(service => {
        return service.get(consentId);
      });
      if (!scope && consentId) {
        return consent;
      }
    }
    return cidService.get(scope, consent).catch(error => {
      // Not getting a CID is not fatal.
      dev().error('ad-cid', error);
      return undefined;
    });
  });
  // The CID should never be crucial for an ad. If it does not come within
  // 1 second, assume it will never arrive.
  return timerFor(adElement.win)
      .timeoutPromise(1000, cidPromise, 'cid timeout').catch(error => {
        // Timeout is not fatal.
        dev().warn(error);
        return undefined;
      });
}
