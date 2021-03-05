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

import {dict} from '../../src/utils/object';
import {loadScript, validateData} from '../../3p/3p';
import {tryParseJson} from '../../src/json';

/**
 * @param {!Window} global
 * @param {{
 *   width: string,
 *   height: string,
 *   blade_api_key: string,
 *   blade_player_id: string,
 *   blade_player_type: string,
 *   servingDomain: (string|undefined),
 *   blade_macros: (string|undefined)
 * }} data
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

  /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */
  const context = /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */ (global.context);
  const marcosObj = tryParseJson(data['blade_macros']) || {};
  marcosObj['rand'] = Math.random().toString();
  marcosObj['page_url'] = marcosObj['page_url'] || context.canonicalUrl;
  /** @type {{width:string,height:string}} */
  const macros = /** @type {{width:string,height:string}} */ ({...marcosObj});
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

  const bladeOnLoad = `_bladeOnLoad-${containerId}`;
  /**
   * @param {boolean} error
   * @param {{
   *   width: string,
   *   height: string
   * }} player
   */
  global[bladeOnLoad] = function (error, player) {
    if (error) {
      context.noContentAvailable();
      return;
    }
    context.reportRenderedEntityIdentifier(containerId);
    context.renderStart(
      dict({
        'width': player.width,
        'height': player.height,
      })
    );
  };

  const servingDomain = data.servingDomain
    ? encodeURIComponent(data.servingDomain)
    : 'ssr.streamrail.net';

  loadScript(
    global,
    `https://${servingDomain}/js/${data['blade_api_key']}/${data['blade_player_id']}/player.js?t=${data['blade_player_type']}&callback=${bladeOnLoad}&config=${bladeConfig}&c=${containerId}`,
    undefined,
    () => {
      context.noContentAvailable();
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
