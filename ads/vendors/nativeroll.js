/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, validateData} from '../../3p/3p';

/**
 * @param {!Window} global
 * @param {{
 *   gid: string,
 * }} data
 */
export function nativeroll(global, data) {
  validateData(data, ['gid']);
  loadScript(
    global,
    'https://cdn01.nativeroll.tv/js/seedr-player.min.js',
    () => {
      initPlayer(global, data);
    }
  );
}

/**
 * @param {!Window} global
 * @param {{
 *   gid: string,
 * }} data
 */
function initPlayer(global, data) {
  const context = /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */ (global.context);
  const config = {
    container: '#c',
    desiredOffset: 50,
    gid: data.gid,
    onError: () => {
      context.noContentAvailable();
    },
    onLoad: () => {
      const document = /** @type {HTMLDocument} */ (global.document);
      const height = /** @type {HTMLElement} */ (document.getElementsByClassName(
        'nr-player'
      )[0])./* OK */ offsetHeight;
      context.requestResize(undefined, height);
    },
    onDestroy: () => {
      context.noContentAvailable();
    },
  };
  // eslint-disable-next-line no-undef
  global.SeedrPlayer(config);
}
