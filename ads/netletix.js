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

import {writeScript, loadScript, validateData} from '../3p/3p';
import {startsWith} from '../src/string.js';
import {dev} from '../src/log.js';
import {assertHttpsUrl, addParamsToUrl} from '../src/url.js';

const NX_URL_HOST = 'https://call.adadapter.netzathleten-media.de';
const NX_URL_PATHPREFIX = '/pb/';
const NX_URL_FULL = NX_URL_HOST + NX_URL_PATHPREFIX ;
const DEFAULT_NX_KEY = 'default';
const DEFAULT_NX_UNIT = 'default';
const DEFAULT_NX_WIDTH = 'fluid';
const DEFAULT_NX_HEIGHT = 'fluid';
const DEFAULT_NX_V = '0002';
const DEFAULT_NX_SITE = 'none';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function netletix(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/
  global._netletix_amp = {
    allowed_data: ['nxasync','nxv','nxsite','nxid','nxscript'],
    mandatory_data: ['nxkey','nxunit','nxwidth','nxheight'],
    data,
  };
  validateData(data,
    global._netletix_amp.mandatory_data, global._netletix_amp.allowed_data);
  const url = assertHttpsUrl(addParamsToUrl(
    NX_URL_FULL + encodeURIComponent(data.nxkey || DEFAULT_NX_KEY),
    {
      unit: data.nxunit || DEFAULT_NX_UNIT,
      width: data.nxwidth || DEFAULT_NX_WIDTH,
      height: data.nxheight || DEFAULT_NX_HEIGHT,
      v: data.nxv || DEFAULT_NX_V,
      site: data.nxsite || DEFAULT_NX_SITE,
      ord: Math.round(Math.random() * 100000000),
    }), data.ampSlotIndex);
  window.addEventListener('message', event => {
    if (event.data.type &&
        startsWith(dev().assertString(event.data.type), 'nx-')) {
      switch (event.data.type) {
        case 'nx-resize':
          const renderconfig = {
            'width': event.data.width,
            'height': event.data.height,
          };
          global.context.renderStart(renderconfig);
          const nxh = (data.nxheight || DEFAULT_NX_HEIGHT);
          const nxw = (data.nxwidth || DEFAULT_NX_WIDTH);
          if (event.data.width &&
              event.data.height &&
              (event.data.width != nxh ||
              event.data.height != nxw)) {
            global.context.requestResize(event.data.width,
                event.data.height);
          };
          break;
        case 'nx-empty':
          global.context.noContentAvailable();
          break;
        case 'nx-identifier':
          global.context.reportRenderedEntityIdentifier(event.data.identifier);
          break;
        default:
          break;
      }
    }
  });
  if (data.async && data.async.toLowerCase() === 'true') {
    loadScript(global, url);
  } else {
    writeScript(global, url);
  }
}
