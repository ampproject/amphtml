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
export function streamrail(global, data) {
  // ensure mandatory fields
  validateData(data, [
    'width',
    'height',
    'streamrail_api_key',
    'streamrail_player_id',
    'streamrail_player_type',
  ]);

  const marcosObj = tryParseJson(data['streamrail_macros']) || {};
  marcosObj['rand'] = Math.random().toString();
  marcosObj['page_url'] = marcosObj['page_url'] || global.context.canonicalUrl;
  const macros = Object.assign({}, marcosObj);
  macros.width = data.width;
  macros.height = data.height;

  const conatinerId = `${data['streamrail_api_key']}-${
    data['streamrail_player_id']
  }`;
  createContainer(conatinerId);

  global._streamrailConfig = {
    playerId: data['streamrail_player_id'],
    apiKey: data['streamrail_api_key'],
    version: '1.0',
    macros,
  };
  const ctx = global.context;

  global._streamrailOnLoad = function(error, player) {
    if (error) {
      global.context.noContentAvailable();
      return;
    }
    ctx.reportRenderedEntityIdentifier(conatinerId);
    ctx.renderStart({
      width: player.width,
      height: player.height,
    });
  };

  loadScript(
    global,
    `https://ssp.streamrail.net/js/${data['streamrail_api_key']}/${
      data['streamrail_player_id']
    }/player.js?t=${
      data['streamrail_player_type']
    }&callback=_streamrailOnLoad&config=_streamrailConfig&c=${conatinerId}`,
    undefined,
    () => {
      global.context.noContentAvailable();
    }
  );
}

/**
 * @param {string} elemId
 */
function createContainer(elemId) {
  const d = global.document.createElement('div');
  d.id = elemId;
  d.classList.add('streamrail');
  global.document.getElementById('c').appendChild(d);
}
