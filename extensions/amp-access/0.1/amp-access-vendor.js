import './access-vendor';
import {Deferred} from '#core/data-structures/promise';

import {dev, userAssert} from '#utils/log';

/** @const {string} */
const TAG = 'amp-access-vendor';

/**
 * The adapter for a vendor implementation that implements `AccessVendor`
 * interface and delivered via a separate extension. The vendor implementation
 * mainly requires two method: `authorize` and `pingback`. The actual
 * extension is registered via `registerVendor` method.
 * @implements {./amp-access-source.AccessTypeAdapterDef}
 */
export class AccessVendorAdapter {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} configJson
   */
  constructor(ampdoc, configJson) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @const @private {string} */
    this.vendorName_ = userAssert(
      configJson['vendor'],
      '"vendor" name must be specified'
    );

    /** @const @private {!JsonObject} */
    this.vendorConfig_ = configJson[this.vendorName_] || {};

    /** @const @private {boolean} */
    this.isPingbackEnabled_ = !configJson['noPingback'];

    const deferred = new Deferred();

    /** @const @private {!Promise<!./access-vendor.AccessVendor>} */
    this.vendorPromise_ = deferred.promise;

    /** @private {?function(!./access-vendor.AccessVendor)} */
    this.vendorResolve_ = deferred.resolve;
  }

  /** @return {string} */
  getVendorName() {
    return this.vendorName_;
  }

  /** @override */
  getConfig() {
    return this.vendorConfig_;
  }

  /**
   * @param {!./access-vendor.AccessVendor} vendor
   */
  registerVendor(vendor) {
    userAssert(this.vendorResolve_, 'Vendor has already been registered');
    this.vendorResolve_(vendor);
    this.vendorResolve_ = null;
  }

  /** @override */
  isAuthorizationEnabled() {
    return true;
  }

  /** @override */
  authorize() {
    dev().fine(TAG, 'Start authorization via ', this.vendorName_);
    return this.vendorPromise_.then((vendor) => {
      return vendor.authorize();
    });
  }

  /** @override */
  isPingbackEnabled() {
    return this.isPingbackEnabled_;
  }

  /** @override */
  pingback() {
    dev().fine(TAG, 'Pingback via ', this.vendorName_);
    return this.vendorPromise_.then((vendor) => {
      return vendor.pingback();
    });
  }

  /** @override */
  postAction() {
    // TODO(dvoytenko): delegate to vendor adapter.
  }
}
