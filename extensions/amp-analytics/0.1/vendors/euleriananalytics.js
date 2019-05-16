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

export const EULERIANANALYTICS_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'analyticsHost': '',
    'documentLocation': 'SOURCE_URL',
  },
  'requests': {
    'base': 'https://${analyticsHost}',
    'basePrefix':
      '-/${random}?' +
      'euid-amp=${clientId(etuix)}&' +
      'url=${documentLocation}&',
    'pageview':
      '${base}/col2/${basePrefix}' +
      'rf=${externalReferrer}&' +
      'urlp=${pagePath}&' +
      'ss=${screenWidth}x${screenHeight}&' +
      'sd=${screenColorDepth}',
    'action':
      '${base}/action/${basePrefix}' +
      'eact=${actionCode}&' +
      'actr=${actionRef}',
    'user':
      '${base}/uparam/${basePrefix}' + 'euk${userParamKey}=${userParamVal}',
    'contextflag':
      '${base}/cflag2/${basePrefix}' + 'ecf0k=${cflagKey}&ecf0v=${cflagVal}',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
