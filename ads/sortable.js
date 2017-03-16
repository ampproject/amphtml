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

import {loadScript, validateData} from '../3p/3p';
import {doubleclick} from './google/doubleclick';
import {adsense} from './google/adsense';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function sortable(global, data) {
  /**
   * For A/B testing our tags against doubleclick or adsense in AMP ads.
   * See https://github.com/ampproject/amphtml/blob/master/ads/sortable.md for examples.
   */
  if (data.abType && data.abType === 'doubleclick' && data.abPct &&
      Math.random() * 100 < parseInt(data.abPct, 10)) {
    doubleclick(global, data);
    return;
  }
  if (data.abType && data.abType === 'adsense' && data.abPct &&
      Math.random() * 100 < parseInt(data.abPct, 10)) {
    adsense(global, data);
    return;
  }

  validateData(data, ['site', 'name']);
  const slot = global.document.getElementById('c');
  const ad = global.document.createElement('div');
  ad.className = 'ad-tag';
  ad.setAttribute('data-ad-name', data.name);
  ad.setAttribute('data-ad-size', data.width + 'x' + data.height);
  slot.appendChild(ad);
  loadScript(global, 'https://tags-cdn.deployads.com/a/'
      + encodeURIComponent(data.site) + '.js');
}
