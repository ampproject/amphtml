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

const pubmineOptional = ['section', 'pt', 'ht'],
  pubmineRequired = ['siteid'],
  pubmineURL = 'https://s.pubmine.com/head.js';

/**
 * @param {!Object} data
 * @param {!Window} global
 */
function initMasterFrame(data, global) {
  global['__ATA_PP'] = {
    pt: data['pt'] || 1,
    ht: data['ht'] || 1,
    tn: 'amp',
    amp: true,
  };
  global['__ATA'] = global['__ATA'] || {};
  global['__ATA']['cmd'] = global['__ATA']['cmd'] || [];
  loadScript(global, pubmineURL);
}

/**
 * @param {string} slotId
 * @param {!Window} global
 */
function createSlot(slotId, global) {
  const containerEl = global.document.getElementById('c');
  const adSlot = global.document.createElement('div');
  adSlot.setAttribute('id', slotId);
  containerEl.appendChild(adSlot);
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pubmine(global, data) {
  validateData(data, pubmineRequired, pubmineOptional);

  const sectionId = data['siteid'] + (data['section'] || '1');

  const slotConfig = {
    sectionId,
    height: data.height == 250 ? 250 : data.height - 15,
    width: data.width,
    window: global,
  };

  const slotId = `atatags-${sectionId}`;

  createSlot(slotId, global);
  const {isMaster} = global.context;
  if (isMaster) {
    initMasterFrame(data, global);
  }
  const master = isMaster ? global : global.context.master;
  master['__ATA']['cmd']['push'](function() {
    master['__ATA']['insertStyles'](global);
    master['__ATA']['initSlot'](slotId, slotConfig);
  });
}
