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

import {writeScript} from './3p';
import {user} from '../src/log';


/**
 * Get the correct script for the gist.
 *
 * Use writeScript: Failed to execute 'write' on 'Document': It isn't possible
 * to write into a document from an asynchronously-loaded external script unless
 * it is explicitly opened.
 *
 * @param {!Window} global
 * @param {string} scriptSource The source of the script, different for post and comment embeds.
 */
function getGistJs(global, scriptSource, cb) {
  writeScript(global, scriptSource, function() {
    cb(global.gist);
  });
}

/**
 * Create DOM element for the gist.
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getGistContainer(global, data) {
  const container = global.document.createElement('div');
  container.className = 'gh-gist';
  container.setAttribute('data-gistid', data.gistid);
  return container;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function github(global, data) {
  user().assert(
    data.gistid,
    'The data-gistid attribute is required for <amp-gist> %s',
    data.element);

  const gistid = data.gistid;
  const container = getGistContainer(global, data);

  global.document.getElementById('c').appendChild(container);

  getGistJs(global, 'https://gist.github.com/' + gistid + '.js', function() {
    // Dimensions are given by the parent frame.
    delete data.width;
    delete data.height;
    const ctnr = document./*REVIEW*/querySelector('#c .gist');
    window.context.requestResize(
      container./*REVIEW*/offsetWidth,
      ctnr./*REVIEW*/offsetHeight + /* margins */ 20
    );
  });
}
