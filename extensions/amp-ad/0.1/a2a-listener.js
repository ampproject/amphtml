/* Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../../src/services';
import {closestByTag} from '../../../src/dom';
import {getData} from '../../../src/event-helper';
import {isExperimentOn} from '../../../src/experiments';
import {isProxyOrigin} from '../../../src/url';
import {parseJson} from '../../../src/json';
import {user} from '../../../src/log';

/**
 * Sets up a special document wide listener that relays requests
 * from ad iframes to the viewer to perform A2A navigations.
 * Requests are denied if the requests come from iframes that
 * do not currently have focus.
 * @param {!Window} win
 */
export function setupA2AListener(win) {
  if (win.a2alistener) {
    return;
  }
  win.a2alistener = true;
  if (!isExperimentOn(win, 'alp')) {
    return;
  }
  win.addEventListener('message', handleMessageEvent.bind(null, win));
}

/**
 * Handles a potential a2a message.
 * @param {!Window} win
 * @param {!Event} event
 * @visibleForTesting
 */
export function handleMessageEvent(win, event) {
  const data = getData(event);
  // Only handle messages starting with the magic string.
  if (typeof data != 'string' || data.indexOf('a2a;') != 0) {
    return;
  }
  const origin = event.origin;
  const nav = parseJson(data.substr(/* 'a2a;'.length */ 4));
  const url = nav['url'];
  const source = event.source;
  const activeElement = win.document.activeElement;
  // Check that the active element is an iframe.
  user().assert(activeElement.tagName == 'IFRAME',
      'A2A request with invalid active element %s %s %s',
      activeElement, url, origin);
  let found = false;
  let sourceParent = source;
  const activeWindow = activeElement.contentWindow;
  while (sourceParent != win.top) {
    if (sourceParent == activeWindow) {
      found = true;
      break;
    }
    sourceParent = sourceParent.parent;
  }
  // Check that the active iframe contains the iframe that sent us
  // the message.
  user().assert(found,
      'A2A request from invalid source win %s %s', url, origin);
  // Check that the iframe is contained in an ad.
  user().assert(closestByTag(activeElement, 'amp-ad'),
      'A2A request from non-ad frame %s %s', url, origin);
  // We only allow AMP shaped URLs.
  user().assert(isProxyOrigin(url), 'Invalid ad A2A URL %s %s',
      url, origin);
  Services.viewerForDoc(win.document).navigateTo(url, 'ad-' + origin);
}
