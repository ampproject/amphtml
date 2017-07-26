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

import './polyfills';
import {tryParseJson} from '../src/json';
import {dev, user, initLogConstructor, setReportError} from '../src/log';
import {IFRAME_TRANSPORT_EVENTS_TYPE} from '../src/iframe-transport-common';
import {IframeMessagingClient} from './iframe-messaging-client';

initLogConstructor();
// TODO(alanorozco): Refactor src/error.reportError so it does not contain big
// transitive dependencies and can be included here.
setReportError(() => {});

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

    /**
     * Multiple creatives on a page may wish to use the same type of
     * amp-analytics tag. This object provides a mapping between the
     * IDs which identify which amp-analytics tag a message is to/from,
     * with each ID's corresponding CreativeEventRouter,
     * which is an object that handles messages to/from a particular creative.
     * @private {!Object<string, !CreativeEventRouter>}
     */
    this.creativeEventRouters_ = {};

    /** @protected {!IframeMessagingClient} */
    this.client_ = new IframeMessagingClient(win);
    this.client_.setHostWindow(this.win_.parent);
    this.client_.setSentinel(dev().assertString(
        tryParseJson(this.win_.name)['sentinel'],
        'Invalid/missing sentinel on iframe name attribute' + this.win_.name));
    this.client_.makeRequest(
        IFRAME_TRANSPORT_EVENTS_TYPE,
        IFRAME_TRANSPORT_EVENTS_TYPE,
        eventData => {
          user().assert(eventData['type'],
              'Received message with missing type in ' +
              this.win_.location.href);
          user().assert(eventData['type'] == IFRAME_TRANSPORT_EVENTS_TYPE,
              'Received unrecognized message type ' + eventData['type'] +
              ' in ' + this.win_.location.href);
          const events =
              /**
               * @type {!Array<../src/iframe-transport-common.IframeTransportEvent>}
               */
              (eventData['events']);
          user().assert(events,
              'Received malformed events list in ' + this.win_.location.href);
          dev().assert(events.length,
              'Received empty events list in ' + this.win_.location.href);
          this.win_.onNewAmpAnalyticsInstance =
              this.win_.onNewAmpAnalyticsInstance || null;
          user().assert(this.win_.onNewAmpAnalyticsInstance,
              'Must implement onNewAmpAnalyticsInstance in ' +
              this.win_.location.href);
          events.forEach(event => {
            try {
              if (!this.creativeEventRouters_[event.transportId]) {
                this.creativeEventRouters_[event.transportId] =
                    new CreativeEventRouter(this.win_, event.transportId);
                try {
                  this.win_.onNewAmpAnalyticsInstance(
                      this.creativeEventRouters_[event.transportId]);
                } catch (e) {
                  user().error(TAG_,
                      'Exception in onNewAmpAnalyticsInstance: ' + e.message);
                  throw e;
                }
              }
              this.creativeEventRouters_[event.transportId]
                  .sendMessageToListener(event.message);
            } catch (e) {
              user().error(TAG_, 'Failed to pass message to event listener: ' +
                  e.message);
            }
          });
        });
  }

  /**
   * Gets the mapping of creative senderId to
   * CreativeEventRouter
   * @returns {!Object.<string, !CreativeEventRouter>}
   * @VisibleForTesting
   */
  getCreativeEventRouters() {
    return this.creativeEventRouters_;
  }

  /**
   * Gets rid of the mapping to CreativeEventRouter
   * @VisibleForTesting
   */
  reset() {
    this.creativeEventRouters_ = {};
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

if (!window.AMP_TEST) {
  try {
    new IframeTransportClient(window);
  } catch (e) {
    user().error(TAG_, 'Failed to construct IframeTransportClient: ' +
      e.message);
  }
}

/**
 * Receives messages bound for this cross-domain iframe, from a particular
 * creative.
 */
export class CreativeEventRouter {
  /**
   * @param {!Window} win The enclosing window object
   * @param {!string} transportId The ID of the creative to route messages
   * to/from
   */
  constructor(win, transportId) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!string} */
    this.transportId_ = transportId;

    /** @private
     * {?function(!Array<!string>)} */
    this.eventListener_ = null;
  }

  /**
   * Registers a callback function to be called when AMP Analytics events occur.
   * There may only be one listener. If another function has previously been
   * registered as a listener, it will no longer receive events.
   * @param {!function(!string)}
   * listener A function that takes an event string, and does something with
   * it.
   */
  registerCreativeEventListener(listener) {
    if (this.eventListener_) {
      dev().warn(TAG_, 'Replacing existing eventListener for ' +
        this.transportId_);
    }
    this.eventListener_ = listener;
  }

  /**
   * Receives message(s) from a creative for the cross-domain iframe
   * and passes them to that iframe's listener, if a listener has been
   * registered
   * @param {!string} message The event message that was received
   */
  sendMessageToListener(message) {
    if (!this.eventListener_) {
      dev().warn(TAG_, 'Attempted to send message when no listener' +
        ' configured. TransportID=' +
        this.transportId_ + '. Be sure to' +
        ' call registerCreativeEventListener() within' +
        ' onNewAmpAnalyticsInstance()!');
      return;
    }
    try {
      this.eventListener_(message);
    } catch (e) {
      user().error(TAG_, 'Caught exception executing listener for ' +
        this.transportId_ + ': ' + e.message);
    }
  }

  /**
   * @returns {!string}
   * @VisibleForTesting
   */
  getTransportId() {
    return this.transportId_;
  }
}

