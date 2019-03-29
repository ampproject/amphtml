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

import {Services} from '../services';
import {createCustomEvent} from '../event-helper.js';
import {dict} from '../utils/object';
import {isObject} from '../types';
import {whenContentIniLoad} from '../friendly-iframe-embed';

/**
 * Registers ini-load listener that will fire custom 'amp-ini-load' event
 * on window (accessible if creative is friendly to ad tag) and postMessage to
 * window parent.
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function registerIniLoadListener(ampdoc) {
  const {win} = ampdoc;
  const root = ampdoc.getRootNode();
  whenContentIniLoad(ampdoc, win,
      Services.viewportForDoc(ampdoc).getLayoutRect(
          root.documentElement || root.body || root))
      .then(() => {
        win.dispatchEvent(createCustomEvent(
            win, 'amp-ini-load', /* detail */ null, {bubbles: true}));
        if (win.parent) {
          win.parent./*OK*/postMessage('amp-ini-load', '*');

          // Fire a safeframe message to report creative size on init as well
          if (isObject(win.sf_) && isObject(win.sf_.cfg)) {
            const payload = dict({
              'uid': win.sf_.cfg.uid,
              'width': win.document.body.offsetWidth,
              'height': win.document.body.offsetHeight,
            });
            const message = dict({
              /* CHANNEL */ 'c': 'sfchannel' + win.sf_.cfg.uid,
              /* SERVICE */ 's': 'creative_geometry_update',
              /* PAYLOAD */ 'p': JSON.stringify(payload),
            });
            win.parent./*OK*/postMessage(JSON.stringify(message), '*');
          }
        }
      });
}

/**
 * Function to get the amp4ads-identifier from the meta tag on the document
 * @param {!Window} win
 * @return {?string}
 */
export function getA4AId(win) {

  const a4aIdMetaTag = win.document.head
      .querySelector('meta[name="amp4ads-id"]');

  if (a4aIdMetaTag) {
    return a4aIdMetaTag.getAttribute('content');
  }

  return null;
}
