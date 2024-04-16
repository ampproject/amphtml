import {
  CONSTANTS,
  deserializeMessage,
  listen,
  serializeMessage,
} from '#core/3p-frame-messaging';
import {Observable} from '#core/data-structures/observable';
import {map} from '#core/types/object';

import {getData} from '#utils/event-helper';
import {dev} from '#utils/log';

import {getMode} from '../src/mode';

export class IframeMessagingClient {
  /**
   * @param {!Window} win A window object.
   * @param {Window=} hostWindow The host window to send messages to. If not set
   * then we'll broadcast our messages to all parent windows and choose the
   * first one with a valid response to be the host window.
   */
  constructor(win, hostWindow) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {?string} */
    this.rtvVersion_ = getMode().rtvVersion || null;
    /** @private {?Window} */
    this.hostWindow_ = hostWindow || null;
    /** @private {?string} */
    this.sentinel_ = null;
    /** @type {number} */
    this.nextMessageId_ = 1;
    /**
     * Map messageType keys to observables to be fired when messages of that
     * type are received.
     * @private {!Object}
     */
    this.observableFor_ = map();
    this.setupEventListener_();
  }

  /**
   * Retrieves data from host.
   *
   * @param {string} requestType
   * @param {?Object} payload
   * @param {function(*)} callback
   */
  getData(requestType, payload, callback) {
    const responseType = requestType + CONSTANTS.responseTypeSuffix;
    const messageId = this.nextMessageId_++;
    const unlisten = this.registerCallback(responseType, (result) => {
      if (result[CONSTANTS.messageIdFieldName] === messageId) {
        unlisten();
        callback(result[CONSTANTS.contentFieldName]);
      }
    });
    const data = {};
    data[CONSTANTS.payloadFieldName] = payload;
    data[CONSTANTS.messageIdFieldName] = messageId;
    this.sendMessage(requestType, data);
  }

  /**
   * Make an event listening request.
   *
   * @param {string} requestType The type of the request message.
   * @param {string} responseType The type of the response message.
   * @param {function(JsonObject)} callback The callback function to call
   *   when a message with type responseType is received.
   * @return {function()}
   */
  makeRequest(requestType, responseType, callback) {
    const unlisten = this.registerCallback(responseType, callback);
    this.sendMessage(requestType);
    return unlisten;
  }

  /**
   * Make a one time event listening request.
   * Will unlisten after response is received.
   *
   * @param {string} requestType The type of the request message.
   * @param {string} responseType The type of the response message.
   * @param {function(Object)} callback The callback function to call
   *   when a message with type responseType is received.
   * @return {*} TODO(#23582): Specify return type
   */
  requestOnce(requestType, responseType, callback) {
    const unlisten = this.registerCallback(responseType, (event) => {
      unlisten();
      callback(event);
    });
    this.sendMessage(requestType);
    return unlisten;
  }

  /**
   * Register callback function for message with type messageType.
   * @param {string} messageType The type of the message.
   * @param {function(?JsonObject)} callback The callback function to call
   *   when a message with type messageType is received.
   * @return {function()}
   */
  registerCallback(messageType, callback) {
    // NOTE : no validation done here. any callback can be register
    // for any callback, and then if that message is received, this
    // class *will execute* that callback
    return this.getOrCreateObservableFor_(messageType).add(callback);
  }

  /**
   * Send a postMessage to Host Window, or all parent windows if host window is
   * not set.
   * @param {string} type The type of message to send.
   * @param {JsonObject=} opt_payload The payload of message to send.
   */
  sendMessage(type, opt_payload) {
    const msg = serializeMessage(
      type,
      dev().assertString(this.sentinel_),
      opt_payload,
      this.rtvVersion_
    );

    if (!this.hostWindow_) {
      for (
        let j = 0, hostWin = this.win_;
        j < 10 && hostWin != this.win_.top;
        j++
      ) {
        hostWin = hostWin.parent;
        this.sendMessageInternal_(hostWin, msg);
        j++;
      }
    } else {
      this.sendMessageInternal_(this.hostWindow_, msg);
    }
  }

  /**
   * @param {!Window} win
   * @param {string} msg
   * private
   */
  sendMessageInternal_(win, msg) {
    // opt in the userActivation feature
    // see https://github.com/dtapuska/useractivation
    if (this.isMessageOptionsSupported_(win)) {
      this.postMessageWithUserActivation_(win, msg);
    } else {
      win./*OK*/ postMessage(msg, '*');
    }
  }

  /**
   * @param {!Window} win
   * @param {string} msg
   */
  postMessageWithUserActivation_(win, msg) {
    win./*OK*/ postMessage(msg, {
      'targetOrigin': '*',
      'includeUserActivation': true,
    });
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
    listen(this.win_, 'message', (event) => {
      // If we have set a host window, strictly check that it's from it.
      if (this.hostWindow_ && event.source != this.hostWindow_) {
        return;
      }

      // Does it look like a message from AMP?
      const message = deserializeMessage(getData(event));
      if (!message || message['sentinel'] != this.sentinel_) {
        return;
      }

      // At this point the message is valid; serialize necessary information and
      // set its source as the host window if we don't have it set (aka in
      // broadcast mode).
      message['origin'] = event.origin;

      if (!this.hostWindow_) {
        this.hostWindow_ = event.source;
      }

      this.fireObservable_(message['type'], message);
    });
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
   * @param {object} message
   */
  fireObservable_(messageType, message) {
    if (messageType in this.observableFor_) {
      this.observableFor_[messageType].fire(message);
    }
  }

  /**
   * @param {!Window} win
   * @return {boolean}
   */
  isMessageOptionsSupported_(win) {
    // Learned from https://github.com/dtapuska/useractivation
    return win.postMessage.length == 1;
  }
}
