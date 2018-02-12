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

import {doubleclick} from '../ads/google/doubleclick';
import {getSourceUrl} from '../src/url';
import {hasOwn} from '../src/utils/object';
import {loadScript, validateData, writeScript} from '../3p/3p';

/* global rubicontag: false */

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function rubicon(global, data) {
  // TODO: check mandatory fields
  validateData(data, [], [
    'slot', 'targeting', 'categoryExclusions',
    'tagForChildDirectedTreatment', 'cookieOptions',
    'overrideWidth', 'overrideHeight', 'loadingStrategy',
    'consentNotificationId', 'useSameDomainRenderingUntilDeprecated',
    'account', 'site', 'zone', 'size',
    'pos', 'kw', 'visitor', 'inventory',
    'type', 'method', 'callback',
  ]);

  if (data.method === 'fastLane') {
    fastLane(global, data);
  } else {
    smartTag(global, data);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function fastLane(global, data) {
  const dimensions = [[
    parseInt(data.overrideWidth || data.width, 10),
    parseInt(data.overrideHeight || data.height, 10),
  ]];

  function setFPD(type, data) {
    if (typeof data === 'object' && (type === 'V' || type === 'I')) {
      for (const key in data) {
        if (hasOwn(data, key)) {
          if (type === 'V') {
            rubicontag.setFPV(key, data[key]);
          }
          if (type === 'I') {
            rubicontag.setFPI(key, data[key]);
          }
        }
      }
    }
  }

  let gptran = false;
  function gptrun() {
    if (gptran) {
      return;
    }
    gptran = true;

    let ASTargeting = rubicontag.getSlot('c').getAdServerTargeting();
    const ptrn = /rpfl_\d+/i;
    for (let i = 0; i < ASTargeting.length; i++) {
      if (ptrn.test(ASTargeting[i].key)) {
        ASTargeting = ASTargeting[i].values;
      }
    }
    if (!data.targeting) { data.targeting = {}; }
    data.targeting['rpfl_' + data.account] = ASTargeting;
    data.targeting['rpfl_elemid'] = 'c';

    if (data['method']) { delete data['method']; }
    if (data['account']) { delete data['account']; }
    if (data['pos']) { delete data['pos']; }
    if (data['kw']) { delete data['kw']; }
    if (data['visitor']) { delete data['visitor']; }
    if (data['inventory']) { delete data['inventory']; }
    doubleclick(global, data);
  }

  loadScript(global, 'https://ads.rubiconproject.com/header/' + encodeURIComponent(data.account) + '.js', () => {
    global.rubicontag.cmd.push(() => {
      const rubicontag = global.rubicontag;
      const slot = rubicontag.defineSlot(data.slot, dimensions, 'c');

      if (data.pos) { slot.setPosition(data.pos); }
      if (data.kw) { rubicontag.addKW(data.kw); }
      if (data.visitor) { setFPD('V', data.visitor); }
      if (data.inventory) { setFPD('I', data.inventory); }
      rubicontag.setUrl(getSourceUrl(context.location.href));
      rubicontag.setIntegration('amp');
      rubicontag.run(gptrun, 1000);
    });
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function smartTag(global, data) {
  const pageURL = getSourceUrl(context.location.href);
  /* eslint-disable */
  global.rp_account = data.account;
  global.rp_site = data.site;
  global.rp_zonesize = data.zone + '-' + data.size;
  global.rp_adtype = 'js';
  global.rp_page = pageURL;
  global.rp_kw = data.kw;
  global.rp_visitor = data.visitor;
  global.rp_inventory = data.inventory;
  global.rp_amp = 'st';
  global.rp_callback = data.callback;
  /* eslint-enable */
  writeScript(global, 'https://ads.rubiconproject.com/ad/'
      + encodeURIComponent(data.account) + '.js');
}
