import {Services} from '#service';

import {PooolVendor} from './poool-impl';

AMP.extension('amp-access-poool', '0.1', function (AMP) {
  AMP.registerServiceForDoc(
    'poool',
    /**
     * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     * @return {*} TODO(#23582): Specify return type
     */
    function (ampdoc) {
      const element = ampdoc.getHeadNode();
      return Services.accessServiceForDoc(element).then((accessService) => {
        const source = accessService.getVendorSource('poool');
        const vendor = new PooolVendor(accessService, source);
        const adapter = /** @type {
            !../../amp-access/0.1/amp-access-vendor.AccessVendorAdapter
          } */ (source.getAdapter());
        adapter.registerVendor(vendor);
        return vendor;
      });
    }
  );
});
