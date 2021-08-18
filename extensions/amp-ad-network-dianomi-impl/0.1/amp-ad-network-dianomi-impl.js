

import {userAssert} from '../../../src/log';
import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';

const REQUEST_PARAM_ID = new RegExp(/^.[0-9]*$/);

export class AmpAdNetworkDianomiImpl extends AmpA4A {
  /** @override */
  getAdUrl() {
    const paramId = this.element.getAttribute('data-request-param-id');
    userAssert(
      REQUEST_PARAM_ID.test(paramId),
      'The Dianomi request parameter ID provided is invalid'
    );
    return `https://www.dianomi.com/smartads.pl?format=a4a&id=${paramId}`;
  }
}

AMP.extension('amp-ad-network-dianomi-impl', '0.1', (AMP) => {
  AMP.registerElement('amp-ad-network-dianomi-impl', AmpAdNetworkDianomiImpl);
});
