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

import {buildUrl} from '../../../ads/google/a4a/url-builder';
import {user} from '../../../src/log';

/** @const */
const TAG = 'amp-auto-ads';

/**
 * Builds and returns a URL that can be used to fetch the auto-ads configuration
 * for the given type.
 * @param {string} type
 * @param {!Element} autoAmpAdsElement
 * @return {?string}
 */
export function getConfigUrl(type, autoAmpAdsElement) {
  if (type == 'adsense') {
    return getAdSenseConfigUrl(autoAmpAdsElement);
  }
  user().error(TAG,
      'Unable to generate amp-auto-ads config URL for type: ' + type);
  return null;
}

/**
 * @param {!Element} autoAmpAdsElement
 * @return {string}
 */
function getAdSenseConfigUrl(autoAmpAdsElement) {
  return buildUrl('//pagead2.googlesyndication.com/getconfig/ama', [
    {name: 'client', value: autoAmpAdsElement.getAttribute('data-ad-client')},
    {name: 'plah', value: autoAmpAdsElement.ownerDocument.location.hostname},
  ], 4096);
}
