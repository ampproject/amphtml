import {MessageType_Enum} from '#core/3p-frame-messaging';
import {tryParseJson} from '#core/types/object/json';

import {dev, devAssert, user, userAssert} from '#utils/log';

import {IframeMessagingClient} from './iframe-messaging-client';

/** @typedef {import('#core/3p-frame-messaging').IframeTransportEventDef} IframeTransportDef */

/** @private @const {string} */
const TAG_ = 'iframe-transport-client';

/**
 * Receives event messages bound for this cross-domain iframe, from all
 * creatives.
 */
export class IframeTransportClient {
  /** @param {!Window} win */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!{[key: string]: IframeTransportContext}} */
    this.creativeIdToContext_ = {};

    const parsedFrameName = tryParseJson(this.win_.name);

    /** @private {string} */
    this.vendor_ = dev().assertString(
      parsedFrameName['type'],
      'Parent frame must supply vendor name as type in ' +
        this.win_.location.href
    );
    // Note: amp-ad-exit will validate the vendor name before performing
    // variable substitution, so if the vendor name is not a valid one from
    // vendors.js, then its response messages will have no effect.
    devAssert(
      this.vendor_.length,
      'Vendor name cannot be empty in ' + this.win_.location.href
    );

    /** @protected {!IframeMessagingClient} */
    this.iframeMessagingClient_ = new IframeMessagingClient(win, win.parent);
    this.iframeMessagingClient_.setSentinel(
      dev().assertString(
        parsedFrameName['sentinel'],
        'Invalid/missing sentinel on iframe name attribute' + this.win_.name
      )
    );
    this.iframeMessagingClient_.makeRequest(
      MessageType_Enum.SEND_IFRAME_TRANSPORT_EVENTS,
      MessageType_Enum.IFRAME_TRANSPORT_EVENTS,
      (eventData) => {
        const events = /** @type {!Array<IframeTransportEventDef>} */ (
          eventData['events']
        );
        devAssert(
          events,
          'Received malformed events list in ' + this.win_.location.href
        );
        devAssert(
          events.length,
          'Received empty events list in ' + this.win_.location.href
        );
        events.forEach((event) => {
          try {
            devAssert(
              event.creativeId,
              'Received malformed event in ' + this.win_.location.href
            );
            this.contextFor_(event.creativeId).dispatch(event.message);
          } catch (e) {
            user().error(
              TAG_,
              'Exception in callback passed to onAnalyticsEvent',
              e
            );
          }
        });
      }
    );
  }

  /**
   * Retrieves/creates a context object to pass events pertaining to a
   * particular creative.
   * @param {string} creativeId The ID of the creative
   * @return {!IframeTransportContext}
   * @private
   */
  contextFor_(creativeId) {
    return (
      this.creativeIdToContext_[creativeId] ||
      (this.creativeIdToContext_[creativeId] = new IframeTransportContext(
        this.win_,
        this.iframeMessagingClient_,
        creativeId,
        this.vendor_
      ))
    );
  }

  /**
   * Gets the IframeMessagingClient.
   * @return {!IframeMessagingClient}
   * @visibleForTesting
   */
  getIframeMessagingClient() {
    return this.iframeMessagingClient_;
  }
}

/**
 * A context object to be passed along with event data.
 */
export class IframeTransportContext {
  /**
   * @param {!Window} win
   * @param {!IframeMessagingClient} iframeMessagingClient
   * @param {string} creativeId The ID of the creative that the event
   *     pertains to.
   * @param {string} vendor The 3p vendor name
   */
  constructor(win, iframeMessagingClient, creativeId, vendor) {
    /** @private {!IframeMessagingClient} */
    this.iframeMessagingClient_ = iframeMessagingClient;

    /** @private @const {!Object} */
    this.baseMessage_ = {creativeId, vendor};

    /** @private {?function(string)} */
    this.listener_ = null;

    userAssert(
      win['onNewContextInstance'] &&
        typeof win['onNewContextInstance'] == 'function',
      'Must implement onNewContextInstance in ' + win.location.href
    );
    win['onNewContextInstance'](this);
  }

  /**
   * Registers a callback function to be called when an AMP analytics event
   * is received.
   * Note that calling this a second time will result in the first listener
   * being removed - the events will not be sent to both callbacks.
   * @param {function(string)} listener
   */
  onAnalyticsEvent(listener) {
    this.listener_ = listener;
  }

  /**
   * Receives an event from IframeTransportClient, and passes it along to
   * the creative that this context represents.
   * @param {string} event
   */
  dispatch(event) {
    this.listener_ && this.listener_(event);
  }

  /**
   * Sends a response message back to the creative.
   * @param {!{[key: string]: string}} data
   */
  sendResponseToCreative(data) {
    this.iframeMessagingClient_./*OK*/ sendMessage(
      MessageType_Enum.IFRAME_TRANSPORT_RESPONSE,
      /** @type {!JsonObject} */
      ({message: data, ...this.baseMessage_})
    );
  }
}
