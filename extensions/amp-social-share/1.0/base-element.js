

import {PreactBaseElement} from '#preact/base-element';

import {SocialShare} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = SocialShare;

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
