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

import {computedStyle, setStyle} from '../src/style';
import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function aja(global, data) {

  validateData(data, ['asi']);

  const {document} = global;
  const asi = data['asi'];
  const d = document.createElement('div');
  d.dataset['ajaAd'] = '';
  d.dataset['ajaAsi'] = asi;
  setStyle(d, 'margin', '1px');
  document.body.appendChild(d);

  const params = {asis: {}};
  params.asis[asi] = {
    callback: res => {
      if (!res.ad || res.ad.ad_type === 0) {
        return global.context.noContentAvailable();
      }

      if (!!res.ad.banner) {
        const {banner} = res.ad;
        global.context.requestResize(banner.w, banner.h);
      } else if (!!res.ad.native) {
        const timer = setInterval(() => {
          if (1 <= document.querySelectorAll('.ajaRecommend-item').length) {
            let {scrollWidth: width, scrollHeight: height} = document.body;
            if (height === 0) {
              const ds = computedStyle(global, d);
              width = parseInt(ds.width, 10);
              height = parseInt(ds.height, 10);
              if (height === 0) {
                const fc = d.firstElementChild;
                if (!fc) {
                  return;
                }
                const fs = computedStyle(global, fc);
                width = parseInt(fs.width, 10);
                height = parseInt(fs.height, 10);
              }
            }
            global.context.requestResize(width, height);
            clearInterval(timer);
          }
        }, 100);
      } else if (!!res.ad.video) {
        const {video} = res.ad;
        global.context.requestResize(video.w, video.h);
      } else {
        global.context.noContentAvailable();
      }
    },
  };
  global.__ASOT__ = params;

  loadScript(global, 'https://cdn.as.amanad.adtdp.com/sdk/asot-v2.js');

}
