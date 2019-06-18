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

export const UPSCORE_CONFIG = /**@type {!JsonObject} */ ({
  'requests': {
    'host': 'https://hit-pool.upscore.com/amp?',
    'basePrefix':
      'u_id=${clientId(upscore)}&' +
      'hit_id=${pageViewId}&' +
      'scTop=${scrollTop}&' +
      'scHeight=${scrollHeight}&' +
      'vHeight=${viewportHeight}&' +
      'domain=${domain}&' +
      'load=${domInteractiveTime}&' +
      'timespent=${totalEngagedTime}',
    'initialHit':
      'author=${author}&' +
      'creator=${creator}&' +
      'o_id=${object_id}&' +
      'o_type=${object_type}&' +
      'pubdate=${pubdate}&' +
      'ref=${documentReferrer}&' +
      'section=${section}&' +
      'url=${ampdocUrl}&' +
      'agent=${userAgent}&' +
      'location=${ampGeo(ISOCountry)}',
    'finalbeat': '${host}${basePrefix}&type=final',
    'heartbeat': '${host}${basePrefix}&type=pulse',
    'pageview': '${host}${basePrefix}&${initialHit}&type=init',
  },
  'triggers': {
    'initHit': {
      'on': 'visible',
      'request': 'pageview',
    },
    'pulse': {
      'on': 'timer',
      'timerSpec': {
        'interval': 10,
        'immediate': false,
        'stopSpec': {
          'on': 'hidden',
        },
      },
      'request': 'heartbeat',
    },
    'final': {
      'on': 'hidden',
      'visibilitySpec': {
        'totalTimeMin': 5000,
      },
      'request': 'finalbeat',
    },
  },
  'transport': {
    'beacon': true,
    'xhrpost': true,
    'image': false,
  },
});
