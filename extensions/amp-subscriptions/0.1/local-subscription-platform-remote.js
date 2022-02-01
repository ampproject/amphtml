import {isArray} from '#core/types';

import {Services} from '#service';

import {devAssert, userAssert} from '#utils/log';

import {Entitlement} from './entitlement';
import {LocalSubscriptionBasePlatform} from './local-subscription-platform-base';

import {addParamToUrl, assertHttpsUrl} from '../../../src/url';

/**
 * Implments the remotel local subscriptions platform which uses
 * authorization and pingback urls
 *
 * @implements {./subscription-platform.SubscriptionPlatform}
 */
export class LocalSubscriptionRemotePlatform extends LocalSubscriptionBasePlatform {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} platformConfig
   * @param {!./service-adapter.ServiceAdapter} serviceAdapter
   */
  constructor(ampdoc, platformConfig, serviceAdapter) {
    super(ampdoc, platformConfig, serviceAdapter);

    /** @private @const {string} */
    this.authorizationUrl_ = assertHttpsUrl(
      userAssert(
        this.serviceConfig_['authorizationUrl'],
        'Service config does not have authorization Url'
      ),
      'Authorization Url'
    );

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.ampdoc_.win);

    /** @private @const {?string} */
    this.pingbackUrl_ = this.serviceConfig_['pingbackUrl'] || null;

    this.initializeListeners_();
  }

  /** @override */
  getEntitlements() {
    const fetchUrlPromise = this.urlBuilder_.buildUrl(
      this.authorizationUrl_,
      /* useAuthData */ false
    );
    const meteringStatePromise = this.serviceAdapter_.loadMeteringState();
    return Promise.all([fetchUrlPromise, meteringStatePromise]).then(
      (results) => {
        let fetchUrl = results[0];
        const meteringState = results[1];

        // WARNING: If this value is really long, you might run into issues by hitting
        // the maximum URL length in some browsers when sending the GET fetch URL.
        if (meteringState) {
          fetchUrl = addParamToUrl(
            fetchUrl,
            'meteringState',
            btoa(JSON.stringify(meteringState))
          );
        }

        // WARNING: If this key is really long, you might run into issues by hitting
        // the maximum URL length in some browsers when sending the GET fetch URL.
        const encryptedDocumentKey =
          this.serviceAdapter_.getEncryptedDocumentKey('local');
        if (encryptedDocumentKey) {
          //TODO(chenshay): if crypt, switch to 'post'
          fetchUrl = addParamToUrl(fetchUrl, 'crypt', encryptedDocumentKey);
        }
        return this.xhr_
          .fetchJson(fetchUrl, {credentials: 'include'})
          .then((res) => res.json())
          .then((resJson) => {
            const promises = [];

            // Save metering state, if present.
            if (resJson.metering && resJson.metering.state) {
              promises.push(
                this.serviceAdapter_.saveMeteringState(resJson.metering.state)
              );
            }

            return Promise.all(promises).then(() =>
              Entitlement.parseFromJson(resJson)
            );
          });
      }
    );
  }

  /** @override */
  isPingbackEnabled() {
    return !!this.pingbackUrl_;
  }

  /**
   * Format data for pingback
   * @param {./entitlement.Entitlement|Array<./entitlement.Entitlement>} entitlements
   * @return {string}
   * @private
   */
  stringifyPingbackData_(entitlements) {
    if (isArray(entitlements)) {
      const entitlementArray = [];
      entitlements.forEach((ent) => {
        entitlementArray.push(ent.jsonForPingback());
      });
      return JSON.stringify(entitlementArray);
    }
    return JSON.stringify(entitlements.jsonForPingback());
  }

  /** @override */
  pingback(selectedEntitlement) {
    if (!this.isPingbackEnabled) {
      return;
    }
    const pingbackUrl = /** @type {string} */ (
      devAssert(this.pingbackUrl_, 'pingbackUrl is null')
    );

    const promise = this.urlBuilder_.buildUrl(
      pingbackUrl,
      /* useAuthData */ true
    );
    return promise.then((url) => {
      // Content should be 'text/plain' to avoid CORS preflight.
      return this.xhr_.sendSignal(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: this.stringifyPingbackData_(selectedEntitlement),
      });
    });
  }
}
