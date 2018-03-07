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

import {loadScript} from './3p';

/**
 * Produces the AirBnB Bodymovin player SDK object for the passed in callback.
 * @param {!Window} global
 * @param {function(!Object)} cb
 */
function getBodymovinPlayerSdk(global, cb) {
  loadScript(global, 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/4.13.0/bodymovin.js', function() {
    cb(global.bodymovin);
  });
}

export function bodymovinplayer(global, data) {
  const animatingContainer = global.document.createElement('div');
  global.document.getElementById('c').appendChild(animatingContainer);
  const shouldLoop = (data.loop === 'true' || data.loop === 'false') ?
    data.loop === 'true' : parseInt(data.loop, 10);
  getBodymovinPlayerSdk(global, function() {
    bodymovin.loadAnimation({
      container: animatingContainer,
      renderer: 'svg',
      loop: shouldLoop,
      autoplay: data.autoplay === 'true',
      animationData: JSON.parse(data.animationData),
      name: data.name,
    });
  });
}
