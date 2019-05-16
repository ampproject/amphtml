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

import {dev, devAssert} from './log';
import {dict} from './utils/object';
import {internalListenImplementation} from './event-helper-listen';
import {parseJson} from './json';

/** @const */
const AMP_MESSAGE_PREFIX = 'amp-';
export const CONSTANTS = {
  responseTypeSuffix: '-result',
  messageIdFieldName: 'messageId',
  payloadFieldName: 'payload',
  contentFieldName: 'content',
};

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
  GET_HTML: 'get-html',
  GET_CONSENT_STATE: 'get-consent-state',

  // For the frame to be placed in full overlay mode for lightboxes
  FULL_OVERLAY_FRAME: 'full-overlay-frame',
  FULL_OVERLAY_FRAME_RESPONSE: 'full-overlay-frame-response',
  CANCEL_FULL_OVERLAY_FRAME: 'cancel-full-overlay-frame',
  CANCEL_FULL_OVERLAY_FRAME_RESPONSE: 'cancel-full-overlay-frame-response',

  // For amp-inabox
  SEND_POSITIONS: 'send-positions',
  POSITION: 'position',

  // For amp-analytics' iframe-transport
  SEND_IFRAME_TRANSPORT_EVENTS: 'send-iframe-transport-events',
  IFRAME_TRANSPORT_EVENTS: 'iframe-transport-events',
  IFRAME_TRANSPORT_RESPONSE: 'iframe-transport-response',

  // For user-error-in-iframe
  USER_ERROR_IN_IFRAME: 'user-error-in-iframe',
};

/**
 * Listens for the specified event on the element.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {function(!Event)} listener
 * @param {Object=} opt_evtListenerOpts
 * @return {!UnlistenDef}
 */
export function listen(element, eventType, listener, opt_evtListenerOpts) {
  return internalListenImplementation(
    element,
    eventType,
    listener,
    opt_evtListenerOpts
  );
}

/**
 * Serialize an AMP post message. Output looks like:
 * 'amp-011481323099490{"type":"position","sentinel":"12345","foo":"bar"}'
 * @param {string} type
 * @param {string} sentinel
 * @param {JsonObject=} data
 * @param {?string=} rtvVersion
 * @return {string}
 */
export function serializeMessage(
  type,
  sentinel,
  data = dict(),
  rtvVersion = null
) {
  // TODO: consider wrap the data in a "data" field. { type, sentinal, data }
  const message = data;
  message['type'] = type;
  message['sentinel'] = sentinel;
  return AMP_MESSAGE_PREFIX + (rtvVersion || '') + JSON.stringify(message);
}

/**
 * Deserialize an AMP post message.
 * Returns null if it's not valid AMP message format.
 *
 * @param {*} message
 * @return {?JsonObject|undefined}
 */
export function deserializeMessage(message) {
  if (!isAmpMessage(message)) {
    return null;
  }
  const startPos = message.indexOf('{');
  devAssert(startPos != -1, 'JSON missing in %s', message);
  try {
    return parseJson(message.substr(startPos));
  } catch (e) {
    dev().error('MESSAGING', 'Failed to parse message: ' + message, e);
    return null;
  }
}

/**
 *  Returns true if message looks like it is an AMP postMessage
 *  @param {*} message
 *  @return {boolean}
 */
export function isAmpMessage(message) {
  return (
    typeof message == 'string' &&
    message.indexOf(AMP_MESSAGE_PREFIX) == 0 &&
    message.indexOf('{') != -1
  );
}

/** @typedef {{creativeId: string, message: string}} */
export let IframeTransportEvent;
// An event, and the transport ID of the amp-analytics tags that
// generated it. For instance if the creative with transport
// ID 2 sends "hi", then an IframeTransportEvent would look like:
// { creativeId: "2", message: "hi" }
// If the creative with transport ID 2 sent that, and also sent "hello",
// and the creative with transport ID 3 sends "goodbye" then an *array* of 3
// AmpAnalyticsIframeTransportEvent would be sent to the 3p frame like so:
// [
//   { creativeId: "2", message: "hi" }, // An AmpAnalyticsIframeTransportEvent
//   { creativeId: "2", message: "hello" }, // Another
//   { creativeId: "3", message: "goodbye" } // And another
// ]
