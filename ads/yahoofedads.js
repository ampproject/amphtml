/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function yahoofedads(global, data) {
  validateData(data, [
    'adUnit',
    'site',
    'region',
    'lang',
    'sa',
    'spaceId',
    'url',
  ]);

  global.amp = true;
  global.adConfig = {
    'adPositionOverride': data.adPositionOverride,
    'adUnit': data.adUnit,
    'forceSource': data.forceSource,
    'height': data.height,
    'lang': data.lang,
    'publisherUrl': data.url,
    'region': data.region,
    'sa': data.sa,
    'sectionId': data.sectionId,
    'site': data.site,
    'spaceId': data.spaceId,
    'width': data.width,
  };

  loadScript(
    global,
    'https://s.yimg.com/aaq/ampyahoofedads/yahoofedads.js',
    () => global.context.renderStart()
  );
}
