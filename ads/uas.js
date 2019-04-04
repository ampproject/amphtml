/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {hasOwn} from '../src/utils/object';
import {loadScript, validateData} from '../3p/3p';
import {setStyles} from '../src/style';

/**
 * @param {!Object} theObject
 * @param {!Function} callback
 */
function forEachOnObject(theObject, callback) {
  if (typeof theObject === 'object' && theObject !== null) {
    if (typeof callback === 'function') {
      for (const key in theObject) {
        if (hasOwn(theObject, key)) {
          callback(key, theObject[key]);
        }
      }
    }
  }
}

/**
 * @param {!Window} global
 */
function centerAd(global) {
  const e = global.document.getElementById('c');
  if (e) {
    setStyles(e, {
      top: '50%',
      left: '50%',
      bottom: '',
      right: '',
      transform: 'translate(-50%, -50%)',
    });
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function uas(global, data) {
  validateData(
      data,
      ['accId', 'adUnit', 'sizes'],
      ['locLat', 'locLon', 'locSrc', 'pageURL', 'targetings', 'extraParams',
        'visibility']
  );
  global.Phoenix = {EQ: []};
  const uasDivId = 'uas-amp-slot';
  global.document.write('<div id="' + uasDivId + '"></div>');
  loadScript(global, 'https://ads.pubmatic.com/AdServer/js/phoenix.js', () => {
    global.Phoenix.EQ.push(function() {
      global.Phoenix.enableSingleRequestCallMode();
      global.Phoenix.setInfo('AMP', 1);// Need to set the AMP flag
      global.Phoenix.setInfo('ACCID', data.accId);
      global.Phoenix.setInfo('PAGEURL', (global.context.sourceUrl || global.context.location.href)); // eslint-disable-line max-len
      data.pageURL && global.Phoenix.setInfo('PAGEURL', data.pageURL);
      data.locLat && global.Phoenix.setInfo('LAT', data.locLat);
      data.locLon && global.Phoenix.setInfo('LON', data.locLon);
      data.locSrc && global.Phoenix.setInfo('LOC_SRC', data.locSrc);
      const slot = global.Phoenix.defineAdSlot(data.adUnit, data.sizes,
          uasDivId);
      slot.setVisibility(1);
      forEachOnObject(data.targetings, function(key, value) {
        slot.setTargeting(key, value);
      });
      forEachOnObject(data.extraParams, function(key, value) {
        slot.setExtraParameters(key, value);
      });
      global.Phoenix.display(uasDivId);
    });
  });
  centerAd(global);
}
