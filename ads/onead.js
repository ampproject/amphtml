/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function onead(global, data) {
  validateData(data, [], ['playmode', 'uid', 'pid', 'host']);
  global.Guoshi = {
    queryAd: {
      amp: {},
    },
  };
  global.ONEAD_AMP = {
    playmode: data.playmode,
    uid: data.uid,
    pid: data.pid,
    host: data.host,
  };
  createOneadSlot(global);
  createAdUnit(global);
}
/**
 * @param {!Window} win
 */
function createOneadSlot(win) {
  const slot = document.createElement('div');
  slot.id = 'onead-amp';
  win.document.getElementById('c').appendChild(slot);
}
/**
 * @param {!Window} win
 */
function createAdUnit(win) {
  win.ONEAD_AMP.isAMP = true;
  const src = 'https://ad-specs.guoshipartners.com/static/js/onead-amp.min.js';
  const jsLoadCb = () => {
    win.Guoshi.queryAd.amp.setup({
      playMode: win.ONEAD_AMP.playMode,
      uid: win.ONEAD_AMP.uid,
      pid: win.ONEAD_AMP.pid,
      host: win.ONEAD_AMP.host,
    });
  };

  loadScript(win, src, jsLoadCb);
}
