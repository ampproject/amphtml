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
import {getData} from '../src/event-helper';

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

    /** @const {string} */
    this.sentinel_ = user().assertString(
        tryParseJson(this.win_.name)['sentinel'],
        'Invalid/missing sentinel on iframe name attribute' + this.win_.name);
    if (!this.sentinel_) {
      return;
    }

    /**
     * Multiple creatives on a page may wish to use the same type of
     * amp-analytics tag. This object provides a mapping between the
     * IDs which identify which amp-analytics tag a message is to/from,
     * with each ID's corresponding CreativeEventRouter,
     * which is an object that handles messages to/from a particular creative.
     * @private {!Object<string, !CreativeEventRouter>}
     */
    this.creativeEventRouters_ = {};

    this.win_.addEventListener('message', event => {
      const messageContainer = this.extractMessage_(event);
      if (this.sentinel_ != messageContainer['sentinel']) {
        return;
      }
      user().assert(messageContainer['type'],
          'Received message with missing type in ' + this.win_.location.href);
      user().assert(messageContainer['events'],
          'Received empty message in ' + this.win_.location.href);
      user().assert(
          messageContainer['type'] == IFRAME_TRANSPORT_EVENTS_TYPE,
          'Received unrecognized message type ' + messageContainer['type'] +
          ' in ' + this.win_.location.href);
      this.processEventsMessage_(
          /**
           * @type {!Array<../src/iframe-transport-common.IframeTransportEvent>}
           */
          (messageContainer['events']));
    }, false);

    this.subscribeTo(IFRAME_TRANSPORT_EVENTS_TYPE);
  }

  /**
   * Sends a message to the parent frame, requesting to subscribe to a
   * particular message type
   * @param messageType The type of message to subscribe to
   * @VisibleForTesting
   */
  subscribeTo(messageType) {
    this.win_.parent./*OK*/postMessage(/** @type {JsonObject} */ ({
      sentinel: this.sentinel_,
      type: messageType,
    }), '*');
  }

  /**
   * Handle receipt of a message indicating that creative(s) have sent
   * event(s) to this frame
   * @param {!Array<!../src/iframe-transport-common.IframeTransportEvent>}
   * events An array of events
   * @private
   */
  processEventsMessage_(events) {
    user().assert(events && events.length,
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
              new CreativeEventRouter(
                  this.win_, this.sentinel_, event.transportId);
          try {
            this.win_.onNewAmpAnalyticsInstance(
                this.creativeEventRouters_[event.transportId]);
          } catch (e) {
            user().error(TAG_, 'Caught exception in' +
              ' onNewAmpAnalyticsInstance: ' + e.message);
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
  }

  /**
   * Test method to ensure sentinel set correctly
   * @returns {string}
   * @VisibleForTesting
   */
  getSentinel() {
    return this.sentinel_;
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
   * Takes the raw postMessage event, and extracts from it the actual data
   * payload
   * @param event
   * @returns {JsonObject}
   * @private
   */
  extractMessage_(event) {
    user().assert(event, 'Received null event in ' + this.win_.name);
    const data = String(getData(event));
    user().assert(data, 'Received empty event in ' + this.win_.name);
    let startIndex;
    user().assert((startIndex = data.indexOf('-') + 1) > 0,
        'Received truncated events message in ' + this.win_.name);
    return tryParseJson(data.substr(startIndex)) || null;
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
   * @param {!string} sentinel The communication sentinel of this iframe
   * @param {!string} transportId The ID of the creative to route messages
   * to/from
   */
  constructor(win, sentinel, transportId) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!string} */
    this.sentinel_ = sentinel;

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
        ' configured. Sentinel=' + this.sentinel_ + ', TransportID=' +
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

