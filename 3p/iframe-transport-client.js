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
import {IframeMessagingClient} from './iframe-messaging-client';

/** @private @const {string} */
const TAG_ = 'iframe-transport-client';

/**
 * Receives event messages bound for this cross-domain iframe, from all
 * creatives
 */
export class IframeTransportClient {

  /** @param {!Window} win */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {?function(string,string)} */
    this.listener_ = null;

    /** @protected {!IframeMessagingClient} */
    this.client_ = new IframeMessagingClient(win);
    this.client_.setHostWindow(this.win_.parent);
    this.client_.setSentinel(user().assertString(
        tryParseJson(this.win_.name)['sentinel'],
        'Invalid/missing sentinel on iframe name attribute' + this.win_.name));
    this.client_.makeRequest(
        MessageType.SEND_IFRAME_TRANSPORT_EVENTS,
        MessageType.IFRAME_TRANSPORT_EVENTS,
        eventData => {
          const events =
              /**
               * @type
               * {!Array<../src/3p-frame-messaging.IframeTransportEvent>}
               */
              (eventData['events']);
          user().assert(events,
              'Received malformed events list in ' + this.win_.location.href);
          dev().assert(events.length,
              'Received empty events list in ' + this.win_.location.href);
          user().assert(this.listener_,
              'Must call onAnalyticsEvent in ' + this.win_.location.href);
          events.forEach(event => {
            try {
              this.listener_ &&
                  this.listener_(event.message, event.transportId);
            } catch (e) {
              user().error(TAG_,
                  'Exception in callback passed to onAnalyticsEvent: ' +
                  e.message);
            }
          });
        });
  }

  /**
   * Registers a callback function to be called when an AMP analytics event
   * is received.
   * Note that calling this a second time will result in the first listener
   * being removed - the events will not be sent to both callbacks.
   * @param {function(string,string)} callback
   */
  onAnalyticsEvent(callback) {
    this.listener_ = callback;
  }

  /**
   * Gets the IframeMessagingClient
   * @returns {!IframeMessagingClient}
   * @VisibleForTesting
   */
  getClient() {
    return this.client_;
  }
}
