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

import {loadScript, writeScript, validateData} from '../3p/3p';
import {doubleclick} from '../ads/google/doubleclick';

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Sort of like Object.assign.
 * @param {!Object} target
 * @param {!Object} source
 * @return {!Object}
 */
function assign(target, source) {
  for (const prop in source) {
    if (hasOwnProperty.call(source, prop)) {
      target[prop] = source[prop];
    }
  }

  return target;
}

/* global OX: false */

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function openx(global, data) {
  const openxData = ['host', 'nc', 'auid', 'dfpSlot', 'dfp'];
  const dfpData = assign({}, data); // Make a copy for dfp.
  // TODO: check mandatory fields
  validateData(data, [], openxData);

  // Consolidate Doubleclick inputs for forwarding -
  // conversion rules are explained in openx.md.
  if (data.dfpSlot) {
    // Anything starting with 'dfp' gets promoted.
    openxData.forEach(openxKey => {
      if (openxKey in dfpData && openxKey !== 'dfp') {
        if (openxKey.indexOf('dfp') === 0) {
          // Remove 'dfp' prefix, lowercase the first letter.
          let fixKey = openxKey.substring(3);
          fixKey = fixKey.substring(0,1).toLowerCase() + fixKey.substring(1);
          dfpData[fixKey] = data[openxKey];
        }
        delete dfpData[openxKey];
      }
    });

    // Promote the whole 'dfp' object.
    if ('dfp' in data) {
      assign(dfpData, dfpData.dfp);
      delete dfpData['dfp'];
    }
  }

  // Decide how to render.
  if (data.host) {
    let jssdk = `https://${data.host}/mw/1.0/jstag`;
    if (data.nc && data.dfpSlot) { // Use DFP Bidder
      jssdk += '?nc=' + encodeURIComponent(data.nc);
      writeScript(global, jssdk, () => {
        /*eslint "google-camelcase/google-camelcase": 0*/
        OX._requestArgs['amp'] = 1;
        doubleclick(global, dfpData);
      });
    } else if (data.auid) { // Just show an ad.
      global.OX_cmds = [
        () => {
          const oxRequest = OX();
          const oxAnchor = global.document.createElement('div');
          global.document.body.appendChild(oxAnchor);
          /*eslint "google-camelcase/google-camelcase": 0*/
          OX._requestArgs['amp'] = 1;
          oxRequest.addAdUnit(data.auid);
          oxRequest.setAdSizes([data.width + 'x' + data.height]);
          oxRequest.getOrCreateAdUnit(data.auid).set('anchor', oxAnchor);
          oxRequest.load();
        },
      ];
      loadScript(global, jssdk);
    }
  } else if (data.dfpSlot) { // Fall back to a DFP ad.
    doubleclick(global, dfpData);
  }
}
