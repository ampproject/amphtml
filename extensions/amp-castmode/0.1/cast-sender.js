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

import {dev} from '../../../src/log';

const applicationID = '6134C796';
const channelId = 'urn:x-cast:com.google.amp.cast';


class CastSender {
  constructor(win) {
    /** @const {!Window} */
    this.win = win;

    /** @private @const {!Object<string, function(*)>} */
    this.actions_ = {};
  }

  /**
   * @return {!Promise}
   */
  connect() {
    return dev.assert(null, 'not implemented');
  }

  /**
   * @return {!Promise}
   */
  startSession() {
    return dev.assert(null, 'not implemented');
  }

  /**
   * @param {string} action
   * @param {!JSONObject} payload
   * @return {!Promise}
   */
  sendAction(action, payload) {
    return dev.assert(null, 'not implemented');
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
   * @param {string} action
   * @param {*} payload
   * @protected
   */
  fireAction_(action, payload) {
    const handler = this.actions_[action];
    if (handler) {
      handler(payload);
    } else {
      console.log('[WARN] unknown action: ' + action);
    }
  }
}


export class CastSenderProd extends CastSender {
  constructor(win) {
    super(win);

    /** @private {?chrome.cast.Session} */
    this.session_ = null;
  }

  /** @override */
  connect() {
    return this.ensureApiScript_().then(() => {
      const sessionRequest = new chrome.cast.SessionRequest(applicationID);
      let receiverReadyResolver;
      const receiverReadyPromise = new Promise(resolve => {
        receiverReadyResolver = resolve;
      });
      const apiConfig = new chrome.cast.ApiConfig(sessionRequest,
          this.sessionListener_.bind(this),
          function(e) {
            if (e === chrome.cast.ReceiverAvailability.AVAILABLE) {
              console.log('receiver available', e,
                  e === chrome.cast.ReceiverAvailability.AVAILABLE);
              receiverReadyResolver();
            }
          });
      return new Promise((resolve, reject) => {
        chrome.cast.initialize(apiConfig, resolve, reject);
      }).then(() => receiverReadyPromise);
    });
  }

  /** @override */
  startSession() {
    return new Promise((resolve, reject) => {
      chrome.cast.requestSession(session => {
        console.log('onRequestSessionSuccess: ', session);
        this.session_ = session;
        resolve();
      }, error => {
        console.error('requestSession error: ', error);
        reject(error);
      });
    });
  }

  /** @override */
  sendAction(action, payload) {
    return new Promise((resolve, reject) => {
      const message = {action, payload};
      const messageString = JSON.stringify(message);
      this.session_.sendMessage(channelId, messageString, () => {
        console.log('message sent');
        resolve();
      }, error => {
        console.error('message send failed: ', error);
        reject(error);
      });
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  ensureApiScript_() {
    const src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js';
    let scriptElement = this.win.document.querySelector(`script[src="${src}"]`);
    if (scriptElement) {
      return Promise.resolve();
    }
    // TODO(dvoytenko): WAT!? Remove this craziness!!!
    return new Promise((resolve, reject) => {
      this.win['__onGCastApiAvailable'] = function(loaded, errorInfo) {
        console.log('cast loaded: ', loaded, errorInfo);
        if (loaded) {
          resolve();
        } else {
          reject(errorInfo);
        }
      };
      const script = this.win.document.createElement('script');
      script.onerror = reject;
      script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js';
      this.win.document.head.appendChild(script);
    });
  }

  /**
   * @param {!chrome.cast.Session} e
   * @private
   */
  sessionListener_(e) {
    console.log('sessionListener_: ', e);
    // this.session_ = e;
    // console.log('sessionListener: ', this.session_,
    //     this.session_.media.length);
    // if (session.media.length != 0) {
    //   onMediaDiscovered('onRequestSessionSuccess', session.media[0]);
    // }
  }

  /** @private */
  receiveAction_(messageString) {
    // XXX
    let message;
    try {
      message = JSON.parse(messageString);
    } catch (e) {
      console.error('failed to parse message: ', e, messageString);
    }
    if (message && message.action) {
      this.fireAction_(message.action, message.payload);
    }
  }
}


export class CastSenderDebug extends CastSender {
  constructor(win) {
    super(win);
    this.storage_ = this.win.localStorage;
    this.senderKey_ = channelId + ':sender';
    this.receiverKey_ = channelId + ':receiver';
    this.waitForReceiver_ = null;
    this.win.addEventListener('storage', event => {
      console.log('storage event: ', event);
      if (event.key == this.senderKey_) {
      } else if (event.key == this.receiverKey_) {
        if (this.waitForReceiver_) {
          // Connect receiver.
          this.waitForReceiver_();
          this.waitForReceiver_ = null;
        }
        this.receiveAction_();
      }
    });
  }

  /** @override */
  connect() {
    return new Promise(resolve => {
      this.waitForReceiver_ = resolve;
      this.sendMessage_('discover');
    });
  }

  /**
   * @return {!Promise}
   */
  startSession() {
    // Nothing. Session is always on.
    return Promise.resolve();
  }

  /**
   * @param {string} action
   * @param {!JSONObject} payload
   * @return {!Promise}
   */
  sendAction(action, payload) {
    return this.sendMessage_(action, payload);
  }

  /**
   * @param {string} action
   * @param {!JSONObject} payload
   * @return {!Promise}
   * @private
   */
  sendMessage_(action, payload) {
    console.log('send message', action, payload, 'to', this.senderKey_);
    const message = {action, payload, time: Date.now()};
    const messageString = JSON.stringify(message);
    this.storage_.setItem(this.senderKey_, messageString);
    return Promise.resolve();
  }

  /** @private */
  receiveAction_() {
    const messageString = this.storage_.getItem(this.receiverKey_);
    if (!messageString) {
      return;
    }
    let message;
    try {
      message = JSON.parse(messageString);
    } catch (e) {
      console.error('failed to parse message: ', e, messageString);
    }
    if (message && message.action) {
      this.fireAction_(message.action, message.payload);
    }
  }
}
