import {parseJson} from '#core/types/object/json';

import {getData} from '#utils/event-helper';

/**
 * Send messages to parent frame. These should not contain user data.
 * @param {string} type Type of messages
 * @param {!JsonObject=} opt_object Data for the message.
 * @deprecated Use iframe-messaging-client.js
 */
export function nonSensitiveDataPostMessage(type, opt_object) {
  if (window.parent == window) {
    return; // Nothing to do.
  }
  const object = opt_object || /** @type {JsonObject} */ ({});
  object['type'] = type;
  object['sentinel'] = window.context.sentinel;
  window.parent./*OK*/ postMessage(object, window.context.location.origin);
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
 * @deprecated Use iframe-messaging-client.js
 */
export function listenParent(win, type, callback) {
  const listener = {
    type,
    cb: callback,
  };
  listeners.push(listener);
  startListening(win);
  return function () {
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
  win.addEventListener('message', function (event) {
    // Cheap operations first, so we don't parse JSON unless we have to.
    const eventData = getData(event);
    if (
      event.source != win.parent ||
      event.origin != win.context.location.origin ||
      typeof eventData != 'string' ||
      eventData.indexOf('amp-') != 0
    ) {
      return;
    }
    // Parse JSON only once per message.
    const data = /** @type {!JsonObject} */ (
      parseJson(/**@type {string} */ (getData(event)).substr(4))
    );
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
      const {cb} = listeners[i];
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
