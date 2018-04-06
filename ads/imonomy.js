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
export function imonomy(global, data) {
  validateData(data, ['extraParams', 'pid', 'slot', 'subId'], []);
  let additionParams = {
    random: Math.floor(89999999 * Math.random() + 10000000),
    millis: Date.now(),
    loc: encodeURIComponent(window.context.location.href)};
  additionParams = Object.assign(
      {}, additionParams, imonomyPageParameters(global));

  const imonomyUrl = `//tag.imonomy.com/amp/${data.pid}/amp.js?
  ${serialize(data)}&${serialize(additionParams)}`;

  loadScript(global, imonomyUrl, function() {
    const div = global.document.createElement('div');
    div.id = 'imonomy_ad';
    div.innerHTML = window.imonomyContent;
    global.document.getElementById('c').appendChild(div);
  });
}

function serialize(obj) {
  const str = [];
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {

      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
}


/**
 * @param {!Window} win
 * @return {!Promise<!Object<string,null|number|string>>}
 */
export function imonomyPageParameters(win) {
  const screen = win.screen;
  const visibilityState = null;
  return {
    'is_amp': '3',
    'amp_v': '$internalRuntimeVersion$',
    'd_imp': '1',
    'dt': win.context.startTime,
    'biw': this.innerWidth,
    'bih': this.innerHeight,
    'u_aw': screen ? screen.availWidth : null,
    'u_ah': screen ? screen.availHeight : null,
    'u_cd': screen ? screen.colorDepth : null,
    'u_w': screen ? screen.width : null,
    'u_h': screen ? screen.height : null,
    'u_tz': -new Date().getTimezoneOffset(),
    'isw': win != win.top ? win.visualViewport.width : null,
    'ish': win != win.top ? win.visualViewport.height : null,
    'vis': visibilityStateCodes[visibilityState] || '0',
    'scr_x': win.visualViewport.offsetLeft,
    'scr_y': win.visualViewport.offsetTop,
    'debug_experiment_id':
        (/,?deid=(\d+)/i.exec(win.location.hash) || [])[1] || null,
    'url': win.context.location.href.slice(0,1300),
    'top': win.context.location.hostname,
    'loc': win.context.location.href.slice(0,1300),
    'ref': win.context.referrer || null,
  };
}

/**
 * See `VisibilityState` enum.
 * @const {!Object<string, string>}
 */
const visibilityStateCodes = {
  'visible': '1',
  'hidden': '2',
  'prerender': '3',
  'unloaded': '5',
};
