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

export const RAKAM_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'deviceId': 'CLIENT_ID(rakam_device_id)',
  },
  'requests': {
    'base':
      '?api.api_key=${writeKey}' +
      '&prop._platform=amp' +
      '&prop._device_id=${deviceId}' +
      '&prop.locale=${browserLanguage}' +
      '&prop.path=${canonicalPath}' +
      '&prop.url=${canonicalUrl}' +
      '&prop.color_depth=${screenColorDepth}' +
      '&prop._referrer=${documentReferrer}' +
      '&prop.title=${title}' +
      '&prop.timezone=${timezone}' +
      '&prop._time=${timestamp}' +
      '&prop.resolution=${screenWidth} × ${screenHeight}',
    'pageview':
      'https://${apiEndpoint}/event/pixel${base}&collection=${pageViewName}',
    'custom':
      'https://${apiEndpoint}/event/pixel${base}&collection=${collection}',
  },
});
