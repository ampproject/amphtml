/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {loadScript, validateData} from '../3p/3p';
import {setStyle} from '../src/style';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function aja(global, data) {

  validateData(data, ['asi']);

  const {document} = global;
  const asi = data['asi'];
  const d = document.createElement('div');
  d.dataset.ajaAd = '';
  d.dataset.ajaAsi = asi;
  setStyle(d, 'margin', '1px');
  document.body.appendChild(d);

  const params = {asis: {}};
  params.asis[asi] = {
    callback: res => {
      const {banner, native, video} = res.ad;
      if (!!banner) {
        global.context.requestResize(banner.w, banner.h);
      } else if (!!native) {
        const timer = setInterval(() => {
          if (1 <= document.querySelectorAll('.ajaRecommend-item').length) {
            let {scrollWidth: width, scrollHeight: height} = document.body;
            if (height === 0) {
              const ds = global.getComputedStyle(d);
              width = parseInt(ds.width, 10);
              height = parseInt(ds.height, 10);
              if (height === 0) {
                const fs = global.getComputedStyle(d.firstElementChild);
                width = parseInt(fs.width, 10);
                height = parseInt(fs.height, 10);
              }
            }
            global.context.requestResize(width, height);
            clearInterval(timer);
          }
        }, 100);
      } else if (!!video) {
        global.context.requestResize(video.w, video.h);
      }
    },
  };
  global.__ASOT__ = params;

  loadScript(global, 'https://cdn.as.amanad.adtdp.com/sdk/asot-v2.js');

}
