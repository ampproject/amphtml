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

import {dev} from './log';
import {internalListenImplementation} from './event-helper-listen';


/** @const */
const AMP_MESSAGE_PREFIX = 'amp-';


/** @enum {string} */
export const MessageType = {
  // For amp-ad
  SEND_EMBED_STATE: 'send-embed-state',
  EMBED_STATE: 'embed-state',
  SEND_EMBED_CONTEXT: 'send-embed-context',
  EMBED_CONTEXT: 'embed-context',
  SEND_INTERSECTIONS: 'send-intersections',
  INTERSECTION: 'intersection',
  EMBED_SIZE: 'embed-size',
  EMBED_SIZE_CHANGED: 'embed-size-changed',
  EMBED_SIZE_DENIED: 'embed-size-denied',
  NO_CONTENT: 'no-content',

  // For amp-inabox
  SEND_POSITIONS: 'send-positions',
  POSITION: 'position',
};


/**
 * Listens for the specified event on the element.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {function(!Event)} listener
 * @param {boolean=} opt_capture
 * @return {!UnlistenDef}
 */
export function listen(element, eventType, listener, opt_capture) {
  return internalListenImplementation(
      element, eventType, listener, opt_capture);
}


/**
 * Serialize an AMP post message. Output looks like:
 * 'amp-011481323099490{"type":"position","sentinel":"12345","foo":"bar"}'
 * @param {string} type
 * @param {string} sentinel
 * @param {Object=} data
 * @param {?string=} rtvVersion
 * @returns {string}
 */
export function serializeMessage(type, sentinel, data = {}, rtvVersion = null) {
  // TODO: consider wrap the data in a "data" field. { type, sentinal, data }
  const message = data;
  message.type = type;
  message.sentinel = sentinel;
  return AMP_MESSAGE_PREFIX + (rtvVersion || '') + JSON.stringify(message);
}


/**
 * Deserialize an AMP post message.
 * Returns null if it's not valid AMP message format.
 *
 * @param {*} message
 * @returns {?JSONType}
 */
export function deserializeMessage(message) {
  if (!isAmpMessage(message)) {
    return null;
  }
  const startPos = message.indexOf('{');
  dev().assert(startPos != -1, 'JSON missing in %s', message);
  try {
    return /** @type {!JSONType} */ (JSON.parse(message.substr(startPos)));
  } catch (e) {
    dev().error('MESSAGING', 'Failed to parse message: ' + message, e);
    return null;
  }
}


/**
 *  Returns true if message looks like it is an AMP postMessage
 *  @param {*} message
 *  @return {!boolean}
 */
export function isAmpMessage(message) {
  return (typeof message == 'string' &&
      message.indexOf(AMP_MESSAGE_PREFIX) == 0 &&
      message.indexOf('{') != -1);
}
