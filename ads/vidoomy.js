/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {validateData, loadScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function vidoomy(global, data) {
  const mandatoryAttributes = ['width', 'height', 'zoneId', 'zoneIdMbl', 'uniqueId'];
  const optionalAttributes = ['widthMbl', 'heightMbl', 'appearAt'];
  validateData(data, mandatoryAttributes, optionalAttributes);
  loadScript(global, 'https://vastserverad.com/players/main.js', () => {
    if (global['vidoomy'] && global['vidoomy']['main'] && global['vidoomy']['main']['VidoomyPlayer']) {
        const playerRef = global['vidoomy']['main']['VidoomyPlayer'];
        new playerRef({
            width: data['width'] - 50 || 400,
            height: data['height'] - 60 || 225,
            widthMbl: data['widthMbl'] || 300,
            heightMbl: data['heighMbl'] || 200,
            appearAt: data['appearAt'] || 'right',
            zoneId: data['zoneId'],
            zoneIdMbl: data['zoneIdMbl']
        }, '', data['uniqueId'], 5000, global, 'imasdk');
    }

  });
}
