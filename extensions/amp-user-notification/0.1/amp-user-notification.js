import {Deferred} from '#core/data-structures/promise';
import {toggle} from '#core/dom/style';
import {rethrowAsync} from '#core/error';

import {Services} from '#service';
import {
  NOTIFICATION_UI_MANAGER,
  NotificationUiManager,
} from '#service/notification-ui-manager';

import {dev, user, userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-user-notification-0.1.css';
import {
  getServicePromiseForDoc,
  registerServiceBuilderForDoc,
} from '../../../src/service-helpers';
import {addParamsToUrl, assertHttpsUrl} from '../../../src/url';
import {GEO_IN_GROUP} from '../../amp-geo/0.1/amp-geo-in-group';

const TAG = 'amp-user-notification';
const SERVICE_ID = 'userNotificationManager';

/**
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

    /** @private {?string} */
    this.ampUserId_ = null;

    /** @private {?string} */
    this.elementId_ = null;

    const deferred = new Deferred();

    /** @private {!Promise} */
    this.dialogPromise_ = deferred.promise;

    /** @private {?function()} */
    this.dialogResolve_ = deferred.resolve;

    /** @private {?string} */
    this.dismissHref_ = null;

    /** @private {boolean} */
    this.persistDismissal_ = false;

    /** @private {?string} */
    this.showIfGeo_ = null;

    /** @private {?string} */
    this.showIfNotGeo_ = null;

    /** @private {?Promise<boolean>} */
    this.geoPromise_ = null;

    /** @private {?string} */
    this.showIfHref_ = null;

    /** @private {string} */
    this.storageKey_ = '';

    /** @private {?Promise<!../../../src/service/storage-impl.Storage>} */
    this.storagePromise_ = null;

    /** @private {?../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacements_ = null;
  }

  /** @override */
  isAlwaysFixed() {
    return true;
  }

  /** @override */
  buildCallback() {
    const ampdoc = this.getAmpDoc();
    this.urlReplacements_ = Services.urlReplacementsForDoc(this.element);
    this.storagePromise_ = Services.storageForDoc(this.element);

    this.elementId_ = userAssert(
      this.element.id,
      'amp-user-notification should have an id.'
    );

    this.storageKey_ = 'amp-user-notification:' + this.elementId_;

    this.showIfGeo_ = this.element.getAttribute('data-show-if-geo');
    this.showIfNotGeo_ = this.element.getAttribute('data-show-if-not-geo');

    this.showIfHref_ = this.element.getAttribute('data-show-if-href');
    if (this.showIfHref_) {
      assertHttpsUrl(this.showIfHref_, this.element);
    }

    // Casts string to boolean using !!(string) then coerce that to
    // number using when we add them so we can see easily test
    // how many flags were set.  We want 0 or 1.
    userAssert(
      !!this.showIfHref_ + !!this.showIfGeo_ + !!this.showIfNotGeo_ <= 1,
      'Only one "data-show-if-*" attribute allowed'
    );

    if (this.showIfGeo_) {
      this.geoPromise_ = this.isNotificationRequiredGeo_(this.showIfGeo_, true);
    }

    if (this.showIfNotGeo_) {
      this.geoPromise_ = this.isNotificationRequiredGeo_(
        this.showIfNotGeo_,
        false
      );
    }

    this.dismissHref_ = this.element.getAttribute('data-dismiss-href');
    if (this.dismissHref_) {
      assertHttpsUrl(this.dismissHref_, this.element);
    }

    // Default to alert role if unspecified.
    const roleAttribute = this.element.getAttribute('role');
    if (!roleAttribute) {
      this.element.setAttribute('role', 'alert');
    }

    const persistDismissal = this.element.getAttribute(
      'data-persist-dismissal'
    );

    this.persistDismissal_ =
      persistDismissal != 'false' && persistDismissal != 'no';

    this.registerDefaultAction(
      () => this.dismiss(/*forceNoPersist*/ false),
      'dismiss'
    );
    this.registerAction('optoutOfCid', () => this.optoutOfCid_());

    const userNotificationManagerPromise =
      /** @type {!Promise<!UserNotificationManager>} */
      (getServicePromiseForDoc(ampdoc, SERVICE_ID));
    userNotificationManagerPromise.then((manager) => {
      manager.registerUserNotification(
        dev().assertString(this.elementId_),
        this
      );
    });
  }

  /**
   * Returns a promise that if user is in the given geoGroup
   * @param {string} geoGroup
   * @param {boolean} includeGeos
   * @return {Promise<boolean>}
   */
  isNotificationRequiredGeo_(geoGroup, includeGeos) {
    return Services.geoForDocOrNull(this.element).then((geo) => {
      userAssert(geo, 'requires <amp-geo> to use promptIfUnknownForGeoGroup');

      const matchedGeos = geoGroup.split(/,\s*/).filter((group) => {
        return geo.isInCountryGroup(group) == GEO_IN_GROUP.IN;
      });

      // Invert if includeGeos is false
      return !!(includeGeos ? matchedGeos.length : !matchedGeos.length);
    });
  }

  /**
   * Constructs the new href to execute a `GET` request with the
   * `elementId` and `ampUserId` query params appended.
   * @param {string} ampUserId
   * @return {!Promise<string>}
   * @private
   */
  buildGetHref_(ampUserId) {
    const showIfHref = dev().assertString(this.showIfHref_);
    return this.urlReplacements_.expandUrlAsync(showIfHref).then((href) => {
      const data = /** @type {!JsonObject} */ ({
        'elementId': this.elementId_,
        'ampUserId': ampUserId,
      });
      return addParamsToUrl(href, data);
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
    return this.buildGetHref_(ampUserId).then((href) => {
      const getReq = {
        credentials: 'include',
      };
      return Services.xhrFor(this.win)
        .fetchJson(href, getReq)
        .then((res) => res.json());
    });
  }

  /**
   * Creates an POST to the specified `data-dismiss-href` url.
   * @private
   * @return {!Promise}
   */
  postDismissEnpoint_() {
    const enctype =
      this.element.getAttribute('enctype') || 'application/json;charset=utf-8';
    return Services.xhrFor(this.win).fetchJson(
      dev().assertString(this.dismissHref_),
      this.buildPostDismissRequest_(enctype, this.elementId_, this.ampUserId_)
    );
  }

  /**
   * Creates a Request to be used for postDismiss
   * @private
   * @param {string} enctype
   * @param {?string} elementId
   * @param {?string} ampUserId
   * @return {!Object}
   */
  buildPostDismissRequest_(enctype, elementId, ampUserId) {
    const body = {
      'elementId': elementId,
      'ampUserId': ampUserId,
    };
    return {
      method: 'POST',
      credentials: 'include',
      body,
      headers: {
        'Content-Type': enctype,
      },
    };
  }

  /**
   * Success handler for `getShowEndpoint_`.
   * @param {!GetResponseMetadataDef} data
   * @return {!Promise<boolean>}
   * @private
   */
  onGetShowEndpointSuccess_(data) {
    userAssert(
      typeof data['showNotification'] == 'boolean',
      '`showNotification` ' +
        'should be a boolean. Got "%s" which is of type %s.',
      data['showNotification'],
      typeof data['showNotification']
    );

    if (!data['showNotification']) {
      // If no notification needs to be shown, resolve the `dialogPromise_`
      // right away with false.
      this.dialogResolve_();
    }
    return Promise.resolve(data['showNotification']);
  }

  /**
   * Opts the user out of cid issuance and dismisses the notification.
   * @private
   */
  optoutOfCid_() {
    return this.getCidService_()
      .then((cid) => cid.optOut())
      .then(
        () => this.dismiss(/*forceNoPersist*/ false),
        (reason) => {
          dev().error(TAG, 'Failed to opt out of Cid', reason);
          // If optout fails, dismiss notification without persisting.
          this.dismiss(/*forceNoPersist*/ true);
        }
      );
  }

  /**
   * Get async cid.
   * @return {!Promise}
   * @private
   */
  getAsyncCid_() {
    return this.getCidService_().then((cid) => {
      // `amp-user-notification` is our cid scope, while we give it a resolved
      // promise for the 2nd argument so that the 3rd argument (the
      // persistentConsent) is the one used to resolve getting
      // the external CID.
      // The dialogPromise_ is never rejected,
      // the user only really has 1 option to accept/dismiss (to resolve)
      // the notification or have the nagging notification sitting there
      // (to never resolve).
      return cid.get(
        {scope: TAG, createCookieIfNotPresent: true},
        Promise.resolve(),
        this.dialogPromise_
      );
    });
  }

  /**
   * Get cid service.
   * @return {!Promise}
   * @private
   */
  getCidService_() {
    return Services.cidForDoc(this.element);
  }

  /** @override */
  shouldShow() {
    return this.isDismissed().then((dismissed) => {
      if (dismissed) {
        // Consent has been accepted. Nothing more to do.
        return false;
      }
      if (this.showIfHref_) {
        // Ask remote endpoint if available. XHR will throw a user error when
        // fails.
        return this.shouldShowViaXhr_();
      }
      if (this.geoPromise_) {
        // Check if we are in the requested geo
        return this.geoPromise_;
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
    toggle(this.element, true);
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
      .then((storage) => storage.get(this.storageKey_))
      .then(
        (persistedValue) => !!persistedValue,
        (reason) => {
          dev().error(TAG, 'Failed to read storage', reason);
          return false;
        }
      );
  }

  /**
   * Hides the current user notification and invokes the `dialogResolve_`
   * method. Removes the `.amp-active` class from the element.
   *
   * @param {boolean} forceNoPersist If true, dismissal won't be persisted
   * regardless of 'data-persist-dismissal''s value
   */
  dismiss(forceNoPersist) {
    this.element.classList.remove('amp-active');
    this.element.classList.add('amp-hidden');
    this.dialogResolve_();
    this.getViewport().removeFromFixedLayer(this.element);

    if (this.persistDismissal_ && !forceNoPersist) {
      // Store and post.
      this.storagePromise_.then((storage) => {
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
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @private @const {!{[key: string]: !NotificationInterface}} */
    this.registry_ = Object.create(null);

    /** @private @const {!{[key: string]: !UserNotificationDeferDef}} */
    this.deferRegistry_ = Object.create(null);

    /** @private @const {!Promise} */
    this.documentReadyPromise_ = this.ampdoc.whenReady();

    /** @private @const {!Promise} */
    this.managerReadyPromise_ = Promise.all([
      this.ampdoc.whenFirstVisible(),
      this.documentReadyPromise_,
    ]);

    this.notificationUiManagerPromise_ = getServicePromiseForDoc(
      this.ampdoc,
      NOTIFICATION_UI_MANAGER
    );
  }

  /**
   * Retrieve a promise associated to an `amp-user-notification` component
   * that is resolved when user agrees to the terms.
   * @param {string} id
   * @return {!Promise<!NotificationInterface>}
   */
  get(id) {
    this.managerReadyPromise_.then(() => {
      if (this.ampdoc.getElementById(id) == null) {
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
    return this.managerReadyPromise_
      .then(() => userNotification.shouldShow())
      .then((shouldShow) => {
        if (shouldShow) {
          return this.notificationUiManagerPromise_.then((manager) => {
            return manager.registerUI(
              userNotification.show.bind(userNotification)
            );
          });
        }
      })
      .then(deferred.resolve.bind(this, userNotification))
      .catch(
        rethrowAsync.bind(
          null,
          'Notification service failed amp-user-notification',
          id
        )
      );
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

    const deferred = new Deferred();
    const {promise, resolve} = deferred;

    return (this.deferRegistry_[id] = {promise, resolve});
  }
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @visibleForTesting
 */
export function installUserNotificationManagerForTesting(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, SERVICE_ID, UserNotificationManager);
}

// Register the extension services.
AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerServiceForDoc(SERVICE_ID, UserNotificationManager);
  AMP.registerServiceForDoc(NOTIFICATION_UI_MANAGER, NotificationUiManager);
  AMP.registerElement(TAG, AmpUserNotification, CSS);
});
