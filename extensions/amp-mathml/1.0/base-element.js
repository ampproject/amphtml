import {PreactBaseElement} from '#preact/base-element';

import {BentoMathml} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoMathml;

/** @override */
BaseElement['props'] = {
  'inline': {attr: 'inline', type: 'boolean', default: false},
  'formula': {attr: 'data-formula'},
  'title': {attr: 'title'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = true;
