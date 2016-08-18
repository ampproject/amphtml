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

import {log} from './cast-log';


const applicationID = '6134C796';
const channelId = 'urn:x-cast:com.google.amp.cast';


class CastChannel {
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {!Object<string, function(*)>} */
    this.actions_ = {};

    /** @private @const {function()} */
    this.disconnectedHandler_ = null;
  }

  /**
   * @param {string} action
   * @param {function(*)} handler
   */
  onAction(action, handler) {
    if (this.actions_[action]) {
      throw new Error('duplicate action: ', action);
    }
    this.actions_[action] = handler;
  }

  /**
   * @param {function()} handler
   */
  onDisconnected(handler) {
    this.disconnectedHandler_ = handler;
  }

  /**
   * @param {string} action
   * @param {*} payload
   */
  sendAction(action, payload) {}

  /**
   * @param {string} action
   * @param {*} payload
   * @protected
   */
  fireAction_(action, payload) {
    const handler = this.actions_[action];
    if (handler) {
      handler(payload);
    } else {
      log('[WARN] unknown action: ' + action);
    }
  }

  /**
   * @protected
   */
  fireDisconnected_() {
    if (this.disconnectedHandler_) {
      this.disconnectedHandler_();
    }
  }
}


export class CastChannelDebug extends CastChannel {
  constructor(win) {
    super(win);

    this.storage_ = this.win.localStorage;
    this.senderKey_ = channelId + ':sender';
    this.receiverKey_ = channelId + ':receiver';
    log('listening');
    this.win.addEventListener('storage', event => {
      log('storage event: ' + event);
      if (event.key == this.senderKey_) {
        this.receiveMessage_(event.newValue);
      } else if (event.key == this.receiverKey_) {
      }
    });
  }

  /** @override */
  sendAction(action, payload) {
    this.sendMessage_(action, payload);
  }

  /**
   * @param {string} messsageString
   * @private
   */
  receiveMessage_(messageString) {
    log('received message: ' + messageString);
    if (!messageString) {
      return;
    }

    const message = JSON.parse(messageString);
    if (message.action) {
      this.processAction_(message.action, message.payload);
    }
  }

  /**
   * @param {string} action
   * @param {!JSONObject} payload
   * @return {!Promise}
   * @private
   */
  sendMessage_(action, payload) {
    log('send message: ' + action);
    const message = {action, payload, time: Date.now()};
    const messageString = JSON.stringify(message);
    this.storage_.setItem(this.receiverKey_, messageString);
    return Promise.resolve();
  }

  /**
   * @param {string} action
   * @param {string} payload
   * @private
   */
  processAction_(action, payload) {
    log('action: ' + action);
    if (action == 'discover') {
      this.sendMessage_('discovered');
    } else {
      this.fireAction_(action, payload);
    }
  }
}


export class CastChannelProd extends CastChannel {
  constructor(win) {
    super(win);

    cast.receiver.logger.setLevelValue(0);

    /** @private @const {!cast.receiver.CastReceiverManager} */
    this.manager_ = cast.receiver.CastReceiverManager.getInstance();

    this.manager_.onReady = event => {
      log('onReady');
      this.manager_.setApplicationState("Application status is ready...");
    };
    this.manager_.onSenderConnected = event => {
      log('onSenderConnected: ' + JSON.stringify(event.data));
    };
    this.manager_.onSenderDisconnected = event => {
      log('onSenderDisconnected: ' + JSON.stringify(event.data));
      if (this.manager_.getSenders().length == 0) {
        this.fireDisconnected_();
      }
    };
    this.manager_.onSystemVolumeChanged = event => {
      log('onSystemVolumeChanged: ' + event.data.level + ' ' + event.data.muted);
    };

    /** @private @const {!cast.receiver.CastMessageBus} */
    this.messageBus_ = this.manager_.getCastMessageBus(channelId);

    this.messageBus_.onMessage = event => {
      const message = JSON.parse(event.data);
      log('onMessage: ' + JSON.stringify(message));
      if (message.action) {
        this.fireAction_(message.action, message.payload);
      }
    }

    this.manager_.start({statusText: "Application is starting"});
    log('starting...');
  }

  /** @override */
  sendAction(action, payload) {
    const message = {action, payload, time: Date.now()};
    const messageString = JSON.stringify(message);
    log('send message: ' + action + ' -- ' + messageString);
    this.messageBus_.broadcast(messageString);
    return Promise.resolve();
  }
}
