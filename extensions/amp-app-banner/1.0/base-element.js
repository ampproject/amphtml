import {PreactBaseElement} from '#preact/base-element';

import {BentoAppBanner} from './component/component';
import {CSS as COMPONENT_CSS} from './component/component.jss';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoAppBanner;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  'dismissButtonAriaLabel': {attr: 'dismiss-button-aria-label'},
  'id': {attr: 'id'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
