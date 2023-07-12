import {Services} from '#service';

import {parseUrlDeprecated} from '../url';

/**
 * Exposes CID API if provided by the Viewer.
 */
export class ViewerCidApi {
  /**
   * Creates an instance of ViewerCidApi.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!./viewer-interface.ViewerInterface} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc_);

    const {canonicalUrl} = Services.documentInfoForDoc(this.ampdoc_);

    /** @private {?string} */
    this.canonicalOrigin_ = canonicalUrl
      ? parseUrlDeprecated(canonicalUrl).origin
      : null;
  }

  /**
   * Resolves to true if Viewer is trusted and supports CID API.
   * @return {!Promise<boolean>}
   */
  isSupported() {
    if (!this.viewer_.hasCapability('cid')) {
      return Promise.resolve(false);
    }
    return this.viewer_.isTrustedViewer();
  }

  /**
   * Returns scoped CID retrieved from the Viewer.
   * @param {string|undefined} apiKey
   * @param {string} scope
   * @return {!Promise<?JsonObject|string|undefined>}
   */
  getScopedCid(apiKey, scope) {
    const payload = {
      'scope': scope,
      'clientIdApi': !!apiKey,
      'canonicalOrigin': this.canonicalOrigin_,
    };
    if (apiKey) {
      payload['apiKey'] = apiKey;
    }
    return this.viewer_.sendMessageAwaitResponse('cid', payload);
  }
}
