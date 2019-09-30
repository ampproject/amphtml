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

import {validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function innity(global, data) {
  validateData(data, ['pub', 'zone'], ['channel']);
  writeScript(global, 'https://cdn.innity.net/admanager.js', () => {
    const innityAMPZone = global.innity_adZone;
    const innityAMPTag = new innityAMPZone(
      encodeURIComponent(data.pub),
      encodeURIComponent(data.zone),
      {
        width: data.width,
        height: data.height,
        channel: data.channel ? encodeURIComponent(data.channel) : '',
      }
    );
    // AMP handling or noContentAvailable
    innityAMPTag.amp(global.context);
    // else renderStart (with at least house ad)
    global.context.renderStart();
  });
}
