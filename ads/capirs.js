/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function capirs(global, data) {
  validateData(data, ['begunAutoPad', 'begunBlockId']);

  if (data['customCss']) {
    const style = window.document.createElement('style');
    if (style.styleSheet) {
      style.styleSheet.cssText = data['customCss'];
    } else {
      style.appendChild(document.createTextNode(data['customCss']));
    }
    global.document.body.appendChild(style);
  }

  global['begun_callbacks'] = {
    lib: {
      init: () => {
        const block = global.document.createElement('div');
        block.id = 'x-' + Math.round(Math.random() * 1e8).toString(36);
        document.body.appendChild(block);

        global['Adf']['banner']['ssp'](block.id, data['params'], {
          'begun-auto-pad': data['begunAutoPad'],
          'begun-block-id': data['begunBlockId'],
        });
      },
    },
    block: {
      draw: feed => {
        const banner = feed['banners']['graph'][0];
        window.context.renderStart({
          width: banner['width'],
          height: banner['height'],
        });
        const reportId = 'capirs-' + banner['banner_id'];
        window.context.reportRenderedEntityIdentifier(reportId);
      },
      unexist: window.context.noContentAvailable,
    },
  };

  loadScript(global, '//ssp.rambler.ru/lpdid.js');
  loadScript(global, '//ssp.rambler.ru/capirs_async.js');
}
