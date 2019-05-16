/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const PERMUTIVE_CONFIG = /** @type {!JsonObject} */ ({
  'vars': {
    'identity': '${clientId(_ga)}',
  },
  'requests': {
    'track':
      'https://${namespace}.amp.permutive.com/track' +
      '?k=${key}' +
      '&i=${identity}' +
      '&it=amp',
    'pageview':
      '${track}' +
      '&e=Pageview' +
      '&_ep_isp_info=%24ip_isp_info' +
      '&_ep_geo_info=%24ip_geo_info',
    'engagement': '${track}' + '&e=PageviewEngagement' + '&_ep_engaged_time=5',
    'completion': '${track}' + '&e=PageviewEngagement' + '&_ep_completion=0.25',
  },
  'triggers': {
    'trackPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
    'trackEngagement': {
      'on': 'visible',
      'timerSpec': {
        'interval': 5,
        'maxTimerLength': 600,
        'immediate': false,
      },
      'request': 'engagement',
    },
    'trackCompletion': {
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': [25, 50, 75, 100],
      },
      'request': 'completion',
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
  'extraUrlParams': {
    'properties.client.type': 'amp',
    'properties.client.title': '${title}',
    'properties.client.domain': '${canonicalHost}',
    'properties.client.url': '${canonicalUrl}',
    'properties.client.referrer': '${documentReferrer}',
    'properties.client.user_agent': '${userAgent}',
  },
  'extraUrlParamsReplaceMap': {
    'properties.': '_ep_',
  },
});
