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

function getImgurScript(global, scriptSource, cb) {
  writeScript(global, scriptSource, function() {
    cb();
  });
}

function getImgurContainer(global, data) {
  const blockquote = global.document.createElement('blockquote');
  blockquote.classList.add("imgur-embed-pub");
  blockquote.setAttribute("data-id", data.imgurId);
  return blockquote;
}

export function imgur(global, data) {
  user().assert(
    data.imgurId,
    'The data-imgur-id attribute is required for <amp-imgur> %s',
    data.element);

  let container = getImgurContainer(global, data);
  let scriptSource = "https://s.imgur.com/min/embed.js";

  global.document.getElementById('c').appendChild(container);
  getImgurScript(global, scriptSource, function() {
    const imgurContainer = global.document.querySelector('#c iframe');
  });
}