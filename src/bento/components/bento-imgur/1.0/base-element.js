import {PreactBaseElement} from '#preact/base-element';

import {BentoImgur} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoImgur;

/** @override */
BaseElement['props'] = {
  'imgurId': {attr: 'data-imgur-id'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
