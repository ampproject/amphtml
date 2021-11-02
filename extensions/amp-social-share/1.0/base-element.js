import {PreactBaseElement} from '#preact/base-element';

import {BentoSocialShare} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoSocialShare;

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['delegatesFocus'] = true;

/** @override */
BaseElement['props'] = {
  'children': {passthroughNonEmpty: true},
  'height': {attr: 'height'},
  'tabIndex': {attr: 'tabindex'},
  'type': {attr: 'type'},
  'width': {attr: 'width'},
};

/** @override */
BaseElement['staticProps'] = {
  'color': 'currentColor',
  'background': 'inherit',
};

/** @override */
BaseElement['usesShadowDom'] = true;
