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

import {loadScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function forkmedia(global, data) {
  let src = null;
  if (data.product === 'contextads') {
    switch (data.format) {
      case 'inread':
        src = 'https://amp.contextads.live/inread/inread.js';
        break;
      case 'vibe':
        src = 'https://amp.contextads.live/vibe/iav_ia.js';
        break;
      case 'display':
        src = 'https://amp.contextads.live/display/display.js';
        break;
      case 'impulse':
        src = 'https://amp.contextads.live/impulse/impulse.js';
        break;
      case 'interscroller':
        src = 'https://amp.contextads.live/interscroller/fis.js';
        break;
      case 'spark':
        src = 'https://amp.contextads.live/spark/spark.js';
        break;
      default:
        src = 'https://amp.contextads.live/default.js';
    }
  } else {
    src = 'https://amp.contextads.live/default.js';
  }

  loadScript(
    global,
    src,
    () => {
      global.context.renderStart();
    },
    () => {
      global.context.noContentAvailable();
    }
  );
}
