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

export const TOPMAILRU_CONFIG = /** @type {!JsonObject} */ ({
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
  'vars': {
    'url': '${sourceUrl}',
    'referrer': '${documentReferrer}',
  },
  'requests': {
    'pageView': '${_domain}/counter?${_basicMessage};title=${title}',
    'reachGoal':
      '${_domain}/tracker?${_basicMessage};title=${title}' +
      ';e=RG%3A${value}%2F${goal}',
    'sendEvent':
      '${_domain}/tracker?${_basicMessage}' +
      ';e=CE%3A${value}%2F${category}%3B${action}%3B${label}',
    '_domain': 'https://top-fwz1.mail.ru',
    '_basicMessage':
      'js=13;id=${id};u=${url};r=${referrer}' +
      ';s=${screenWidth}*${screenHeight}' +
      ';vp=${viewportWidth}*${viewportHeight}' +
      ';st=${start};gender=${gender};age=${age}' +
      ';pid=${pid};userid=${userid};device=${device}' +
      ';params=${params};_=${random}',
  },
  'triggers': {
    'pageView': {
      'on': 'visible',
      'request': 'pageView',
    },
  },
});
