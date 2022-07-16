import {devAssert, devAssertString} from '#core/assert';
import {internalListenImplementation} from '#core/dom/event-helper-listen';
import {rethrowAsync} from '#core/error';
import {tryParseJson} from '#core/types/object/json';

/** @const */
const AMP_MESSAGE_PREFIX = 'amp-';
export const CONSTANTS = {
  responseTypeSuffix: '-result',
  messageIdFieldName: 'messageId',
  payloadFieldName: 'payload',
  contentFieldName: 'content',
};

/** @enum {string} */
export const MessageType_Enum = {
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
  CONSENT_DATA: 'consent-data',
};

/**
 * Listens for the specified event on the element.
 * @param {EventTarget} element
 * @param {string} eventType
 * @param {function(Event):void} listener
 * @param {Object=} opt_evtListenerOpts
 * @return {import('#core/types/function/types').UnlistenCallback}
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
export function serializeMessage(type, sentinel, data = {}, rtvVersion = null) {
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

  devAssertString(message);

  const startPos = message.indexOf('{');
  devAssert(startPos != -1, 'JSON missing in %s', message);
  return tryParseJson(message.substr(startPos), (e) => {
    rethrowAsync(
      new Error(`MESSAGING: Failed to parse message: ${message}\n${e.message}`)
    );
  });
}

/**
 *  Returns true if message looks like it is an AMP postMessage
 *  @param {*} message
 *  @return {boolean}
 */
export function isAmpMessage(message) {
  return (
    typeof message == 'string' &&
    message.startsWith(AMP_MESSAGE_PREFIX) &&
    message.indexOf('{') != -1
  );
}

/** @typedef {{creativeId: string, message: string}} IframeTransportEventDef */
// An event, and the transport ID of the amp-analytics tags that
// generated it. For instance if the creative with transport
// ID 2 sends "hi", then an IframeTransportEventDef would look like:
// { creativeId: "2", message: "hi" }
// If the creative with transport ID 2 sent that, and also sent "hello",
// and the creative with transport ID 3 sends "goodbye" then an *array* of 3
// IframeTransportEventDef would be sent to the 3p frame like so:
// [
//   { creativeId: "2", message: "hi" }, // An IframeTransportEventDef
//   { creativeId: "2", message: "hello" }, // Another
//   { creativeId: "3", message: "goodbye" } // And another
// ]
