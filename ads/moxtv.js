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

import {setStyle} from '../src/style';
import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function moxtv(global, data) {
  validateData(data, ['zoneId', 'w', 'h']);

  setStyle(document.body, 'height', '9999px');

  const iframe = global.document.createElement('iframe');
  setStyle(iframe, 'width', '100%');
  setStyle(iframe, 'height', '100%');
  setStyle(iframe, 'border', 0);

  document.getElementById('c').appendChild(iframe);

  const iframeDocument =
    iframe.document || iframe.contentDocument || iframe.contentWindow.document;

  const scriptSrc = 'https://ad.mox.tv/mox/mwayss_invocation.min.js?tld=123&pzoneid=' + data.zoneId + '&height=' + data.w + '&width=' + data.h;
  const iframeContent =
    '<!DOCTYPE html>\
    <html>\
    <head>\
    <style>body{margin:0}</style>\
    </head>\
    <body>\
    <div id="adSlot" style="display:flex;justify-content:center;font-size:0">\
    <script async src="' + scriptSrc + '"></script>\
    </div>\
    </body>\
    </html>';

  iframeDocument.write(iframeContent);
  iframeDocument.close();

  let width;
  let height;

  iframeDocument.defaultView.addEventListener('resize', function() {
    const aspectRatioEl = document.querySelector('#c img');

    if (!aspectRatioEl || !aspectRatioEl.src) {
      return;
    }

    const adSlot = iframeDocument.getElementById('adSlot');
    const {width: aWidth, height: aHeight} = adSlot.getBoundingClientRect();

    if (aWidth === width && aHeight === height) {
      return;
    }

    width = aWidth;
    height = aHeight;

    window.context.requestResize(width - 2, height);
  });
}
