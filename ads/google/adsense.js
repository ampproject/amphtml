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

import {validateData} from '../../3p/3p';
import {setStyles} from '../../src/style';

/**
 * Make an adsense iframe.
 * @param {!Window} global
 * @param {!Object} data
 */
export function adsense(global, data) {
  // TODO: check mandatory fields
  validateData(data, [],
      ['adClient', 'adSlot', 'adHost', 'adtest', 'tagOrigin', 'experimentId',
       'ampSlotIndex']);

  if (global.context.clientId) {
    // Read by GPT for GA/GPT integration.
    global.gaGlobal = {
      vid: global.context.clientId,
      hid: global.context.pageViewId,
    };
  }
  const s = global.document.createElement('script');
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  global.document.body.appendChild(s);

  const i = global.document.createElement('ins');
  i.setAttribute('data-ad-client', data['adClient']);
  if (data['adSlot']) {
    i.setAttribute('data-ad-slot', data['adSlot']);
  }
  if (data['adHost']) {
    i.setAttribute('data-ad-host', data['adHost']);
  }
  if (data['adtest'] != null) {
    i.setAttribute('data-adtest', data['adtest']);
  }
  if (data['tagOrigin']) {
    i.setAttribute('data-tag-origin', data['tagOrigin']);
  }
  i.setAttribute('data-page-url', global.context.canonicalUrl);
  i.setAttribute('class', 'adsbygoogle');
  setStyles(i, {
    display: 'inline-block',
    width: '100%',
    height: '100%',
  });
  const initializer = {};
  if (data['experimentId']) {
    const experimentIdList = data['experimentId'].split(',');
    if (experimentIdList) {
      initializer['params'] = {
        'google_ad_modifications': {
          'eids': experimentIdList,
        },
      };
    }
  }
  global.document.getElementById('c').appendChild(i);
  (global.adsbygoogle = global.adsbygoogle || []).push(initializer);
}
