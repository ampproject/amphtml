import {CidDef} from '#service/cid-impl';

import {registerServiceBuilderForDoc} from '../service-helpers';

/**
 * A dummy impl of CID service as CLIENT_ID is not supported
 * in inabox.
 *
 * @implements {CidDef}
 */
class InaboxCid {
  /** @override */
  get() {
    return Promise.resolve(null);
  }

  /** @override */
  optOut() {}
}

/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 * @return {*} TODO(#23582): Specify return type
 */
export function installInaboxCidService(ampdoc) {
  return registerServiceBuilderForDoc(ampdoc, 'cid', InaboxCid);
}
