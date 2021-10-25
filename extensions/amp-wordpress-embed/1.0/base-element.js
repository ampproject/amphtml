import {PreactBaseElement} from '#preact/base-element';

import {BentoWordPressEmbed} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoWordPressEmbed;

/** @override */
BaseElement['props'] = {
  url: {attr: 'data-url', default: ''},
  title: {attr: 'title'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;
