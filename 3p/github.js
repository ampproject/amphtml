/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {userAssert} from '../src/log';
import {writeScript} from './3p';

/**
 * Get the correct script for the gist.
 *
 * Use writeScript: Failed to execute 'write' on 'Document': It isn't possible
 * to write into a document from an asynchronously-loaded external script unless
 * it is explicitly opened.
 *
 * @param {!Window} global
 * @param {string} scriptSource The source of the script, different for post and comment embeds.
 * @param {function(*)} cb
 */
function getGistJs(global, scriptSource, cb) {
  writeScript(global, scriptSource, function() {
    cb();
  });
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function github(global, data) {
  userAssert(
    data.gistid,
    'The data-gistid attribute is required for <amp-gist> %s',
    data.element
  );

  let gistUrl =
    'https://gist.github.com/' + encodeURIComponent(data.gistid) + '.js';

  if (data.file) {
    gistUrl += '?file=' + encodeURIComponent(data.file);
  }

  getGistJs(global, gistUrl, function() {
    // Dimensions are given by the parent frame.
    delete data.width;
    delete data.height;
    const gistContainer = global.document.querySelector('#c .gist');

    // get all links in the embed
    const gistLinks = global.document.querySelectorAll('.gist-meta a');
    for (let i = 0; i < gistLinks.length; i++) {
      // have the links open in a new tab #8587
      gistLinks[i].target = '_BLANK';
    }

    context.updateDimensions(
      gistContainer./*OK*/ offsetWidth,
      gistContainer./*OK*/ offsetHeight
    );
  });
}
