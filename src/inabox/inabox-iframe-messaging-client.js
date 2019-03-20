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

import {IframeMessagingClient} from '../../3p/iframe-messaging-client';
import {MessageType} from '../../src/3p-frame-messaging';
import {dict} from '../../src/utils/object';
import {getServicePromise, registerServiceBuilder} from '../service';
import {tryParseJson} from '../json';

/**
 * @param {!Window} win
 * @return {!Promise<!../../3p/iframe-messaging-client.IframeMessagingClient>}
 */
export function iframeMessagingClientFor(win) {
  return /** @type {!Promise<!../../3p/iframe-messaging-client.IframeMessagingClient>} */(
    getServicePromise(win, 'iframeMessagingClient'));
}

/**
 * @param {!Window} win
 */
export function installIframeMessagingClient(win) {
  registerServiceBuilder(win,
      'iframeMessagingClient',
      createIframeMessagingClient.bind(null, win),
      /* opt_instantiate */ true);
}

/**
 * @param {!Window} win
 * @return {!Promise<!../../3p/iframe-messaging-client.IframeMessagingClient>}
 */
function createIframeMessagingClient(win) {
  const iframeClient = new IframeMessagingClient(win);
  //  Try read sentinel from window first.
  const dataObject = tryParseJson(win.name);
  let sentinel = null;
  if (dataObject && dataObject['_context']) {
    sentinel = dataObject['_context']['sentinel'];
  }
  iframeClient.setSentinel(sentinel || getRandom(win));

  iframeClient.setBroadcastMode(true);
  return new Promise(resolve => {
    const wins = {};
    let hostWin = win;
    let j = 0;
    iframeClient.registerCallback(MessageType.HOST_RESPONSE, message => {
      iframeClient.setBroadcastMode(false);
      iframeClient.setHostWindow(wins[message['id']]);
      resolve(iframeClient);
    });
    do {
      const id = getRandom(win);
      hostWin = hostWin.parent;
      wins[id] = hostWin;
      iframeClient.setHostWindow(hostWin);
      iframeClient./*OK*/sendMessage(
          MessageType.HOST_BROADCAST, dict({'id': id}));
      j++;
    } while (hostWin != win.top && j < 10);
  });
}

/**
 * @param {!Window} win
 * @return {string}
 */
function getRandom(win) {
  return String(win.Math.random()).substr(2);
}
