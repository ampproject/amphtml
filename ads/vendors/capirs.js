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

import {dict} from '../../src/utils/object';
import {loadScript, validateData} from '../../3p/3p';

/**
 * @param {!Window} global
 * @param {{
 *   width: string,
 *   begunAutoPad: string,
 *   begunBlockId: string,
 *   customCss: (string|undefined)
 * }} data
 */
export function capirs(global, data) {
  validateData(data, ['begunAutoPad', 'begunBlockId']);

  if (data['customCss']) {
    const style = /** @type {HTMLStyleElement} */ (global.document.createElement(
      'style'
    ));

    if (style.styleSheet) {
      style.styleSheet.cssText = data['customCss'];
    } else {
      style.appendChild(global.document.createTextNode(data['customCss']));
    }

    global.document.getElementById('c').appendChild(style);
  }

  /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */
  const context = /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */ (global.context);
  global['begun_callbacks'] = {
    lib: {
      init: () => {
        const block = global.document.createElement('div');
        block.id = 'x-' + Math.round(Math.random() * 1e8).toString(36);

        global.document.getElementById('c').appendChild(block);

        global['Adf']['banner']['ssp'](block.id, data['params'], {
          'begun-auto-pad': data['begunAutoPad'],
          'begun-block-id': data['begunBlockId'],
        });
      },
    },
    block: {
      draw: (feed) => {
        const banner = feed['banners']['graph'][0];

        context.renderStart(
          dict({
            'width': getWidth(global, banner),
            'height': banner.height,
          })
        );

        const reportId = 'capirs-' + banner['banner_id'];
        context.reportRenderedEntityIdentifier(reportId);
      },
      unexist: function () {
        context.noContentAvailable();
      },
    },
  };

  loadScript(global, '//ssp.rambler.ru/capirs_async.js');
}

/**
 * @param {!Window} global
 * @param {{
 *   width: string
 * }} banner
 * @return {*} TODO(#23582): Specify return type
 */
function getWidth(global, banner) {
  let width;

  if (isResponsiveAd(banner)) {
    width = Math.max(
      /** @type {HTMLElement} */ (global.document.documentElement)
        ./*OK*/ clientWidth,
      /** @type {Window} */ (global.window)./*OK*/ innerWidth || 0
    );
  } else {
    width = banner.width;
  }

  return width;
}

/**
 * @param {{
 *   width: string
 * }} banner
 * @return {boolean}
 */
function isResponsiveAd(banner) {
  return banner.width.indexOf('%') !== -1;
}
