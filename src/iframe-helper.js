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

import {dev} from './log';
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
  dev.assert(iframe.src, 'only iframes with src supported');
  dev.assert(!iframe.parentNode, 'cannot register events on an attached ' +
      'iframe. It will cause hair-pulling bugs like #2942');
  const origin = parseUrl(iframe.src).origin;
  let win = iframe.ownerDocument.defaultView;
  const sentinel = getSentinel_(opt_is3P);
  let unlisten;
  let listener = function(event) {
    // If this iframe no longer has a contentWindow is was removed
    // from the DOM. Unlisten immediately as we can never again receive
    // messages for it (
    if (!iframe.contentWindow) {
      unlisten();
      return;
    }
    if (event.origin != origin) {
      return;
    }
    if (event.source != iframe.contentWindow) {
      return;
    }
    if (!event.data) {
      return;
    }
    const data = parseIfNeeded(event.data, opt_is3P);
    if (data.sentinel != sentinel) {
      return;
    }
    if (data.type != typeOfMessage) {
      return;
    }
    callback(data);
  };

  win.addEventListener('message', listener);

  return unlisten = function() {
    if (listener) {
      win.removeEventListener('message', listener);
      // Make sure references to the unlisten function do not keep
      // alive too much.
      listener = null;
      iframe = null;
      win = null;
      callback = null;
    }
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
  if (opt_is3P) {
    // Serialize ourselves because that is much faster in Chrome.
    object = 'amp-' + JSON.stringify(object);
  }
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

/**
 * Json parses event.data if it needs to be
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @returns {!Object} object message
 * @private
 */
function parseIfNeeded(data, opt_is3P) {
  const shouldBeParsed = typeof data === 'string'
      && data.charAt(0) === '{'
      && !opt_is3P;
  if (shouldBeParsed) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      log.warn('Postmessage could not be parsed. ' +
          'Is it in a valid JSON format?', e);
    }
  }
  return data;
}
