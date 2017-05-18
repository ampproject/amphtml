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

import {loadScript, writeScript} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function bringhub(global, data) {
  (global._bringhub = global._bringhub || {
    viewId: global.context.pageViewId,
    htmlURL: data['htmlurl'] || global.context.canonicalUrl,
    ampURL: data['ampurl'] || global.context.sourceUrl,
    referrer: data['referrer'] || global.context.referrer,
  });

  writeScript(global, "https://local-static.bringhub.com/msf/amp-loader.js?v=" + (Date.now()), function() {
      let ss = document.createElement('link');
      ss.setAttribute('rel','stylesheet');
      ss.setAttribute('href', 'https://local-static.bringhub.com/msf/index.css?v=' + global._bringhub.hash);
      document.head.appendChild(ss);
      let msf = document.createElement('div');
      msf.setAttribute('id', 'amp-msf');
      document.body.appendChild(msf);
      loadScript(global, "https://local-static.bringhub.com/msf/amp-widget.js?v=" + global._bringhub.hash);
  });
}
