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

export const WEBTREKK_V2_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'actionName': 'webtrekk_ignore',
    'contentId': '${title}',
    'mediaName': '${id}',
    'everId': '${clientId(amp-wt3-eid)}',
  },
  'requests': {
    'trackURL': 'https://${trackDomain}/${trackId}/wt',
    'basePrefix':
      '?p=440,${contentId},1,' +
      '${screenWidth}x${screenHeight},${screenColorDepth},1,',
    'baseSuffix':
      ',${documentReferrer},' +
      '${viewportWidth}x${viewportHeight},0' +
      '&tz=${timezone}&eid=${everId}&la=${browserLanguage}',
    'parameterPrefix': '${basePrefix}${timestamp}${baseSuffix}',
    'parameterSuffix': '&pu=${sourceUrl}&eor=1',
    'pageview':
      '${trackURL}${parameterPrefix}&${extraUrlParams}' +
      '&cp570=${pageLoadTime}${parameterSuffix}',
    'event':
      '${trackURL}${parameterPrefix}&ct=${actionName}' +
      '&${extraUrlParams}${parameterSuffix}',
    'scroll':
      '${trackURL}${parameterPrefix}&ct=${actionName}' +
      '&ck540=${verticalScrollBoundary}${parameterSuffix}',
    'mediaPrefix': '${trackURL}${basePrefix}${baseSuffix}&mi=${mediaName}',
    'mediaSuffix':
      '&mt1=${currentTime}&mt2=${duration}' +
      '&${extraUrlParams}${parameterSuffix}&x=${playedTotal}',
    'mediaPlay': '${mediaPrefix}&mk=play${mediaSuffix}',
    'mediaPause': '${mediaPrefix}&mk=pause${mediaSuffix}',
    'mediaPosition': '${mediaPrefix}&mk=pos${mediaSuffix}',
    'mediaEnded': '${mediaPrefix}&mk=eof${mediaSuffix}',
  },
  'extraUrlParamsReplaceMap': {
    'pageParameter': 'cp',
    'contentGroup': 'cg',
    'actionParameter': 'ck',
    'sessionParameter': 'cs',
    'ecommerceParameter': 'cb',
    'urmCategory': 'uc',
    'campaignParameter': 'cc',
    'mediaCategory': 'mg',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
