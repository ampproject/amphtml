/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {parseJson} from '../src/json';

/**
 * Send messages to parent frame. These should not contain user data.
 * @param {string} type Type of messages
 * @param {!JsonObject=} opt_object Data for the message.
 */
export function nonSensitiveDataPostMessage(type, opt_object) {
  if (window.parent == window) {
    return; // Nothing to do.
  }
  const object = opt_object || /** @type {JsonObject} */ ({});
  object['type'] = type;
  object['sentinel'] = window.context.sentinel;
  window.parent./*OK*/postMessage(object,
      window.context.location.origin);
}

/**
 * Message event listeners.
 * @const {!Array<{type: string, cb: function(!JsonObject)}>}
 */
const listeners = [];

/**
 * Listen to message events from document frame.
 * @param {!Window} win
 * @param {string} type Type of messages
 * @param {function(!JsonObject)} callback Called with data payload of message.
 * @return {function()} function to unlisten for messages.
 */
export function listenParent(win, type, callback) {
  const listener = {
    type,
    cb: callback,
  };
  listeners.push(listener);
  startListening(win);
  return function() {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

/**
 * Listens for message events and dispatches to listeners registered
 * via listenParent.
 * @param {!Window} win
 */
function startListening(win) {
  if (win.AMP_LISTENING) {
    return;
  }
  win.AMP_LISTENING = true;
  win.addEventListener('message', function(event) {
    // Cheap operations first, so we don't parse JSON unless we have to.
    const eventData = getData(event);
    if (event.source != win.parent ||
        event.origin != win.context.location.origin ||
        typeof eventData != 'string' ||
        eventData.indexOf('amp-') != 0) {
      return;
    }
    // Parse JSON only once per message.
    const data = /** @type {!JsonObject} */ (
      parseJson(/**@type {string} */ (getData(event)).substr(4)));
    if (win.context.sentinel && data['sentinel'] != win.context.sentinel) {
      return;
    }
    // Don't let other message handlers interpret our events.
    if (event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    }
    // Find all the listeners for this type.
    for (let i = 0; i < listeners.length; i++) {
      if (listeners[i].type != data['type']) {
        continue;
      }
      const cb = listeners[i].cb;
      try {
        cb(data);
      } catch (e) {
        // Do not interrupt execution.
        setTimeout(() => {
          throw e;
        });
      }
    }
  });
}
