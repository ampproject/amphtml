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

import {TAG} from './vars';
import {WindowMessenger} from './window-messenger';
import {getMode} from '../../../src/mode';
import {parseQueryString} from '../../../src/url.js';
import {user} from '../../../src/log';

/**
 * @typedef {{
 *   debug: boolean,
 *   windowContext: (?Window|undefined),
 * }}
 */
export let HelperFrameOptions;

/**
 * @typedef {{
 *    topic: string,
 *    payload: ?,
 * }}
 */
export let ServiceWorkerMessage;

/**
 * @typedef {{
 *    workerUrl: string,
 *    registrationOptions: ?{scope: string},
 * }}
 */
export let ServiceWorkerRegistrationMessage;

/**
 * @typedef {{
 *    isQueryTopicSupported: null,
 * }}
 */
export let NotificationPermissionStateMessage;

/**
 * @typedef {{
 *    key: string,
 * }}
 */
export let StorageGetMessage;

/**
  * @fileoverview
  * Loaded as an invisible iframe on the AMP page, and serving a page on the
  * canonical origin, this iframe enables same-origin access to push
  * subscription, notification permission, and IndexedDb data stored on the
  * canonical origin to query the user's permission state, register service
  * workers, and enable communication with the registered service worker.
  */
export class AmpWebPushHelperFrame {
  /** @param {!HelperFrameOptions} options */
  constructor(options) {
    /**
     * Debug enables verbose logging for this page and the window and worker
     * messengers
     * @type {boolean}
     * @private
     */
    this.debug_ = options && options.debug;

    /**
     * @type {!Window}
     * @private
     */
    this.window_ = options.windowContext || window;

    /**
     * For communication between the AMP page and this helper iframe
     * @type {!./window-messenger.WindowMessenger}
     * @private
     */
    this.ampMessenger_ = new WindowMessenger({
      debug: this.debug_,
      windowContext: this.window_,
    });

    /**
     * Describes the messages we allow through from the service worker. Whenever
     * the AMP page sends a 'query service worker' message with a topic string,
     * we add the topic to the allowed list, and wait for the service worker to
     * reply. Once we get a reply, we remove it from the allowed topics.
     *
     * @type {!Object}
     * @private
     */
    this.allowedWorkerMessageTopics_ = {};
  }

  /**
   * Ensures replies to the AMP page messenger have a consistent payload format.
   *
   * @param {function(?, function())} replyToFrameFunction
   * @param {boolean} wasSuccessful
   * @param {?} errorPayload
   * @param {?} successPayload
   * @private
   */
  replyToFrameWithPayload_(
    replyToFrameFunction,
    wasSuccessful,
    errorPayload,
    successPayload
  ) {
    replyToFrameFunction({
      success: wasSuccessful,
      error: wasSuccessful ? undefined : errorPayload,
      result: wasSuccessful ? successPayload : undefined,
    });
  }

  /**
   * @param {NotificationPermissionStateMessage} message
   * @param {function(?, function())} replyToFrame
   * @private
   */
  onAmpPageMessageReceivedNotificationPermissionState_(message, replyToFrame) {
    /*
      Due to an API design mistake, we need to hijack one of our helper frame's
      existing expected messages to return a special response indicating it
      supports receiving another kind of query.
     */
    if (message && message.isQueryTopicSupported) {
      let foundTopicValue = false;
      for (const topicName in WindowMessenger.Topics) {
        if (
          message.isQueryTopicSupported === WindowMessenger.Topics[topicName]
        ) {
          foundTopicValue = true;
        }
      }
      this.replyToFrameWithPayload_(replyToFrame, true, null, foundTopicValue);
    } else {
      // Reply with our standard notification permission state response
      this.replyToFrameWithPayload_(
          replyToFrame,
          true,
          null,
          Notification.permission
      );
    }
  }

  /**
   * @param {StorageGetMessage} message
   * @param {function(?, function())} replyToFrame
   * @private
   */
  onAmpPageMessageReceivedStorageGet_(message, replyToFrame) {
    let storageValue = null;

    try {
      // Reply with our standard notification permission state response
      if (message && message.key && this.window_.localStorage) {
        storageValue = this.window_.localStorage.getItem(message.key);
      } else {
        user().warn(TAG, 'LocalStorage retrieval failed.');
      }
    } catch (e) {
      // LocalStorage may not be accessible
      // The value will remain null
    }

    this.replyToFrameWithPayload_(replyToFrame, true, null, storageValue);
  }

  /**
   * @param {?} _
   * @param {function(?, function())} replyToFrame
   * @private
   */
  onAmpPageMessageReceivedServiceWorkerState_(_, replyToFrame) {
    const serviceWorkerState = {
      /*
        Describes whether navigator.serviceWorker.controller is non-null.

        A page hard-refreshed bypassing the cache will have the
        navigator.serviceWorker.controller property be null even if the service
        worker is successfully registered and activated. In these situations,
        communication with the service worker isn't possible since the
        controller is null.
       */
      isControllingFrame: !!this.window_.navigator.serviceWorker.controller,
      /*
        The URL to the service worker script.
       */
      url: this.window_.navigator.serviceWorker.controller
        ? this.window_.navigator.serviceWorker.controller.scriptURL
        : null,
      /*
        The state of the service worker, one of "installing, waiting,
        activating, activated".
       */
      state: this.window_.navigator.serviceWorker.controller
        ? this.window_.navigator.serviceWorker.controller.state
        : null,
    };

    this.replyToFrameWithPayload_(replyToFrame, true, null, serviceWorkerState);
  }

  /**
   * @param {ServiceWorkerRegistrationMessage} message
   * @param {function(?, function())} replyToFrame
   * @private
   */
  onAmpPageMessageReceivedServiceWorkerRegistration_(message, replyToFrame) {
    if (!message || !message.workerUrl || !message.registrationOptions) {
      throw new Error(
          'Expected arguments workerUrl and registrationOptions ' +
          'in message, got:',
          message
      );
    }

    this.window_.navigator.serviceWorker
        .register(message.workerUrl, message.registrationOptions)
        .then(() => {
          this.replyToFrameWithPayload_(replyToFrame, true, null, null);
        })
        .catch(error => {
          this.replyToFrameWithPayload_(
              replyToFrame,
              true,
              null,
              error ? error.message || error.toString() : null
          );
        });
  }

  /**
   * @param {ServiceWorkerMessage} message
  */
  messageServiceWorker(message) {
    this.window_.navigator.serviceWorker.controller./*OK*/ postMessage({
      command: message.topic,
      payload: message.payload,
    });
  }

  /**
   * @param {ServiceWorkerRegistrationMessage} message
   * @param {function(?, function())} replyToFrame
   * @private
   */
  onAmpPageMessageReceivedServiceWorkerQuery_(message, replyToFrame) {
    if (!message || !message.topic) {
      throw new Error('Expected argument topic in message, got:', message);
    }
    new Promise(resolve => {
      // Allow this message through, just for the next time it's received
      this.allowedWorkerMessageTopics_[message.topic] = resolve;

      // The AMP message is forwarded to the service worker
      this.waitUntilWorkerControlsPage().then(() => {
        this.messageServiceWorker(message);
      });
    }).then(workerReplyPayload => {
      delete this.allowedWorkerMessageTopics_[message.topic];

      // The service worker's reply is forwarded back to the AMP page
      return this.replyToFrameWithPayload_(
          replyToFrame,
          true,
          null,
          workerReplyPayload
      );
    });
  }

  /**
   * @return {?string}
   * @private
   */
  getParentOrigin_() {
    const queryParams = parseQueryString(this.window_.location.search);
    if (!queryParams['parentOrigin']) {
      throw new Error('Expecting parentOrigin URL query parameter.');
    }
    return queryParams['parentOrigin'];
  }

  /**
   * @param {!Event} event
   * @private
   */
  onPageMessageReceivedFromServiceWorker_(event) {
    const {command, payload} = event.data;
    const callbackPromiseResolver = this.allowedWorkerMessageTopics_[command];

    if (typeof callbackPromiseResolver === 'function') {
      // Resolve the waiting listener with the worker's reply payload
      callbackPromiseResolver(payload);
    }
    // Otherwise, ignore unsolicited messages from the service worker
  }

  /**
    * Service worker postMessage() communication relies on the property
    * navigator.serviceWorker.controller to be non-null. The controller property
    * references the active service worker controlling the page. Without this
    * property, there is no service worker to message.
    *
    * The controller property is set when a service worker has successfully
    * registered, installed, and activated a worker, and when a page isn't
    * loaded in a hard refresh mode bypassing the cache.
    *
    * It's possible for a service worker to take a second page load to be fully
    * activated.
    *
    * @return {boolean}
    * @private
    */
  isWorkerControllingPage_() {
    return (
      this.window_.navigator.serviceWorker &&
      this.window_.navigator.serviceWorker.controller &&
      this.window_.navigator.serviceWorker.controller.state === 'activated'
    );
  }

  /**
   * Returns a Promise that is resolved when the the page controlling the
   * service worker is activated. This Promise never rejects.
   *
   * @return {Promise}
   */
  waitUntilWorkerControlsPage() {
    return new Promise(resolve => {
      if (this.isWorkerControllingPage_()) {
        resolve();
      } else {
        this.window_.navigator.serviceWorker.addEventListener(
            'controllerchange',
            () => {
            // Service worker has been claimed
              if (this.isWorkerControllingPage_()) {
                resolve();
              } else {
                this.window_.navigator.serviceWorker
                    .controller.addEventListener(
                        'statechange',
                        () => {
                          if (this.isWorkerControllingPage_()) {
                            // Service worker has been activated
                            resolve();
                          }
                        }
                    );
              }
            }
        );
      }
    });
  }

  /**
   * Sets up message listeners for messages from the AMP page and service
   * worker.
   *
   * @param {string|null} allowedOrigin For testing purposes only. Pass in the
   * allowedOrigin since test environments cannot access the parent origin.
   */
  run(allowedOrigin) {
    this.ampMessenger_.on(
        WindowMessenger.Topics.NOTIFICATION_PERMISSION_STATE,
        this.onAmpPageMessageReceivedNotificationPermissionState_.bind(this)
    );
    this.ampMessenger_.on(
        WindowMessenger.Topics.SERVICE_WORKER_STATE,
        this.onAmpPageMessageReceivedServiceWorkerState_.bind(this)
    );
    this.ampMessenger_.on(
        WindowMessenger.Topics.SERVICE_WORKER_REGISTRATION,
        this.onAmpPageMessageReceivedServiceWorkerRegistration_.bind(this)
    );
    this.ampMessenger_.on(
        WindowMessenger.Topics.SERVICE_WORKER_QUERY,
        this.onAmpPageMessageReceivedServiceWorkerQuery_.bind(this)
    );
    this.ampMessenger_.on(
        WindowMessenger.Topics.STORAGE_GET,
        this.onAmpPageMessageReceivedStorageGet_.bind(this)
    );

    this.waitUntilWorkerControlsPage().then(() => {
      this.window_.navigator.serviceWorker.addEventListener(
          'message',
          this.onPageMessageReceivedFromServiceWorker_.bind(this)
      );
    });
    this.ampMessenger_.listen([allowedOrigin || this.getParentOrigin_()]);
  }
}

if (!getMode().test) {
  window._ampWebPushHelperFrame = new AmpWebPushHelperFrame({
    debug: false,
  });
  window._ampWebPushHelperFrame.run();
}
