import {PreactBaseElement} from '#preact/base-element';

import {BentoAdblockDetector} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoAdblockDetector;

/** @override */
BaseElement['props'] = {
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
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
