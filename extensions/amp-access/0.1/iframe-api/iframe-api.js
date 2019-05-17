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
 * @fileoverview The iframe API for access.
 *
 * Notice! As much as possible, keep this module dependency-free.
 */

import {AccessController} from './access-controller';
import {Messenger} from './messenger';

/**
 * Connects to the parent AMP document and executes authorization, pingback,
 * and other access features.
 */
export class AmpAccessIframeApi {
  /**
   * @param {!AccessController} controller
   * @param {!Window=} opt_win
   */
  constructor(controller, opt_win) {
    if (!controller) {
      throw new Error('controller must be specified');
    }
    /** @const @private {!AccessController} */
    this.controller_ = controller;

    /** @const @private {!Window} */
    this.win_ = opt_win || window;

    /** @private {!Window} */
    this.target_ = this.win_.parent;

    /** @private @const {!Messenger} */
    this.messenger_ = new Messenger(
      this.win_,
      this.target_,
      /* targetOrigin */ null
    );

    /** @private {?Object} */
    this.config_ = null;

    /** @private {?string} */
    this.protocol_ = null;

    /** @private {?function()} */
    this.connectedResolver_ = null;

    /** @private @const {!Promise} */
    this.connectedPromise_ = new Promise(resolve => {
      this.connectedResolver_ = resolve;
    });
  }

  /**
   */
  connect() {
    this.messenger_.connect(this.handleCommand_.bind(this));
    this.messenger_.sendCommand('connect');
    return this.connectedPromise_;
  }

  /**
   */
  disconnect() {
    this.messenger_.disconnect();
  }

  /**
   * @param {string} cmd
   * @param {?Object} payload
   * @return {*}
   * @private
   */
  handleCommand_(cmd, payload) {
    if (cmd == 'start') {
      // Response to "connect" command.
      this.config_ = payload['config'];
      this.protocol_ = payload['protocol'];
      const promise = new Promise(resolve => {
        resolve(
          this.controller_.connect(
            this.messenger_.getTargetOrigin(),
            this.protocol_,
            this.config_
          )
        );
      });
      this.connectedResolver_(promise);
      return promise;
    }
    if (cmd == 'close') {
      this.disconnect();
      return;
    }
    if (cmd == 'authorize') {
      return new Promise(resolve => {
        resolve(this.controller_.authorize());
      });
    }
    if (cmd == 'pingback') {
      if (!this.controller_.pingback) {
        return null;
      }
      return new Promise(resolve => {
        resolve(this.controller_.pingback());
      }).then(() => {});
    }
  }
}

/** @package Visible for testing. */
export function getAccessControllerForTesting() {
  return AccessController;
}
