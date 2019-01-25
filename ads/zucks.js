/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, validateData, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function zucks(global, data) {
  validateData(data, ['frameId']);
  if (data['adtype'] === 'zoe') {
    loadScript(global, 'https://j.zoe.zucks.net/zoe.min.js', function() {
      const frameId = data['frameId'];
      const elementId = 'zucks-widget-parent';

      const d = global.document.createElement('ins');
      d.id = elementId;
      const container = document.getElementById('c');
      container.appendChild(d);

      if (data['zoeMultiAd'] !== 'true') {
        (global.gZgokZoeQueue =
          (global.gZgokZoeQueue || [])).push({frameId});
      }

      (global.gZgokZoeWidgetQueue =
        (global.gZgokZoeWidgetQueue || []))
          .push({frameId, parent: `#${elementId}`});
    });
  }

  let script = `https://j.zucks.net.zimg.jp/j?f=${data['frameId']}`;

  if (data['adtype'] === 'native') {
    script = `https://j.zucks.net.zimg.jp/n?f=${data['frameId']}`;
  }

  writeScript(global, script);
}
