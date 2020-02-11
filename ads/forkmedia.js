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
  if (data.product === 'inread') {
    src = 'https://delivery.forkcdn.com/rappio/inread/v1.1/amp/inread.js';
  } else if (data.product === 'vibe') {
    src = 'https://vibecdn.forkcdn.com/Inarticle/amp/iav.js';
  } else {
    src = 'https://delivery.forkcdn.com/amp/default.js';
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
