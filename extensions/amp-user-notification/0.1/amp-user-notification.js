/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-user-notification-0.1.css';
import {assertHttpsUrl, addParamsToUrl} from '../../../src/url';
import {cidFor} from '../../../src/cid';
import {fromClass} from '../../../src/service';
import {dev, user, rethrowAsync} from '../../../src/log';
import {storageForDoc} from '../../../src/storage';
import {urlReplacementsForDoc} from '../../../src/url-replacements';
import {viewerForDoc} from '../../../src/viewer';
import {whenDocumentReady} from '../../../src/document-ready';
import {xhrFor} from '../../../src/xhr';


/** @private @const {string} */
const TAG = 'amp-user-notification';


/**
 * @export
 * @typedef {{
 *   showNotification: boolean
 * }}
 */
let GetResponseMetadataDef;

/**
 * @typedef {{
 *   promise: !Promise,
 *   resolve: function(*)
 * }}
 */
let UserNotificationDeferDef;


/**
 * Defines underlying API for Notification components.
 * @interface
 */
class NotificationInterface {

  /**
   * Promise that is resolved with a boolean on whether this Notification
   * should be shown or not.
   * @return {!Promise<boolean>}
   */
  shouldShow() {}

  /**
   * Turns the Notification Component visible.
   * @return {!Promise}
   */
  show() {}

  /**
   * Returns whether this notification has been dismissed and the dismissal
   * has been persisted in storage. Returns false if storage throws error or
   * 'data-persist-dismissal' is disabled.
   * @return {!Promise<boolean>}
   */
  isDismissed() {}
}

/**
 * Component class that handles a simple notification.
 * @implements {NotificationInterface}
 */
export class AmpUserNotification extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private @const {?UrlReplacements} */
    this.urlReplacements_ = null;

    /** @private @const {?UserNotificationManager} */
    this.userNotificationManager_ = null;

    /** @const @private {?Promise<!Storage>} */
    this.storagePromise_ = null;
  }

  /** @override */
  isAlwaysFixed() {
    return true;
  }

  /** @override */
  buildCallback() {
    const ampdoc = this.getAmpDoc();
    this.urlReplacements_ = urlReplacementsForDoc(ampdoc);
    this.storagePromise_ = storageForDoc(ampdoc);
    if (!this.userNotificationManager_) {
      this.userNotificationManager_ = getUserNotificationManager_(this.win);
    }

    /** @private {?string} */
    this.ampUserId_ = null;

    /** @private {function()} */
    this.dialogResolve_ = null;

    /** @private {!Promise} */
    this.dialogPromise_ = new Promise(resolve => {
      this.dialogResolve_ = resolve;
    });

    this.elementId_ = user().assert(this.element.id,
        'amp-user-notification should have an id.');

    /** @private @const {string} */
    this.storageKey_ = 'amp-user-notification:' + this.elementId_;

    /** @private @const {?string} */
    this.showIfHref_ = this.element.getAttribute('data-show-if-href');
    if (this.showIfHref_) {
      assertHttpsUrl(this.showIfHref_, this.element);
    }

    /** @private @const {?string} */
    this.dismissHref_ = this.element.getAttribute('data-dismiss-href');
    if (this.dismissHref_) {
      assertHttpsUrl(this.dismissHref_, this.element);
    }

    const persistDismissal = this.element.getAttribute(
        'data-persist-dismissal');
    /** @private @const {boolean} */
    this.persistDismissal_ = (
        persistDismissal != 'false' && persistDismissal != 'no');

    this.userNotificationManager_
        .registerUserNotification(this.elementId_, this);

    this.registerAction('dismiss', this.dismiss.bind(this));
  }

  /**
   * Constructs the new href to execute a `GET` request with the
   * `elementId` and `ampUserId` query params appended.
   * @param {string} ampUserId
   * @return {!Promise<string>}
   * @private
   */
  buildGetHref_(ampUserId) {
    const showIfHref = dev().assert(this.showIfHref_);
    return this.urlReplacements_.expandAsync(showIfHref).then(href => {
      return addParamsToUrl(href, {
        elementId: this.elementId_,
        ampUserId,
      });
    });
  }

  /**
   * Executes a `GET` request to the url given on the `data-show-if-href`
   * attribute.
   * @param {string} ampUserId
   * @return {!Promise<!GetResponseMetadataDef>}
   * @private
   */
  getShowEndpoint_(ampUserId) {
    this.ampUserId_ = ampUserId;
    return this.buildGetHref_(ampUserId).then(href => {
      const getReq = {
        credentials: 'include',
      };
      return xhrFor(this.win).fetchJson(href, getReq);
    });
  }

  /**
   * Creates an POST to the specified `data-dismiss-href` url.
   * @private
   * @return {!Promise}
   */
  postDismissEnpoint_() {
    return xhrFor(this.win).fetchJson(dev().assert(this.dismissHref_), {
      method: 'POST',
      credentials: 'include',
      body: {
        'elementId': this.elementId_,
        'ampUserId': this.ampUserId_,
      },
    });
  }

  /**
   * Success handler for `getShowEndpoint_`.
   * @param {!GetResponseMetadataDef} data
   * @return {!Promise<boolean>}
   * @private
   */
  onGetShowEndpointSuccess_(data) {
    user().assert(typeof data['showNotification'] == 'boolean',
        '`showNotification` ' +
        'should be a boolean. Got "%s" which is of type %s.',
        data['showNotification'], typeof data['showNotification']);

    if (!data['showNotification']) {
      // If no notification needs to be shown, resolve the `dialogPromise_`
      // right away with false.
      this.dialogResolve_();
    }
    return Promise.resolve(data['showNotification']);
  }

  /**
   * Get async cid service.
   * @return {!Promise}
   * @private
   */
  getAsyncCid_() {
    return cidFor(this.win).then(cid => {
      // `amp-user-notification` is our cid scope, while we give it a resolved
      // promise for the 2nd argument so that the 3rd argument (the
      // persistentConsent) is the one used to resolve getting
      // the external CID.
      // The dialogPromise_ is never rejected,
      // the user only really has 1 option to accept/dismiss (to resolve)
      // the notification or have the nagging notification sitting there
      // (to never resolve).
      return cid.get(
        {scope: 'amp-user-notification', createCookieIfNotPresent: true},
        Promise.resolve(), this.dialogPromise_);
    });
  }

  /** @override */
  shouldShow() {
    return this.isDismissed().then(dismissed => {
      if (dismissed) {
        // Consent has been accepted. Nothing more to do.
        return false;
      }
      if (this.showIfHref_) {
        // Ask remote endpoint if available. XHR will throw a user error when
        // fails.
        return this.shouldShowViaXhr_();
      }
      // Otherwise, show the notification.
      return true;
    });
  }

  /**
   * @return {!Promise<boolean>}
   * @private
   */
  shouldShowViaXhr_() {
    return this.getAsyncCid_()
        .then(this.getShowEndpoint_.bind(this))
        .then(this.onGetShowEndpointSuccess_.bind(this));
  }

  /** @override */
  show() {
    this.element.style.display = '';
    this.element.classList.add('amp-active');
    this.getViewport().addToFixedLayer(this.element);
    return this.dialogPromise_;
  }

  /** @override */
  isDismissed() {
    if (!this.persistDismissal_) {
      return Promise.resolve(false);
    }
    return this.storagePromise_
        .then(storage => storage.get(this.storageKey_))
        .then(persistedValue => !!persistedValue, reason => {
          dev().error(TAG, 'Failed to read storage', reason);
          return false;
        });
  }

  /**
   * Hides the current user notification and invokes the `dialogResolve_`
   * method. Removes the `.amp-active` class from the element.
   */
  dismiss() {
    this.element.classList.remove('amp-active');
    this.element.classList.add('amp-hidden');
    this.dialogResolve_();
    this.getViewport().removeFromFixedLayer(this.element);

    if (this.persistDismissal_) {
      // Store and post.
      this.storagePromise_.then(storage => {
        storage.set(this.storageKey_, true);
      });
    }
    if (this.dismissHref_) {
      this.postDismissEnpoint_();
    }
  }
}


/**
 * UserNotificationManager handles `amp-user-notification`
 * queuing and registration, as well as exposing the components
 * dismiss promise.
 */
export class UserNotificationManager {

  /**
   * @param {!Window} window
   */
  constructor(window) {
    /** @const {!Window} */
    this.win = window;

    /** @private @const {!Object<string,!NotificationInterface>} */
    this.registry_ = Object.create(null);

    /** @private @const {!Object<string,!UserNotificationDeferDef>} */
    this.deferRegistry_ = Object.create(null);

    /** @private @const {!Viewer} */
    this.viewer_ = viewerForDoc(this.win.document);

    /** @private @const {!Promise} */
    this.documentReadyPromise_ = whenDocumentReady(this.win.document);

    /** @private @const {!Promise} */
    this.managerReadyPromise_ = Promise.all([
      this.viewer_.whenFirstVisible(),
      this.documentReadyPromise_,
    ]);

    /** @private {!Promise} */
    this.nextInQueue_ = this.managerReadyPromise_;
  }

  /**
   * Retrieve a promise associated to an `amp-user-notification` component
   * that is resolved when user agrees to the terms.
   * @param {string} id
   * @return {!Promise<!NotificationInterface>}
   */
  get(id) {
    this.managerReadyPromise_.then(() => {
      if (this.win.document.getElementById(id) == null) {
        user().warn(TAG, `Did not find amp-user-notification element ${id}.`);
      }
    });
    return this.getOrCreateDeferById_(id).promise;
  }

  /**
   * Retrieves a registered user notification by ID. Returns undefined if it
   * is not registered yet.
   * @param {string} id
   * @return {!Promise<?NotificationInterface>}
   */
  getNotification(id) {
    return this.documentReadyPromise_.then(() => this.registry_[id]);
  }

  /**
   * Register an instance of `amp-user-notification`.
   * @param {string} id
   * @param {!NotificationInterface} userNotification
   * @return {!Promise}
   * @package
   */
  registerUserNotification(id, userNotification) {
    this.registry_[id] = userNotification;
    const deferred = this.getOrCreateDeferById_(id);
    // Compose the registered notifications into a promise queue
    // that blocks until one notification is dismissed.
    return this.nextInQueue_ = this.nextInQueue_
        .then(() => {
          return userNotification.shouldShow().then(shouldShow => {
            if (shouldShow) {
              return userNotification.show();
            }
          });
        })
        .then(deferred.resolve.bind(this, userNotification))
        .catch(rethrowAsync.bind(null,
            'Notification service failed amp-user-notification', id));
  }

  /**
   * Retrieves UserNotificationDeferDef object. Creates an defer if it doesn't
   * exist.
   * @param {string} id
   * @return {!UserNotificationDeferDef}
   * @private
   */
  getOrCreateDeferById_(id) {
    if (this.deferRegistry_[id]) {
      return this.deferRegistry_[id];
    }

    let resolve;
    const promise = new Promise(r => {
      resolve = r;
    });

    return this.deferRegistry_[id] = {promise, resolve};
  }
}

/**
 * @param {!Window} window
 * @return {!UserNotificationManager}
 * @private
 */
function getUserNotificationManager_(window) {
  return fromClass(window, 'userNotificationManager',
      UserNotificationManager);
}

/**
 * @param {!Window} window
 * @return {!UserNotificationManager}
 * @private
 */
export function installUserNotificationManager(window) {
  return getUserNotificationManager_(window);
}

installUserNotificationManager(AMP.win);

AMP.registerElement('amp-user-notification', AmpUserNotification, CSS);
