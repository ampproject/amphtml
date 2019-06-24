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

export const PRESSBOARD_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'mediaId': '',
    'campaignId': '',
    'storyRequestId': '',
    'geoNameId': '',
    'country': '',
    'region': '',
    'city': '',
    'dbInstance': '',
    'timeZoneOffset': '',
    'clientId': 'CLIENT_ID(_pressboardmedia)',
  },
  'requests': {
    'host': 'https://adserver.pressboard.ca',
    'common_params':
      '&amp=1&url=${canonicalUrl}' +
      '&referrer=${documentReferrer}' +
      '&ts=${timestamp}' +
      '&ua=${userAgent}' +
      '&rand=${random}' +
      '&uid=${clientId}' +
      '&mid=${mediaId}&cid=${campaignId}&sid=${storyRequestId}' +
      '&geoid=${geoNameId}&cn=${country}&rg=${region}&ct=${city}' +
      '&dbi=${dbInstance}&tz=${timeZoneOffset}',
    'conversion_params':
      '&hbt=${requestCount}' +
      '&pvid=${pageViewId}' +
      '&asurl=${sourceUrl}' +
      '&ash=${scrollHeight}' +
      '&asnh=${screenHeight}' +
      '&aasnh=${availableScreenHeight}' +
      '&avh=${viewportHeight}' +
      '&ast=${scrollTop}' +
      '&atet=${totalEngagedTime}',
    'conversion':
      '${host}' +
      '/track/attention-amp?' +
      '${common_params}' +
      '${conversion_params}',
  },
  'triggers': {
    'pageTimer': {
      'on': 'timer',
      'timerSpec': {
        'interval': 1,
        'startSpec': {
          'on': 'visible',
        },
        'stopSpec': {
          'on': 'hidden',
        },
      },
      'request': 'conversion',
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
