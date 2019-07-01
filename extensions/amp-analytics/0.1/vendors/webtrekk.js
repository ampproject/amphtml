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

export const WEBTREKK_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'trackURL': 'https://${trackDomain}/${trackId}/wt',
    'parameterPrefix':
      '?p=432,${contentId},1,' +
      '${screenWidth}x${screenHeight},${screenColorDepth},1,' +
      '${timestamp},${documentReferrer},${viewportWidth}x' +
      '${viewportHeight},0&tz=${timezone}' +
      '&eid=${clientId(amp-wt3-eid)}&la=${browserLanguage}',
    'parameterSuffix': '&pu=${sourceUrl}',
    'pageParameter':
      '&cp1=${pageParameter1}' +
      '&cp2=${pageParameter2}&cp3=${pageParameter3}' +
      '&cp4=${pageParameter4}&cp5=${pageParameter5}' +
      '&cp6=${pageParameter6}&cp7=${pageParameter7}' +
      '&cp8=${pageParameter8}&cp9=${pageParameter9}' +
      '&cp10=${pageParameter10}',
    'pageCategories':
      '&cg1=${pageCategory1}' +
      '&cg2=${pageCategory2}&cg3=${pageCategory3}' +
      '&cg4=${pageCategory4}&cg5=${pageCategory5}' +
      '&cg6=${pageCategory6}&cg7=${pageCategory7}' +
      '&cg8=${pageCategory8}&cg9=${pageCategory9}' +
      '&cg10=${pageCategory10}',
    'pageview':
      '${trackURL}${parameterPrefix}${pageParameter}' +
      '${pageCategories}${parameterSuffix}',
    'actionParameter':
      '&ck1=${actionParameter1}' +
      '&ck2=${actionParameter2}&ck3=${actionParameter3}' +
      '&ck4=${actionParameter4}&ck5=${actionParameter5}',
    'event':
      '${trackURL}${parameterPrefix}&ct=${actionName}' +
      '${actionParameter}${parameterSuffix}',
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
