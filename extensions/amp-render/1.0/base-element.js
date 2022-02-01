import {PreactBaseElement} from '#preact/base-element';

import {Render} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Render;

/** @override */
BaseElement['props'] = {
  'src': {attr: 'src'},
};

/** @override */
BaseElement['usesTemplate'] = true;

/** @override */
BaseElement['lightDomTag'] = 'div';

/** @override */
BaseElement['layoutSizeDefined'] = true;
