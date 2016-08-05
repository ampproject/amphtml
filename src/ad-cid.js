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
import {clientIdScope} from '../ads/_config';
import {userNotificationManagerFor} from './user-notification';
import {dev} from '../src/log';


/**
 * @param {BaseElement} adElement
 * @return {!Promise<string|undefined>} A promise for a CID or undefined if
 *     - the ad network does not request one or
 *     - `amp-analytics` which provides the CID service was not installed.
 */
export function getAdCid(adElement) {
  const scope = clientIdScope[adElement.element.getAttribute('type')];
  const consentId = adElement.element.getAttribute(
    'data-consent-notification-id');
  if (!(scope || consentId)) {
    return Promise.resolve();
  }
  return cidForOrNull(adElement.win).then(cidService => {
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
}
