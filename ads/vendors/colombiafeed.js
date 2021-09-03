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

import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function colombiafeed(global, data) {
  validateData(data, ['feedslot', 'feedposition', 'feedsection']);
  // push the two object into the '_colombiafeed' global
  (global._colombiafeed = global._colombiafeed || []).push({
    feedslot: data.feedslot,
    feedposition: data.feedposition,
    feedsection: data.feedsection,
    container: 'c',
    feedpolicy: data.feedpolicy,
    lazyload: data.lazyload,
    lazyloadlimit: data.lazyloadlimit,
    feedsnippetid: data.feedsnippetid,
    feedcustom: data.feedcustom,
  });

  // install observation on entering/leaving the view
  global.context.observeIntersection(function (changes) {
    /** @type {!Array} */ (changes).forEach(function (c) {
      if (c.intersectionRect.height) {
        global._colombiafeed.push({
          visible: true,
          rect: c,
        });
      }
    });
  });

  // load the colombiafeed loader asynchronously
  loadScript(
    global,
    'https://static.clmbtech.com/c1e/static/themes/js/colombiafeed-amp.js'
  );
}
