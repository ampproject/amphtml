/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {tryParseJson} from '../src/json';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function blade(global, data) {
  // ensure mandatory fields
  validateData(data, [
    'width',
    'height',
    'blade_api_key',
    'blade_player_id',
    'blade_player_type',
  ]);

  const marcosObj = tryParseJson(data['blade_macros']) || {};
  marcosObj['rand'] = Math.random().toString();
  marcosObj['page_url'] = marcosObj['page_url'] || global.context.canonicalUrl;
  const macros = {...marcosObj};
  macros.width = data.width;
  macros.height = data.height;

  const containerId = `player-${data['blade_api_key']}-${data['blade_player_id']}`;
  createContainer(containerId);

  const bladeConfig = `_bladeConfig-${containerId}`;
  global[bladeConfig] = {
    playerId: data['blade_player_id'],
    apiKey: data['blade_api_key'],
    version: '1.0',
    macros,
  };
  const ctx = global.context;

  const bladeOnLoad = `_bladeOnLoad-${containerId}`;
  global[bladeOnLoad] = function (error, player) {
    if (error) {
      global.context.noContentAvailable();
      return;
    }
    ctx.reportRenderedEntityIdentifier(containerId);
    ctx.renderStart({
      width: player.width,
      height: player.height,
    });
  };

  const servingDomain = data.servingDomain
    ? encodeURIComponent(data.servingDomain)
    : 'ssr.streamrail.net';

  loadScript(
    global,
    `https://${servingDomain}/js/${data['blade_api_key']}/${data['blade_player_id']}/player.js?t=${data['blade_player_type']}&callback=${bladeOnLoad}&config=${bladeConfig}&c=${containerId}`,
    undefined,
    () => {
      global.context.noContentAvailable();
    }
  );
  /**
   * @param {string} elemId
   */
  function createContainer(elemId) {
    const d = global.document.createElement('div');
    d.id = elemId;
    d.classList.add('blade');
    global.document.getElementById('c').appendChild(d);
  }
}
