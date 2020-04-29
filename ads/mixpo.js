/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
export function mixpo(global, data) {
  validateData(data, ['guid', 'subdomain']);

  const g = global,
    cdnSubdomain = data.subdomain == 'www' ? 'cdn' : data.subdomain + '-cdn',
    url = data.loader || `https://${cdnSubdomain}.mixpo.com/js/loader.js`;

  g.mixpoAd = {
    amp: true,
    noflash: true,
    width: data.width,
    height: data.height,
    guid: data.guid,
    subdomain: data.subdomain,
    embedv: data.embedv,
    clicktag: data.clicktag,
    customTarget: data.customtarget,
    dynClickthrough: data.dynclickthrough,
    viewTracking: data.viewtracking,
    customCSS: data.customcss,
    local: data.local,
    enableMRAID: data.enablemraid,
    jsPlayer: data.jsplayer,
  };

  writeScript(g, url);
}
