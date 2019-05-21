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

export const ADOBEANALYTICS_CONFIG = /** @type {!JsonObject} */ ({
  'transport': {'xhrpost': false, 'beacon': false, 'image': true},
  'vars': {
    'pageName': 'TITLE',
    'host': '',
    'reportSuites': '',
    'linkType': 'o',
    'linkUrl': '',
    'linkName': '',
  },
  'requests': {
    'requestPath': '/b/ss/${reportSuites}/0/amp-1.0/s${random}',
    // vid starts with z to work around #2198
    'basePrefix':
      'vid=z${clientId(adobe_amp_id)}' +
      '&ndh=0' +
      '&ce=${documentCharset}' +
      '&pageName=${pageName}' +
      '&g=${ampdocUrl}' +
      '&r=${documentReferrer}' +
      '&bh=${availableScreenHeight}' +
      '&bw=${availableScreenWidth}' +
      '&c=${screenColorDepth}' +
      '&j=amp' +
      '&s=${screenWidth}x${screenHeight}',
    'pageview': 'https://${host}${requestPath}?${basePrefix}',
    'click':
      'https://${host}${requestPath}?${basePrefix}&pe=lnk_${linkType}&pev1=${linkUrl}&pev2=${linkName}',
  },
});
