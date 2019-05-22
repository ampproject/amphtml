/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview The messaging protocol is intentionally kept close to
 * Web Activities (https://github.com/google/web-activities). We may switch
 * the exact WA version at some in the future.
 *
 * Notice! As much as possible, keep this module dependency-free.
 */

const SENTINEL = '__AMP__';

export class Messenger {
  /**
   * @param {!Window} win
   * @param {!Window|function():?Window} targetOrCallback
   * @param {?string} targetOrigin
   */
  constructor(win, targetOrCallback, targetOrigin) {
    /** @private @const {!Window} */
    this.win_ = win;
    /** @private @const {!Window|function():?Window} */
    this.targetOrCallback_ = targetOrCallback;

    /**
     * May start as unknown (`null`) until received in the first message.
     * @private {?string}
     */
    this.targetOrigin_ = targetOrigin;

    /** @private {?Window} */
    this.target_ = null;

    /** @private {?function(string, ?Object):*} */
    this.onCommand_ = null;

    /** @private @const */
    this.boundHandleEvent_ = this.handleEvent_.bind(this);

    /** @private {number} */
    this.requestId_ = 0;

    /**
     * @private
     * {!Object<string, {resolve: function(*), promise: !Promise<*>}>}
     */
    this.waiting_ = {};
  }

  /**
   * Connect the port to the host or vice versa.
   * @param {function(string, ?Object):*} onCommand
   */
  connect(onCommand) {
    if (this.onCommand_) {
      throw new Error('already connected');
    }
    this.onCommand_ = onCommand;
    this.win_.addEventListener('message', this.boundHandleEvent_);
  }

  /**
   * Disconnect messenger.
   */
  disconnect() {
    if (this.onCommand_) {
      this.onCommand_ = null;
      this.win_.removeEventListener('message', this.boundHandleEvent_);
    }
  }

  /**
   * Returns whether the messenger has been connected already.
   * @return {boolean}
   */
  isConnected() {
    return this.targetOrigin_ != null;
  }

  /**
   * Returns the messaging target. Only available when connection has been
   * establihsed.
   * @return {!Window}
   */
  getTarget() {
    const target = this.getOptionalTarget_();
    if (!target) {
      throw new Error('not connected');
    }
    return target;
  }

  /**
   * @return {?Window}
   * @private
   */
  getOptionalTarget_() {
    if (this.onCommand_ && !this.target_) {
      if (typeof this.targetOrCallback_ == 'function') {
        this.target_ = this.targetOrCallback_();
      } else {
        this.target_ = /** @type {!Window} */ (this.targetOrCallback_);
      }
    }
    return this.target_;
  }

  /**
   * Returns the messaging origin. Only available when connection has been
   * establihsed.
   * @return {string}
   */
  getTargetOrigin() {
    if (this.targetOrigin_ == null) {
      throw new Error('not connected');
    }
    return this.targetOrigin_;
  }

  /**
   * Sends the specified command from the port to the host or vice versa.
   * @param {string} cmd
   * @param {?Object=} opt_payload
   */
  sendCommand(cmd, opt_payload) {
    this.sendCommand_(/* rsvpId */ undefined, cmd, opt_payload);
  }

  /**
   * Sends the specified command from the port to the host or vice versa.
   * @param {string} cmd
   * @param {?Object=} opt_payload
   * @return {!Promise}
   */
  sendCommandRsvp(cmd, opt_payload) {
    const rsvpId = String(++this.requestId_);
    let resolver = null;
    const promise = new Promise(resolve => {
      resolver = resolve;
    });
    this.waiting_[rsvpId] = {
      promise,
      resolver,
    };
    this.sendCommand_(rsvpId, cmd, opt_payload);
    return promise;
  }

  /**
   * @param {string|undefined} rsvpId
   * @param {string} cmd
   * @param {?Object=} opt_payload
   * @private
   */
  sendCommand_(rsvpId, cmd, opt_payload) {
    const target = this.getTarget();
    // Only "connect" command is allowed to use `targetOrigin == '*'`
    const targetOrigin =
      cmd == 'connect'
        ? this.targetOrigin_ != null
          ? this.targetOrigin_
          : '*'
        : this.getTargetOrigin();
    target./*OK*/ postMessage(
      /** @type {!JsonObject} */ ({
        'sentinel': SENTINEL,
        '_rsvp': rsvpId,
        'cmd': cmd,
        'payload': opt_payload || null,
      }),
      targetOrigin
    );
  }

  /**
   * @param {!Event} e
   * @private
   */
  handleEvent_(e) {
    const event = /** @type {!MessageEvent} */ (e);
    const {data} = event;
    if (!data || data['sentinel'] != SENTINEL) {
      return;
    }
    const origin = /** @type {string} */ (event.origin);
    const cmd = data['cmd'];
    const payload = data['payload'] || null;
    if (this.targetOrigin_ == null && cmd == 'start') {
      this.targetOrigin_ = origin;
    }
    if (this.targetOrigin_ == null && event.source) {
      if (this.getOptionalTarget_() == event.source) {
        this.targetOrigin_ = origin;
      }
    }
    // Notice that event.source may differ from the target because of
    // friendly-iframe intermediaries.
    if (origin != this.targetOrigin_) {
      return;
    }
    const rsvpId = data['_rsvp'];
    const rsvp = !!rsvpId && cmd != 'rsvp';
    const result = this.handleCommand_(rsvpId, cmd, payload);
    if (rsvp) {
      Promise.resolve(result).then(
        result => {
          this.sendCommand_(rsvpId, 'rsvp', {
            'result': result,
          });
        },
        reason => {
          this.sendCommand_(rsvpId, 'rsvp', {
            'error': String(reason),
          });
        }
      );
    }
  }

  /**
   * @param {string|undefined} rsvpId
   * @param {string} cmd
   * @param {?Object} payload
   * @return {*}
   * @private
   */
  handleCommand_(rsvpId, cmd, payload) {
    if (cmd == 'rsvp') {
      const waiting = rsvpId && this.waiting_[rsvpId];
      if (waiting) {
        if ('error' in payload) {
          waiting.resolver(Promise.reject(new Error(payload['error'])));
        } else {
          waiting.resolver(payload['result']);
        }
        delete this.waiting_[rsvpId];
      }
      return;
    }
    return this.onCommand_(cmd, payload);
  }
}
