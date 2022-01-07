import {PreactBaseElement} from '#preact/base-element';

import {BentoGist} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoGist;

/** @override */
BaseElement['props'] = {
  'gistId': {attr: 'data-gistid'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
