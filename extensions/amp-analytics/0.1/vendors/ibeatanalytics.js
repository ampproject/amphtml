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

export const IBEATANALYTICS_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'host': 'https://ibeat.indiatimes.com',
    'base': 'https://ibeat.indiatimes.com/iBeat/pageTrendlogAmp.html',
    'pageview':
      '${base}?' +
      '&h=${h}' +
      '&d=${h}' +
      '&url=${url}' +
      '&k=${key}' +
      '&ts=${time}' +
      '&ch=${channel}' +
      '&sid=${uid}' +
      '&at=${agentType}' +
      '&ref=${documentReferrer}' +
      '&aid=${aid}' +
      '&loc=1' +
      '&ct=1' +
      '&cat=${cat}' +
      '&scat=${scat}' +
      '&ac=1' +
      '&tg=${tags}' +
      '&ctids=${catIds}' +
      '&pts=${pagePublishTime}' +
      '&auth=${author}' +
      '&pos=${position}' +
      '&iBeatField=${ibeatFields}' +
      '&cid=${clientId(MSCSAuthDetails)}',
  },
  'triggers': {
    'defaultPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
});
