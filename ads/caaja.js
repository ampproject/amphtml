/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function caaja(global, data) {

  
  //validateData(data, ['aja-ssp-asi']);　キャメルか？

  (global._caaja = global._caaja || {//オブジェクトリテラル　ハッシュ　きー　ばりゅー
    sspCode: data['sspCode'],
    //mediaId: data['mediaid'],

    //htmlURL: data['htmlurl'] || global.context.canonicalUrl,
    //ampURL: data['ampurl'] || global.context.sourceUrl,
    //fbk: data['fbk'] || '',
    //testMode: data['testmode'] || 'false',
    //styleFile: data['stylefile'] || '',
    //referrer: data['referrer'] || global.context.referrer,
  });
  //contest ????

  //amp.html case
    url = `https://static.aja-recommend.com/html/amp.html?ssp_code=` + `encodeURIComponent(data['sspCode'])`;
    loadScript(global,url)

  //CDN case
    //var el = document.createElement('script');
    //el.setAttribute('src', 'https://cdn.as.amanad.adtdp.com/tag/' + ZZZZZ(media-id) + '.js');
    //el.setAttribute('data-aja-ssp-asi', sspCode);
    //el.setAttribute('async', 'true');
  //完成例'Completion example'→  <script src="https://cdn.as.amanad.adtdp.com/tag/ZZZZZ.js" data-aja-ssp-asi="SSPCODE" async="true"></script>

  //asot.js+render.js case
    //todo
    //loadScript(global, 'https://cdn.as.amanad.adtdp.com/sdk/asot-v2.js');

  //amp.html nakami todo  case

}
