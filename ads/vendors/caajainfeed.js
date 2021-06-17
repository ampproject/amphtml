/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function caajainfeed(global, data) {
  validateData(
    data,
    [],
    [
      'adSpot',
      'format',
      'test',
      'optout',
      'offset',
      'ipv4',
      'ipv6',
      'networkReachability',
      'osName',
      'osVersion',
      'osLang',
      'osTimezone',
      'deviceVersion',
      'appId',
      'appVersion',
      'kv',
      'uids',
      'template',
      'protocol',
      'fields',
    ]
  );

  global.caAjaInfeedConfig = data;
  loadScript(global, 'https://cdn.amanad.adtdp.com/sdk/ajaamp.js');
}
