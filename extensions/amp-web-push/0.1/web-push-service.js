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

import {CSS} from '../../../build/amp-web-push-0.1.css';
import {IFrameHost} from './iframehost';
import {
  NotificationPermission,
  SERVICE_TAG,
  StorageKeys,
  TAG,
  WIDGET_TAG,
} from './vars';
import {Services} from '../../../src/services';
import {WebPushWidgetVisibilities} from './amp-web-push-widget';
import {WindowMessenger} from './window-messenger';
import {dev, user} from '../../../src/log';
import {escapeCssSelectorIdent} from '../../../src/css';
import {getMode} from '../../../src/mode';
import {getServicePromiseForDoc} from '../../../src/service';
import {installStylesForDoc} from '../../../src/style-installer';
import {openWindowDialog} from '../../../src/dom';
import {parseQueryString, parseUrlDeprecated} from '../../../src/url';

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
 * @param {!Element} element
 * @return {!Promise<!./web-push-service.WebPushService>}
 */
export function webPushServiceForDoc(element) {
  return /** @type {!Promise<!./web-push-service.WebPushService>} */ (getServicePromiseForDoc(
    element,
    SERVICE_TAG
  ));
}

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
  }

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

    /** @private {?NotificationPermission}} */
    this.lastKnownPermission_ = null;

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
   * @return {!Promise}
   */
  start(configJson) {
    dev().fine(TAG, 'amp-web-push extension starting up.');

    // Exit early if web push isn't supported
    if (!this.environmentSupportsWebPush()) {
      user().warn(TAG, 'Web push is not supported.');
      return Promise.reject('Web push is not supported');
    }

    this.initializeConfig(configJson);

    // Add the IFrame
    const iframeLoadPromise = this.installHelperFrame();

    iframeLoadPromise
      .then(() => {
        dev().fine(
          TAG,
          `Helper frame ${this.config_['helper-iframe-url']} ` +
            'DOM loaded. Connecting to the frame via postMessage()...'
        );
        return this.frameMessenger_.connect(
          this.iframe_.getDomElement().contentWindow,
          parseUrlDeprecated(this.config_['helper-iframe-url']).origin
        );
      })
      .then(() => {
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
    return (
      location.search.indexOf(WebPushService.PERMISSION_POPUP_URL_FRAGMENT) !==
      -1
    );
  }

  /**
   * Given a URL string, returns the URL without the permission dialog URL query
   * parameter fragment indicating a redirect.
   * @param {string} url
   */
  removePermissionPopupUrlFragmentFromUrl(url) {
    let urlWithoutFragment = url.replace(
      `?${WebPushService.PERMISSION_POPUP_URL_FRAGMENT}`,
      ''
    );
    urlWithoutFragment = urlWithoutFragment.replace(
      `&${WebPushService.PERMISSION_POPUP_URL_FRAGMENT}`,
      ''
    );
    return urlWithoutFragment;
  }

  /**
   * Waits until the helper iframe has loaded, and then sends the message to the
   * helper iframe and awaits a reply. Errors that are returned are thrown,
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
    return this.iframe_
      .whenReady()
      .then(() => {
        return this.frameMessenger_.send(messageTopic, message);
      })
      .then(result => {
        const replyPayload = result[0];
        if (replyPayload.success) {
          return replyPayload.result;
        } else {
          throw new Error(
            `AMP page helper iframe query topic ${messageTopic} ` +
              `and message ${message} failed with: ${replyPayload.error}`
          );
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
    return this.queryHelperFrame_(WindowMessenger.Topics.SERVICE_WORKER_QUERY, {
      topic: messageTopic,
      payload: message,
    });
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
    const swUrl = this.config_['service-worker-url'];
    const swScope = this.config_['service-worker-scope'];

    return this.queryHelperFrame_(
      WindowMessenger.Topics.SERVICE_WORKER_REGISTRATION,
      {
        workerUrl: swUrl,
        registrationOptions: swScope ? {scope: swScope} : {},
      }
    );
  }

  /**
   * Queries the service worker for the current subscription state.
   * @return {Promise<ServiceWorkerState>}
   */
  querySubscriptionStateRemotely() {
    return this.queryServiceWorker_('amp-web-push-subscription-state', null);
  }

  /**
   * Requests the service worker to complete subscribing the user.
   * @return {Promise}
   */
  subscribeForPushRemotely() {
    return this.queryServiceWorker_('amp-web-push-subscribe', null);
  }

  /**
   * Requests the service worker to unsubscribe the user from push.
   * @return {Promise<ServiceWorkerState>}
   */
  unsubscribeFromPushRemotely() {
    return this.queryServiceWorker_('amp-web-push-unsubscribe', null);
  }

  /**
   * Returns true if the service worker is activated, has the same URL as the
   * config service-worker-url attribute, and is controlling the AMP page.
   *
   * @return {Promise<boolean>}
   */
  isServiceWorkerActivated() {
    const self = this;
    return this.queryServiceWorkerState_().then(serviceWorkerState => {
      const isControllingFrame = serviceWorkerState.isControllingFrame === true;
      const serviceWorkerHasCorrectUrl = this.isUrlSimilarForQueryParams(
        serviceWorkerState.url,
        self.config_['service-worker-url']
      );
      const serviceWorkerActivated = serviceWorkerState.state === 'activated';

      return (
        isControllingFrame &&
        serviceWorkerHasCorrectUrl &&
        serviceWorkerActivated
      );
    });
  }

  /**
   * Compares if two URLs are identical except for a subset of the query
   * parameters. The second URL (that is being tested) must have the same subset
   * of query parameters as the first URL provided, and the second URL can have
   * more than the first URL's query parameters. All other components like
   * origin and pathname must be equal.
   *
   * @param {string} originalUrlString
   * @param {string} urlToTestString
   * @return {boolean}
   */
  isUrlSimilarForQueryParams(originalUrlString, urlToTestString) {
    const originalUrl = parseUrlDeprecated(originalUrlString);
    const originalUrlQueryParams = parseQueryString(originalUrl.search);
    const urlToTest = parseUrlDeprecated(urlToTestString);
    const urlToTestQueryParams = parseQueryString(urlToTest.search);

    // The URL to test may have more query params than the original URL, but it
    // must have at least the same query params as original URL
    for (const originalKey in originalUrlQueryParams) {
      if (
        urlToTestQueryParams[originalKey] !==
        originalUrlQueryParams[originalKey]
      ) {
        return false;
      }
    }

    // The rest of the URL, excluding the query params, must be identical
    return (
      originalUrl.origin === urlToTest.origin &&
      originalUrl.pathname === urlToTest.pathname
    );
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
    const widgetDomElements = this.ampdoc
      .getRootNode()
      .querySelectorAll(
        `${escapeCssSelectorIdent(
          WIDGET_TAG
        )}[visibility=${escapeCssSelectorIdent(widgetCategoryName)}]`
      );
    const invisibilityCssClassName = 'amp-invisible';

    for (let i = 0; i < widgetDomElements.length; i++) {
      const widgetDomElement = widgetDomElements[i];
      if (isVisible) {
        widgetDomElement.classList.remove(invisibilityCssClassName);
      } else {
        widgetDomElement.classList.add(invisibilityCssClassName);
      }
    }
  }

  /**
   * Returns true if the publisher defined some markup on the page with the
   * widget visibility section (e.g. <tag visiblity=widgetCategoryName>).
   *
   * @param {string} widgetCategoryName
   * @return {boolean}
   * @private
   */
  doesWidgetCategoryMarkupExist_(widgetCategoryName) {
    const widgetDomElements = this.ampdoc
      .getRootNode()
      .querySelectorAll(
        `${escapeCssSelectorIdent(
          WIDGET_TAG
        )}[visibility=${escapeCssSelectorIdent(widgetCategoryName)}]`
      );

    return widgetDomElements.length > 0;
  }

  /**
   * @private
   * @param {*} subscriptionStateReply
   * @return {(number|undefined)}
   */
  getSubscriptionStateReplyVersion_(subscriptionStateReply) {
    if (typeof subscriptionStateReply === 'boolean') {
      return 1;
    }
  }

  /**
   * @private
   * @return {Promise}
   *
   * Store the notification permission before the user clicks the Subscribe
   * button, because the permission may currently be granted, and we can avoid
   * opening the popup in the future if the permission is granted.
   *
   * The user might have previously subscribed and then cleared their browser
   * data without resetting their permission, and in this case we don't have to
   * open a popup when resubscribing.
   *
   * We can't check the notification permission when the user clicks Subscribe
   * because waiting on promises after clicking buttons triggers the browser's
   * popup blocker. So we have to check and store the permission before the user
   * clicks Subscribe and use the stored result when the user finally clicks
   * Subscribe.
   */
  storeLastKnownPermission_() {
    return this.queryNotificationPermission().then(permission => {
      this.lastKnownPermission_ = permission;
    });
  }

  /**
   * Queries the helper frame for notification permissions and service worker
   * registration state to compute visibility for subscription and
   * unsubscription widgets.
   *
   * @return {Promise}
   */
  updateWidgetVisibilities() {
    /*
      In Chrome 62+, notification permission returned by a cross-origin iframe
      is ambiguous for the default/denied state. We have to rely on stored
      permission values. We assume the permission state is default (e.g. new
      user case) unless we see a different stored value.

      The initial release of AMP web push does not support the STORAGE_GET
      query. An existing query topic was hijacked to support both its existing
      task and returning whether a query topic was supported. This prevents an
      unexpected messenger query from delaying indefinitely.
     */
    return this.storeLastKnownPermission_()
      .then(() => this.isQuerySupported_(WindowMessenger.Topics.STORAGE_GET))
      .then(response => {
        /*
          Response could be "denied", "granted", or "default". This is a
          response to the notification permission state query, and we're
          hijacking the call to get a special return value if the user has
          updated their helper frame.

          We want to make sure response is a boolean true value, and not a
          permission string.
        */
        const isSupported = response === true;
        if (isSupported) {
          /*
            The site has v2+ of AMP web push's helper frame and supports
            retrieving the remote storage value.
          */
          return this.getCanonicalFrameStorageValue_(
            StorageKeys.NOTIFICATION_PERMISSION
          );
        } else {
          /*
            The site is running our initial AMP web push release and the helper
            frame does not support retrieving the remote storage value. Assume
            the permission is default to provide the best user experience.
          */
          return Promise.resolve(NotificationPermission.DEFAULT);
        }
      })
      .then(canonicalNotificationPermission => {
        /*
            If the canonical notification permission is:
              - Blocked
                - If the publisher has defined a blocked widget section, show
                  it, otherwise show the unsubscribed widget.
              - Default or Granted
                - Resume flow
          */
        if (canonicalNotificationPermission === NotificationPermission.DENIED) {
          if (
            this.doesWidgetCategoryMarkupExist_(
              WebPushWidgetVisibilities.BLOCKED
            )
          ) {
            this.updateWidgetVisibilitiesBlocked_();
          } else {
            this.updateWidgetVisibilitiesUnsubscribed_();
          }
        } else {
          return this.isServiceWorkerActivated().then(
            isServiceWorkerActivated => {
              if (isServiceWorkerActivated) {
                this.updateWidgetVisibilitiesServiceWorkerActivated_();
              } else {
                this.updateWidgetVisibilitiesUnsubscribed_();
              }
            }
          );
        }
      });
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
                WebPushWidgetVisibilities.UNSUBSCRIBED,
                false
              );
              this.setWidgetVisibilities(
                WebPushWidgetVisibilities.SUBSCRIBED,
                true
              );
              this.setWidgetVisibilities(
                WebPushWidgetVisibilities.BLOCKED,
                false
              );
            } else {
              this.updateWidgetVisibilitiesUnsubscribed_();
            }
            break;
          default:
            /*
              Service worker returned incorrect amp-web-push reply (amp-web-push
              not supported); widgets will stay hidden.
             */
            throw user().createError(
              'The controlling service worker replied to amp-web-push ' +
                'with an unexpected value.'
            );
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

  /** @private */
  updateWidgetVisibilitiesBlocked_() {
    this.setWidgetVisibilities(WebPushWidgetVisibilities.UNSUBSCRIBED, false);
    this.setWidgetVisibilities(WebPushWidgetVisibilities.SUBSCRIBED, false);
    this.setWidgetVisibilities(WebPushWidgetVisibilities.BLOCKED, true);
  }

  /**
   * Subscribes the user to web push notifications.
   *
   * This action is exposed from this service and is called from the config
   * element.
   *
   * @param {function()} onPopupClosed
   * @return {Promise}
   */
  subscribe(onPopupClosed) {
    const promises = [];
    // Register the service worker in the background in parallel for a headstart
    promises.push(this.registerServiceWorker());
    promises.push(
      new Promise(resolve => {
        /*
            In most environments, the canonical notification permission returned
            is accurate. On Chrome 62+, the permission is non-ambiguous only if
            it is granted. If the permission is anything other than granted, we
            can't trust it.
          */
        switch (this.lastKnownPermission_) {
          /*
              Because notification permissions are already granted, we do not
              need to open a popup to ask for permissions. Subscribe in the
              background using the helper frame.
            */
          case NotificationPermission.GRANTED:
            return this.onPermissionGrantedSubscribe_().then(() => {
              resolve();
            });
          default:
            /*
                Because notification permissions are not granted, we need to
                open a popup asking the user to grant permissions.

                The last known permission can be unknown, in which case we open
                a popup anyways.
              */
            const permissionDialogWindow = this.openPopupOrRedirect();
            this.checkPermissionDialogClosedInterval_(
              permissionDialogWindow,
              onPopupClosed
            );

            this.popupMessenger_ = new WindowMessenger({
              debug: this.debug_,
            });
            this.popupMessenger_.listen([
              this.config_['permission-dialog-url'],
            ]);

            this.onPermissionDialogInteracted()
              .then(result => {
                return this.handlePermissionDialogInteraction(result);
              })
              .then(() => {
                resolve();
              });
        }
      })
    );

    return Promise.all(promises);
  }

  /**
   * Checks whether the permission dialog is still open. When closed, a closed
   * callback is executed.
   *
   * @param {?Window} permissionDialogWindow
   * @param {!Function} onPopupClosed
   * @private
   */
  checkPermissionDialogClosedInterval_(permissionDialogWindow, onPopupClosed) {
    if (permissionDialogWindow && !permissionDialogWindow.closed) {
      const interval = this.ampdoc.win.setInterval(() => {
        if (permissionDialogWindow.closed) {
          onPopupClosed();
          this.ampdoc.win.clearInterval(interval);
        }
      }, 500);
    }
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
      case NotificationPermission.DEFAULT:
        // User clicked X or blocked
        reply({closeFrame: true});
        return this.updateWidgetVisibilities();
      case NotificationPermission.GRANTED:
        // User allowed
        reply({closeFrame: true});
        this.onPermissionGrantedSubscribe_();
        break;
      default:
        throw new Error('Unexpected permission value:', permission);
    }
  }

  /** @private */
  onPermissionGrantedSubscribe_() {
    return this.subscribeForPushRemotely().then(() => {
      return this.updateWidgetVisibilities();
    });
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
   * Returns a Promise that resolves when the helper iframe responds with
   * whether the messenger query is supported.
   *
   * This special query is not supported with the initial helper frame release
   * of AMP web push, and is only supported on the 2nd release of AMP web push
   * and onwards.
   *
   * @param {string} queryType One of the topics defined in
   * WindowMessenger.Topics.
   * @return {Promise<boolean>}
   * @private
   */
  isQuerySupported_(queryType) {
    return this.queryHelperFrame_(
      WindowMessenger.Topics.NOTIFICATION_PERMISSION_STATE,
      {
        isQueryTopicSupported: queryType,
      }
    );
  }

  /**
   * Returns a Promise that resolves when the helper iframe responds with the
   * value of the LocalStorage key.
   *
   * @param {string} storageKey The LocalStorage item key name in the canonical
   * helper frame.
   * @return {Promise<NotificationPermission>}
   * @private
   */
  getCanonicalFrameStorageValue_(storageKey) {
    return this.queryHelperFrame_(WindowMessenger.Topics.STORAGE_GET, {
      key: storageKey,
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
        }
      );
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
   * @return {?Window}
   */
  openPopupOrRedirect() {
    // Note: Don't wait on promise chains when opening a pop up, otherwise
    // they'll be blocked

    const pageUrlHasQueryParams =
      this.ampdoc.win.location.href.indexOf('?') !== -1;
    const pageUrlQueryParamPrefix = pageUrlHasQueryParams ? '&' : '?';
    // The URL to return to after the permission dialog closes
    const returningPopupUrl =
      this.ampdoc.win.location.href +
      pageUrlQueryParamPrefix +
      WebPushService.PERMISSION_POPUP_URL_FRAGMENT;

    const permissionDialogUrlHasQueryParams =
      this.config_['permission-dialog-url'].indexOf('?') !== -1;
    const permissionDialogUrlQueryParamPrefix = permissionDialogUrlHasQueryParams
      ? '&'
      : '?';
    // The permission dialog URL, containing the return URL above embedded in a
    // query parameter
    const openingPopupUrl =
      this.config_['permission-dialog-url'] +
      permissionDialogUrlQueryParamPrefix +
      `return=${encodeURIComponent(returningPopupUrl)}`;

    const d = WebPushService.getPopupDimensions_();
    const sizing = `height=${d.h},width=${d.w},left=${d.x},top=${d.y}`;
    const options = `${sizing},resizable=yes,scrollbars=yes`;

    return openWindowDialog(
      this.ampdoc.win,
      openingPopupUrl,
      '_blank',
      options
    );
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
        this.ampdoc.win.location.href
      )
    );

    this.queryNotificationPermission().then(permission => {
      switch (permission) {
        case NotificationPermission.DENIED:
        case NotificationPermission.DEFAULT:
          // User blocked or clicked X
          return this.updateWidgetVisibilities();
        case NotificationPermission.GRANTED:
          // User allowed
          this.onPermissionGrantedSubscribe_();
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
   * @return {boolean}
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
   * @return {boolean}
   * @private
   */
  arePushRelatedApisSupported_() {
    return (
      this.ampdoc.win.Notification !== undefined &&
      this.ampdoc.win.navigator.serviceWorker !== undefined &&
      this.ampdoc.win.PushManager !== undefined
    );
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
    return (
      this.ampdoc.win.location.protocol === 'https:' ||
      this.ampdoc.win.location.hostname === 'localhost' ||
      this.ampdoc.win.location.hostname === '127.0.0.1' ||
      getMode().development ||
      getMode().test
    );
  }
}
