import {PreactBaseElement} from '#preact/base-element';

import {BentoInstagram} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoInstagram;

/** @override */
BaseElement['loadable'] = true;

/** @override */
BaseElement['unloadOnPause'] = true;

/** @override */
BaseElement['props'] = {
  'captioned': {attr: 'data-captioned'},
  'shortcode': {attr: 'data-shortcode'},
  'title': {attr: 'title'},
};

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['layoutSizeDefined'] = true;
