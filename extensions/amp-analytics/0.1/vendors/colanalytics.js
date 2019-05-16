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

export const COLANALYTICS_CONFIG = /** @type {!JsonObject} */ ({
  'requests': {
    'host': 'https://ase.clmbtech.com',
    'base': '${host}/message',
    'pageview':
      '${base}?cid=${id}' +
      '&val_101=${id}' +
      '&val_101=${canonicalPath}' +
      '&ch=${canonicalHost}' +
      '&uuid=${uid}' +
      '&au=${authors}' +
      '&zo=${zone}' +
      '&sn=${sponsorName}' +
      '&ct=${contentType}' +
      '&st=${scrollTop}' +
      '&sh=${scrollHeight}' +
      '&dct=${decayTime}' +
      '&tet=${totalEngagedTime}' +
      '&dr=${documentReferrer}' +
      '&plt=${pageLoadTime}' +
      '&val_108=${title}' +
      '&val_120=3',
  },
  'triggers': {
    'defaultPageview': {
      'on': 'visible',
      'request': 'pageview',
    },
  },
  'transport': {
    'beacon': false,
    'xhrpost': false,
    'image': true,
  },
});
