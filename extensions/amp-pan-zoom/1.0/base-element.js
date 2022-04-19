import {PreactBaseElement} from '#preact/base-element';

import {BentoPanZoom} from './component';
import {CSS as COMPONENT_CSS} from './component.jss';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoPanZoom;

/** @override */
BaseElement['props'] = {
  'children': {passthrough: true},
  'initialX': {attr: 'initial-x'},
  'initialY': {attr: 'initial-y'},
  'initialScale': {attr: 'initial-scale'},
  'maxScale': {attr: 'max-scale'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

/** @override */
BaseElement['shadowCss'] = COMPONENT_CSS;
