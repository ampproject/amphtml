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

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function videonow(global, data) {
  const mandatoryAttributes = ['pid', 'width', 'height'];
  const optionalAttributes = ['kind', 'src'];

  const gn = global && global.name;
  if (gn) {
    const p = JSON.parse(gn);
    const href =
      p &&
      p.attributes &&
      p.attributes._context &&
      p.attributes._context.location &&
      p.attributes._context.location.href;

    if (href) {
      const vnDataStorageKey = 'videonow-config';
      const logLevelString = /[?&]vn_debug\b(?:=(\d+))?/.exec(href);
      const moduleString = /[?&]vn_module=(.*?)[$&\n]/.exec(href);
      const logLevel = (logLevelString && logLevelString[1]) || null;
      const vnModule = (moduleString && moduleString[1]) || null;

      if (logLevel !== null && global.localStorage) {
        const data = JSON.parse(
          global.localStorage.getItem(vnDataStorageKey) || '{}'
        );
        data['logLevel'] = logLevel;
        global.localStorage.setItem(vnDataStorageKey, JSON.stringify(data));
      }
      if (vnModule && global.sessionStorage) {
        const data = JSON.parse(
          global.sessionStorage.getItem(vnDataStorageKey) || '{}'
        );
        data['vnModule'] = vnModule;
        global.sessionStorage.setItem(vnDataStorageKey, JSON.stringify(data));
      }
    }
  }
  validateData(data, mandatoryAttributes, optionalAttributes);

  const profileId = data.pid || 1;

  // production version by default
  let script =
    (data.src && decodeURI(data.src)) ||
    'https://cdn.videonow.ru/vn_init_module.js';

  script = addParam(script, 'amp', 1);
  script = addParam(script, 'profileId', profileId);

  loadScript(global, script);
}

/**
 * @param {string} script
 * @param {string} name
 * @param {string|number}value
 * @return {string}
 */
function addParam(script, name, value) {
  if (script.indexOf(name) < 0) {
    script += (~script.indexOf('?') ? '&' : '?') + name + '=' + value;
  }
  return script;
}
