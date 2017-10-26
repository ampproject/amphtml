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

export const TAG = 'amp-web-push';
export const CONFIG_TAG = TAG;
export const SERVICE_TAG = TAG + '-service';
export const WIDGET_TAG = TAG + '-widget';
export const StorageKeys = {
  NOTIFICATION_PERMISSION: 'amp-web-push-notification-permission',
};

/** @enum {string} */
export const NotificationPermission = {
  GRANTED: 'granted',
  DENIED: 'denied',
  /*
    Note: PushManager.permissionState() returns 'prompt';
    Notification.permission returns 'default'
   */
  DEFAULT: 'default',
};
