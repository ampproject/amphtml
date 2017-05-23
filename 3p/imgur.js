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

import {loadScript} from './3p';
import {user} from '../src/log';
/**
 * 
 * @param {!Window} global 
 * @param {string} scriptSource 
 */
function getImgurScript(global, cb) {
  loadScript(global, "https://s.imgur.com/min/embed.js", function() {
    cb();
  });
}
/**
 * 
 * @param {!Window} global 
 * @param {!Object} data 
 */
function getImgurContainer(global, data) {
  const blockquote = global.document.createElement('blockquote');
  blockquote.classList.add("imgur-embed-pub");
  blockquote.setAttribute("data-id", data.imgurId);
  return blockquote;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function imgur(global, data) {
  user().assert(
    data.imgurId,
    'The data-imgur-id attribute is required for <amp-imgur> %s',
    data.element);

  let container = getImgurContainer(global, data);

  global.document.getElementById('c').appendChild(container);

  getImgurScript(global, function(imgur) {
    delete data.width;
    delete data.height;
    let imgurContainer = global.document.querySelector('#c .imgur-embed-iframe-pub');
    let repeat;
    if(imgurContainer === null) {
      let repeat = setInterval(function() {
        imgurContainer = global.document.querySelector('#c .imgur-embed-iframe-pub');
        if(imgurContainer !== null) {
          clearInterval(repeat);
          context.updateDimensions(
            imgurContainer.offsetWidth,
            imgurContainer.offsetHeight
          )
        }
      }, 30);
    }
  });
}