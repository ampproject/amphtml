/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function remixd(global, data) {
  global._rmxd = {};
  global._rmxd.url = data.url || global.context.sourceUrl;
  global._rmxd.amp = true;
  const sriptVersion = data.version || '5';
  const tagUrl =
    'https://tags.remixd.com/player/v' +
    sriptVersion +
    '/index.js?cb=' +
    Math.random();

  document.write(
    '<' +
      'script src="' +
      encodeURI(tagUrl) +
      '" id="remixd-audio-player-script"><' +
      '/script>'
  );
  global.context.renderStart();
}
