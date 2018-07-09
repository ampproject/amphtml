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

import {assertAbsoluteHttpOrHttpsUrl, tryDecodeUriComponent} from '../src/url';
import {getData} from '../src/event-helper';
import {loadScript} from './3p';
import {setStyles} from '../src/style';
import {user} from '../src/log';


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
  subscribeTracking({
    Mute: 'mute',
    Unmute: 'unmute',
  });

  /**
   * Subscribe on viqeo's events
   * @param {string} playerEventName
   * @param {string} targetEventName
   * @param {function()} extraHandler
   * @private
   */
  function subscribe(playerEventName, targetEventName, extraHandler = null) {
    VIQEO['subscribeTracking'](
        () => {
          sendMessage(targetEventName);
          if (extraHandler) {
            extraHandler();
          }
        },
        {eventName: `Player:${playerEventName}`, container: 'stdPlayer'}
    );
  }

  /**
   * Subscribe viqeo's tracking
   * @param {Object.<string, string>} eventsDescription
   * @private
   */
  function subscribeTracking(eventsDescription) {
    VIQEO['subscribeTracking'](params => {
      const name = params && params['trackingParams'] &&
          params['trackingParams'].name;
      const targetEventName = eventsDescription[name];
      sendMessage(targetEventName);
    }, 'Player:userAction');
  }

  const sendMessage = eventName => {
    const {parent} = global;
    const message = /** @type {JsonObject} */({
      source: 'ViqeoPlayer',
      action: eventName,
    });
    parent./*OK*/postMessage(message, '*');
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
  const {data} = global.context;
  const videoId = user().assert(
      data['videoid'],
      'The data-videoid attribute is required for <amp-viqeo-player> %s',
      data);

  const profileId = user().assert(
      data['profileid'],
      'The data-profileid attribute is required for <amp-viqeo-player> %s',
      data);

  const markTagsAdvancedParams = data['tag-settings'];

  const kindIsProd = data['data-kind'] !== 'stage';

  let scriptPlayerInit = data['script-url'];
  scriptPlayerInit =
      (scriptPlayerInit
          && tryDecodeUriComponent(scriptPlayerInit)
      )
      ||
      (kindIsProd
        ? 'https://cdn.viqeo.tv/js/vq_player_init.js?amp=true'
        : 'https://static.viqeo.tv/js/vq_player_init.js?branch=dev1&amp=true'
      );
  // embed preview url
  let previewUrl = data['player-url'];
  previewUrl =
      (previewUrl
          && previewUrl.length && decodeURI(previewUrl)
      )
      || (kindIsProd ? 'https://cdn.viqeo.tv/embed' : 'https://stage.embed.viqeo.tv');

  // Create preview iframe source path
  previewUrl = assertAbsoluteHttpOrHttpsUrl(
      `${previewUrl}/?vid=${videoId}&amp=true`);

  const doc = global.document;
  const mark = doc.createElement('div');

  const markTagsStyle = Object.assign({
    position: 'relative',
    width: '100%',
    height: '0',
    paddingBottom: '100%',
  }, markTagsAdvancedParams);

  setStyles(mark, markTagsStyle);

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
