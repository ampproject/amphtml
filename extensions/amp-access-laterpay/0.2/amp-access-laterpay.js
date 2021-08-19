import {Services} from '#service';

import {LaterpayVendor} from './laterpay-impl';

AMP.extension('amp-access-laterpay', '0.2', function (AMP) {
  AMP.registerServiceForDoc(
    'laterpay',
    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {*} TODO(#23582): Specify return type
     */
    function (ampdoc) {
      const element = ampdoc.getHeadNode();
      return Services.accessServiceForDoc(element).then((accessService) => {
        const source = accessService.getVendorSource('laterpay');
        const vendor = new LaterpayVendor(accessService, source);
        const adapter = /** @type {
            !../../amp-access/0.1/amp-access-vendor.AccessVendorAdapter
          } */ (source.getAdapter());
        adapter.registerVendor(vendor);
        return vendor;
      });
    }
  );
});
