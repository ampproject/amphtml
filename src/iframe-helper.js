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

import {assert} from './asserts';
import {parseUrl} from './url';


/**
 * Allows listening for message from the iframe. Returns an unlisten
 * function to remove the listener.
 *
 * @param {!Element} iframe.
 * @param {string} typeOfMessage.
 * @param {function(!Object)} callback Called when a message of this type
 *     arrives for this iframe.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @return {!Unlisten}
 */
export function listen(iframe, typeOfMessage, callback, opt_is3P) {
  assert(iframe.src, 'only iframes with src supported');
  const origin = parseUrl(iframe.src).origin;
  const win = iframe.ownerDocument.defaultView;
  const sentinel = getSentinel_(opt_is3P);
  const listener = function(event) {
    if (event.origin != origin) {
      return;
    }
    if (event.source != iframe.contentWindow) {
      return;
    }
    if (!event.data || event.data.sentinel != sentinel) {
      return;
    }
    if (event.data.type != typeOfMessage) {
      return;
    }
    callback(event.data);
  };

  win.addEventListener('message', listener);

  return function() {
    win.removeEventListener('message', listener);
  };
}

/**
 * Allows listening for a message from the iframe and then removes the listener
 *
 * @param {!Element} iframe.
 * @param {string} typeOfMessage.
 * @param {function(!Object)} callback Called when a message of this type
 *     arrives for this iframe.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @return {!Unlisten}
 */
export function listenOnce(iframe, typeOfMessage, callback, opt_is3P) {
  const unlisten = listen(iframe, typeOfMessage, data => {
    unlisten();
    return callback(data);
  }, opt_is3P);
  return unlisten;
}

/**
 * Posts a message to the iframe.
 * @param {!Element} element The iframe.
 * @param {string} type Type of the message.
 * @param {!Object} object Message payload.
 * @param {string} targetOrigin origin of the target.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 */
export function postMessage(iframe, type, object, targetOrigin, opt_is3P) {
  if (!iframe.contentWindow) {
    return;
  }
  object.type = type;
  object.sentinel = getSentinel_(opt_is3P);
  iframe.contentWindow./*OK*/postMessage(object, targetOrigin);
}

/**
 * Gets the sentinel string.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @returns {string} Sentinel string.
 * @private
 */
function getSentinel_(opt_is3P) {
  return opt_is3P ? 'amp-$internalRuntimeToken$' : 'amp';
}
