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

import {getMode} from '../../../src/mode';
import {user} from '../../../src/log';
import {CSS} from '../../../build/amp-web-push-0.1.css';
import {IFrameHost} from './iframehost';
import {WindowMessenger} from './window-messenger';
import {installStylesForDoc} from '../../../src/style-installer';
import {openWindowDialog} from '../../../src/dom';
import {
  TAG,
  WIDGET_TAG,
  NotificationPermission,
} from './vars';
import {WebPushWidgetVisibilities} from './amp-web-push-widget';
import {dev} from '../../../src/log';
import {Services} from '../../../src/services';

/** @typedef {{
 *    isControllingFrame: boolean,
 *    state: string,
 *    url: string,
 * }}
 */
export let ServiceWorkerState;

/** @typedef {{
 *    workerUrl: string,
 *    registrationOptions: ?{scope: string},
 * }}
 */
export let ServiceWorkerRegistrationMessage;

/** @typedef {{
 *    'helper-iframe-url': (?string|undefined),
 *    'permission-dialog-url': (?string|undefined),
 *    'service-worker-url': (?string|undefined),
 * }}
 */
export let AmpWebPushConfig;

/**
 * @fileoverview
 * Obtains the user's subscription state and subscribes and unsubscribes the
 * user.
 *
 * This service loads a hidden iframe on the canonical origin to access
 * same-origin data like notification permission and subscription data. When
 * subscribing, it registers a service worker. This service worker determines
 * whether the user is subscribed or unsubscribed.
 */
export class WebPushService {

  /**
    * Describes the URL query parameter appended to the URL when the permission
    * dialog redirects back to the AMP page to continue subscribing.
    *
    * In environments where pop ups aren't supported, the AMP page is redirected
    * to a lightweight "permission dialog" page on the canonical origin. After
    * permissions are granted, the page is redirected back to the AMP page.
    *
    * This describes the URL query parameter to add to the redirect back to the
    * AMP page, so we know to resume the subscription process.
    *
    * We use the History API after to remove this fragment from the URL without
    * affecting the page state.
    * @return {string}
   */
  static get PERMISSION_POPUP_URL_FRAGMENT() {
    return 'amp-web-push-subscribing=yes';
  };

  /**
   * Describes the extension's version a remote service worker supports.
   *
   * Service workers are forwarded messages from the AMP page asking for the
   * subscription state, asking to subscribe, and asking to unsubscribe. Vendors
   * or individuals controlling their service workers may not update their
   * service worker even when the AMP extension updates.
   *
   * To handle the case where this AMP extension undergoes a couple revisions
   * and some service workers respond with a v1 reply, some a v2 reply, and
   * others a v3 reply, we track which version the reply matches and enumerize
   * it as a human readable description.
   * @return {number}
   */
  static get AMP_VERSION_INITIAL() {
    return 1;
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    // Install styles.
    installStylesForDoc(ampdoc, CSS, () => {}, false, TAG);

    /** @private {!Object} */
    this.config_ = {
      'helper-iframe-url': null,
      'permission-dialog-url': null,
      'service-worker-url': null,
      debug: null,
    };

    /** @private {boolean} */
    this.debug_ = getMode().development;

    /** @private {./iframehost.IFrameHost} */
    this.iframe_ = null;

    /**
     * Create a postMessage() helper to listen for messages
     *
     * @private {./window-messenger.WindowMessenger}
     */
    this.frameMessenger_ = new WindowMessenger({
      debug: this.debug_,
    });

    /** @private {./window-messenger.WindowMessenger} */
    this.popupMessenger_ = null;
  }

  /**
   * Occurs when the config element loads.
   * @param {!AmpWebPushConfig} configJson
   * @returns {!Promise}
   */
  start(configJson) {
    dev().fine(TAG, 'amp-web-push extension starting up.');

    // Exit early if web push isn't supported
    if (!this.environmentSupportsWebPush()) {
      dev().fine(TAG, 'Web push is not supported.');
      return Promise.reject('Web push is not supported');
    }

    this.initializeConfig(configJson);

    // Add the IFrame
    const iframeLoadPromise = this.installHelperFrame();

    iframeLoadPromise.then(() => {
      dev().fine(TAG, `Helper frame ${this.config_['helper-iframe-url']} ` +
        'DOM loaded. Connecting to the frame via postMessage()...');
      return this.frameMessenger_.connect(
          this.iframe_.getDomElement().contentWindow,
          new URL(this.config_['helper-iframe-url']).origin);
    }).then(() => {
      if (this.isContinuingSubscriptionFromRedirect()) {
        this.resumeSubscribingForPushNotifications_();
      } else {
        return this.updateWidgetVisibilities();
      }
    });

    return iframeLoadPromise;
  }

  /**
   * Parses service configuration and determines environment compatibility.
   * @param {!AmpWebPushConfig} configJson
   */
  initializeConfig(configJson) {
    // Read amp-web-push configuration
    this.config_ = configJson;
    if (!this.config_) {
      // An error will already be thrown from the config parsing function
      return;
    }
  }

  /**

  /**
   * Installs the helper IFrame onto the AMP page and returns a Promise for when
   * the iframe is loaded.
   *
   * @return {Promise}
   */
  installHelperFrame() {
    // Add a ?parentOrigin=... to let the iframe know which origin to accept
    // postMessage() calls from
    const helperUrlHasQueryParams =
      this.config_['helper-iframe-url'].indexOf('?') !== -1;
    const helperUrlQueryParamPrefix = helperUrlHasQueryParams ? '&' : '?';
    const finalIframeUrl =
      `${this.config_['helper-iframe-url']}${helperUrlQueryParamPrefix}` +
      `parentOrigin=${this.ampdoc.win.location.origin}`;

    // Create a hidden iFrame to check subscription state
    this.iframe_ = new IFrameHost(this.ampdoc, finalIframeUrl);

    // Load the iFrame asychronously in the background
    return this.iframe_.load();
  }

  /**
   * Returns true if this AMP page has a special URL query parameter suffix
   * indicating this page was redirected from the permission dialog.
   * @return {boolean}
   */
  isContinuingSubscriptionFromRedirect() {
    const location = this.ampdoc.win.testLocation || this.ampdoc.win.location;
    return location.search.indexOf(
        WebPushService.PERMISSION_POPUP_URL_FRAGMENT) !== -1;
  }

  /**
   * Given a URL string, returns the URL without the permission dialog URL query
   * parameter fragment indicating a redirect.
   * @param {string} url
   */
  removePermissionPopupUrlFragmentFromUrl(url) {
    let urlWithoutFragment =
      url.replace(`?${WebPushService.PERMISSION_POPUP_URL_FRAGMENT}`, '');
    urlWithoutFragment =
      urlWithoutFragment.replace(
          `&${WebPushService.PERMISSION_POPUP_URL_FRAGMENT}`, '');
    return urlWithoutFragment;
  }

  /**
   * Waits until the helper iframe has loaded, and then sends the message to
   * the helper iframe and awaits a reply. Errors that are returned are thrown,
   * otherwise the message is returned as a Promise.
   *
   * This is used by all of our AMP page <-> helper iframe communications.
   *
   * @param {string} messageTopic
   * @param {?} message
   * @return {Promise<?>}
   * @private
   */
  queryHelperFrame_(messageTopic, message) {
    return this.iframe_.whenReady().then(() => {
      return this.frameMessenger_.send(messageTopic, message);
    }).then(result => {
      const replyPayload = result[0];
      if (replyPayload.success) {
        return replyPayload.result;
      } else {
        throw new Error(`AMP page helper iframe query topic ${messageTopic} ` +
          `and message ${message} failed with: ${replyPayload.error}`);
      }
    });
  }

  /**
   * Passes messages to the service worker through the helper iframe. Messages
   * are forwarded directly as-is and service worker replies and received as-is
   * without filtering, so that changes in the AMP page and service worker don't
   * require code changes in the helper frame (which lives on the canonical
   * origin).
   *
   * @param {string} messageTopic
   * @param {?} message
   * @return {Promise<?>}
   * @private
   */
  queryServiceWorker_(messageTopic, message) {
    return this.queryHelperFrame_(
        WindowMessenger.Topics.SERVICE_WORKER_QUERY,
        {
          topic: messageTopic,
          payload: message,
        }
    );
  }

  /**
   * Queries the helper iframe for the notification permission on the canonical
   * origin.
   *
   * @return {Promise<NotificationPermission>}
   */
  queryNotificationPermission() {
    return this.queryHelperFrame_(
        WindowMessenger.Topics.NOTIFICATION_PERMISSION_STATE,
        null
    );
  }

  /**
   * @return {Promise<ServiceWorkerState>}
   * @private
   */
  queryServiceWorkerState_() {
    return this.queryHelperFrame_(
        WindowMessenger.Topics.SERVICE_WORKER_STATE,
        null
    );
  }

  /**
   * Sends a message to the helper iframe with the service worker URL and
   * registration options and requests the iframe to register the service
   * worker.
   * @return {Promise<ServiceWorkerRegistrationMessage>}
   */
  registerServiceWorker() {
    return this.queryHelperFrame_(
        WindowMessenger.Topics.SERVICE_WORKER_REGISTRATION,
        {
          workerUrl: this.config_['service-worker-url'],
          registrationOptions: this.config_.serviceWorkerRegistrationOptions ||
          {scope: '/'},
        }
    );
  }

  /**
   * Queries the service worker for the current subscription state.
   * @return {Promise<ServiceWorkerState>}
   */
  querySubscriptionStateRemotely() {
    return this.queryServiceWorker_(
        'amp-web-push-subscription-state',
        null
    );
  }

  /**
   * Requests the service worker to complete subscribing the user.
   * @return {Promise}
   */
  subscribeForPushRemotely() {
    return this.queryServiceWorker_(
        'amp-web-push-subscribe',
        null
    );
  }

  /**
   * Requests the service worker to unsubscribe the user from push.
   * @return {Promise<ServiceWorkerState>}
   */
  unsubscribeFromPushRemotely() {
    return this.queryServiceWorker_(
        'amp-web-push-unsubscribe',
        null
    );
  }

  /**
   * Returns true if the service worker is activated, has the same URL as the
   * config service-worker-url attribute, and is controlling the AMP page.
   *
   * @return {Promise<boolean>}
   */
  isServiceWorkerActivated() {
    const self = this;
    return this.queryServiceWorkerState_().then(
        function(serviceWorkerState) {
          const isControllingFrame =
            serviceWorkerState.isControllingFrame === true;
          const serviceWorkerHasCorrectUrl =
            serviceWorkerState.url === self.config_['service-worker-url'];
          const serviceWorkerActivated =
            serviceWorkerState.state === 'activated';

          return isControllingFrame &&
            serviceWorkerHasCorrectUrl &&
            serviceWorkerActivated;
        });
  }

  /**
   * Sets the visibilities of subscription and unsubscription widget elements.
   *
   * Element visibilities change throughout the lifetime of the page: they are
   * initially invisible as their visibilties are determined, and then they
   * either remain hidden or appear. After users subscribe or unsubscribe,
   * visibilties change again.
   *
   * @param {string} widgetCategoryName
   * @param {boolean} isVisible
   */
  setWidgetVisibilities(widgetCategoryName, isVisible) {
    const widgetDomElements = this.ampdoc.getRootNode()
      .querySelectorAll(`${WIDGET_TAG}[visibility=${widgetCategoryName}]`);
    const visibilityCssClassName = 'amp-invisible';

    for (let i = 0; i < widgetDomElements.length; i++) {
      const widgetDomElement = widgetDomElements[i];
      if (isVisible) {
        widgetDomElement.classList.remove(visibilityCssClassName);
      } else {
        widgetDomElement.classList.add(visibilityCssClassName);
      }
    }
  }

  /**
   * @private
   * @return {(number|undefined)}
   */
  getSubscriptionStateReplyVersion_(subscriptionStateReply) {
    if (typeof subscriptionStateReply === 'boolean') {
      return 1;
    }
  }

  /**
   * Queries the helper frame for notification permissions and service worker
   * registration state to compute visibility for subscription and
   * unsubscription widgets.
   *
   * @return {Promise}
   */
  updateWidgetVisibilities() {
    return this.queryNotificationPermission().then(notificationPermission => {
      if (notificationPermission === NotificationPermission.DENIED) {
        this.updateWidgetVisibilitiesNotificationPermissionsBlocked_();
      } else {
        return this.isServiceWorkerActivated().then(
            isServiceWorkerActivated => {
              if (isServiceWorkerActivated) {
                this.updateWidgetVisibilitiesServiceWorkerActivated_();
              } else {
                this.updateWidgetVisibilitiesUnsubscribed_();
              }
            });
      }
    });
  }

  /** @private */
  updateWidgetVisibilitiesNotificationPermissionsBlocked_() {
    this.setWidgetVisibilities(WebPushWidgetVisibilities.UNSUBSCRIBED, false);
    this.setWidgetVisibilities(WebPushWidgetVisibilities.SUBSCRIBED, false);
    this.setWidgetVisibilities(WebPushWidgetVisibilities.BLOCKED, true);
  }

  /** @private */
  updateWidgetVisibilitiesServiceWorkerActivated_() {
    return Services.timerFor(this.ampdoc.win).timeoutPromise(
        5000,
        this.querySubscriptionStateRemotely().then(reply => {
        /*
          This Promise will never resolve if the service worker does not support
          amp-web-push, and widgets will stay hidden.
         */
          switch (this.getSubscriptionStateReplyVersion_(reply)) {
            case WebPushService.AMP_VERSION_INITIAL:
              const isSubscribed = reply;
              if (isSubscribed) {
                this.setWidgetVisibilities(
                    WebPushWidgetVisibilities.UNSUBSCRIBED, false);
                this.setWidgetVisibilities(
                    WebPushWidgetVisibilities.SUBSCRIBED, true);
                this.setWidgetVisibilities(
                    WebPushWidgetVisibilities.BLOCKED, false);
              } else {
                this.updateWidgetVisibilitiesUnsubscribed_();
              }
              break;
            default:
            /*
              Service worker returned incorrect amp-web-push reply
              (amp-web-push not supported); widgets will stay hidden.
             */
              throw user().createError(
                  'The controlling service worker replied to amp-web-push ' +
                'with an unexpected value.');
          }
        }),
        'The controlling service worker does not support amp-web-push.'
    );
  }

  /** @private */
  updateWidgetVisibilitiesUnsubscribed_() {
    this.setWidgetVisibilities(WebPushWidgetVisibilities.UNSUBSCRIBED, true);
    this.setWidgetVisibilities(WebPushWidgetVisibilities.SUBSCRIBED, false);
    this.setWidgetVisibilities(WebPushWidgetVisibilities.BLOCKED, false);
  }

  /**
   * Subscribes the user to web push notifications.
   *
   * This action is exposed from this service and is called from the config
   * element.
   *
   * @return {Promise}
   */
  subscribe() {
    this.registerServiceWorker();
    this.openPopupOrRedirect();

    this.popupMessenger_ = new WindowMessenger({
      debug: this.debug_,
    });
    this.popupMessenger_.listen([this.config_['permission-dialog-url']]);

    return this.onPermissionDialogInteracted().then(result => {
      return this.handlePermissionDialogInteraction(result);
    });
  }

  /**
   * Processes the result of a user dismissing, granting, or denying
   * notification permissions when subscribing.
   *
   * @param {Array<?>} result
   */
  handlePermissionDialogInteraction(result) {
    /*
      At this point, the popup most likely opened and we can communicate with it
      via postMessage(). Or, in rare environments like Custom Chrome Tabs, this
      entire page was redirected and our code will resume with our page is
      redirected back.
    */
    /** @type {NotificationPermission} */
    const permission = result[0];
    /** @type {function ({closeFrame: boolean})} */
    const reply = result[1];
    switch (permission) {
      case NotificationPermission.DENIED:
        // User blocked
        reply({closeFrame: true});
        return this.updateWidgetVisibilities();
      case NotificationPermission.DEFAULT:
        // User clicked X
        reply({closeFrame: true});
        return this.updateWidgetVisibilities();
      case NotificationPermission.GRANTED:
        // User allowed
        reply({closeFrame: true});
        this.subscribeForPushRemotely().then(() => {
          return this.updateWidgetVisibilities();
        });
        break;
      default:
        throw new Error('Unexpected permission value:', permission);
    }
  }

  /**
   * Unsubscribes a user from web push notifications.
   *
   * This action is exposed from this service and is called from the config
   * element.
   *
   * @return {Promise}
   */
  unsubscribe() {
    return this.unsubscribeFromPushRemotely().then(() => {
      return this.updateWidgetVisibilities();
    });
  }

  /**
   * Returns a Promise that resolves when the user dismisses, grants, or denies
   * notification permissions when subscribing.
   *
   * @return {Promise<Array<(NotificationPermission|function({closeFrame: boolean}))>>}
   */
  onPermissionDialogInteracted() {
    return new Promise(resolve => {
      this.popupMessenger_.on(
          WindowMessenger.Topics.NOTIFICATION_PERMISSION_STATE,
          (message, replyToFrame) => {
            resolve([message, replyToFrame]);
          });
    });
  }

  /**
   * @return {{w: number, h: number, x: number, y: number}}
   * @private
   */
  static getPopupDimensions_() {
    /*
      On mobile, pop ups should show up as a full-screen window. The magic
      numbers below are just reasonable defaults.
    */
    const w = Math.floor(Math.min(700, screen.width * 0.9));
    const h = Math.floor(Math.min(450, screen.height * 0.9));
    const x = Math.floor((screen.width - w) / 2);
    const y = Math.floor((screen.height - h) / 2);

    return {
      w,
      h,
      x,
      y,
    };
  }

  /**
   * Opens a popup or redirects the top-level frame to the permission dialog.
   */
  openPopupOrRedirect() {
    // Note: Don't wait on promise chains when opening a pop up, otherwise
    // they'll be blocked

    const pageUrlHasQueryParams =
      this.ampdoc.win.location.href.indexOf('?') !== -1;
    const pageUrlQueryParamPrefix = pageUrlHasQueryParams ? '&' : '?';
    // The URL to return to after the permission dialog closes
    const returningPopupUrl = this.ampdoc.win.location.href +
      pageUrlQueryParamPrefix + WebPushService.PERMISSION_POPUP_URL_FRAGMENT;

    const permissionDialogUrlHasQueryParams =
      this.config_['permission-dialog-url'].indexOf('?') !== -1;
    const permissionDialogUrlQueryParamPrefix =
      permissionDialogUrlHasQueryParams ? '&' : '?';
    // The permission dialog URL, containing the return URL above embedded in a
    // query parameter
    const openingPopupUrl =
      this.config_['permission-dialog-url'] +
      permissionDialogUrlQueryParamPrefix +
      `return=${encodeURIComponent(returningPopupUrl) }`;

    const d = WebPushService.getPopupDimensions_();
    const sizing = `height=${d.h},width=${d.w},left=${d.x},top=${d.y}`;
    const options = `${sizing},resizable=yes,scrollbars=yes`;

    openWindowDialog(this.ampdoc.win, openingPopupUrl, '_blank', options);
  }

  /**
   * If this page is loaded with a special URL query parameter indicating we
   * were just redirected from the permission dialog, then continue subscribing
   * the user and remove the URL query parameter from the URL.
   *
   * @private
   */
  resumeSubscribingForPushNotifications_() {
    // Remove the ?amp-web-push-subscribing=true from the URL without affecting
    // the page contents using the History API
    this.ampdoc.win.history.replaceState(
        null,
        '',
        this.removePermissionPopupUrlFragmentFromUrl(
            this.ampdoc.win.location.href)
    );

    this.queryNotificationPermission()
        .then(permission => {
          switch (permission) {
            case NotificationPermission.DENIED:
            // User blocked
              return this.updateWidgetVisibilities();
            case NotificationPermission.DEFAULT:
            // User clicked X
              return this.updateWidgetVisibilities();
            case NotificationPermission.GRANTED:
            // User allowed
              this.subscribeForPushRemotely()
                  .then(() => {
                    return this.updateWidgetVisibilities();
                  });
              break;
            default:
              throw new Error('Unexpected permission value', permission);
          }
        });
  }

  /**
   * Returns true if the Service Worker API, Push API, and Notification API are
   * supported and the page is HTTPS.
   *
   * @returns {boolean}
   */
  environmentSupportsWebPush() {
    return this.arePushRelatedApisSupported_() && this.isAmpPageHttps_();
  }

  /**
   * Returns true if the Notifications, Service Worker, and Push API are
   * supported.
   *
   * This check causes Safari to return false (i.e. W3C-standardized push not
   * supported on Safari). Safari has its own propietary push system, but it
   * doesn't work on mobile, since Apple has not developed iOS push. This means
   * that AMP, a mobile-only feature, won't be supporting Safari until Safari
   * actually develops mobile push support.
   *
   * @returns {boolean}
   * @private
   */
  arePushRelatedApisSupported_() {
    return this.ampdoc.win.Notification !== undefined &&
      this.ampdoc.win.navigator.serviceWorker !== undefined &&
      this.ampdoc.win.PushManager !== undefined;
  }

  /**
   * Both the AMP page and the helper iframe must be HTTPS.
   *
   * It's possible for the AMP page to be HTTP; our extension should not
   * initialize in these cases. AMP pages loaded on Google's AMP cache should
   * always be HTTPS (e.g. https://www.google.com/amp/site.com/page.amp.html).
   * However, an AMP page directly accessed on an HTTP site (e.g.
   * http://site.com/page.amp.html) would be HTTP.
   *
   * The entire origin chain must be HTTPS to allow communication with the
   * service worker, which is done via the navigator.serviceWorker.controller.
   * navigator.serviceWorker.controller will return null if the AMP page is
   * HTTP.
   *
   * This does not prevent subscriptions to HTTP integrations; the helper iframe
   * simply becomes https://customer-subdomain.push-vendor.com
   *
   * The helper iframe HTTPS is enforced when checking the configuration.
   *
   * @return {boolean}
   * @private
   */
  isAmpPageHttps_() {
    return this.ampdoc.win.location.protocol === 'https:' ||
      getMode().development ||
      getMode().test;
  }
}
