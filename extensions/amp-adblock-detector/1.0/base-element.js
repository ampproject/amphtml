import {PreactBaseElement} from '#preact/base-element';

import {BentoAdblockDetector} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoAdblockDetector;

/** @override */
BaseElement['props'] = {
  adNetworkDomain: {attr: 'data-ad-network-domain', type: 'string'},
  ampAd: {
    as: true,
    clone: true,
    selector: 'amp-ad',
    single: true,
  },
  fallbackDiv: {
    as: true,
    clone: true,
    selector: 'div[status="blocked"]',
    single: true,
  },
  fetchOptions: {attr: 'data-fetch-options'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
