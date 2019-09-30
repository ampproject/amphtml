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

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function broadstreetads(global, data) {
  validateData(
    data,
    ['network', 'zone', 'width', 'height'],
    ['keywords', 'place']
  );

  data.place = data.place || 0;

  const placeholderID = 'placement_' + data.zone + '_' + data.place;

  // placeholder div
  const d = global.document.createElement('div');
  d.setAttribute('id', placeholderID);
  global.document.getElementById('c').appendChild(d);

  global.broadstreet = global.broadstreet || {};
  global.broadstreet.loadZone = global.broadstreet.loadZone || (() => ({}));
  global.broadstreet.run = global.broadstreet.run || [];
  global.broadstreet.run.push(() => {
    global.broadstreet.loadZone(d, {
      amp: true,
      height: data.height,
      keywords: data.keywords,
      networkId: data.network,
      place: data.place,
      softKeywords: true,
      width: data.width,
      zoneId: data.zone,
    });
  });
  loadScript(global, 'https://cdn.broadstreetads.com/init-2.min.js');
}
