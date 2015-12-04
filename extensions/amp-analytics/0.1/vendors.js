/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @const {!JSONObject}
 */
export const ANALYTICS_CONFIG = {
  // TODO(btownsend, #871): Add a generic hit format to make custom analytics
  // easier.

  'googleanalytics': {
    'host': 'www.google-analytics.com',
    'method': 'GET',
    'requests': {
      'baseHit': '/collect?v=1&_v=a0&aip=true&_s=HIT_COUNT&dp=PATH&' +
          'dl=DOMAIN&dt=TITLE&sr=SCREEN_WIDTHxSCREEN_HEIGHT&' +
          '_utmht=TIMESTAMP&jid=&cid=CLIENT_IDENTIFIER&tid=ACCOUNT',
      'pageview': '/r{baseHit}&t=pageview&_r=1',
      'event': '{baseHit}&t=event&ec=EVENT_CATEGORY&ea=EVENT_ACTION&' +
          'el=EVENT_LABEL&ev=EVENT_VALUE',
      'timing': '{baseHit}&t=timing&plt={}&dns={}&pdt={}&rrt={}&tcp={}&' +
          'srt={}&dit={}&clt={}',
      'social': '{baseHit}&t=social&sa=SOCIAL_ACTION&sn=SOCIAL_NETWORK&' +
          'st=SOCIAL_ACTION_TARGET'
    },
    'optout': '_gaUserPrefs.ioo'
  }
};


