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

import { internalListenImplementation } from "./core/dom/event-helper-listen";
import { dict } from "./core/types/object";
import { tryParseJson } from "./core/types/object/json";
import { dev, devAssert } from "./log";

/** @const */
var AMP_MESSAGE_PREFIX = 'amp-';
export var CONSTANTS = {
  responseTypeSuffix: '-result',
  messageIdFieldName: 'messageId',
  payloadFieldName: 'payload',
  contentFieldName: 'content' };


/** @enum {string} */
export var MessageType = {
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
  SIGNAL_INTERACTIVE: 'signal-interactive',

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

  // For amp-iframe
  SEND_CONSENT_DATA: 'send-consent-data',
  CONSENT_DATA: 'consent-data' };


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
  opt_evtListenerOpts);

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
sentinel)


{var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : dict();var rtvVersion = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  // TODO: consider wrap the data in a "data" field. { type, sentinal, data }
  var message = data;
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
  var startPos = message.indexOf('{');
  devAssert(startPos != -1);
  return tryParseJson(message.substr(startPos), function (e) {return (
      dev().error('MESSAGING', 'Failed to parse message: ' + message, e));});

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
  message.indexOf('{') != -1);

}

/** @typedef {{creativeId: string, message: string}} */
export var IframeTransportEvent;
// /Users/mszylkowski/src/amphtml/src/3p-frame-messaging.js