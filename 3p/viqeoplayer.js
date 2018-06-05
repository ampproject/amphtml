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

// import {dev} from '../src/log';
import {getData} from '../src/event-helper';
import {loadScript} from './3p';
import {parseJson} from '../src/json';
import {setStyles} from '../src/style';


/**
 * @param {Window} global
 * @param {Object} VIQEO
 * @param  {function(Object)} VIQEO.getPlayers - returns viqeo player
 * @param {function(function(Object), Object)} VIQEO.subscribeTracking - subscriber
 * @private
 */
function viqeoPlayerInitLoaded(global, VIQEO) {
  let viqeoPlayerInstance;
  global.addEventListener('message', parseMessage, false);

  subscribe('added', 'ready', () => {
    const players = VIQEO['getPlayers']({container: 'stdPlayer'});
    viqeoPlayerInstance = players && players[0];
  });
  subscribe('paused', 'pause');
  subscribe('played', 'play');
  subscribe('replayed', 'play');

  function subscribe(playerEventName, targetEventName, extraHandler = null) {
    const {parent} = global;
    VIQEO['subscribeTracking'](
        () => {
          const message = /** @type {JsonObject} */({
            source: 'ViqeoPlayer',
            action: targetEventName,
          });
          parent.postMessage(message, '*');
          if (extraHandler) {
            extraHandler();
          }
        },
        {eventName: `Player:${playerEventName}`, container: 'stdPlayer'}
    );
  }

  function parseMessage(event) {
    const eventData = getData(event);
    const action = eventData['action'];
    if (!action) {
      return;
    }
    if (action === 'play') {
      viqeoPlayerInstance.play();
    } else if (action === 'pause') {
      viqeoPlayerInstance.pause();
    } else if (action === 'stop') {
      viqeoPlayerInstance.stop();
    } else if (action === 'mute') {
      viqeoPlayerInstance.setVolume(0);
    } else if (action === 'unmute') {
      viqeoPlayerInstance.setVolume(0);
    } else if (action === 'intersection') {
      // dev().info(`parseMessage()
      //     viqeoPlayerInstance.setIntersectionRatio(${value})`);
      const value = eventData['value'];
      viqeoPlayerInstance.setIntersectionRatio
        && viqeoPlayerInstance.setIntersectionRatio(value);
    }
  }
}

export function viqeoplayer(global) {
  const dataReceived = parseJson(global.name)['attributes']._context;
  const scriptPlayerInit = decodeURIComponent(dataReceived['scriptPlayerInit']);
  const previewUrl = decodeURIComponent(dataReceived['previewUrl']);
  const videoId = dataReceived['videoId'];
  const profileId = dataReceived['profileId'];

  const doc = global.document;
  const mark = doc.createElement('div');

  setStyles(mark, {
    'position': 'relative',
    'width': '100%',
    'height': '0',
    'paddingBottom': '100%',
  });

  mark.setAttribute('data-vnd', videoId);
  mark.setAttribute('data-profile', profileId);
  mark.classList.add('viqeo-embed');

  const iframe = doc.createElement('iframe');

  iframe.setAttribute('width', '100%');
  iframe.setAttribute('height', '100%');
  iframe.setAttribute('style', 'position: absolute');
  iframe.setAttribute('frameBorder', '0');
  iframe.setAttribute('allowFullScreen', '');
  iframe.src = previewUrl;

  mark.appendChild(iframe);

  doc.getElementById('c').appendChild(mark);

  loadScript(global, scriptPlayerInit, () => {
    if (!global['VIQEO']) {
      global['onViqeoLoad'] = viqeoPlayerInitLoaded.bind(null, global);
    } else {
      viqeoPlayerInitLoaded(global, global['VIQEO']);
    }
  });
}

