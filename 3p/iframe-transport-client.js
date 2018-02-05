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

import {IframeMessagingClient} from './iframe-messaging-client';
import {MessageType} from '../src/3p-frame-messaging';
import {dev, user} from '../src/log';
import {tryParseJson} from '../src/json';

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

    /** @private {!Object<string, IframeTransportContext>} */
    this.creativeIdToContext_ = {};

    const parsedFrameName = tryParseJson(this.win_.name);

    /** @private {string} */
    this.vendor_ = dev().assertString(parsedFrameName['type'],
        'Parent frame must supply vendor name as type in ' +
        this.win_.location.href);
    // Note: amp-ad-exit will validate the vendor name before performing
    // variable substitution, so if the vendor name is not a valid one from
    // vendors.js, then its response messages will have no effect.
    dev().assert(this.vendor_.length, 'Vendor name cannot be empty in ' +
        this.win_.location.href);

    /** @protected {!IframeMessagingClient} */
    this.iframeMessagingClient_ = new IframeMessagingClient(win);
    this.iframeMessagingClient_.setHostWindow(this.win_.parent);
    this.iframeMessagingClient_.setSentinel(dev().assertString(
        parsedFrameName['sentinel'],
        'Invalid/missing sentinel on iframe name attribute' + this.win_.name));
    this.iframeMessagingClient_.makeRequest(
        MessageType.SEND_IFRAME_TRANSPORT_EVENTS,
        MessageType.IFRAME_TRANSPORT_EVENTS,
        eventData => {
          const events =
          /**
           * @type
           *   {!Array<../src/3p-frame-messaging.IframeTransportEvent>}
           */
          (eventData['events']);
          dev().assert(events,
              'Received malformed events list in ' + this.win_.location.href);
          dev().assert(events.length,
              'Received empty events list in ' + this.win_.location.href);
          events.forEach(event => {
            try {
              dev().assert(event.creativeId,
                  'Received malformed event in ' + this.win_.location.href);
              this.contextFor_(event.creativeId).dispatch(event.message);
            } catch (e) {
              user().error(TAG_,
                  'Exception in callback passed to onAnalyticsEvent',
                  e);
            }
          });
        });
  }

  /**
   * Retrieves/creates a context object to pass events pertaining to a
   * particular creative.
   * @param {string} creativeId The ID of the creative
   * @returns {!IframeTransportContext}
   * @private
   */
  contextFor_(creativeId) {
    return this.creativeIdToContext_[creativeId] ||
        (this.creativeIdToContext_[creativeId] =
            new IframeTransportContext(this.win_, this.iframeMessagingClient_,
              creativeId, this.vendor_));
  }

  /**
   * Gets the IframeMessagingClient.
   * @returns {!IframeMessagingClient}
   * @VisibleForTesting
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

    user().assert(win['onNewContextInstance'] &&
        typeof win['onNewContextInstance'] == 'function',
    'Must implement onNewContextInstance in ' + win.location.href);
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
   * @param {!Object<string, string>} data
   */
  sendResponseToCreative(data) {
    this.iframeMessagingClient_./*OK*/sendMessage(
        MessageType.IFRAME_TRANSPORT_RESPONSE,
        /** @type {!JsonObject} */
        (Object.assign({message: data}, this.baseMessage_)));
  }
}
