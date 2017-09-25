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

import {tryParseJson} from '../src/json';
import {dev, user} from '../src/log';
import {MessageType} from '../src/3p-frame-messaging';
import {dict} from '../src/utils/object';
import {IframeMessagingClient} from './iframe-messaging-client';

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

    /** @private {Object<string,IframeTransportContext>} */
    this.creativeIdToContext_ = {};

    /** @protected {!IframeMessagingClient} */
    this.iframeMessagingClient_ = new IframeMessagingClient(win);
    this.iframeMessagingClient_.setHostWindow(this.win_.parent);
    this.iframeMessagingClient_.setSentinel(dev().assertString(
        tryParseJson(this.win_.name)['sentinel'],
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
          user().assert(events,
              'Received malformed events list in ' + this.win_.location.href);
          dev().assert(events.length,
              'Received empty events list in ' + this.win_.location.href);
          events.forEach(event => {
            try {
              user().assert(event.creativeId,
                  'Received malformed event in ' + this.win_.location.href);
              const context = this.contextFor_(event.creativeId);
              context.dispatch(event.message);
            } catch (e) {
              user().error(TAG_,
                  'Exception in callback passed to onAnalyticsEvent: ' +
              e.message);
            }
          });
        });
  }

  /**
   * Retrieves/creates a context object to pass events pertaining to a
   * particular creative.
   * @param {string} creativeId The ID of the creative
   * @returns {IframeTransportContext}
   * @private
   */
  contextFor_(creativeId) {
    const vendor = tryParseJson(this.win_.name)['type'];
    return this.creativeIdToContext_[creativeId] ||
        (this.creativeIdToContext_[creativeId] =
            new IframeTransportContext(this.win_, this.iframeMessagingClient_,
            creativeId, vendor));
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
class IframeTransportContext {
  /**
   * @param {string} creativeId The ID of the creative that the event
   *     pertains to.
   * @param {string} vendor The 3p vendor name
   */
  constructor(win, iframeMessagingClient, creativeId, vendor) {
    this.win_ = win;
    this.iframeMessagingClient_ = iframeMessagingClient;
    this.creativeId_ = creativeId;
    this.vendor_ = vendor;

    /** @private {?function(string)} */
    this.listener_ = null;

    user().assert(this.win_.onNewAmpAnalyticsInstance,
        'Must implement onNewAmpAnalyticsInstance in ' +
        this.win_.location.href);
    this.win_.onNewAmpAnalyticsInstance(this);
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
   * @param {!Object<string,string>} response
   */
  sendResponseToCreative(response) {
    this.iframeMessagingClient_./*OK*/sendMessage(
        MessageType.IFRAME_TRANSPORT_RESPONSE,
        dict({
          'creativeId': this.creativeId_,
          'vendor': this.vendor_,
          'message': response,
        }));
  }
}
