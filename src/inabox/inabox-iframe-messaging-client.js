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

import {registerServiceBuilder, getService} from '../service';
import {IframeMessagingClient} from '../../3p/iframe-messaging-client';

/**
 * @param {!Window} win
 * @return {!../../3p/iframe-messaging-client.IframeMessagingClient}
 */
export function iframeMessagingClientFor(win) {
  return /** @type {!../../3p/iframe-messaging-client.IframeMessagingClient} */(
      getService(win, 'iframeMessagingClient'));
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
 * @return {!../../3p/iframe-messaging-client.IframeMessagingClient}
 */
function createIframeMessagingClient(win) {
  const iframeClient = new IframeMessagingClient(win);
  iframeClient.setSentinel(getRandom(win));

  // Bet the top window is the scrollable window and loads host script.
  // TODO(lannka,#9120):
  // 1) check window ancestor origin, if the top window is in same origin,
  // don't bother to use post messages.
  // 2) broadcast the request
  iframeClient.setHostWindow(win.top);
  return iframeClient;
}

/**
 * @param {!Window} win
 * @returns {string}
 */
function getRandom(win) {
  return String(win.Math.random()).substr(2);
}
