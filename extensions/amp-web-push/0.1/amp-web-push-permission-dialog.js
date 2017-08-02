/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import {tryDecodeUriComponent, parseQueryString} from '../../../src/url.js';
import {WindowMessenger} from './window-messenger';
import {getMode} from '../../../src/mode';

/** @typedef {{
 *    debug: boolean,
 *    windowContext: (?Window|undefined),
 * }}
 */
export let PermissionDialogOptions;

/**
 * @fileoverview
 * The script for the web push notification permission dialog. This script will
 * eventually live on the publisher's origin. It shows the notification prompt
 * and forwards results to the AMP page.
 */
export class AmpWebPushPermissionDialog {

  /** @param {PermissionDialogOptions} options */
  constructor(options) {
    /**
     * Debug enables verbose logging for this page and the window and worker
     * messengers
     * @private {boolean}
     */
    this.debug_ = options && options.debug;

    /**
     * @private {!Window}
     */
    this.window_ = options.windowContext || window;

    /**
     * For communication between the AMP page and this helper iframe
     * @private {./window-messenger.WindowMessenger}
     */
    this.ampMessenger_ = new WindowMessenger({
      debug: this.debug_,
      windowContext: this.window_,
    });
  }

  /**
   * Returns true if this permission dialog is loaded as a popup; returns false
   * if the permission dialog was redirected to its current location.
   * @return {boolean}
   */
  isCurrentDialogPopup() {
    return !!this.window_.opener &&
      this.window_.opener !== this.window_;
  }

  /**
   * Wraps the browser Notification API requestPermission() in a promise.
   * @return {!Promise<string>}
   */
  requestNotificationPermission() {
    return new Promise((resolve, reject) => {
      try {
        this.window_.Notification.requestPermission(
            permission => resolve(permission));
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Requests notification permissions and reports the result back to the AMP
   * page.
   *
   * If this dialog was redirected instead of opened as a pop up, the page is
   * redirected back.
   */
  run() {
    if (this.isCurrentDialogPopup()) {
      this.ampMessenger_.connect(opener, '*');

      return this.requestNotificationPermission().then(permission => {
        return this.ampMessenger_.send(
            WindowMessenger.Topics.NOTIFICATION_PERMISSION_STATE,
            permission
        );
      }).then(result => {
        const message = result[0];
        if (message && message.closeFrame) {
          this.window_.close();
        }
      });
    } else {
      const winLocation = this.window_.fakeLocation || this.window_.location;
      const queryParams = parseQueryString(winLocation.search);
      if (!queryParams['return']) {
        throw new Error(
          'Expecting return URL query parameter to redirect back.');
      }
      const redirectLocation = tryDecodeUriComponent(queryParams['return']);
      return this.requestNotificationPermission().then(() => {
        this.redirectToUrl(redirectLocation);
      });
    }
  }

  /**
   * Redirects the top-level frame to another URL.
   *
   * This is wrapped as a method for testing purposes, because window.location
   * cannot be mocked.
   * @param {string} url
   */
  redirectToUrl(url) {
    this.window_.location.href = url;
  }
}

if (!getMode().test) {
  window._ampWebPushPermissionDialog = new AmpWebPushPermissionDialog({
    debug: false,
  });
  window._ampWebPushPermissionDialog.run();
}
