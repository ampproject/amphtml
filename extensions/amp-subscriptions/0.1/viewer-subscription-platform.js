import {Services} from '#service';

import {devAssert, user, userAssert} from '#utils/log';

import {PageConfig as PageConfigInterface} from '#third_party/subscriptions-project/config';

import {ENTITLEMENTS_REQUEST_TIMEOUT} from './constants';
import {Entitlement, GrantReason} from './entitlement';
import {localSubscriptionPlatformFactory} from './local-subscription-platform';

import {getSourceOrigin, getWinOrigin} from '../../../src/url';
import {JwtHelper} from '../../amp-access/0.1/jwt';

/**
 * This implements the methods to interact with viewer subscription platform.
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class ViewerSubscriptionPlatform {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} platformConfig
   * @param {!./service-adapter.ServiceAdapter} serviceAdapter
   * @param {string} origin
   */
  constructor(ampdoc, platformConfig, serviceAdapter, origin) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.serviceAdapter_ = serviceAdapter;

    /** @private @const {!PageConfigInterface} */
    this.pageConfig_ = serviceAdapter.getPageConfig();

    /** @private @const {!./subscription-platform.SubscriptionPlatform} */
    this.platform_ = localSubscriptionPlatformFactory(
      ampdoc,
      platformConfig,
      serviceAdapter
    );

    /** @const @private {!../../../src/service/viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);
    this.viewer_.onMessage(
      'subscriptionchange',
      this.subscriptionChange_.bind(this)
    );

    /** @private @const {!JwtHelper} */
    this.jwtHelper_ = new JwtHelper(ampdoc.win);

    /** @private @const {string} */
    this.publicationId_ = this.pageConfig_.getPublicationId();

    /** @private @const {?string} */
    this.currentProductId_ = this.pageConfig_.getProductId();

    /** @private @const {string} */
    this.origin_ = origin;

    /** @private @const {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);
  }

  /** @override */
  isPrerenderSafe() {
    return true;
  }

  /** @override */
  getEntitlements() {
    devAssert(this.currentProductId_, 'Current product is not set');

    /** @type {JsonObject} */
    const authRequest = {
      'publicationId': this.publicationId_,
      'productId': this.currentProductId_,
      'origin': this.origin_,
    };

    // Defaulting to google.com for now.
    // TODO(@elijahsoria): Remove google.com and only rely on what is returned
    // in the cryptokeys param.
    let encryptedDocumentKey;
    const cryptokeysNames = this.viewer_.getParam('cryptokeys') || 'google.com';
    if (cryptokeysNames) {
      const keyNames = cryptokeysNames.split(',');
      for (let i = 0; i != keyNames.length; i++) {
        encryptedDocumentKey = this.serviceAdapter_.getEncryptedDocumentKey(
          keyNames[i]
        );
        if (encryptedDocumentKey) {
          break;
        }
      }
    }
    if (encryptedDocumentKey) {
      authRequest['encryptedDocumentKey'] = encryptedDocumentKey;
    }

    return /** @type {!Promise<Entitlement>} */ (
      this.timer_
        .timeoutPromise(
          ENTITLEMENTS_REQUEST_TIMEOUT,
          this.viewer_.sendMessageAwaitResponse('auth', authRequest)
        )
        .then((entitlementData) => {
          entitlementData = entitlementData || {};

          /** Note to devs: Send error at top level of postMessage instead. */
          const deprecatedError = entitlementData['error'];
          const authData = entitlementData['authorization'];
          const decryptedDocumentKey = entitlementData['decryptedDocumentKey'];

          if (deprecatedError) {
            throw new Error(deprecatedError.message);
          }

          if (!authData) {
            return Entitlement.empty('local');
          }

          return this.verifyAuthToken_(authData, decryptedDocumentKey).catch(
            (reason) => {
              this.sendAuthTokenErrorToViewer_(reason.message);
              throw reason;
            }
          );
        })
    );
  }

  /**
   * Logs error and sends message to viewer
   * @param {string} token
   * @param {?string} decryptedDocumentKey
   * @return {!Promise<!Entitlement>}
   * @private
   */
  verifyAuthToken_(token, decryptedDocumentKey) {
    return new Promise((resolve) => {
      const origin = getWinOrigin(this.ampdoc_.win);
      const sourceOrigin = getSourceOrigin(this.ampdoc_.win.location);
      const decodedData = this.jwtHelper_.decode(token);
      const currentProductId = /** @type {string} */ (
        userAssert(this.pageConfig_.getProductId(), 'Product id is null')
      );
      if (decodedData['aud'] != origin && decodedData['aud'] != sourceOrigin) {
        throw user().createError(
          `The mismatching "aud" field: ${decodedData['aud']}`
        );
      }
      if (decodedData['exp'] < Math.floor(Date.now() / 1000)) {
        throw user().createError('Payload is expired');
      }
      const entitlements = decodedData['entitlements'];
      let entitlement = Entitlement.empty('local');
      let entitlementObject;

      if (entitlements) {
        // Not null
        if (Array.isArray(entitlements)) {
          // Multi entitlement case
          for (let index = 0; index < entitlements.length; index++) {
            if (
              entitlements[index]['products'].indexOf(currentProductId) !== -1
            ) {
              entitlementObject = entitlements[index];
              break;
            }
          }
        } else if (entitlements['products'].indexOf(currentProductId) !== -1) {
          // Single entitlment case
          entitlementObject = entitlements;
        }

        if (entitlementObject) {
          // Found a match
          entitlement = new Entitlement({
            source: 'viewer',
            raw: token,
            granted: true,
            grantReason: entitlementObject.subscriptionToken
              ? GrantReason.SUBSCRIBER
              : '',
            dataObject: entitlementObject,
            decryptedDocumentKey,
          });
        }
      }

      if (decodedData['metering'] && !entitlement.granted) {
        // Special case where viewer gives metering but no entitlement
        entitlement = new Entitlement({
          source: decodedData['iss'] || '',
          raw: token,
          granted: true,
          grantReason: GrantReason.METERING,
          dataObject: decodedData['metering'],
          decryptedDocumentKey,
        });
      }
      entitlement.service = 'local';
      resolve(entitlement);
    });
  }

  /**
   * Logs error and sends message to viewer
   * @param {string} errorString
   * @private
   */
  sendAuthTokenErrorToViewer_(errorString) {
    this.viewer_.sendMessage('auth-rejected', {
      'reason': errorString,
    });
  }

  /** @override */
  getPlatformKey() {
    return this.platform_.getPlatformKey();
  }

  /** @override */
  activate() {}

  /** @override */
  reset() {}

  /** @override */
  isPingbackEnabled() {
    return this.platform_.isPingbackEnabled();
  }

  /** @override */
  pingbackReturnsAllEntitlements() {
    return this.platform_.pingbackReturnsAllEntitlements();
  }

  /** @override */
  pingback(selectedPlatform) {
    this.platform_.pingback(selectedPlatform);
  }

  /** @override */
  getSupportedScoreFactor(factorName) {
    return this.platform_.getSupportedScoreFactor(factorName);
  }

  /** @override */
  getBaseScore() {
    return 0;
  }

  /** @override */
  executeAction(action, sourceId) {
    return this.platform_.executeAction(action, sourceId);
  }

  /** @override */
  decorateUI(element, action, options) {
    return this.platform_.decorateUI(element, action, options);
  }

  /**
   * Handles a reset message from the viewer which indicates
   * subscription state changed.  Eventually that will trigger
   * a new getEntitlements() message exchange.
   */
  subscriptionChange_() {
    this.serviceAdapter_.resetPlatforms();
  }
}
