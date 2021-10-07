import {dev, devAssert} from '#utils/log';

import {isProxyOrigin} from '../../../src/url';

/** @const {string} */
const TAG = 'amp-access-other';

/** @implements {./amp-access-source.AccessTypeAdapterDef} */
export class AccessOtherAdapter {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} configJson
   * @param {!./amp-access-source.AccessTypeAdapterContextDef} context
   */
  constructor(ampdoc, configJson, context) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @const @protected {!./amp-access-source.AccessTypeAdapterContextDef} */
    this.context_ = context;

    /** @private {?JsonObject} */
    this.authorizationResponse_ =
      configJson['authorizationFallbackResponse'] || null;

    /** @const @private {boolean} */
    this.isProxyOrigin_ = isProxyOrigin(ampdoc.win.location);
  }

  /** @override */
  getConfig() {
    return {
      'authorizationResponse': this.authorizationResponse_,
    };
  }

  /** @override */
  isAuthorizationEnabled() {
    // The `type=other` is allowed to use the authorization fallback, but
    // only if it's not on `cdn.ampproject.org`.
    return !!this.authorizationResponse_ && !this.isProxyOrigin_;
  }

  /** @override */
  authorize() {
    dev().fine(TAG, 'Use the authorization fallback for type=other');
    // Disallow authorization for proxy origin (`cdn.ampproject.org`).
    devAssert(!this.isProxyOrigin_, 'Cannot authorize for proxy origin');
    const response = devAssert(this.authorizationResponse_);
    return Promise.resolve(response);
  }

  /** @override */
  isPingbackEnabled() {
    return false;
  }

  /** @override */
  pingback() {
    dev().fine(TAG, 'Ignore pingback');
    return Promise.resolve();
  }

  /** @override */
  postAction() {
    // Nothing to do.
  }
}
