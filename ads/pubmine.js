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

import {writeScript, validateData} from '../3p/3p';
import {getSourceOrigin, getSourceUrl} from '../src/url';

const pubmineOptional = ['adsafe', 'section', 'wordads'],
    pubmineRequired = ['siteid'],
    pubmineURL = 'https://s.pubmine.com/head.js';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function pubmine(global, data) {
  validateData(data, pubmineRequired, pubmineOptional);

  global._ipw_custom = { // eslint-disable-line google-camelcase/google-camelcase
    adSafe: 'adsafe' in data ? data.adsafe : '0',
    amznPay: [],
    domain: getSourceOrigin(global.context.location.href),
    pageURL: getSourceUrl(global.context.location.href),
    wordAds: 'wordads' in data ? data.wordads : '0',
    renderStartCallback: () => global.context.renderStart(),
  };
  writeScript(global, pubmineURL);

  const o = {
        sectionId: data['siteid'] + ('section' in data ? data.section : '1'),
        height: data.height,
        width: data.width,
      },
      wr = global.document.write;

  wr.call(global.document,
      `<script type="text/javascript">
      (function(g){g.__ATA.initAd(
        {sectionId:${o.sectionId}, width:${o.width}, height:${o.height}});
      })(window);
    </script>`
  );
}
