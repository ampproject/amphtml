import {PreactBaseElement} from '#preact/base-element';

import {BentoSocialShare} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

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
  'tabindex': {attr: 'tabindex'},
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

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
