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

import {validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function iprom(global, data) {
  validateData(data, ['zone', 'sitepath'], ['keywords', 'channels']);

  window.ipromNS = {};

  function namespaceLoaded() {
    const {sitepath, zone} = data;
    const config = {
      sitePath: JSON.parse(sitepath),
      containerId: 'c',
      zoneId: zone,
      prebid: true,
      amp: true,
      keywords: data.keywords ? data.keywords.split(',') : [],
      channels: data.channels ? data.channels.split(',') : [],
    };

    let tag = new ipromNS.AdTag(config);
    tag.init();
  }

  writeScript(global, 'https://cdn.ipromcloud.com/ipromNS.js', namespaceLoaded);
}
