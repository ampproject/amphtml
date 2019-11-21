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
import {getData} from '../src/event-helper';
import {loadScript} from './3p';
import {tryDecodeUriComponent} from '../src/url';

/**
 * @param {Window} global
 * @param {Object} VIQEO
 * @private
 */
function viqeoPlayerInitLoaded(global, VIQEO) {
  const {canonicalUrl, pageViewId, sourceUrl} = global.context;
  const data = getData(global.context);
  let viqeoPlayerInstance;
  VIQEO['setConfig']({url: sourceUrl, amp: {pageViewId, canonicalUrl}});
  VIQEO['subscribeTracking'](params => {
    viqeoPlayerInstance = params['player'];
  }, 'Player:added');
  VIQEO['createPlayer']({
    videoId: data['videoid'],
    profileId: data['profileid'],
    parent: global.document.getElementById('c'),
  });

  global.addEventListener('message', parseMessage, false);

  subscribe('videoLoaded', 'ready');
  subscribe('previewLoaded', 'ready');
  subscribe('started', 'started');
  subscribe('paused', 'pause');
  subscribe('played', 'play');
  subscribe('replayed', 'play');
  subscribeTracking({
    Mute: 'mute',
    Unmute: 'unmute',
  });

  /**
   * Subscribe on viqeo's events
   * @param {string} playerEventName
   * @param {string} targetEventName
   * @private
   */
  function subscribe(playerEventName, targetEventName) {
    VIQEO['subscribeTracking'](() => {
      sendMessage(targetEventName);
    }, `Player:${playerEventName}`);
  }

  /**
   * Subscribe viqeo's tracking
   * @param {Object.<string, string>} eventsDescription
   * @private
   */
  function subscribeTracking(eventsDescription) {
    VIQEO['subscribeTracking'](params => {
      const name =
        params && params['trackingParams'] && params['trackingParams'].name;
      const targetEventName = eventsDescription[name];
      if (targetEventName) {
        sendMessage(targetEventName);
      }
    }, 'Player:userAction');
  }

  const sendMessage = (eventName, value = null) => {
    const {parent} = global;
    const message = /** @type {JsonObject} */ ({
      source: 'ViqeoPlayer',
      action: eventName,
      value,
    });
    parent./*OK*/ postMessage(message, '*');
  };

  /**
   * Parse events data for viqeo
   * @param {!Event|{data: !JsonObject}} event
   */
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
      viqeoPlayerInstance.setVolume(1);
    }
  }
}

/**
 * Prepare and return viqeo instance
 * @param {!Window} global
 */
export function viqeoplayer(global) {
  const data = getData(global.context);
  const kindIsProd = data['data-kind'] !== 'stage';

  let scriptPlayerInit = data['script-url'];
  scriptPlayerInit =
    (scriptPlayerInit && tryDecodeUriComponent(scriptPlayerInit)) ||
    (kindIsProd
      ? 'https://cdn.viqeo.tv/js/vq_starter.js'
      : 'https://static.viqeo.tv/js/vq_player_init.js?branch=dev1');

  global['onViqeoLoad'] = VIQEO => viqeoPlayerInitLoaded(global, VIQEO);
  loadScript(global, scriptPlayerInit);
}
