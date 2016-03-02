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

import {writeScript, loadScript, checkData} from '../src/3p';
import {doubleclick} from 'doubleclick';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function rubicon(global, data) {
  checkData(data, [
    'slot', 'targeting', 'categoryExclusions',
    'tagForChildDirectedTreatment', 'cookieOptions',
    'overrideWidth', 'overrideHeight',
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
    parseInt(data.overrideHeight || data.height, 10)
  ]];

  var gptran = false;
  var gptrun = function() {
      if (gptran) {
          return;
      }
      gptran = true;

      data.targeting['rpfl_'+data.account] = rubicontag.getSlot('c').getAdServerTargeting();
      data.targeting.rplf_elemid = 'c';
      doubleclick(global, data);
  };

  loadScript(global, 'https://ads.rubiconproject.com/header/'+ data.account +'.js', () => {
    global.rubicontag.cmd.push(() => {
      const rubicontag = global.rubicontag;
      const slot = rubicontag.defineSlot(data.slot, dimensions, 'c');
      
      slot.setPosition(data.pos);

/**
      global.rubicontag.defineSlot({
        siteId: data.site,
        zoneId: data.zone,
        id: data.slot,
        sizes: data.sizes
      });
**/

      rubicontag.addKW(data.kw);
      rubicontag.setFPV(data.visitor);
      rubicontag.setFPI(data.inventory);

      rubicontag.run(gptrun, 1000);
      
    });
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function smartTag(global, data) {
  global.rp_account   = data.account;
  global.rp_site      = data.site;
  global.rp_zonesize  = data.zone +'-'+ data.size;
  global.rp_adtype    = data.type;
  global.rp_kw        = data.kw;
  global.rp_visitor   = data.visitor;
  global.rp_inventory = data.inventory;
  global.rp_callback  = data.callback;
  writeScript(global, 'https://ads.rubiconproject.com/ad/'+ data.account +'.js');
}

