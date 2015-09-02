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

import {writeScript, executeAfterWriteScript} from '../src/3p'

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function doubleclick(global, data) {
  writeScript(global,
      'https://www.googletagservices.com/tag/js/gpt.js',
      function() {
        global.googletag.defineSlot(data.slot,
          [data.width, data.height], 'dbad').addService(googletag.pubads());
        global.googletag.pubads().enableSyncRendering();
        global.googletag.pubads().set("page_url", context.location.href);
        global.googletag.enableServices();
        googletag.display('c');
      });
}
