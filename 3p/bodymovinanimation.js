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

import {dict} from '../src/utils/object';
import {getData} from '../src/event-helper';
import {loadScript} from './3p';
import {parseJson} from '../src/json';
import {setStyles} from '../src/style';

/**
 * Produces the AirBnB Bodymovin Player SDK object for the passed in callback.
 * @param {!Window} global
 * @param {function(!Object)} cb
 */

let animationHandler;

/**
 * @param {!Window} global
 * @param {string} renderer
 * @param {!Function} cb
 */
function getBodymovinAnimationSdk(global, renderer, cb) {
  const scriptToLoad =
    renderer === 'svg'
      ? 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/4.13.0/bodymovin_light.min.js'
      : 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/4.13.0/bodymovin.min.js';
  loadScript(global, scriptToLoad, function() {
    cb(global.bodymovin);
  });
}

/**
 * @param {!Event} event
 */
function parseMessage(event) {
  const eventMessage = parseJson(getData(event));
  const action = eventMessage['action'];
  if (action == 'play') {
    animationHandler.play();
  } else if (action == 'pause') {
    animationHandler.pause();
  } else if (action == 'stop') {
    animationHandler.stop();
  } else if (action == 'seekTo') {
    if (eventMessage['valueType'] === 'time') {
      animationHandler.goToAndStop(eventMessage['value']);
    } else {
      const frameNumber = Math.round(
        eventMessage['value'] * animationHandler.totalFrames
      );
      animationHandler.goToAndStop(frameNumber, true);
    }
  }
}

/**
 * @param {!Window} global
 */
export function bodymovinanimation(global) {
  const dataReceived = parseJson(global.name)['attributes']._context;
  const dataLoop = dataReceived['loop'];
  const animatingContainer = global.document.createElement('div');
  setStyles(animatingContainer, {
    width: '100%',
    height: '100%',
  });

  global.document.getElementById('c').appendChild(animatingContainer);
  const shouldLoop = dataLoop != 'false';
  const loop = !isNaN(dataLoop) ? dataLoop : shouldLoop;
  const renderer = dataReceived['renderer'];
  getBodymovinAnimationSdk(global, renderer, function(bodymovin) {
    animationHandler = bodymovin.loadAnimation({
      container: animatingContainer,
      renderer,
      loop,
      autoplay: dataReceived['autoplay'],
      animationData: dataReceived['animationData'],
    });
    const message = JSON.stringify(
      dict({
        'action': 'ready',
      })
    );
    global.addEventListener('message', parseMessage, false);
    global.parent./*OK*/ postMessage(message, '*');
  });
}
