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

export const MEDIATOR_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'host': '//collector.mediator.media/script/${mediator_id}/amp/',
    'renderstart': '${host}init/?url=${canonicalUrl}',
    'prefix': '${host}register/?url=${canonicalUrl}&ref=${documentReferrer}&',
    'suffix': 'vh=${viewportHeight}&sh=${scrollHeight}&st=${scrollTop}',
    'pageview': '${prefix}e=v',
    'timer': '${prefix}e=t&${suffix}',
    's0': '${prefix}e=s0',
    's1': '${prefix}e=s1',
    's2': '${prefix}e=s2',
    's3': '${prefix}e=s3',
  },
  'vars': {
    'mediator_id': '',
  },
  'triggers': {
    'renderStart': {
      'on': 'render-start',
      'request': 'renderstart',
    },
    'trackPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
    'scrollPing0': {
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': [5],
      },
      'request': 's0',
    },
    'scrollPing1': {
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': [35],
      },
      'request': 's1',
    },
    'scrollPing2': {
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': [65],
      },
      'request': 's2',
    },
    'scrollPing3': {
      'on': 'scroll',
      'scrollSpec': {
        'verticalBoundaries': [95],
      },
      'request': 's3',
    },
    'pageTimer': {
      'on': 'timer',
      'timerSpec': {
        'interval': 5,
        'maxTimerLength': 600,
        'immediate': false,
      },
      'request': 'timer',
    },
  },
});
