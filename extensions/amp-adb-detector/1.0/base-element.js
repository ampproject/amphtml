import {PreactBaseElement} from '#preact/base-element';

import {BentoAdbDetector} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoAdbDetector;

/** @override */
BaseElement['props'] = {
  'onB': {attr: 'onBlock'},
  ampAd: {
    selector: 'amp-ad',
    single: true,
    as: true,
    clone: true,
  },
  divBlocked: {
    selector: 'div[status="blocked"]',
    single: true,
    as: true,
    clone: true,
  },
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
