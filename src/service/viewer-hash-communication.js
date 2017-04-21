/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {dev, user} from '../log';

/** @const {string} */
const sentinel = '#__AMP_viewer';

/** @const {string} */
const TAG = 'HASH';

/**
 * Sets up a communication channel via the hash for use in web
 * view embeds.
 * In particular pages that are opened with
 * #webview=1&com=hash
 * Can update the fragment
 * @param {!./viewer-impl.Viewer} viewer
 */
export function setupHashBasedCommunication(viewer) {
  viewer.setMessageDeliverer(function(message) {
    dev().warn(TAG,
        'Ignoring outbound message in hash based communication',
        message);
  }, 'not-an-origin');
  const win = viewer.win;
  // Magic var picked up in error reporting.
  win.viewerState = 'hash-viewer;';
  win.addEventListener('hashchange', function() {
    const hash = win.location.hash;
    if (hash.indexOf(sentinel) != 0) {
      return;
    }
    win.viewerState += hash;
    const message = parseFragment(hash.substr(sentinel.length));
    user().assert(
        message && message.type,
        'Expected type in viewer message', message);
    viewer.receiveMessage(message.type, message.data);
  });
}

// Manual test URLs
// http://localhost:8000/examples/article.amp.max.html#webview=1&visibilityState=prerender&com=hash
// http://localhost:8000/examples/article.amp.max.html#__AMP_viewer{"type":"visibilitychange","data":{"state":"visible"}}

/**
 * @param {string} fragment
 * @return {!JSONType} [description]
 */
function parseFragment(fragment) {
  let json = fragment.substr(sentinel);
  // Some browser, notably Firefox produce an encoded version of the fragment
  // while most don't. Since we know how the string should start, this is easy
  // to detect.
  if (json.indexOf('{%22') == 0) {
    json = decodeURIComponent(json);
  }
  return /** @type {!JSONType} */ (json ? JSON.parse(json) : {});
}