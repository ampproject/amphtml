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

import { loadScript, validateData } from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adtelligent(global, data) {
  validateData(
    data,
    [],
    ['source', 'floor', 'hbmpPubId', 'hbmpSiteId', 'hbmpUnitId']
  );

  const doc = global.document;
  const container = doc.createElement('div');
  const ctx = window.context;
  doc.body.appendChild(container);
  if (data.source) {
    const url =
      `https://s.adtelligent.com/?floor=${data.floor || 0}` +
      `&content_page_url=${encodeURIComponent(ctx.location)}` +
      `&width=${data.width}` +
      `&height=${data.height}` +
      `&cb=${Date.now()}` +
      `&aid=${data.source}`;
    container.id = 'PDS' + data.source;
    loadScript(global, url, () => {
      ctx.renderStart({
        width: data.width,
        height: data.height,
      });
    });
  } else {
    const HTML_ELEMENT_ID = 'adt-placement';
    const vpbSrc = `//player.adtelligent.com/prebid/wrapper_hb_${data['hbmpPubId']}_${data['hbmpSiteId']}.js`;
    const pbSrc = vpbSrc.replace('wrapper_hb', 'hb');
    container.id = HTML_ELEMENT_ID;
    global.vpb = window.vpb || {
      cmd: [],
      fastLoad: true,
      amp: true,
      startAuction: 1,
    };

    loadScript(global, vpbSrc);
    loadScript(global, pbSrc);

    global.vpb.cmd.push(function () {
      global.vpb.startAuction({
        code: HTML_ELEMENT_ID,
        adUnitId: parseInt(data['hbmpUnitId'], 10),
        sizes: [[data.width, data.height]],
        render: true,
        onEnd(winner) {
          ctx.renderStart({
            width: winner.width,
            height: winner.height,
          });
        },
      });
    });
  }
}
