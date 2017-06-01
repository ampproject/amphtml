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

import {cidForDocOrNull, timerFor} from './services';
import {adConfig} from '../ads/_config';
import {dev} from '../src/log';

/**
 * @param {AMP.BaseElement} adElement
 * @return {!Promise<string|undefined>} A promise for a CID or undefined if
 *     - the ad network does not request one or
 *     - `amp-analytics` which provides the CID service was not installed.
 */
export function getAdCid(adElement) {
  const config = adConfig[adElement.element.getAttribute('type')];
  if (!config || !config.clientIdScope) {
    return Promise.resolve();
  }
  return getOrCreateAdCid(adElement.getAmpDoc(), config.clientIdScope,
                          config.clientIdCookieName);
}

/**
 * @param {!./service/ampdoc-impl.AmpDoc} ampDoc
 * @param {!string} clientIdScope
 * @param {string=} opt_clientIdCookieName
 * @return {!Promise<string|undefined>} A promise for a CID or undefined.
 */
export function getOrCreateAdCid(
    ampDoc, clientIdScope, opt_clientIdCookieName) {
  const cidPromise = cidForDocOrNull(ampDoc).then(cidService => {
    if (!cidService) {
      return;
    }
    return cidService.get({
      scope: dev().assertString(clientIdScope),
      cookieName: opt_clientIdCookieName,
    }, Promise.resolve(undefined)).catch(error => {
      // Not getting a CID is not fatal.
      dev().error('AD-CID', error);
      return undefined;
    });
  });
  // The CID should never be crucial for an ad. If it does not come within
  // 1 second, assume it will never arrive.
  return timerFor(ampDoc.win)
      .timeoutPromise(1000, cidPromise, 'cid timeout').catch(error => {
        // Timeout is not fatal.
        dev().warn('AD-CID', error);
        return undefined;
      });
}
