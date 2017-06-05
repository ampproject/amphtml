/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {Observable} from '../src/observable';
import {map} from '../src/utils/object';
import {
  listen,
  serializeMessage,
  deserializeMessage,
} from '../src/3p-frame-messaging';
import {getData} from '../src/event-helper';
import {getMode} from '../src/mode';
import {dev} from '../src/log';

export class IframeMessagingClient {

  /**
   *  @param {!Window} win A window object.
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {?string} */
    this.rtvVersion_ = getMode().rtvVersion || null;
    /** @private {!Window|Object} */
    this.hostWindow_ = win.parent;
    /** @private {?string} */
    this.sentinel_ = null;
    /**
     * Map messageType keys to observables to be fired when messages of that
     * type are received.
     * @private {!Object}
     */
    this.observableFor_ = map();
    this.setupEventListener_();
  }

  /**
   * Make an event listening request to the host window.
   *
   * @param {string} requestType The type of the request message.
   * @param {string} responseType The type of the response message.
   * @param {function(Object)} callback The callback function to call
   *   when a message with type responseType is received.
   */
  makeRequest(requestType, responseType, callback) {
    const unlisten = this.registerCallback(responseType, callback);
    this.sendMessage(requestType);
    return unlisten;
  }

  /**
   * Register callback function for message with type messageType.
   *   As it stands right now, only one callback can exist at a time.
   *   All future calls will overwrite any previously registered
   *   callbacks.
   * @param {string} messageType The type of the message.
   * @param {function(?JsonObject)} callback The callback function to call
   *   when a message with type messageType is received.
   */
  registerCallback(messageType, callback) {
    // NOTE : no validation done here. any callback can be register
    // for any callback, and then if that message is received, this
    // class *will execute* that callback
    return this.getOrCreateObservableFor_(messageType).add(callback);
  }

  /**
   *  Send a postMessage to Host Window
   *  @param {string} type The type of message to send.
   *  @param {JsonObject=} opt_payload The payload of message to send.
   */
  sendMessage(type, opt_payload) {
    this.hostWindow_.postMessage/*OK*/(
        serializeMessage(
            type, dev().assertString(this.sentinel_),
            opt_payload, this.rtvVersion_),
        '*');
  }

  /**
   * Sets up event listener for post messages of the desired type.
   *   The actual implementation only uses a single event listener for all of
   *   the different messages, and simply diverts the message to be handled
   *   by different callbacks.
   *   To add new messages to listen for, call registerCallback with the
   *   messageType to listen for, and the callback function.
   * @private
   */
  setupEventListener_() {
    listen(this.win_, 'message', event => {
      try {
        if (this.hostWindow_ && !this.hostWindow_.postMessage &&
          this.hostWindow_.tagName == 'IFRAME' &&
          this.hostWindow_.contentWindow) {
          // this.hostWindow_ can now be set to an iframe, after it has been
          // created but before it has finished loading. If we've gotten a
          // message from that iframe, then it must exist, so its
          // contentWindow is now non-null.
          this.hostWindow_ = this.hostWindow_.contentWindow;
        }
      } catch (e) {
      }

      // Does it look a message from AMP?
      if (event.source != this.hostWindow_) {
        return;
      }

      const message = deserializeMessage(getData(event));
      if (!message || message['sentinel'] != this.sentinel_) {
        return;
      }

      this.fireObservable_(message['type'], message);
    });
  }

  /**
   * @param {!Window} win
   */
  setHostWindow(win) {
    this.hostWindow_ = win;
  }

  /**
   * @param {string} sentinel
   */
  setSentinel(sentinel) {
    this.sentinel_ = sentinel;
  }

  /**
   * @param {string} messageType
   * @return {!Observable<?JsonObject>}
   */
  getOrCreateObservableFor_(messageType) {
    if (!(messageType in this.observableFor_)) {
      this.observableFor_[messageType] = new Observable();
    }
    return this.observableFor_[messageType];
  }

  /**
   * @param {string} messageType
   * @param {Object} message
   */
  fireObservable_(messageType, message) {
    if (messageType in this.observableFor_) {
      this.observableFor_[messageType].fire(message);
    }
  }
}
