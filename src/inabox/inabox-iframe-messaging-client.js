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
import {canInspectWindow} from '../iframe-helper';
import {getExistingServiceOrNull, registerServiceBuilder} from '../service';
import {tryParseJson} from '../json';

/**
 * @param {!Window} win
 * @return {?../../3p/iframe-messaging-client.IframeMessagingClient}
 */
export function iframeMessagingClientFor(win) {
  return /** @type {?../../3p/iframe-messaging-client.IframeMessagingClient} */ (
    getExistingServiceOrNull(win, 'iframeMessagingClient')
  );
}

/**
 * @param {!Window} win
 */
export function installIframeMessagingClient(win) {
  if (!canInspectWindow(win.top)) {
    registerServiceBuilder(
      win,
      'iframeMessagingClient',
      createIframeMessagingClient.bind(null, win),
      /* opt_instantiate */ true
    );
  }
}

/**
 * @param {!Window} win
 * @return {!../../3p/iframe-messaging-client.IframeMessagingClient}
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
  return iframeClient;
}

/**
 * @param {!Window} win
 * @return {string}
 */
function getRandom(win) {
  return String(win.Math.random()).substr(2);
}
