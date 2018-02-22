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

import {doubleclick} from '../ads/google/doubleclick';
import {loadScript, validateData, writeScript} from '../3p/3p';
import {startsWith} from '../src/string';

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
  const openxData = ['host', 'nc', 'auid', 'dfpSlot', 'dfp', 'openx'];
  const dfpData = assign({}, data); // Make a copy for dfp.

  // TODO: check mandatory fields
  validateData(data, [], openxData);
  // Consolidate Doubleclick inputs for forwarding -
  // conversion rules are explained in openx.md.
  if (data.dfpSlot) {
    // Anything starting with 'dfp' gets promoted.
    openxData.forEach(openxKey => {
      if (openxKey in dfpData && openxKey !== 'dfp') {
        if (startsWith(openxKey, 'dfp')) {
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

    if (data.nc && data.dfpSlot) {
      jssdk += '?nc=' + encodeURIComponent(data.nc);
      if (data.auid) {
        advanceImplementation(global, jssdk, dfpData, data);
      } else {
        standardImplementation(global, jssdk, dfpData);
      }
    } else if (data.auid) { // Just show an ad.
      global.OX_cmds = [
        () => {
          const oxRequest = OX();
          const oxAnchor = global.document.createElement('div');
          global.document.body.appendChild(oxAnchor);
          /*eslint "google-camelcase/google-camelcase": 0*/
          OX._requestArgs['bc'] = 'amp';
          oxRequest.addAdUnit(data.auid);
          oxRequest.setAdSizes([data.width + 'x' + data.height]);
          if (data.openx && data.openx.customVars) {
            setCustomVars(oxRequest, filterCustomVar(data.openx.customVars));
          }
          oxRequest.getOrCreateAdUnit(data.auid).set('anchor', oxAnchor);
          global.context.renderStart();
          oxRequest.load();
        },
      ];
      loadScript(global, jssdk);
    }
  } else if (data.dfpSlot) { // Fall back to a DFP ad.
    doubleclick(global, dfpData);
  }
}

function standardImplementation(global, jssdk, dfpData) {
  writeScript(global, jssdk, () => {
    /*eslint "google-camelcase/google-camelcase": 0*/
    doubleclick(global, dfpData);
  });
}

function advanceImplementation(global, jssdk, dfpData, data) {
  const size = [data.width + 'x' + data.height];
  let customVars = {};
  if (data.openx && data.openx.customVars) {
    customVars = filterCustomVar(data.openx.customVars);
  }
  global.OX_bidder_options = {
    bidderType: 'hb_amp',
    callback: () => {
      const priceMap = global.oxhbjs && global.oxhbjs.getPriceMap();
      const slot = priceMap && priceMap['c'];
      const targeting = slot ?
        `${slot.size}_${slot.price},hb-bid-${slot.bid_id}` : 'none_t';
      dfpData.targeting = dfpData.targeting || {};
      assign(dfpData.targeting, {oxb: targeting});
      doubleclick(global, dfpData);
    },
  };
  global.OX_bidder_ads = [[data.dfpSlot, size, 'c', customVars]];
  loadScript(global, jssdk);
}

function setCustomVars(oxRequest, customVars) {
  const customVarKeys = Object.keys(customVars);
  customVarKeys.forEach(customVarKey => {
    const customVarValue = customVars[customVarKey];
    if (Array.isArray(customVarValue)) {
      customVarValue.forEach(value => {
        oxRequest.addVariable(customVarKey, value);
      });
    } else {
      oxRequest.addVariable(customVarKey, customVarValue);
    }
  });
}

function filterCustomVar(customVars) {
  const filterPattern = /^[A-Za-z0-9._]{1,20}$/;
  const filteredKeys = Object.keys(customVars)
      .filter(key => filterPattern.test(key));
  const filteredCustomVar = {};
  filteredKeys.forEach(key => {
    filteredCustomVar[key.toLowerCase()] = customVars[key];
  });
  return filteredCustomVar;
}
