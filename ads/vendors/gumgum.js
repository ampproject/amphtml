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

import {dict} from '../../src/utils/object';
import {loadScript, validateData} from '../../3p/3p';
import {setStyles} from '../../src/style';

/**
 * @param {!Window} global
 * @param {{
 *   zone: string,
 *   slot: string,
 *   width: string,
 *   height: string
 * }} data
 */
export function gumgum(global, data) {
  validateData(data, ['zone', 'slot']);

  const win = window;
  /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */
  const ctx = /** @type {./3p/ampcontext-integration.IntegrationAmpContext} */ (win.context);
  const dom = global.document.getElementById('c');
  const ampWidth = parseInt(data.width || '0', 10);
  const ampHeight = parseInt(data.height || '0', 10);
  const ggevents = global.ggevents || [];

  const {max} = Math,
    slotId = parseInt(data.slot, 10),
    onLoad = function (type) {
      return function (evt) {
        const ad = {width: 0, height: 0, ...(evt.ad || {})},
          identifier = ['GUMGUM', type, evt.id].join('_');
        ctx.reportRenderedEntityIdentifier(identifier);
        ctx.renderStart(
          dict({
            'width': max(ampWidth, ad.width),
            'height': max(ampHeight, ad.height),
          })
        );
      };
    },
    noFill = function () {
      ctx.noContentAvailable();
    };

  // Ads logic starts
  global.ggv2id = data.zone;
  global.ggevents = ggevents;
  global.sourceUrl = global.context.sourceUrl;
  global.sourceReferrer = global.context.referrer;

  if (slotId) {
    // Slot Ad
    const ins = global.document.createElement('div');
    setStyles(ins, {
      display: 'block',
      width: '100%',
      height: '100%',
    });
    ins.setAttribute('data-gg-slot', slotId);
    ins.setAttribute('pl', 2);
    dom.appendChild(ins);
    // Events
    ggevents.push({
      'slot.nofill': noFill,
      'slot.close': noFill,
      'slot.load': onLoad('SLOT'),
    });
    // Main script
    loadScript(global, 'https://js.gumgum.com/slot.js');
  } else {
    // No valid configuration
    ctx.noContentAvailable();
  }
}
