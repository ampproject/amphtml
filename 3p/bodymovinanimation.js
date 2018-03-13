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

import {isFiniteNumber} from '../src/types';
import {loadScript} from './3p';

/**
 * Produces the AirBnB Bodymovin Player SDK object for the passed in callback.
 * @param {!Window} global
 * @param {function(!Object)} cb
 */

let animationHandler;

function getBodymovinAnimationSdk(global, cb) {
  loadScript(global, 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/4.13.0/bodymovin.js', function() {
    cb(global.bodymovin);
  });
}

function parseMessage(event) {
  const dataReceived = JSON.parse(event.data);
  const messageType = dataReceived['messageType'];
  if (messageType == 'load dict') {
    return loadAnimationEvent(dataReceived['animationData'], dataReceived['autoplay'], dataReceived['loop']);
  } else if (animationHandler && messageType == 'action') {
    getBodymovinAnimationSdk(global, function() {
      const action = dataReceived['action'];
      if (action == 'play') {
        animationHandler.play();
      } else if (action == 'pause') {
        animationHandler.pause();
      } else if (action == 'stop') {
        animationHandler.stop();
      }
    });
  }

}

function loadAnimationEvent(animationData, autoplay, loop_val) {
  const dataReceived = JSON.parse(event.data);
  const animatingContainer = global.document.createElement('div');

  global.document.getElementById('c').appendChild(animatingContainer);
  const shouldLoop = loop_val == 'true';
  const loop = isFiniteNumber(loop_val) ? parseInt(loop_val, 10) : shouldLoop;

  getBodymovinAnimationSdk(global, function() {
    animationHandler = bodymovin.loadAnimation({
      container: animatingContainer,
      renderer: 'svg',
      loop: loop,
      autoplay: autoplay,
      animationData,
    });
  });
}

window.addEventListener('message', parseMessage, false);

export function bodymovinanimation(global, data) {
}
