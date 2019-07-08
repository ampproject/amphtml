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

  const ctx = window.context;
  global.srAsyncInit = function() {
    const playerId = `player-${data['streamrail_api_key']}`;

    createContainer(playerId);
    // eslint-disable-next-line no-undef
    const p = SR(playerId, {
      'playerId': data['streamrail_player_id'],
      'apiKey': data['streamrail_api_key'],
      'version': '1.0',
      'macros': macros,
    });

    p.then(function(player) {
      if (
        player &&
        !player.hasAds &&
        player.options &&
        player.options.content &&
        !player.options.content.length
      ) {
        ctx.noContentAvailable();
        return;
      }
      player.on('playerReady', function() {
        ctx.reportRenderedEntityIdentifier(playerId);
        ctx.renderStart({
          width: player.width,
          height: player.height,
        });
      });
    }).catch(function() {
      ctx.noContentAvailable();
    });
  };

  const type = data['streamrail_player_type'];
  if (type === 'bladex') {
    loadScript(global, 'https://sdk.streamrail.com/blade/sr.bladex.js');
  } else if (type === 'blade') {
    loadScript(global, 'https://sdk.streamrail.com/blade/sr.blade.js');
  }
}

/**
 * @param {string} playerId
 */
function createContainer(playerId) {
  const d = global.document.createElement('div');
  d.id = playerId;
  global.document.getElementById('c').appendChild(d);
}
