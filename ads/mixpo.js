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

import {writeScript,validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function mixpo(global, data) {
  validateData(data, [
    'guid',
    'subdomain',
  ]);

  const g = global,
    cdnSubdomain = (data.subdomain == 'www') ? 'cdn' : data.subdomain + '-cdn',
    url = data.loader ? data.loader : 'https://' + cdnSubdomain + '.mixpo.com/js/loader.js';

  g.mixpoAd = g.mixpoAd || {};
  g.mixpoAd.amp = true;
  g.mixpoAd.noflash = true;
  g.mixpoAd.width = data.width;
  g.mixpoAd.height = data.height;
  g.mixpoAd.guid = data.guid;
  g.mixpoAd.subdomain = data.subdomain;
  g.mixpoAd.embedv = data.embedv;
  g.mixpoAd.clicktag = data.clicktag;
  g.mixpoAd.customTarget = data.customtarget;
  g.mixpoAd.dynClickthrough = data.dynclickthrough;
  g.mixpoAd.viewTracking = data.viewtracking;
  g.mixpoAd.customCSS = data.customcss;
  g.mixpoAd.local = data.local;
  g.mixpoAd.enableMRAID = data.enablemraid;
  g.mixpoAd.jsPlayer = data.jsplayer;

  writeScript(g, url);
}
