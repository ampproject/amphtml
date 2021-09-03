import {Services} from '#service';

import {ScrollAccessVendor} from './scroll-impl';

AMP.extension('amp-access-scroll', '0.1', function (AMP) {
  AMP.registerServiceForDoc(
    'scroll',
    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {*} TODO(#23582): Specify return type
     */
    function (ampdoc) {
      const element = ampdoc.getHeadNode();
      return Services.accessServiceForDoc(element).then((accessService) => {
        const source = accessService.getVendorSource('scroll');
        const vendor = new ScrollAccessVendor(ampdoc, source);
        const adapter = /** @type {
            !../../amp-access/0.1/amp-access-vendor.AccessVendorAdapter
          } */ (source.getAdapter());
        adapter.registerVendor(vendor);
        return vendor;
      });
    }
  );
});
