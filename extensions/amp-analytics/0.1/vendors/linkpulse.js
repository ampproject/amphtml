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

export const LINKPULSE_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'id': '',
    'pageUrl': 'CANONICAL_URL',
    'title': 'TITLE',
    'section': '',
    'channel': 'amp',
    'type': '',
    'host': 'pp.lp4.io',
    'empty': '',
  },
  'requests': {
    'base': 'https://${host}',
    'pageview':
      '${base}/p?i=${id}' +
      '&r=${documentReferrer}' +
      '&p=${pageUrl}' +
      '&s=${section}' +
      '&t=${type}' +
      '&c=${channel}' +
      '&mt=${title}' +
      '&_t=amp' +
      '&_r=${random}',
    'pageload':
      '${base}/pl?i=${id}' +
      '&ct=${domInteractiveTime}' +
      '&rt=${pageDownloadTime}' +
      '&pt=${pageLoadTime}' +
      '&p=${pageUrl}' +
      '&c=${channel}' +
      '&t=${type}' +
      '&s=${section}' +
      '&_t=amp' +
      '&_r=${random}',
    'ping':
      '${base}/u?i=${id}' +
      '&u=${clientId(_lp4_u)}' +
      '&p=${pageUrl}' +
      '&uActive=true' +
      '&isPing=yes' +
      '&c=${channel}' +
      '&t=${type}' +
      '&s=${section}' +
      '&_t=amp' +
      '&_r=${random}',
  },
  'triggers': {
    'pageview': {
      'on': 'visible',
      'request': 'pageview',
    },
    'pageload': {
      'on': 'visible',
      'request': 'pageload',
    },
    'ping': {
      'on': 'timer',
      'timerSpec': {
        'interval': 30,
        'maxTimerLength': 7200,
      },
      'request': 'ping',
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
