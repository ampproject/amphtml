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

import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {parseQueryString, tryDecodeUriComponent} from '#core/types/string/url';

import {NotificationPermission, StorageKeys} from './vars';
import {WindowMessenger} from './window-messenger';

import {getMode} from '../../../src/mode';
import {parseUrlDeprecated} from '../../../src/url';

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
    return !!this.window_.opener && this.window_.opener !== this.window_;
  }

  /**
   * Wraps the browser Notification API requestPermission() in a promise.
   * @return {!Promise<string>}
   */
  requestNotificationPermission() {
    return new Promise((resolve, reject) => {
      try {
        this.window_.Notification.requestPermission((permission) =>
          resolve(permission)
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Requests notification permissions and reports the result back to the AMP
   *
   * page.
   *
   * If this dialog was redirected instead of opened as a pop up, the page is
   * redirected back.
   *
   * A DOM section with ID preload is visible (defaults to a spinning circle)
   * while this script is downloading and running. The preload section is then
   * hidden and the postload section is unhidden.
   */
  run() {
    this.onCloseIconClick_();
    this.storeNotificationPermission_();
    this.showTargetPermissionSection_();
    this.showPostloadSection_();
    if (
      this.window_.Notification.permission !== NotificationPermission.DENIED
    ) {
      this.onPermissionDefaultOrGranted_();
    } else {
      this.onPermissionDenied_();
    }
  }

  /** @private */
  onCloseIconClick_() {
    const closeIcon = this.window_.document.querySelector('#close');

    if (closeIcon) {
      closeIcon.addEventListener('click', () => {
        this.closeDialog();
      });
    }
  }

  /**
   * Closes the popup or redirects the dialog back to the AMP page.
   *
   * @public
   */
  closeDialog() {
    if (this.isCurrentDialogPopup()) {
      this.window_.close();
    } else {
      const winLocation = this.window_.fakeLocation || this.window_.location;
      const queryParams = parseQueryString(winLocation.search);
      if (!queryParams['return']) {
        throw new Error('Missing required parameter.');
      }
      const redirectLocation = tryDecodeUriComponent(queryParams['return']);
      this.redirectToUrl(redirectLocation);
    }
  }

  /** @private */
  onPermissionDenied_() {
    navigator.permissions
      .query({name: 'notifications'})
      .then((permissionStatus) => {
        permissionStatus.onchange = () => {
          this.storeNotificationPermission_();
          switch (this.window_.Notification.permission) {
            case NotificationPermission.DEFAULT:
            case NotificationPermission.GRANTED:
              this.onPermissionDefaultOrGranted_();
              break;
          }
        };
      });
  }

  /**
   * Stores the notification permission in local storage for the helper frame to
   * access later.
   * @private
   */
  storeNotificationPermission_() {
    this.window_.localStorage.setItem(
      StorageKeys.NOTIFICATION_PERMISSION,
      this.window_.Notification.permission
    );
  }

  /** @private */
  showTargetPermissionSection_() {
    // Hide all permission sections first
    const allSections = this.window_.document.querySelectorAll('[permission]');
    for (let i = 0; i < allSections.length; i++) {
      const section = allSections[i];
      this.setDomElementVisibility_(section, false);
    }

    // Show the section that matches the current permission
    const section = this.window_.document.querySelector(
      `[permission=${escapeCssSelectorIdent(
        this.window_.Notification.permission
      )}]`
    );

    if (section) {
      this.setDomElementVisibility_(section, true);
    }
  }

  /** @private */
  showPostloadSection_() {
    // Hide all permission sections first
    const preloadSection = this.window_.document.querySelector('#preload');
    const postloadSection = this.window_.document.querySelector('#postload');

    if (preloadSection && postloadSection) {
      this.setDomElementVisibility_(preloadSection, false);
      this.setDomElementVisibility_(postloadSection, true);
    }
  }

  /**
   * Toggles a predefined visiblity class name on the specified DOM element.
   *
   * @param {HtmlElement} domElement
   * @param {boolean} isVisible
   * @private
   *
   */
  setDomElementVisibility_(domElement, isVisible) {
    if (!domElement) {
      return;
    }

    const invisibilityCssClassName = 'invisible';

    if (isVisible) {
      domElement.classList.remove(invisibilityCssClassName);
    } else {
      domElement.classList.add(invisibilityCssClassName);
    }
  }

  /**
   * @private
   * @return {*} TODO(#23582): Specify return type
   */
  onPermissionDefaultOrGranted_() {
    // Prompt for permissions
    return this.requestNotificationPermission().then((permission) => {
      this.storeNotificationPermission_();
      if (this.isCurrentDialogPopup()) {
        this.ampMessenger_.connect(opener, '*');

        return this.ampMessenger_
          .send(
            WindowMessenger.Topics.NOTIFICATION_PERMISSION_STATE,
            permission
          )
          .then((result) => {
            const message = result[0];
            if (message && message.closeFrame) {
              this.closeDialog();
            }
          });
      } else {
        this.closeDialog();
      }
    });
  }

  /**
   * Redirects the top-level frame to another URL.
   *
   * This is wrapped as a method for testing purposes, because window.location
   * cannot be mocked.
   * @param {string} url
   */
  redirectToUrl(url) {
    const parsedUrl = parseUrlDeprecated(url);
    if (
      parsedUrl &&
      (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:')
    ) {
      this.window_.location.href = url;
    }
  }
}

if (!getMode().test) {
  window._ampWebPushPermissionDialog = new AmpWebPushPermissionDialog({
    debug: false,
  });
  window._ampWebPushPermissionDialog.run();
}
